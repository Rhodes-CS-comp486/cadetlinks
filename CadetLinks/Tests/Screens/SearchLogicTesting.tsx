import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebaseDatabase from 'firebase/database';
import { useSearchLogic } from '../../src/navigation/screens/SearchPage/SearchLogic';

type Snapshot = {
	val: () => unknown;
};

type ListenerEntry = {
	next: (snapshot: Snapshot) => void;
	error?: (error: Error) => void;
	unsubscribe: jest.Mock;
};

const dbState: Record<string, unknown> = {};
const listeners: Record<string, ListenerEntry[]> = {};

const STEVENSON_KEY = 'stecj_26_rhodes_edu';
const GRAY_KEY = 'grasv_26_rhodes_edu';
const WHITFIELD_KEY = 'rjwhtfld_memphis_edu';

const makeSnapshot = (value: unknown): Snapshot => ({
	val: () => value,
});

const emitValue = (path: string, value: unknown) => {
	dbState[path] = value;
	(listeners[path] || []).forEach((listener) => {
		listener.next(makeSnapshot(value));
	});
};

const emitError = (path: string, error: Error) => {
	(listeners[path] || []).forEach((listener) => {
		listener.error?.(error);
	});
};

jest.mock('../../src/firebase/config', () => ({
	db: { mockedDb: true },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn(),
}));

jest.mock('firebase/database', () => ({
	ref: jest.fn((_db: unknown, path: string) => ({ path })),
	onValue: jest.fn(
		(
			refObj: { path: string },
			next: (snapshot: Snapshot) => void,
			error?: (error: Error) => void
		) => {
			const unsubscribe = jest.fn();
			if (!listeners[refObj.path]) {
				listeners[refObj.path] = [];
			}

			const entry: ListenerEntry = {
				next,
				error,
				unsubscribe,
			};
			listeners[refObj.path].push(entry);

			next(makeSnapshot(dbState[refObj.path]));

			return unsubscribe;
		}
	),
}));

describe('useSearchLogic', () => {
	beforeEach(() => {
		Object.keys(dbState).forEach((k) => delete dbState[k]);
		Object.keys(listeners).forEach((k) => delete listeners[k]);
		jest.clearAllMocks();

		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(STEVENSON_KEY);
		jest.spyOn(console, 'error').mockImplementation(jest.fn());
	});

	afterEach(() => {
		(console.error as jest.Mock).mockRestore?.();
	});

	it('loads cadets, excludes current cadet, sorts by last then first, and unsubscribes on unmount', async () => {
		dbState.cadets = {
			[STEVENSON_KEY]: {
				firstName: 'Camren',
				lastName: 'Stevenson',
			},
			[GRAY_KEY]: {
				firstName: 'Sadie',
				lastName: 'Gray',
			},
			[WHITFIELD_KEY]: {
				firstName: 'Ryan',
				lastName: 'Whitfield',
			},
			aaron_key: {
				firstName: 'Aaron',
				lastName: 'Gray',
			},
		};

		const { result, unmount } = renderHook(() => useSearchLogic());

		await waitFor(() => {
			expect(result.current.loadingCadets).toBe(false);
		});

		expect(result.current.searchError).toBeNull();
		expect(result.current.query).toBe('');
		expect(result.current.filteredCadets.map((cadet) => cadet.cadetKey)).toEqual([
			'aaron_key',
			GRAY_KEY,
			WHITFIELD_KEY,
		]);

		const cadetsUnsubscribe = listeners.cadets[0].unsubscribe;
		unmount();
		expect(cadetsUnsubscribe).toHaveBeenCalledTimes(1);
	});

	it('filters cadets by full name query (case-insensitive with trim)', async () => {
		dbState.cadets = {
			[GRAY_KEY]: {
				firstName: 'Sadie',
				lastName: 'Gray',
			},
			[WHITFIELD_KEY]: {
				firstName: 'Ryan',
				lastName: 'Whitfield',
			},
		};

		const { result } = renderHook(() => useSearchLogic());

		await waitFor(() => {
			expect(result.current.loadingCadets).toBe(false);
		});

		act(() => {
			result.current.setQuery('  RYAN WHITFIELD  ');
		});

		expect(result.current.filteredCadets.map((cadet) => cadet.cadetKey)).toEqual([WHITFIELD_KEY]);
	});

	it('filters cadets by rank, job, flight, class year, and school email fields', async () => {
		dbState.cadets = {
			[GRAY_KEY]: {
				firstName: 'Sadie',
				lastName: 'Gray',
				cadetRank: 'C/Lt Col',
				job: 'Cadet Vice Wing Commander',
				flight: 'POC',
				classYear: 400,
				contact: {
					schoolEmail: 'grasv@rhodes.edu',
				},
			},
			[WHITFIELD_KEY]: {
				firstName: 'Ryan',
				lastName: 'Whitfield',
				cadetRank: 'C/4C',
				job: 'N/A',
				flight: 'Alpha',
				classYear: 150,
				contact: {
					schoolEmail: 'rjwhtfld@memphis.edu',
				},
			},
		};

		const { result } = renderHook(() => useSearchLogic());

		await waitFor(() => {
			expect(result.current.loadingCadets).toBe(false);
		});

		act(() => {
			result.current.setQuery('lt col');
		});
		expect(result.current.filteredCadets.map((cadet) => cadet.cadetKey)).toEqual([GRAY_KEY]);

		act(() => {
			result.current.setQuery('wing commander');
		});
		expect(result.current.filteredCadets.map((cadet) => cadet.cadetKey)).toEqual([GRAY_KEY]);

		act(() => {
			result.current.setQuery('alpha');
		});
		expect(result.current.filteredCadets.map((cadet) => cadet.cadetKey)).toEqual([WHITFIELD_KEY]);

		act(() => {
			result.current.setQuery('400');
		});
		expect(result.current.filteredCadets.map((cadet) => cadet.cadetKey)).toEqual([GRAY_KEY]);

		act(() => {
			result.current.setQuery('memphis.edu');
		});
		expect(result.current.filteredCadets.map((cadet) => cadet.cadetKey)).toEqual([WHITFIELD_KEY]);
	});

	it('executes first-name and last-name fallback checks when full-name short-circuit is bypassed', async () => {
		dbState.cadets = {
			[GRAY_KEY]: {
				firstName: 'Sadie',
				lastName: 'Gray',
			},
		};

		const originalIncludes = String.prototype.includes;
		const includesSpy = jest
			.spyOn(String.prototype, 'includes')
			.mockImplementation(function (this: string, searchString: string, position?: number) {
				const haystack = this.toLowerCase();
				const needle = String(searchString).toLowerCase();

				if (haystack === 'sadie gray' && (needle === 'sadie' || needle === 'gray')) {
					return false;
				}

				return originalIncludes.call(this, searchString, position);
			});

		const { result } = renderHook(() => useSearchLogic());

		await waitFor(() => {
			expect(result.current.loadingCadets).toBe(false);
		});

		act(() => {
			result.current.setQuery('sadie');
		});
		expect(result.current.filteredCadets.map((cadet) => cadet.cadetKey)).toEqual([GRAY_KEY]);

		act(() => {
			result.current.setQuery('gray');
		});
		expect(result.current.filteredCadets.map((cadet) => cadet.cadetKey)).toEqual([GRAY_KEY]);

		includesSpy.mockRestore();
	});

	it('sorts cadets safely when first/last names are missing', async () => {
		dbState.cadets = {
			cadet_b: {
				firstName: 'Beta',
			},
			cadet_a: {
				firstName: 'Alpha',
			},
			[STEVENSON_KEY]: {
				firstName: 'Camren',
				lastName: 'Stevenson',
			},
		};

		const { result } = renderHook(() => useSearchLogic());

		await waitFor(() => {
			expect(result.current.loadingCadets).toBe(false);
		});

		expect(result.current.filteredCadets.map((cadet) => cadet.cadetKey)).toEqual([
			'cadet_a',
			'cadet_b',
		]);
	});

	it('returns no results when query matches nothing and handles undefined cadets data', async () => {
		dbState.cadets = undefined;

		const { result } = renderHook(() => useSearchLogic());

		await waitFor(() => {
			expect(result.current.loadingCadets).toBe(false);
		});
		expect(result.current.filteredCadets).toHaveLength(0);

		act(() => {
			emitValue('cadets', {
				[GRAY_KEY]: {
					firstName: 'Sadie',
					lastName: 'Gray',
				},
			});
			result.current.setQuery('zzz-not-found');
		});

		expect(result.current.filteredCadets).toHaveLength(0);
	});

	it('sets search error when realtime cadets listener errors', async () => {
		dbState.cadets = {
			[GRAY_KEY]: { firstName: 'Sadie', lastName: 'Gray' },
		};

		const { result } = renderHook(() => useSearchLogic());

		await waitFor(() => {
			expect(result.current.loadingCadets).toBe(false);
		});

		act(() => {
			emitError('cadets', new Error('listener failed'));
		});

		await waitFor(() => {
			expect(result.current.searchError).toBe('Could not load cadets.');
			expect(result.current.loadingCadets).toBe(false);
		});
		expect(console.error).toHaveBeenCalled();
	});

	it('sets startup error when search initialization throws and cleanup handles null unsubscribe', async () => {
		const asyncError = new Error('storage unavailable');
		(AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(asyncError);

		const { result, unmount } = renderHook(() => useSearchLogic());

		await waitFor(() => {
			expect(result.current.searchError).toBe('Could not start search.');
			expect(result.current.loadingCadets).toBe(false);
		});

		expect(firebaseDatabase.onValue).not.toHaveBeenCalled();
		unmount();
	});
});

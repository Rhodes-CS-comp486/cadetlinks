import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebaseDatabase from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { useHomeLogic, cadetObject } from '../../src/navigation/screens/HomePage/HomeLogic';
import { PERMISSIONS } from '../../src/assets/constants';

type Snapshot = {
	val: () => unknown;
	exists: () => boolean;
};

type Listener = {
	next: (snapshot: Snapshot) => void;
	unsubscribe: jest.Mock;
};

const dbState: Record<string, unknown> = {};
const getResponses: Record<string, { exists: boolean; value?: unknown }> = {};
const listeners: Record<string, Listener[]> = {};

const makeSnapshot = (value: unknown, exists = value !== undefined && value !== null): Snapshot => ({
	val: () => value,
	exists: () => exists,
});

const emitValue = (path: string, value: unknown) => {
	dbState[path] = value;
	(listeners[path] || []).forEach((listener) => listener.next(makeSnapshot(value)));
};

const STEVENSON_KEY = 'stecj_26_rhodes_edu';
const GRAY_KEY = 'grasv_26_rhodes_edu';
const WHITFIELD_KEY = 'rjwhtfld_memphis_edu';

const mockNavigate = jest.fn();
const mockSetOptions = jest.fn();

jest.mock('../../src/firebase/config', () => ({
	db: { mockedDb: true },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
	useNavigation: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
	Ionicons: 'Ionicons',
}));

jest.mock('firebase/database', () => ({
	ref: jest.fn((_db: unknown, path: string) => ({ path })),
	get: jest.fn((refObj: { path: string }) => {
		const response = getResponses[refObj.path] || { exists: false, value: undefined };
		return Promise.resolve(makeSnapshot(response.value, response.exists));
	}),
	onValue: jest.fn((refObj: { path: string }, next: (snapshot: Snapshot) => void) => {
		const unsubscribe = jest.fn();
		if (!listeners[refObj.path]) {
			listeners[refObj.path] = [];
		}
		listeners[refObj.path].push({ next, unsubscribe });
		next(makeSnapshot(dbState[refObj.path]));
		return unsubscribe;
	}),
}));

describe('useHomeLogic', () => {
	beforeEach(() => {
		Object.keys(dbState).forEach((k) => delete dbState[k]);
		Object.keys(getResponses).forEach((k) => delete getResponses[k]);
		Object.keys(listeners).forEach((k) => delete listeners[k]);
		jest.clearAllMocks();

		(useNavigation as jest.Mock).mockReturnValue({
			navigate: mockNavigate,
			setOptions: mockSetOptions,
		});

		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(STEVENSON_KEY);
	});

	it('loads Stevenson profile and grants only Upload Documents permission', async () => {
		getResponses[`cadets/${STEVENSON_KEY}`] = {
			exists: true,
			value: {
				firstName: 'Camren',
				lastName: 'Stevenson',
				cadetRank: 'C/Maj',
				classYear: 400,
				flight: 'POC',
				job: 'A1 Director',
			},
		};
		getResponses['indexes/permissions/A1 Director'] = {
			exists: true,
			value: {
				[PERMISSIONS.FILE_UPLOADING]: true,
			},
		};

		const { result } = renderHook(() => useHomeLogic());

		await waitFor(() => {
			expect(result.current.hasPermission(PERMISSIONS.FILE_UPLOADING)).toBe(true);
		});

		expect(result.current.hasPermission(PERMISSIONS.EVENT_MAKING)).toBe(false);
		expect(result.current.hasPermission(PERMISSIONS.ATTENDANCE_EDITING)).toBe(false);
		expect(cadetObject?.job).toBe('A1 Director');
		expect(result.current.announcements).toHaveLength(5);
	});

	it('loads Gray profile and grants create events, upload docs, and attendance editing', async () => {
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(GRAY_KEY);
		getResponses[`cadets/${GRAY_KEY}`] = {
			exists: true,
			value: {
				firstName: 'Sadie',
				lastName: 'Gray',
				cadetRank: 'C/Lt Col',
				classYear: 400,
				flight: 'POC',
				job: 'Cadet Vice Wing Commander',
			},
		};
		getResponses['indexes/permissions/Cadet Vice Wing Commander'] = {
			exists: true,
			value: {
				[PERMISSIONS.EVENT_MAKING]: true,
				[PERMISSIONS.FILE_UPLOADING]: true,
				[PERMISSIONS.ATTENDANCE_EDITING]: true,
			},
		};

		const { result } = renderHook(() => useHomeLogic());

		await waitFor(() => {
			expect(result.current.hasPermission(PERMISSIONS.EVENT_MAKING)).toBe(true);
			expect(result.current.hasPermission(PERMISSIONS.FILE_UPLOADING)).toBe(true);
			expect(result.current.hasPermission(PERMISSIONS.ATTENDANCE_EDITING)).toBe(true);
		});
	});

	it('loads Whitfield profile and keeps no permissions when permissions node is missing', async () => {
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(WHITFIELD_KEY);
		getResponses[`cadets/${WHITFIELD_KEY}`] = {
			exists: true,
			value: {
				firstName: 'Ryan',
				lastName: 'Whitfield',
				cadetRank: 'C/4C',
				classYear: 150,
				flight: 'Alpha',
				job: 'N/A',
			},
		};
		getResponses['indexes/permissions/N/A'] = { exists: false };

		const { result } = renderHook(() => useHomeLogic());

		await waitFor(() => {
			expect(firebaseDatabase.get).toHaveBeenCalledWith({ path: `cadets/${WHITFIELD_KEY}` });
		});

		expect(result.current.hasPermission(PERMISSIONS.EVENT_MAKING)).toBe(false);
		expect(result.current.hasPermission(PERMISSIONS.FILE_UPLOADING)).toBe(false);
		expect(result.current.hasPermission(PERMISSIONS.ATTENDANCE_EDITING)).toBe(false);
	});

	it('filters/sorts upcoming events and ignores invalid event date rows', async () => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date(2026, 3, 14, 10, 0, 0));

		dbState.events = {
			e1: {
				eventName: 'Today Later',
				date: '2026-04-14',
				time: '15:00:00',
				details: 'Today',
				locationId: 'A',
				mandatory: true,
			},
			e2: {
				eventName: 'Tomorrow',
				date: '2026-04-15',
				time: '09:30:00',
				details: 'Tomorrow',
				locationId: 'B',
				mandatory: 'true',
			},
			e3: {
				eventName: 'Day After Tomorrow',
				date: '2026-04-16',
				time: '08:00:00',
				details: 'DAT',
				locationId: 'C',
				mandatory: false,
			},
			e4: {
				eventName: 'Too Far Out',
				date: '2026-04-17',
				time: '08:00:00',
				details: 'Outside window',
				locationId: 'D',
				mandatory: false,
			},
			bad: {
				eventName: 'Invalid Event',
				date: 'not-a-date',
				time: '07:00:00',
				details: 'bad',
				locationId: 'E',
				mandatory: false,
			},
		};

		const { result } = renderHook(() => useHomeLogic());

		await waitFor(() => {
			expect(result.current.upcomingEvents).toHaveLength(3);
		});

		expect(result.current.upcomingEvents.map((e) => e.id)).toEqual(['e1', 'e2', 'e3']);
		expect(result.current.upcomingEvents[0].type).toBe('Mandatory');
		expect(result.current.upcomingEvents[1].type).toBe('Mandatory');
		expect(result.current.upcomingEvents[2].type).toBe('RSVP');

		jest.useRealTimers();
	});

	it('sets nav header options and unsubscribes events listener on unmount', async () => {
		dbState.events = {};
		getResponses[`cadets/${STEVENSON_KEY}`] = {
			exists: true,
			value: { job: 'A1 Director' },
		};
		getResponses['indexes/permissions/A1 Director'] = { exists: true, value: {} };

		const { unmount } = renderHook(() => useHomeLogic());

		await waitFor(() => {
			expect(mockSetOptions).toHaveBeenCalled();
			expect(firebaseDatabase.onValue).toHaveBeenCalledWith(
				{ path: 'events' },
				expect.any(Function)
			);
		});

		const eventsUnsub = listeners.events[0].unsubscribe;
		const setOptionsArg = (mockSetOptions as jest.Mock).mock.calls[0][0];
		const headerRightElement = setOptionsArg.headerRight();

		act(() => {
			headerRightElement.props.onPress();
		});

		expect(mockNavigate).toHaveBeenCalledWith('Settings');
		unmount();
		expect(eventsUnsub).toHaveBeenCalledTimes(1);
	});

	it('updates upcoming events when realtime events listener emits later', async () => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date(2026, 3, 14, 10, 0, 0));
		dbState.events = {};

		const { result } = renderHook(() => useHomeLogic());

		await waitFor(() => {
			expect(result.current.upcomingEvents).toHaveLength(0);
		});

		act(() => {
			emitValue('events', {
				live1: {
					eventName: 'Live Event',
					date: '2026-04-15',
					time: '10:00:00',
					details: 'live',
					locationId: 'X',
					mandatory: false,
				},
			});
		});

		await waitFor(() => {
			expect(result.current.upcomingEvents).toHaveLength(1);
			expect(result.current.upcomingEvents[0].id).toBe('live1');
		});

		jest.useRealTimers();
	});

	it('handles missing stored cadet key by warning and skipping profile load', async () => {
		const warnSpy = jest.spyOn(console, 'warn').mockImplementation(jest.fn());
		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

		const { result } = renderHook(() => useHomeLogic());

		await waitFor(() => {
			expect(warnSpy).toHaveBeenCalledWith('No cadetKey found in AsyncStorage');
		});

		expect(result.current.hasPermission(PERMISSIONS.EVENT_MAKING)).toBe(false);
		expect(result.current.hasPermission(PERMISSIONS.FILE_UPLOADING)).toBe(false);
		expect(result.current.hasPermission(PERMISSIONS.ATTENDANCE_EDITING)).toBe(false);
		expect(firebaseDatabase.get).not.toHaveBeenCalledWith({ path: expect.stringMatching(/^cadets\//) });

		warnSpy.mockRestore();
	});

	it('sets empty permission map when cadet profile snapshot does not exist', async () => {
		getResponses[`cadets/${STEVENSON_KEY}`] = { exists: false };

		const { result } = renderHook(() => useHomeLogic());

		await waitFor(() => {
			expect(firebaseDatabase.get).toHaveBeenCalledWith({ path: `cadets/${STEVENSON_KEY}` });
		});

		expect(result.current.cadetPermissionsMap.size).toBe(0);
		expect(result.current.hasPermission(PERMISSIONS.EVENT_MAKING)).toBe(false);
		expect(result.current.hasPermission(PERMISSIONS.FILE_UPLOADING)).toBe(false);
		expect(result.current.hasPermission(PERMISSIONS.ATTENDANCE_EDITING)).toBe(false);
	});

	it('logs error when cadet data fetch throws', async () => {
		const errorSpy = jest.spyOn(console, 'error').mockImplementation(jest.fn());
		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(STEVENSON_KEY);
		jest.mocked(firebaseDatabase.get).mockRejectedValueOnce(new Error('db unavailable'));

		renderHook(() => useHomeLogic());

		await waitFor(() => {
			expect(errorSpy).toHaveBeenCalledWith(
				'Error fetching cadet data:',
				expect.any(Error)
			);
		});

		errorSpy.mockRestore();
	});

	it('returns early from layout effect when navigation.setOptions is not a function', async () => {
		(useNavigation as jest.Mock).mockReturnValue({
			navigate: mockNavigate,
		});

		renderHook(() => useHomeLogic());

		await waitFor(() => {
			expect(firebaseDatabase.onValue).toHaveBeenCalledWith(
				{ path: 'events' },
				expect.any(Function)
			);
		});

		expect(mockSetOptions).not.toHaveBeenCalled();
	});
});

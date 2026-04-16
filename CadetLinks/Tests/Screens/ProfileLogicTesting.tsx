import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebaseDatabase from 'firebase/database';
import { useProfileLogic } from '../../src/navigation/screens/ProfilePage/ProfileLogic';

type Snapshot = {
	val: () => unknown;
	exists: () => boolean;
};

type Listener = {
	next: (snapshot: Snapshot) => void;
	error?: (error: Error) => void;
	unsubscribe: jest.Mock;
};

const dbState: Record<string, unknown> = {};
const getResponses: Record<string, { exists: boolean; value?: unknown }> = {};
const listeners: Record<string, Listener[]> = {};
const STEVENSON_KEY = 'stecj_26_rhodes_edu';
const GRAY_KEY = 'grasv_26_rhodes_edu';
const WHITFIELD_KEY = 'rjwhtfld_memphis_edu';
const DEFAULT_CADET_KEY = STEVENSON_KEY;

const makeSnapshot = (value: unknown, exists = value !== undefined && value !== null): Snapshot => ({
	val: () => value,
	exists: () => exists,
});

const emitValue = (path: string, value: unknown) => {
	dbState[path] = value;
	(listeners[path] || []).forEach((listener) => listener.next(makeSnapshot(value)));
};

const emitError = (path: string, message = 'listener failed') => {
	(listeners[path] || []).forEach((listener) => listener.error?.(new Error(message)));
};

jest.mock('../../src/firebase/config', () => ({
	db: { mockedDb: true },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn(),
}));

jest.mock('firebase/database', () => ({
	ref: jest.fn((_db: unknown, path: string) => ({ path })),
	get: jest.fn((refObj: { path: string }) => {
		const response = getResponses[refObj.path] || { exists: false, value: undefined };
		return Promise.resolve(makeSnapshot(response.value, response.exists));
	}),
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
			listeners[refObj.path].push({ next, error, unsubscribe });
			next(makeSnapshot(dbState[refObj.path]));
			return unsubscribe;
		}
	),
}));

describe('useProfileLogic', () => {
	let consoleErrorSpy: jest.SpyInstance;
	let consoleLogSpy: jest.SpyInstance;

	beforeEach(() => {
		Object.keys(dbState).forEach((k) => delete dbState[k]);
		Object.keys(getResponses).forEach((k) => delete getResponses[k]);
		Object.keys(listeners).forEach((k) => delete listeners[k]);
		jest.clearAllMocks();
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(DEFAULT_CADET_KEY);
		// Some tests intentionally exercise error branches; suppress expected console output.
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
		consoleLogSpy.mockRestore();
	});

	it('returns no-user errors and zeroed attendance when no user is logged in', async () => {
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

		const { result } = renderHook(() => useProfileLogic());

		await waitFor(() => {
			expect(result.current.loadingProfile).toBe(false);
			expect(result.current.loadingAttendance).toBe(false);
		});

		expect(result.current.cadetKey).toBeNull();
		expect(result.current.profile).toBeNull();
		expect(result.current.profileError).toBe('No user is logged in.');
		expect(result.current.attendanceError).toBe('No user is logged in.');
		expect(result.current.ptAttended).toBe(0);
		expect(result.current.ptMissed).toBe(0);
		expect(result.current.ptExcused).toBe(0);
		expect(result.current.ptLate).toBe(0);
		expect(result.current.llabAttended).toBe(0);
		expect(result.current.llabMissed).toBe(0);
		expect(result.current.llabExcused).toBe(0);
		expect(result.current.llabLate).toBe(0);
		expect(firebaseDatabase.get).not.toHaveBeenCalled();
		expect(firebaseDatabase.onValue).not.toHaveBeenCalled();
	});

	it('tracks PT and LLAB correctly for Stevenson profile', async () => {
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

		dbState['attendance/PT'] = {
			'2026-04-01': { stevenson: { status: 'P' } },
			'2026-04-02': { stevenson: { status: 'P' } },
			'2026-04-03': { stevenson: { status: 'L' } },
			'2026-04-06': { someoneelse: { status: 'P' } },
		};

		dbState['attendance/LLAB'] = {
			'2026-04-01': { stevenson: { status: 'P' } },
			'2026-04-02': { stevenson: { status: 'A' } },
			'2026-04-03': { stevenson: { status: 'E' } },
		};

		const { result } = renderHook(() => useProfileLogic());

		await waitFor(() => {
			expect(result.current.loadingProfile).toBe(false);
			expect(result.current.loadingAttendance).toBe(false);
			expect(result.current.profile?.lastName).toBe('Stevenson');
		});

		expect(result.current.cadetKey).toBe(STEVENSON_KEY);
		expect(result.current.profileError).toBeNull();
		expect(result.current.attendanceError).toBeNull();
		expect(result.current.profile?.firstName).toBe('Camren');
		expect(result.current.profile?.cadetRank).toBe('C/Maj');
		expect(result.current.profile?.classYear).toBe(400);
		expect(result.current.profile?.flight).toBe('POC');
		expect(result.current.profile?.job).toBe('A1 Director');

		expect(result.current.ptAttended).toBe(2);
		expect(result.current.ptMissed).toBe(0);
		expect(result.current.ptExcused).toBe(0);
		expect(result.current.ptLate).toBe(1);
		expect(result.current.ptAttendancePercent).toBe(83);
		expect(result.current.ptInGoodStanding).toBe(false);

		expect(result.current.llabAttended).toBe(1);
		expect(result.current.llabMissed).toBe(1);
		expect(result.current.llabExcused).toBe(1);
		expect(result.current.llabLate).toBe(0);
		expect(result.current.llabAttendancePercent).toBe(50);
		expect(result.current.llabInGoodStanding).toBe(false);
	});

	it('tracks PT and LLAB correctly for Gray profile', async () => {
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

		dbState['attendance/PT'] = {
			'2026-04-01': { gray: { status: 'P' } },
			'2026-04-02': { gray: { status: 'P' } },
			'2026-04-03': { gray: { status: 'P' } },
			'2026-04-04': { gray: { status: 'L' } },
		};

		dbState['attendance/LLAB'] = {
			'2026-04-01': { gray: { status: 'P' } },
			'2026-04-02': { gray: { status: 'P' } },
			'2026-04-03': { gray: { status: 'P' } },
			'2026-04-04': { gray: { status: 'P' } },
		};

		const { result } = renderHook(() => useProfileLogic());

		await waitFor(() => {
			expect(result.current.loadingProfile).toBe(false);
			expect(result.current.loadingAttendance).toBe(false);
			expect(result.current.profile?.lastName).toBe('Gray');
		});

		expect(result.current.cadetKey).toBe(GRAY_KEY);
		expect(result.current.ptAttended).toBe(3);
		expect(result.current.ptLate).toBe(1);
		expect(result.current.ptAttendancePercent).toBe(88);
		expect(result.current.ptInGoodStanding).toBe(false);

		expect(result.current.llabAttended).toBe(4);
		expect(result.current.llabMissed).toBe(0);
		expect(result.current.llabAttendancePercent).toBe(100);
		expect(result.current.llabInGoodStanding).toBe(true);
	});

	it('tracks PT and LLAB correctly for Whitfield profile', async () => {
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

		dbState['attendance/PT'] = {
			'2026-04-01': { whitfield: { status: 'A' } },
			'2026-04-02': { whitfield: { status: 'E' } },
		};

		dbState['attendance/LLAB'] = {
			'2026-04-01': { whitfield: { status: 'P' } },
			'2026-04-02': { whitfield: { status: 'L' } },
		};

		const { result } = renderHook(() => useProfileLogic());

		await waitFor(() => {
			expect(result.current.loadingProfile).toBe(false);
			expect(result.current.loadingAttendance).toBe(false);
			expect(result.current.profile?.lastName).toBe('Whitfield');
		});

		expect(result.current.cadetKey).toBe(WHITFIELD_KEY);
		expect(result.current.ptAttended).toBe(0);
		expect(result.current.ptMissed).toBe(1);
		expect(result.current.ptExcused).toBe(1);
		expect(result.current.ptLate).toBe(0);
		expect(result.current.ptAttendancePercent).toBe(0);
		expect(result.current.ptInGoodStanding).toBe(false);

		expect(result.current.llabAttended).toBe(1);
		expect(result.current.llabMissed).toBe(0);
		expect(result.current.llabLate).toBe(1);
		expect(result.current.llabAttendancePercent).toBe(75);
		expect(result.current.llabInGoodStanding).toBe(false);
	});

	it('falls back to cadet key for attendance lookup when profile does not exist', async () => {
		getResponses[`cadets/${DEFAULT_CADET_KEY}`] = { exists: false };
		dbState['attendance/PT'] = {
			'2026-04-01': { [DEFAULT_CADET_KEY]: { status: 'P' } },
			'2026-04-02': { [DEFAULT_CADET_KEY]: { status: 'L' } },
		};
		dbState['attendance/LLAB'] = {
			'2026-04-01': { [DEFAULT_CADET_KEY]: { status: 'A' } },
			'2026-04-02': { [DEFAULT_CADET_KEY]: { status: 'E' } },
		};

		const { result } = renderHook(() => useProfileLogic());

		await waitFor(() => {
			expect(result.current.loadingProfile).toBe(false);
			expect(result.current.loadingAttendance).toBe(false);
		});

		expect(result.current.profile).toBeNull();
		expect(result.current.profileError).toBe('No profile found for this user.');

		expect(result.current.ptAttended).toBe(1);
		expect(result.current.ptLate).toBe(1);
		expect(result.current.llabMissed).toBe(1);
		expect(result.current.llabExcused).toBe(1);
	});

	it('sets profile and attendance errors when initial profile get throws', async () => {
		(firebaseDatabase.get as jest.Mock).mockRejectedValueOnce(new Error('get failed'));

		const { result } = renderHook(() => useProfileLogic());

		await waitFor(() => {
			expect(result.current.loadingProfile).toBe(false);
			expect(result.current.loadingAttendance).toBe(false);
		});

		expect(result.current.profileError).toBe('Could not load profile.');
		expect(result.current.attendanceError).toBe('Could not load attendance.');
		expect(firebaseDatabase.onValue).not.toHaveBeenCalled();
	});

	it('sets attendance error when PT listener errors', async () => {
		getResponses[`cadets/${DEFAULT_CADET_KEY}`] = { exists: true, value: { lastName: 'Smith' } };
		dbState['attendance/PT'] = {};
		dbState['attendance/LLAB'] = {};

		const { result } = renderHook(() => useProfileLogic());

		await waitFor(() => {
			expect(result.current.loadingProfile).toBe(false);
		});

		act(() => {
			emitError('attendance/PT', 'PT listen error');
		});

		await waitFor(() => {
			expect(result.current.attendanceError).toBe('Could not load PT attendance.');
			expect(result.current.loadingAttendance).toBe(false);
		});
	});

	it('sets attendance error when LLAB listener errors', async () => {
		getResponses[`cadets/${DEFAULT_CADET_KEY}`] = { exists: true, value: { lastName: 'Smith' } };
		dbState['attendance/PT'] = {};
		dbState['attendance/LLAB'] = {};

		const { result } = renderHook(() => useProfileLogic());

		await waitFor(() => {
			expect(result.current.loadingProfile).toBe(false);
		});

		act(() => {
			emitError('attendance/LLAB', 'LLAB listen error');
		});

		await waitFor(() => {
			expect(result.current.attendanceError).toBe('Could not load LLAB attendance.');
			expect(result.current.loadingAttendance).toBe(false);
		});
	});

	it('updates counts in real time when attendance listeners emit new values', async () => {
		getResponses[`cadets/${DEFAULT_CADET_KEY}`] = { exists: true, value: { lastName: 'Smith' } };
		dbState['attendance/PT'] = {
			'2026-04-01': { smith: { status: 'P' } },
		};
		dbState['attendance/LLAB'] = {
			'2026-04-01': { smith: { status: 'A' } },
		};

		const { result } = renderHook(() => useProfileLogic());

		await waitFor(() => {
			expect(result.current.ptAttended).toBe(1);
			expect(result.current.llabMissed).toBe(1);
		});

		act(() => {
			emitValue('attendance/PT', {
				'2026-04-01': { smith: { status: 'P' } },
				'2026-04-02': { smith: { status: 'L' } },
				'2026-04-03': { smith: { status: 'A' } },
			});
			emitValue('attendance/LLAB', {
				'2026-04-01': { smith: { status: 'P' } },
				'2026-04-02': { smith: { status: 'P' } },
			});
		});

		await waitFor(() => {
			expect(result.current.ptAttended).toBe(1);
			expect(result.current.ptLate).toBe(1);
			expect(result.current.ptMissed).toBe(1);
			expect(result.current.llabAttended).toBe(2);
			expect(result.current.llabMissed).toBe(0);
		});
	});

	it('unsubscribes both PT and LLAB listeners on unmount', async () => {
		getResponses[`cadets/${DEFAULT_CADET_KEY}`] = { exists: true, value: { lastName: 'Smith' } };
		dbState['attendance/PT'] = {};
		dbState['attendance/LLAB'] = {};

		const { unmount } = renderHook(() => useProfileLogic());

		await waitFor(() => {
			expect(firebaseDatabase.onValue).toHaveBeenCalledTimes(2);
		});

		const ptUnsub = listeners['attendance/PT'][0].unsubscribe;
		const llabUnsub = listeners['attendance/LLAB'][0].unsubscribe;

		unmount();

		expect(ptUnsub).toHaveBeenCalledTimes(1);
		expect(llabUnsub).toHaveBeenCalledTimes(1);
	});
});

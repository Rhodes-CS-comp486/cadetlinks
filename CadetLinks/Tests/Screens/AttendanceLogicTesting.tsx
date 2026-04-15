import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useAttendanceLogic,
  type AttendanceStatus,
} from '../../src/navigation/screens/JobsPage/AttendanceLogic';
import { useEvents } from '../../src/navigation/screens/EventsPage/EventsLogic';
import { useProfileLogic } from '../../src/navigation/screens/ProfilePage/ProfileLogic';

type Snapshot = {
  val: () => unknown;
  exists: () => boolean;
};

type Listener = {
  callback: (snapshot: Snapshot) => void;
  error?: (error: Error) => void;
};

const dbData: Record<string, unknown> = {};
const listeners: Record<string, Listener[]> = {};

const STEVENSON_KEY = 'stecj_26_rhodes_edu';
const GRAY_KEY = 'grasv_26_rhodes_edu';
const WHITFIELD_KEY = 'rjwhtfld_memphis_edu';

const makeSnapshot = (value: unknown): Snapshot => ({
  val: () => value,
  exists: () => value !== undefined && value !== null,
});

const getPathSegments = (path: string) => path.split('/').filter(Boolean);

const clone = <T,>(value: T): T => {
  if (value === undefined) {
    return value;
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const getAtPath = (path: string): unknown => {
  const segments = getPathSegments(path);
  let current: any = dbData;

  for (const segment of segments) {
    if (current == null || typeof current !== 'object' || !(segment in current)) {
      return undefined;
    }
    current = current[segment];
  }

  return current;
};

const setAtPath = (path: string, value: unknown) => {
  const segments = getPathSegments(path);
  if (segments.length === 0) {
    return;
  }

  let current: any = dbData;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const seg = segments[i];
    if (!current[seg] || typeof current[seg] !== 'object') {
      current[seg] = {};
    }
    current = current[seg];
  }

  current[segments[segments.length - 1]] = value;
};

const removeAtPath = (path: string) => {
  const segments = getPathSegments(path);
  if (segments.length === 0) {
    return;
  }

  let current: any = dbData;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const seg = segments[i];
    if (!current[seg] || typeof current[seg] !== 'object') {
      return;
    }
    current = current[seg];
  }

  delete current[segments[segments.length - 1]];
};

const relevantListenerPaths = (changedPath: string): string[] => {
  return Object.keys(listeners).filter(
    (listenerPath) =>
      changedPath === listenerPath ||
      changedPath.startsWith(`${listenerPath}/`) ||
      listenerPath.startsWith(`${changedPath}/`)
  );
};

const notifyListenersForPath = (changedPath: string) => {
  relevantListenerPaths(changedPath).forEach((listenerPath) => {
    const currentValue = clone(getAtPath(listenerPath));
    (listeners[listenerPath] || []).forEach((listener) => {
      listener.callback(makeSnapshot(currentValue));
    });
  });
};

const seedDb = (path: string, value: unknown) => {
  setAtPath(path, clone(value));
};

const getDbValue = (path: string) => clone(getAtPath(path));

jest.mock('../../src/firebase/config', () => ({
  db: { mockedDb: true },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(() => ({ mockedDb: true })),
  ref: jest.fn((_db: unknown, path: string) => ({ path })),
  get: jest.fn((refObj: { path: string }) => {
    return Promise.resolve(makeSnapshot(clone(getAtPath(refObj.path))));
  }),
  onValue: jest.fn(
    (
      refObj: { path: string },
      callback: (snapshot: Snapshot) => void,
      error?: (error: Error) => void
    ) => {
      if (!listeners[refObj.path]) {
        listeners[refObj.path] = [];
      }

      const entry: Listener = { callback, error };
      listeners[refObj.path].push(entry);
      callback(makeSnapshot(clone(getAtPath(refObj.path))));

      return () => {
        listeners[refObj.path] = (listeners[refObj.path] || []).filter((item) => item !== entry);
      };
    }
  ),
  set: jest.fn((refObj: { path: string }, value: unknown) => {
    setAtPath(refObj.path, clone(value));
    notifyListenersForPath(refObj.path);
    return Promise.resolve();
  }),
  update: jest.fn((_refObj: { path?: string }, updates: Record<string, unknown>) => {
    Object.entries(updates).forEach(([path, value]) => {
      setAtPath(path, clone(value));
      notifyListenersForPath(path);
    });
    return Promise.resolve();
  }),
  remove: jest.fn((refObj: { path: string }) => {
    removeAtPath(refObj.path);
    notifyListenersForPath(refObj.path);
    return Promise.resolve();
  }),
}));

describe('useAttendanceLogic - unit', () => {
  beforeEach(() => {
    Object.keys(dbData).forEach((k) => delete dbData[k]);
    Object.keys(listeners).forEach((k) => delete listeners[k]);
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 3, 14, 9, 0, 0));
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.useRealTimers();
    (Alert.alert as jest.Mock).mockRestore?.();
  });

  it('loads today events/cadets, supports status edits, and writes attendance updates', async () => {
    seedDb('events', {
      e1: {
        eventName: 'PT Morning Session',
        date: '2026-04-14',
        time: '08:00:00',
      },
      e2: {
        eventName: 'LLAB Leadership',
        date: '2026-04-14',
        time: '14:00:00',
      },
      e3: {
        eventName: 'Future Event',
        date: '2026-04-15',
        time: '09:00:00',
      },
    });

    seedDb('cadets', {
      [GRAY_KEY]: { firstName: 'Sadie', lastName: 'Gray' },
      [STEVENSON_KEY]: { firstName: 'Camren', lastName: 'Stevenson' },
      [WHITFIELD_KEY]: { firstName: 'Ryan', lastName: 'Whitfield' },
    });

    const { result } = renderHook(() => useAttendanceLogic());

    await act(async () => {
      await result.current.openAttendanceModal();
    });

    expect(result.current.attendanceModalVisible).toBe(true);
    expect(result.current.todayEvents.map((e) => e.id)).toEqual(['e1', 'e2']);
    expect(result.current.allCadets.map((c) => c.fullName)).toEqual([
      'Camren Stevenson',
      'Ryan Whitfield',
      'Sadie Gray',
    ]);

    act(() => {
      result.current.selectEvent('e1');
      result.current.setCadetStatus(STEVENSON_KEY, 'A');
      result.current.setCadetStatus(GRAY_KEY, 'L');
    });

    expect(result.current.getCadetStatus(STEVENSON_KEY)).toBe('A');
    expect(result.current.getCadetStatus(GRAY_KEY)).toBe('L');
    expect(result.current.getCadetStatus(WHITFIELD_KEY)).toBe('P');
    expect(result.current.markedAbsentCount).toBe(1);
    expect(result.current.markedLateCount).toBe(1);

    await act(async () => {
      await result.current.submitAttendance();
    });

    expect(getDbValue('attendance/PT/2026-04-14/stevenson')).toEqual({ status: 'A' });
    expect(getDbValue('attendance/PT/2026-04-14/gray')).toEqual({ status: 'L' });
    expect(getDbValue('attendance/PT/2026-04-14/whitfield')).toEqual({ status: 'P' });

    expect(Alert.alert).toHaveBeenCalledWith('Success', 'Attendance was saved.');
  });

  it('clearSelectedAttendance removes selected event attendance after clear confirm', async () => {
    seedDb('events', {
      e1: {
        eventName: 'LLAB Drill',
        date: '2026-04-14',
        time: '10:00:00',
      },
    });

    seedDb('cadets', {
      [STEVENSON_KEY]: { firstName: 'Camren', lastName: 'Stevenson' },
    });

    seedDb('attendance/LLAB/2026-04-14/stevenson', { status: 'A' });
    const { result } = renderHook(() => useAttendanceLogic());

    await act(async () => {
      await result.current.openAttendanceModal();
    });

    act(() => {
      result.current.selectEvent('e1');
    });

    await waitFor(() => {
      expect(result.current.selectedEventId).toBe('e1');
    });

    act(() => {
      result.current.clearSelectedAttendance();
    });

    const clearCall = (Alert.alert as jest.Mock).mock.calls.find(
      (call) => call[0] === 'Clear Attendance'
    );
    expect(clearCall).toBeDefined();

    const buttons = clearCall?.[2] as Array<{ text: string; onPress?: () => void }>;
    const clearButton = buttons.find((b) => b.text === 'Clear');
    expect(clearButton?.onPress).toBeDefined();

    await act(async () => {
      await clearButton?.onPress?.();
    });

    expect(getDbValue('attendance/LLAB/2026-04-14')).toBeUndefined();
    expect(Alert.alert).toHaveBeenCalledWith('Cleared', 'Attendance was cleared for that event.');
  });
});

describe('Integration: useEvents + useAttendanceLogic + useProfileLogic', () => {
  beforeEach(() => {
    Object.keys(dbData).forEach((k) => delete dbData[k]);
    Object.keys(listeners).forEach((k) => delete listeners[k]);
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 3, 14, 9, 0, 0));
    jest.spyOn(Math, 'random').mockReturnValue(0.1111);
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

    seedDb('cadets', {
      [STEVENSON_KEY]: {
        firstName: 'Camren',
        lastName: 'Stevenson',
        cadetRank: 'C/Maj',
        classYear: 400,
        job: 'A1 Director',
      },
      [GRAY_KEY]: {
        firstName: 'Sadie',
        lastName: 'Gray',
        cadetRank: 'C/Lt Col',
        classYear: 400,
        job: 'Cadet Vice Wing Commander',
      },
      [WHITFIELD_KEY]: {
        firstName: 'Ryan',
        lastName: 'Whitfield',
        cadetRank: 'C/4C',
        classYear: 150,
        job: 'N/A',
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    (Math.random as jest.Mock).mockRestore?.();
    (Alert.alert as jest.Mock).mockRestore?.();
  });

  it('new event today becomes attendable, attendance writes table, and profile PT metrics update', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(STEVENSON_KEY);

    const eventsHook = renderHook(() => useEvents());

    act(() => {
      eventsHook.result.current.setNewEvent({
        id: '',
        title: 'PT Leadership Session',
        date: new Date(2026, 3, 14, 0, 0, 0),
        time: new Date(2026, 3, 14, 7, 30, 0),
        description: 'Integration event',
        location: 'Field',
        type: 'Mandatory',
      });
    });

    await act(async () => {
      await eventsHook.result.current.handleConfirmAddEvent();
    });

    expect(getDbValue('events/1111')).toEqual(
      expect.objectContaining({
        eventName: 'PT Leadership Session',
        date: '2026-04-14',
      })
    );

    const attendanceHook = renderHook(() => useAttendanceLogic());

    await act(async () => {
      await attendanceHook.result.current.openAttendanceModal();
    });

    expect(attendanceHook.result.current.todayEvents.some((e) => e.id === '1111')).toBe(true);

    act(() => {
      attendanceHook.result.current.selectEvent('1111');
      attendanceHook.result.current.setCadetStatus(STEVENSON_KEY, 'A');
      attendanceHook.result.current.setCadetStatus(GRAY_KEY, 'L');
      attendanceHook.result.current.setCadetStatus(WHITFIELD_KEY, 'P');
    });

    await act(async () => {
      await attendanceHook.result.current.submitAttendance();
    });

    expect(getDbValue('attendance/PT/2026-04-14/stevenson')).toEqual({ status: 'A' });
    expect(getDbValue('attendance/PT/2026-04-14/gray')).toEqual({ status: 'L' });
    expect(getDbValue('attendance/PT/2026-04-14/whitfield')).toEqual({ status: 'P' });

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(STEVENSON_KEY);
    const profileStevenson = renderHook(() => useProfileLogic());
    await waitFor(() => {
      expect(profileStevenson.result.current.loadingAttendance).toBe(false);
    });
    expect(profileStevenson.result.current.ptMissed).toBe(1);
    expect(profileStevenson.result.current.ptAttendancePercent).toBe(0);

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(GRAY_KEY);
    const profileGray = renderHook(() => useProfileLogic());
    await waitFor(() => {
      expect(profileGray.result.current.loadingAttendance).toBe(false);
    });
    expect(profileGray.result.current.ptLate).toBe(1);
    expect(profileGray.result.current.ptAttendancePercent).toBe(50);

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(WHITFIELD_KEY);
    const profileWhitfield = renderHook(() => useProfileLogic());
    await waitFor(() => {
      expect(profileWhitfield.result.current.loadingAttendance).toBe(false);
    });
    expect(profileWhitfield.result.current.ptAttended).toBe(1);
    expect(profileWhitfield.result.current.ptAttendancePercent).toBe(100);
    expect(profileWhitfield.result.current.ptInGoodStanding).toBe(true);
  });
});

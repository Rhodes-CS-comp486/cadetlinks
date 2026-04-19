import { act, renderHook } from '@testing-library/react-native';
import { PERMISSIONS } from '../../src/assets/constants';
import { iconForAction, useActionsLogic } from '../../src/navigation/screens/ActionsPage/ActionsLogic';

const mockNavigate = jest.fn();
const mockOpenAttendanceModal = jest.fn();
const mockOpenDocumentUploadingModal = jest.fn(async () => {});
const mockInitializeGlobals = jest.fn(() => Promise.resolve());

let mockGlobalState: any = {};

jest.mock('@react-navigation/core', () => ({
  useNavigation: jest.fn(() => ({ navigate: mockNavigate })),
}));

jest.mock('../../src/navigation/screens/ActionsPage/AttendanceLogic', () => ({
  useAttendanceLogic: jest.fn(() => ({
    attendanceModalVisible: false,
    openAttendanceModal: mockOpenAttendanceModal,
  })),
}));

jest.mock('../../src/navigation/screens/ActionsPage/UploadDocsLogic', () => ({
  useDocumentUploadingLogic: jest.fn(() => ({
    openDocumentUploadingModal: mockOpenDocumentUploadingModal,
  })),
}));

jest.mock('../../src/firebase/globals', () => ({
  globals: () => mockGlobalState,
  initializeGlobals: () => mockInitializeGlobals(),
}));

function buildGlobalState(overrides: Partial<any> = {}) {
  return {
    isInitialized: true,
    isInitializing: false,
    cadetKey: 'cadet_key_123',
    profile: {
      firstName: 'Jane',
      lastName: 'Doe',
      job: 'Admin',
    },
    permissionsMap: new Map<string, boolean>([
      [PERMISSIONS.ATTENDANCE_EDITING, false],
      [PERMISSIONS.FILE_UPLOADING, false],
      [PERMISSIONS.EVENT_MAKING, false],
      [PERMISSIONS.ADMIN, false],
    ]),
    errors: {},
    ...overrides,
  };
}

describe('useActionsLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGlobalState = buildGlobalState();
  });

  it('returns empty actions when no permissions are granted', () => {
    const { result } = renderHook(() => useActionsLogic());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.fullName).toBe('Jane Doe');
    expect(result.current.jobText).toBe('Admin');
    expect(result.current.actions).toHaveLength(0);
    expect(result.current.anyVisibleActions).toBe(false);
  });

  it('creates attendance and upload actions when permissions are enabled', () => {
    mockGlobalState = buildGlobalState({
      permissionsMap: new Map<string, boolean>([
        [PERMISSIONS.ATTENDANCE_EDITING, true],
        [PERMISSIONS.FILE_UPLOADING, true],
        [PERMISSIONS.EVENT_MAKING, false],
        [PERMISSIONS.ADMIN, false],
      ]),
    });

    const { result } = renderHook(() => useActionsLogic());

    expect(result.current.actions.map((a: any) => a.id)).toEqual([
      PERMISSIONS.ATTENDANCE_EDITING,
      PERMISSIONS.FILE_UPLOADING,
      PERMISSIONS.ADMIN,
    ]);
    expect(result.current.anyVisibleActions).toBe(true);
  });

  it('opens attendance modal and handles file upload action', async () => {
    mockGlobalState = buildGlobalState({
      permissionsMap: new Map<string, boolean>([
        [PERMISSIONS.ATTENDANCE_EDITING, true],
        [PERMISSIONS.FILE_UPLOADING, true],
        [PERMISSIONS.EVENT_MAKING, false],
        [PERMISSIONS.ADMIN, false],
      ]),
    });

    const { result } = renderHook(() => useActionsLogic());

    const attendanceAction = result.current.actions.find((a: any) => a.id === PERMISSIONS.ATTENDANCE_EDITING);
    const uploadAction = result.current.actions.find((a: any) => a.id === PERMISSIONS.FILE_UPLOADING);

    act(() => {
      void result.current.onPressAction(attendanceAction);
    });
    expect(mockOpenAttendanceModal).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.onPressAction(uploadAction);
    });
    expect(mockOpenDocumentUploadingModal).toHaveBeenCalledTimes(1);
  });

  it('maps icons for known and unknown actions', () => {
    expect(iconForAction(PERMISSIONS.ATTENDANCE_EDITING as any)).toBe('checkbox-outline');
    expect(iconForAction(PERMISSIONS.FILE_UPLOADING as any)).toBe('cloud-upload-outline');
    expect(iconForAction(PERMISSIONS.ADMIN as any)).toBe('person-add-outline');
    expect(iconForAction(PERMISSIONS.EVENT_MAKING as any)).toBe('calendar-outline');
    expect(iconForAction('Unknown' as any)).toBe('briefcase-outline');
  });
});

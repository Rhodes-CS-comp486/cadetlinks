import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { PERMISSIONS } from '../../src/assets/constants';
import { useHomeLogic } from '../../src/navigation/screens/HomePage/HomeLogic';

const mockNavigate = jest.fn();
const mockSetOptions = jest.fn();
const mockInitializeGlobals = jest.fn(() => Promise.resolve());
const mockUpsertAnnouncement = jest.fn(() => Promise.resolve('announcement-1'));
const mockDeleteAnnouncement = jest.fn(() => Promise.resolve());

let mockGlobalState: any = {};

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: mockNavigate,
    setOptions: mockSetOptions,
  })),
}));

jest.mock('../../src/firebase/globals', () => ({
  PERMISSIONS: {
    EVENT_MAKING: 'Event Making',
    FILE_UPLOADING: 'File Uploading',
    ATTENDANCE_EDITING: 'Attendance Editing',
    ADMIN: 'Admin',
  },
  globals: () => mockGlobalState,
  initializeGlobals: () => mockInitializeGlobals(),
  upsertAnnouncement: (...args: any[]) => mockUpsertAnnouncement(...args),
  deleteAnnouncement: (...args: any[]) => mockDeleteAnnouncement(...args),
}));

function buildGlobalState(overrides: Partial<any> = {}) {
  return {
    isInitialized: true,
    isInitializing: false,
    profile: { firstName: 'Jane', lastName: 'Doe', job: 'Admin' },
    permissionsMap: new Map<string, boolean>([
      [PERMISSIONS.EVENT_MAKING, false],
      [PERMISSIONS.FILE_UPLOADING, false],
      [PERMISSIONS.ATTENDANCE_EDITING, false],
      [PERMISSIONS.ADMIN, true],
    ]),
    announcements: [
      { id: 'a1', title: 'A', body: 'B', importance: 'Low', retirementDate: new Date('2026-04-30') },
    ],
    userRsvpEventIds: new Set<string>(['rsvp-1']),
    events: [
      {
        id: 'mandatory-1',
        title: 'Mandatory Event',
        date: new Date('2026-04-20T00:00:00.000Z'),
        time: new Date('2026-04-20T14:00:00.000Z'),
        description: 'desc',
        location: 'Hall',
        type: 'Mandatory',
      },
      {
        id: 'rsvp-1',
        title: 'RSVP Event',
        date: new Date('2026-04-21T00:00:00.000Z'),
        time: new Date('2026-04-21T15:00:00.000Z'),
        description: 'desc',
        location: 'Gym',
        type: 'RSVP',
      },
      {
        id: 'rsvp-2',
        title: 'Hidden RSVP Event',
        date: new Date('2026-04-21T00:00:00.000Z'),
        time: new Date('2026-04-21T16:00:00.000Z'),
        description: 'desc',
        location: 'Track',
        type: 'RSVP',
      },
    ],
    ...overrides,
  };
}

describe('useHomeLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGlobalState = buildGlobalState();
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    (Alert.alert as jest.Mock).mockRestore?.();
  });

  it('filters upcoming events to mandatory and confirmed RSVP', () => {
    const { result } = renderHook(() => useHomeLogic());

    expect(result.current.upcomingEvents.map((e: any) => e.id)).toEqual(['mandatory-1', 'rsvp-1']);
  });

  it('returns permission checks from global permission map', () => {
    const { result } = renderHook(() => useHomeLogic());

    expect(result.current.hasPermission(PERMISSIONS.ADMIN)).toBe(true);
    expect(result.current.hasPermission(PERMISSIONS.ATTENDANCE_EDITING)).toBe(false);
  });

  it('creates and deletes announcement through globals actions', async () => {
    const { result } = renderHook(() => useHomeLogic());

    act(() => {
      result.current.handleAddAnnouncement();
      result.current.setNewAnnouncement({
        id: '',
        title: 'New Title',
        body: 'New Body',
        importance: 'High',
        retirementDate: new Date('2026-04-30T00:00:00.000Z'),
      });
    });

    await act(async () => {
      await result.current.handleConfirmAddAnnouncement();
    });

    expect(mockUpsertAnnouncement).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Title',
        body: 'New Body',
        importance: 'High',
      })
    );

    act(() => {
      result.current.handleDeleteAnnouncement('a1');
    });

    await act(async () => {
      await result.current.handleConfirmDeleteAnnouncement();
    });

    expect(mockDeleteAnnouncement).toHaveBeenCalledWith('a1');
  });
});

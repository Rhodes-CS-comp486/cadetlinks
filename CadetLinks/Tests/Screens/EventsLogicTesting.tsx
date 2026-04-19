import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useEvents } from '../../src/navigation/screens/EventsPage/EventsLogic';

const mockInitializeGlobals = jest.fn(() => Promise.resolve());
const mockAddEvent = jest.fn(() => Promise.resolve('1234'));
const mockRemoveEvent = jest.fn(() => Promise.resolve());
const mockSetUserRsvpStatus = jest.fn(() => Promise.resolve());

let mockGlobalState: any = {};

jest.mock('../../src/firebase/globals', () => ({
  PERMISSIONS: {
    EVENT_MAKING: 'Event Making',
    FILE_UPLOADING: 'File Uploading',
    ATTENDANCE_EDITING: 'Attendance Editing',
    ADMIN: 'Admin',
  },
  globals: () => mockGlobalState,
  initializeGlobals: () => mockInitializeGlobals(),
  addEvent: (...args: any[]) => mockAddEvent(...args),
  removeEvent: (...args: any[]) => mockRemoveEvent(...args),
  setUserRsvpStatus: (...args: any[]) => mockSetUserRsvpStatus(...args),
}));

function buildGlobalState(overrides: Partial<any> = {}) {
  return {
    isInitialized: true,
    isInitializing: false,
    profile: { job: 'Special Projects Officer' },
    permissionsMap: new Map<string, boolean>([['Event Making', true], ['Admin', false]]),
    events: [
      {
        id: 'e1',
        title: 'Drill Briefing',
        date: new Date('2026-04-20T00:00:00.000Z'),
        time: new Date('2026-04-20T13:00:00.000Z'),
        description: 'Uniform check',
        location: 'Hangar A',
        type: 'RSVP',
      },
    ],
    userRsvpStatusByEvent: { e1: true },
    ...overrides,
  };
}

describe('useEvents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGlobalState = buildGlobalState();
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
  });

  afterEach(() => {
    (Alert.alert as jest.Mock).mockRestore?.();
  });

  it('marks dates and returns events for selected date', () => {
    const { result } = renderHook(() => useEvents());

    act(() => {
      result.current.setSelectedDate('2026-04-20');
    });

    expect(result.current.markedDates['2026-04-20']).toEqual({ marked: true, dotColor: 'blue' });
    expect(result.current.eventsForSelectedDate).toHaveLength(1);
    expect(result.current.eventsForSelectedDate[0].id).toBe('e1');
  });

  it('handleRSVP updates local state and calls setUserRsvpStatus', () => {
    const { result } = renderHook(() => useEvents());

    act(() => {
      result.current.handleRSVP('e1', false);
    });

    expect(result.current.rsvpStatus.e1).toBe(false);
    expect(mockSetUserRsvpStatus).toHaveBeenCalledWith('e1', false);
  });

  it('validates required fields before addEvent', async () => {
    const { result } = renderHook(() => useEvents());

    await act(async () => {
      await result.current.handleConfirmAddEvent();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all required fields');
    expect(mockAddEvent).not.toHaveBeenCalled();
  });

  it('calls addEvent when form is valid', async () => {
    const { result } = renderHook(() => useEvents());

    act(() => {
      result.current.setNewEvent({
        id: '',
        title: 'PT Session',
        date: new Date('2026-04-20T00:00:00.000Z'),
        time: new Date('2026-04-20T14:00:00.000Z'),
        description: 'Workout',
        location: 'Gym',
        type: 'Mandatory',
      });
    });

    await act(async () => {
      await result.current.handleConfirmAddEvent();
    });

    expect(mockAddEvent).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'PT Session', type: 'Mandatory' })
    );
  });
});

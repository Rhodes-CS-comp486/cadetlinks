import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebaseDatabase from 'firebase/database';
import { useEvents, Event } from '../../src/navigation/screens/EventsPage/EventsLogic';
import { eventsStyles } from '../../src/styles/EventStyles';

type Snapshot = {
  val: () => unknown;
  exists: () => boolean;
};

const listeners: Record<string, Array<(snapshot: Snapshot) => void>> = {};
const dbState: Record<string, unknown> = {};
const getState: Record<string, unknown> = {};

const makeSnapshot = (value: unknown): Snapshot => ({
  val: () => value,
  exists: () => value !== undefined && value !== null,
});

const emitValue = (path: string, value: unknown) => {
  dbState[path] = value;
  (listeners[path] || []).forEach((cb) => cb(makeSnapshot(value)));
};

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(() => ({ mocked: true })),
  ref: jest.fn((_db: unknown, path: string) => ({ path })),
  onValue: jest.fn((refObj: { path: string }, cb: (snapshot: Snapshot) => void) => {
    if (!listeners[refObj.path]) {
      listeners[refObj.path] = [];
    }
    listeners[refObj.path].push(cb);
    cb(makeSnapshot(dbState[refObj.path]));
    return jest.fn();
  }),
  set: jest.fn(() => Promise.resolve()),
  get: jest.fn((refObj: { path: string }) => {
    const value = getState[refObj.path];
    return Promise.resolve({
      val: () => value,
      exists: () => value !== undefined && value !== null,
    });
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));

describe('useEvents', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    Object.keys(listeners).forEach((k) => delete listeners[k]);
    Object.keys(dbState).forEach((k) => delete dbState[k]);
    Object.keys(getState).forEach((k) => delete getState[k]);
    jest.clearAllMocks();
    jest.useFakeTimers();

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('cadet-1');
    (firebaseDatabase.set as jest.Mock).mockResolvedValue(undefined);
    (firebaseDatabase.get as jest.Mock).mockImplementation((refObj: { path: string }) => {
      const value = getState[refObj.path];
      return Promise.resolve({
        val: () => value,
        exists: () => value !== undefined && value !== null,
      });
    });

    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  const waitForInitialEffects = async () => {
    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('currentCadetKey');
    });
    await act(async () => {
      await Promise.resolve();
    });
  };

  it('loads events from the database, marks dates, and sorts events for selected day', async () => {
    dbState.events = {
      '1001': {
        eventName: 'Morning PT',
        date: '2026-04-14',
        time: '08:30:00',
        details: 'Workout',
        locationId: 'Gym',
        mandatory: true,
      },
      '1002': {
        eventName: 'Briefing',
        date: '2026-04-14',
        time: '07:30:00',
        details: 'Daily briefing',
        locationId: 'Hall',
        mandatory: false,
      },
      '1003': {
        eventName: 'Other Day Event',
        date: '2026-04-15',
        time: '09:00:00',
        details: 'Different date',
        locationId: 'Room 2',
        mandatory: false,
      },
    };

    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    await waitFor(() => {
      expect(result.current.allEvents).toHaveLength(3);
    });

    act(() => {
      result.current.setSelectedDate('2026-04-14');
    });

    expect(result.current.eventsForSelectedDate.map((e) => e.id)).toEqual(['1002', '1001']);
    expect(result.current.markedDates['2026-04-14']).toEqual({ marked: true, dotColor: 'blue' });
    expect(result.current.markedDates['2026-04-15']).toEqual({ marked: true, dotColor: 'blue' });
  });

  it('logs and filters out events with invalid date/time from DB', async () => {
    dbState.events = {
      bad1: {
        eventName: 'Broken Event',
        date: 'not-a-date',
        time: '99:99:99',
        details: 'Bad datetime',
        locationId: 'Nowhere',
        mandatory: false,
      },
      good1: {
        eventName: 'Good Event',
        date: '2026-04-14',
        time: '08:00:00',
        details: 'Valid datetime',
        locationId: 'Hall',
        mandatory: false,
      },
    };

    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    await waitFor(() => {
      expect(result.current.allEvents).toHaveLength(1);
    });

    expect(result.current.allEvents[0].id).toBe('good1');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Invalid date for event bad1:',
      'not-a-date',
      '99:99:99'
    );
  });

  it('loads RSVP status for the current cadet from database listener', async () => {
    dbState.events = {};
    dbState['rsvps/'] = {
      '1001': { 'cadet-1': { status: 'Y' } },
      '1002': { 'cadet-1': { status: 'N' } },
      '1003': { 'someone-else': { status: 'Y' } },
    };

    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    await waitFor(() => {
      expect(result.current.rsvpStatus['1001']).toBe(true);
      expect(result.current.rsvpStatus['1002']).toBe(false);
    });
    expect(result.current.rsvpStatus['1003']).toBeUndefined();
  });

  it('handleEventPress for RSVP event reads RSVP via get and opens modal', async () => {
    dbState.events = {};
    getState['rsvps/2001/cadet-1'] = { status: 'Y' };

    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    const event: Event = {
      id: '2001',
      title: 'RSVP Event',
      date: new Date('2026-04-14T10:00:00'),
      time: new Date('2026-04-14T10:00:00'),
      description: 'Desc',
      location: 'Room',
      type: 'RSVP',
    };

    await act(async () => {
      await result.current.handleEventPress(event);
    });

    expect(result.current.selectedEvent?.id).toBe('2001');
    expect(result.current.eventInfoModalVisible).toBe(true);
    await waitFor(() => {
      expect(result.current.rsvpStatus['2001']).toBe(true);
    });
    expect(firebaseDatabase.get).toHaveBeenCalledWith({ path: 'rsvps/2001/cadet-1' });
  });

  it('handleRSVP updates local status, writes to DB, and resets modal state', async () => {
    dbState.events = {};
    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    act(() => {
      result.current.setEventInfoModalVisible(true);
      result.current.handleRSVP('3001', true);
    });

    expect(result.current.rsvpStatus['3001']).toBe(true);
    expect(result.current.eventInfoModalVisible).toBe(false);
    expect(result.current.selectedEvent).toBeNull();
    expect(result.current.toastMessage).toBe('RSVP Confirmed');
    expect(firebaseDatabase.set).toHaveBeenCalledWith({ path: 'rsvps/3001/cadet-1' }, { status: 'Y' });

    act(() => {
      result.current.handleRSVP('3001', false);
    });

    expect(result.current.rsvpStatus['3001']).toBe(false);
    expect(result.current.toastMessage).toBe('RSVP Declined');
    expect(firebaseDatabase.set).toHaveBeenCalledWith({ path: 'rsvps/3001/cadet-1' }, { status: 'N' });
  });

  it('handleCloseEventInfoModal closes modal and clears selected event', async () => {
    dbState.events = {};
    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    const event: Event = {
      id: '4001',
      title: 'Mandatory Event',
      date: new Date('2026-04-14T11:00:00'),
      time: new Date('2026-04-14T11:00:00'),
      description: 'Desc',
      location: 'Room',
      type: 'Mandatory',
    };

    await act(async () => {
      await result.current.handleEventPress(event);
    });

    act(() => {
      result.current.handleCloseEventInfoModal();
    });

    expect(result.current.eventInfoModalVisible).toBe(false);
    expect(result.current.selectedEvent).toBeNull();
  });

  it('handleAddEvent resets newEvent and opens add event modal', async () => {
    dbState.events = {};
    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    act(() => {
      result.current.setNewEvent({
        id: 'old',
        title: 'Old Event',
        date: new Date('2026-01-01T10:00:00'),
        time: new Date('2026-01-01T10:00:00'),
        description: 'Old',
        location: 'Old Loc',
        type: 'RSVP',
      });
      result.current.handleAddEvent();
    });

    expect(result.current.addEventsModalVisible).toBe(true);
    expect(result.current.newEvent.id).toBe('');
    expect(result.current.newEvent.title).toBe('');
    expect(result.current.newEvent.description).toBe('');
    expect(result.current.newEvent.location).toBe('');
    expect(result.current.newEvent.type).toBe('');
  });

  it('handleConfirmAddEvent validates required fields before DB writes', async () => {
    dbState.events = {};
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    await act(async () => {
      await result.current.handleConfirmAddEvent();
    });

    expect(alertSpy).toHaveBeenCalledWith('Error', 'Please fill in all required fields');
    expect(firebaseDatabase.set).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('handleConfirmAddEvent writes mandatory event to DB and closes modal', async () => {
    dbState.events = {};
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.1234);
    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    act(() => {
      result.current.setNewEvent({
        id: '',
        title: 'Inspection',
        date: new Date('2026-04-14T00:00:00'),
        time: new Date('2026-04-14T16:45:00'),
        description: 'Uniform inspection',
        location: 'Parade Field',
        type: 'Mandatory',
      });
    });

    await act(async () => {
      await result.current.handleConfirmAddEvent();
    });

    expect(firebaseDatabase.set).toHaveBeenCalledWith(
      { path: 'events/1234' },
      expect.objectContaining({
        eventName: 'Inspection',
        date: '2026-04-14',
        details: 'Uniform inspection',
        locationId: 'Parade Field',
        mandatory: 'true',
      })
    );
    expect(result.current.addEventsModalVisible).toBe(false);
    expect(result.current.toastMessage).toBe('Event added successfully');
    randomSpy.mockRestore();
  });

  it('handleConfirmAddEvent initializes RSVP DB node for RSVP events', async () => {
    dbState.events = {};
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5678);
    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    act(() => {
      result.current.setNewEvent({
        id: '',
        title: 'Volunteer Shift',
        date: new Date('2026-04-14T00:00:00'),
        time: new Date('2026-04-14T12:00:00'),
        description: 'Help desk support',
        location: 'HQ',
        type: 'RSVP',
      });
    });

    await act(async () => {
      await result.current.handleConfirmAddEvent();
    });

    expect(firebaseDatabase.set).toHaveBeenCalledWith(
      { path: 'events/5678' },
      expect.objectContaining({ eventName: 'Volunteer Shift', mandatory: 'false' })
    );
    expect(firebaseDatabase.set).toHaveBeenCalledWith(
      { path: 'rsvps/5678/cadet-1' },
      { status: '' }
    );
    randomSpy.mockRestore();
  });

  it('does not initialize RSVP DB entry when cadet key is missing while adding RSVP event', async () => {
    dbState.events = {};
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.7777);
    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    act(() => {
      result.current.setNewEvent({
        id: '',
        title: 'No Cadet RSVP Event',
        date: new Date('2026-04-14T00:00:00'),
        time: new Date('2026-04-14T13:00:00'),
        description: 'Should not init RSVP table row',
        location: 'HQ',
        type: 'RSVP',
      });
    });

    await act(async () => {
      await result.current.handleConfirmAddEvent();
    });

    expect(firebaseDatabase.set).toHaveBeenCalledWith(
      { path: 'events/7776' },
      expect.objectContaining({ eventName: 'No Cadet RSVP Event' })
    );
    expect(firebaseDatabase.set).not.toHaveBeenCalledWith(
      { path: 'rsvps/7777/null' },
      expect.anything()
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Cannot initialize RSVP entry without a persisted cadet key.'
    );
    randomSpy.mockRestore();
  });

  it('logs error when RSVP table write fails during event creation', async () => {
    dbState.events = {};
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.8888);
    (firebaseDatabase.set as jest.Mock)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('rsvp write failed'));

    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    act(() => {
      result.current.setNewEvent({
        id: '',
        title: 'RSVP Error Event',
        date: new Date('2026-04-14T00:00:00'),
        time: new Date('2026-04-14T14:00:00'),
        description: 'Should surface RSVP write error',
        location: 'HQ',
        type: 'RSVP',
      });
    });

    await act(async () => {
      await result.current.handleConfirmAddEvent();
    });

    expect(firebaseDatabase.set).toHaveBeenCalledWith(
      { path: 'events/8888' },
      expect.objectContaining({ eventName: 'RSVP Error Event' })
    );
    expect(firebaseDatabase.set).toHaveBeenCalledWith(
      { path: 'rsvps/8888/cadet-1' },
      { status: '' }
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error initializing RSVP entry in DB:',
      expect.any(Error)
    );
    randomSpy.mockRestore();
  });

  it('logs error when updating RSVP in DB fails', async () => {
    dbState.events = {};
    (firebaseDatabase.set as jest.Mock).mockRejectedValueOnce(new Error('update rsvp failed'));

    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    act(() => {
      result.current.handleRSVP('9002', true);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating RSVP in DB:', expect.any(Error));
    });
  });

  it('uses false when RSVP status in DB is N during event press', async () => {
    dbState.events = {};
    getState['rsvps/9100/cadet-1'] = { status: 'N' };

    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    const event: Event = {
      id: '9100',
      title: 'RSVP N Event',
      date: new Date('2026-04-14T10:00:00'),
      time: new Date('2026-04-14T10:00:00'),
      description: 'Desc',
      location: 'Room',
      type: 'RSVP',
    };

    await act(async () => {
      await result.current.handleEventPress(event);
    });

    await waitFor(() => {
      expect(result.current.rsvpStatus['9100']).toBe(false);
    });
  });

  it('keeps RSVP undefined when RSVP status is missing in DB during event press', async () => {
    dbState.events = {};
    getState['rsvps/9200/cadet-1'] = { someOtherField: 'X' };

    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    const event: Event = {
      id: '9200',
      title: 'RSVP Undefined Event',
      date: new Date('2026-04-14T11:00:00'),
      time: new Date('2026-04-14T11:00:00'),
      description: 'Desc',
      location: 'Room',
      type: 'RSVP',
    };

    await act(async () => {
      await result.current.handleEventPress(event);
    });

    expect(result.current.rsvpStatus['9200']).toBeUndefined();
  });

  it('logs error when cadet key fails to load from AsyncStorage', async () => {
    dbState.events = {};
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('storage read failed'));

    renderHook(() => useEvents());

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading cadet key from storage:',
        expect.any(Error)
      );
    });
  });

  it('does not write RSVP when confirming response without a cadet key', async () => {
    dbState.events = {};
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    act(() => {
      result.current.handleRSVP('3002', true);
    });

    expect(result.current.rsvpStatus['3002']).toBe(true);
    expect(consoleWarnSpy).toHaveBeenCalledWith('Cannot update RSVP without a persisted cadet key.');
    expect(firebaseDatabase.set).not.toHaveBeenCalledWith(
      { path: 'rsvps/3002/null' },
      expect.anything()
    );
  });

  it('handleCancelAddEvent closes add event modal', async () => {
    dbState.events = {};
    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    act(() => {
      result.current.handleAddEvent();
      result.current.handleCancelAddEvent();
    });

    expect(result.current.addEventsModalVisible).toBe(false);
  });

  it('getLabelTextAndStyle returns correct label and style by type/status', async () => {
    dbState.events = {};
    dbState['rsvps/'] = {
      '7001': { 'cadet-1': { status: 'Y' } },
      '7002': { 'cadet-1': { status: 'N' } },
    };

    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    await waitFor(() => {
      expect(result.current.rsvpStatus['7001']).toBe(true);
      expect(result.current.rsvpStatus['7002']).toBe(false);
    });

    const mandatory = result.current.getLabelTextAndStyle({ type: 'Mandatory', id: 'any' });
    const confirmed = result.current.getLabelTextAndStyle({ type: 'RSVP', id: '7001' });
    const declined = result.current.getLabelTextAndStyle({ type: 'RSVP', id: '7002' });
    const undecided = result.current.getLabelTextAndStyle({ type: 'RSVP', id: '7003' });

    expect(mandatory).toEqual([eventsStyles.mandatoryLabel, 'Mandatory']);
    expect(confirmed).toEqual([eventsStyles.confirmButton, 'Confirmed']);
    expect(declined).toEqual([eventsStyles.declineButton, 'Declined']);
    expect(undecided).toEqual([eventsStyles.rsvpLabel, 'RSVP']);
  });

  it('reacts to subsequent realtime event updates', async () => {
    dbState.events = {};
    const { result } = renderHook(() => useEvents());
    await waitForInitialEffects();

    await waitFor(() => {
      expect(result.current.allEvents).toHaveLength(0);
    });

    act(() => {
      emitValue('events', {
        '9001': {
          eventName: 'New Live Event',
          date: '2026-04-16',
          time: '18:00:00',
          details: 'Realtime push',
          locationId: 'Auditorium',
          mandatory: false,
        },
      });
      result.current.setSelectedDate('2026-04-16');
    });

    expect(result.current.allEvents).toHaveLength(1);
    expect(result.current.eventsForSelectedDate[0].id).toBe('9001');
  });
});

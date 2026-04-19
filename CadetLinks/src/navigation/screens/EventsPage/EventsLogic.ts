import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { eventsStyles as styles } from '../../../styles/EventStyles';
import { globals, initializeGlobals, addEvent, removeEvent, setUserRsvpStatus, PERMISSIONS } from '../../../firebase/globals';

export interface Event {
  id: string;
  title: string;
  date: Date;
  time: Date;
  description: string;
  location: string;
  type: '' | 'RSVP' | 'Mandatory';
}

export function useEvents() {
  const globalState = globals();

  const formatDate = (d: Date | string): string => {
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) {
      console.error('Invalid date provided to formatDate:', d);
      return '';
    }
    return date.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventInfoModalVisible, setEventInfoModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addEventsModalVisible, setAddEventsModalVisible] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [rsvpStatus, setRsvpStatus] = useState<{ [eventId: string]: boolean }>({});

  const profile = globalState.profile;
  const allEvents = globalState.events as Event[];
  const cadetPermissionsMap = globalState.permissionsMap;

  const [newEvent, setNewEvent] = useState<Event>({
    id: '',
    title: '',
    date: new Date(),
    time: new Date(),
    description: '',
    location: '',
    type: '' as '' | 'RSVP' | 'Mandatory',
  });

  useEffect(() => {
    if (!globalState.isInitialized && !globalState.isInitializing) {
      void initializeGlobals();
    }
  }, [globalState.isInitialized, globalState.isInitializing]);

  useEffect(() => {
    setRsvpStatus(globalState.userRsvpStatusByEvent);
  }, [globalState.userRsvpStatusByEvent]);

  const markedDates = allEvents.reduce((acc: any, event) => {
    const dateKey = formatDate(event.date);
    acc[dateKey] = { marked: true, dotColor: 'blue' };
    return acc;
  }, {});

  const eventsForSelectedDate = useMemo(() => {
    return allEvents
      .filter((ev) => formatDate(ev.date) === selectedDate)
      .sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [allEvents, selectedDate]);

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setEventInfoModalVisible(true);
  };

  const handleRSVP = (eventId: string, confirming: boolean) => {
    setRsvpStatus((prev) => ({ ...prev, [eventId]: confirming }));
    void setUserRsvpStatus(eventId, confirming);
    setEventInfoModalVisible(false);
    setSelectedEvent(null);
    setToastMessage(confirming ? 'RSVP Confirmed' : 'RSVP Declined');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCloseEventInfoModal = () => {
    setEventInfoModalVisible(false);
    setSelectedEvent(null);
  };

  const getEventConfig = (job?: string) => {
    if (cadetPermissionsMap.get(PERMISSIONS.ADMIN)) {
      return { mode: 'free', type: 'either', title: '', options: [] };
    }

    switch (job) {
      case 'Physical Fitness Officer (PFO)':
        return { mode: 'fixed', type: 'Mandatory', title: 'PT', options: [] };
      case 'Leadership Lab (LLAB) Commander':
        return { mode: 'fixed', type: 'Mandatory', title: 'LLAB', options: [] };
      case 'A3 Director':
        return { mode: 'checkbox', type: 'Mandatory', title: '', options: ['LLAB', 'PT'] };
      case 'Remedial Marching Practice (RMP) Commander':
        return { mode: 'fixed', type: 'either', title: 'RMP', options: [] };
      case 'Honor Guard Officer':
        return { mode: 'checkbox', type: 'RSVP', title: '', options: ['Honor Guard', 'Honor Guard Practice'] };
      case 'Morale Officer':
        return { mode: 'fixed', type: 'RSVP', title: 'Morale', options: [] };
      case 'A4, A5 Director':
        return { mode: 'checkbox', type: 'RSVP', title: '', options: ['RMP', 'Honor Guard', 'Honor Guard Practice', 'Morale'] };
      case 'Community Service Officer':
        return { mode: 'fixed', type: 'RSVP', title: 'Community Service', options: [] };
      case 'Recruiting Officer':
        return { mode: 'fixed', type: 'RSVP', title: 'Recruiting', options: [] };
      case 'A8, A9 Director':
      case 'A9 Director':
        return { mode: 'checkbox', type: 'RSVP', title: '', options: ['Community Service', 'Recruiting'] };
      case 'Special Projects Officer':
        return { mode: 'free', type: 'either', title: '', options: [] };
      default:
        return { mode: 'free', type: 'either', title: '', options: [] };
    }
  };

  const normalizeEventTitle = (title: string) => title.trim().toLowerCase();

  const canDeleteEvent = (event: Event): boolean => {
    const config = getEventConfig(profile?.job);

    if (cadetPermissionsMap.get(PERMISSIONS.ADMIN)) {
      return true;
    }

    const eventTitle = normalizeEventTitle(event.title);

    if (config.mode === 'fixed') {
      return normalizeEventTitle(config.title) === eventTitle;
    }

    if (config.mode === 'checkbox') {
      return config.options.some((option: string) => normalizeEventTitle(option) === eventTitle);
    }

    return false;
  };

  useEffect(() => {
    if (addEventsModalVisible) {
      const config = getEventConfig(profile?.job);
      if (config.mode === 'checkbox') {
        let title = '';
        if (selectedOptions.length > 0) {
          title = selectedOptions[0];
        }
        setNewEvent((prev) => ({ ...prev, title }));
      }
    }
  }, [selectedOptions, addEventsModalVisible, profile?.job]);

  const handleAddEvent = () => {
    const config = getEventConfig(profile?.job);
    let title = '';

    if (config.mode === 'fixed') {
      title = config.title;
    } else if (config.mode === 'checkbox') {
      setSelectedOptions(config.options.length > 0 ? [config.options[0]] : []);
      title = config.options.length > 0 ? config.options[0] : '';
    }

    const [year, month, day] = selectedDate.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day);
    const type = config.type === 'either' ? '' : (config.type as '' | 'RSVP' | 'Mandatory');

    setNewEvent({
      id: '',
      title,
      date: parsedDate,
      time: new Date(),
      description: '',
      location: '',
      type,
    });
    setAddEventsModalVisible(true);
  };

  const handleConfirmAddEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.type) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await addEvent(newEvent);
      setAddEventsModalVisible(false);
      setToastMessage('Event added successfully');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error('Error writing event to DB:', error);
      Alert.alert('Error', 'Could not add event.');
    }
  };

  const handleCancelAddEvent = () => {
    setAddEventsModalVisible(false);
  };

  const handleDeleteEvent = (event: Event) => {
    if (!canDeleteEvent(event)) {
      Alert.alert('Not allowed', 'You can only delete events associated with your role.');
      return;
    }

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
        void removeEvent(event.id);
      }
      return;
    }

    Alert.alert('Delete Event', `Are you sure you want to delete "${event.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => void removeEvent(event.id),
      },
    ]);
  };

  const getLabelTextAndStyle = (event: { type: string; id: string }): [any, string] => {
    if (event.type === 'Mandatory') {
      return [styles.mandatoryLabel, 'Mandatory'];
    }

    const status = rsvpStatus[event.id];
    if (status === true) {
      return [styles.confirmButton, 'Confirmed'];
    }
    if (status === false) {
      return [styles.declineButton, 'Declined'];
    }

    return [styles.rsvpLabel, 'RSVP'];
  };

  const canManageEvents =
    (cadetPermissionsMap.get(PERMISSIONS.EVENT_MAKING) ?? false) ||
    (cadetPermissionsMap.get(PERMISSIONS.ADMIN) ?? false);

  return {
    selectedDate,
    rsvpList,
    setRsvpList,
    setSelectedDate,
    selectedEvent,
    eventInfoModalVisible,
    setEventInfoModalVisible,
    rsvpStatus,
    toastMessage,
    addEventsModalVisible,
    allEvents,
    newEvent,
    setNewEvent,
    selectedOptions,
    setSelectedOptions,
    markedDates,
    eventsForSelectedDate,
    handleEventPress,
    handleRSVP,
    handleCloseEventInfoModal,
    handleAddEvent,
    handleConfirmAddEvent,
    handleCancelAddEvent,
    handleDeleteEvent,
    canDeleteEvent,
    canManageEvents,
    getLabelTextAndStyle,
    eventConfig: getEventConfig(profile?.job),
  };
}

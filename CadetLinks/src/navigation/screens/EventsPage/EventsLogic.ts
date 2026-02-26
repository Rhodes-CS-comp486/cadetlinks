import { useState, useMemo } from 'react';
import { Alert } from 'react-native';
import { eventsStyles as styles } from '../../../styles/EventsStyles';

export interface Event {
  id: string;
  title: string;
  date: Date;
  time: Date;
  description: string;
  location: string;
  type: '' | 'RSVP' | 'Mandatory';
}

// export interface NewEvent {
//   title: string;
//   date: string;
//   time: string;
//   description: string;
//   location: string;
//   type: '' | 'RSVP' | 'Mandatory';
// }

export function useEvents() {
  // helper used throughout the hook - must be defined before any computed values that call it
  const formatDate = (d: Date | string): string => {
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toISOString().split('T')[0]; // Return just the date part (YYYY-MM-DD)
  };

  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventInfoModalVisible, setEventInfoModalVisible] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<{ [eventId: string]: boolean }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addEventsModalVisible, setAddEventsModalVisible] = useState(false);

  const [allEvents, setAllEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'PT',
      date: new Date('2026-02-10'),
      time: new Date('2026-02-10T06:00:00'),
      description: 'Physical training session',
      location: 'Memorial Field',
      type: 'Mandatory',
    },
    {
      id: '2',
      title: 'LLAB',
      date: new Date('2026-02-10'),
      time: new Date('2026-02-10T03:00:00'),
      description: 'Leadership Lab',
      location: 'Room 113',
      type: 'Mandatory',
    },
    {
      id: '3',
      title: 'PT',
      date: new Date('2026-02-12'),
      time: new Date('2026-02-12T06:00:00'),
      description: 'Physical training session',
      location: 'Memorial Field',
      type: 'Mandatory',
    },
    {
      id: '4',
      title: 'Lunch & Learn',
      date: new Date('2026-02-12'),
      time: new Date('2026-02-12T12:00:00'),
      description: 'Lunch and a presentation',
      location: 'Air Force Classroom',
      type: 'RSVP',
    },
  ]);

  const [newEvent, setNewEvent] = useState<Event>({
    id: '',
    title: '',
    date: new Date(),
    time: new Date(),
    description: '',
    location: '',
    type: '' as '' | 'RSVP' | 'Mandatory',
  });

  // Computed values
  const markedDates = allEvents.reduce((acc: any, event) => {
    const dateKey = formatDate(event.date);
    acc[dateKey] = { marked: true, dotColor: 'blue' };
    return acc;
  }, {});

  // Memoized filtered and sorted events for the selected date
  const eventsForSelectedDate = useMemo(() => {
    return allEvents
      .filter((ev) => formatDate(ev.date) === selectedDate)
      .sort((a, b) => 
        a.time.getTime() - b.time.getTime()
    );
       
  }, [allEvents, selectedDate]);

  // Event handlers
  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setEventInfoModalVisible(true);
  };

  const handleRSVP = (eventId: string, confirming: boolean) => {
    setRsvpStatus((prev) => ({ ...prev, [eventId]: confirming }));
    setEventInfoModalVisible(false);
    setSelectedEvent(null);
    setToastMessage(confirming ? 'RSVP Confirmed' : 'RSVP Declined');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCloseEventInfoModal = () => {
    setEventInfoModalVisible(false);
    setSelectedEvent(null);
  };


  const handleAddEvent = () => {


    setNewEvent({
      id: '',
      title: '',
      date: new Date(),
      time: new Date(),
      description: '',
      location: '',
      type: '' as '' | 'RSVP' | 'Mandatory',
    });
    setAddEventsModalVisible(true);
  };

  const handleConfirmAddEvent = () => {
    // Validate form inputs
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.type) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Create a new event object with a unique random id
    const combinedDateTime = new Date(newEvent.date);

    combinedDateTime.setHours(newEvent.time.getHours());
    combinedDateTime.setMinutes(newEvent.time.getMinutes());
    combinedDateTime.setSeconds(0);
    combinedDateTime.setMilliseconds(0);
    const eventToAdd: Event = {
      ...newEvent,
      id: Math.random().toString(36), // simple random id generator
      date: combinedDateTime,
      time: combinedDateTime,
      //type: newEvent.type as '' | 'RSVP' | 'Mandatory',
    };

    console.log('Adding event:', eventToAdd);

    // Add the new event and keep the list sorted by date and time
    setAllEvents(prev => {
      const combined = [...prev, eventToAdd];
      combined.sort((a, b) => {
        const dateDiff = a.date.getTime() - b.date.getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.time.getTime() - b.time.getTime();
      });
      return combined;
    });
    setAddEventsModalVisible(false);
    setToastMessage('Event added successfully');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCancelAddEvent = () => {
    setAddEventsModalVisible(false);
  };

  // Helper function to determine label text and style for event based on type and RSVP status
  const getLabelTextAndStyle = (event: { type: string; id: string }): [any, string] => {
    if (event.type === 'Mandatory') {
      return [styles.mandatoryLabel, 'Mandatory'];
    }
    const status = rsvpStatus[event.id];
    if (status === undefined) {
      return [styles.rsvpLabel, 'RSVP'];
    } else {
      return status ? [styles.confirmButton, 'Confirmed'] : [styles.declineButton, 'Declined'];
    }
  };

  // Return all state, computed values, handlers, and helpers
  return {
    // State
    selectedDate,
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
    // Computed values
    markedDates,
    eventsForSelectedDate,
    // Handlers
    handleEventPress,
    handleRSVP,
    handleCloseEventInfoModal,
    handleAddEvent,
    handleConfirmAddEvent,
    handleCancelAddEvent,
    // Helpers
    getLabelTextAndStyle,
  };
}

import { useState } from 'react';
import { Alert } from 'react-native';
import { eventsStyles as styles } from '../../../styles/EventsStyles';

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
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
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventInfoModalVisible, setEventInfoModalVisible] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<{ [eventId: string]: boolean }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addEventsModalVisible, setAddEventsModalVisible] = useState(false);

  const [allEvents, setAllEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'PT',
      date: '2026-02-10',
      time: '0600',
      description: 'Physical training session',
      location: 'Memorial Field',
      type: 'Mandatory',
    },
    {
      id: '2',
      title: 'LLAB',
      date: '2026-02-10',
      time: '0300',
      description: 'Leadership Lab',
      location: 'Room 113',
      type: 'Mandatory',
    },
    {
      id: '3',
      title: 'PT',
      date: '2026-02-12',
      time: '0600',
      description: 'Physical training session',
      location: 'Memorial Field',
      type: 'Mandatory',
    },
    {
      id: '4',
      title: 'Lunch & Learn',
      date: '2026-02-12',
      time: '1200',
      description: 'Lunch and a presentation',
      location: 'Air Force Classroom',
      type: 'RSVP',
    },
  ]);

  const [newEvent, setNewEvent] = useState<Event>({
    id: '',
    title: '',
    date: '',
    time: '',
    description: '',
    location: '',
    type: '' as '' | 'RSVP' | 'Mandatory',
  });

  // Computed values
  const markedDates = allEvents.reduce((acc: any, event) => {
    acc[event.date] = { marked: true, dotColor: 'blue' };
    return acc;
  }, {});

  const eventsForSelectedDate = allEvents.filter((ev) => ev.date === selectedDate);

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
      date: '',
      time: '',
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
    const eventToAdd: Event = {
      ...newEvent,
      id: Math.random().toString(36), // simple random id generator
      type: newEvent.type as '' | 'RSVP' | 'Mandatory',
    };

    // Add the new event to the allEvents array
    setAllEvents([...allEvents, eventToAdd]);
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

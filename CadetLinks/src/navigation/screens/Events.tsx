import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Alert, TextInput, Pressable } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { eventsStyles as styles } from '../../styles/EventsStyles';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
  type: '' | 'RSVP' | 'Mandatory';
}

export function Events(): React.ReactElement {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventInfoModalVisible, setEventInfoModalVisible] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<{ [eventId: string]: boolean }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPressed,setIsPressed] = useState(false); 
  const [isMandatoryPressed,setIsMandatoryPressed] = useState(false); 
  // - need a form and a function 
  // - handle form submission that updates the allEvents array and markedDates object
  const [addEventsModalVisible, setAddEventsModalVisible] = useState(false); //initially false since we only want to see it when we add an event 

  {/* sample event data. remove later */ }
  const [allEvents, setAllEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'PT 0600',
      date: '2026-02-10',
      time: '06:00 AM',
      description: 'Physical training session',
      location: 'Athletic Field',
      type: 'RSVP',
    },
    {
      id: '2',
      title: 'LLAB 1500',
      date: '2026-02-10',
      time: '03:00 PM',
      description: 'Leadership Lab',
      location: ' Room 201',
      type: 'Mandatory',
    },
    {
      id: '3',
      title: 'PT 0600',
      date: '2026-02-11',
      time: '06:00 AM',
      description: 'Physical training session',
      location: 'Athletic Field',
      type: 'RSVP',
    },
    {
      id: '4',
      title: 'Lunch & Learn',
      date: '2026-02-12',
      time: '12:00 PM',
      description: 'lunch and a presentation',
      location: 'Dining Hall',
      type: 'RSVP',
    },
  ]);

  //new event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    location: '',
    type: '' as '' | 'RSVP' | 'Mandatory',
  })

  {/* create an object where keys are dates and values are booleans indicating
     if there's an event on that date */}
  const markedDates = allEvents.reduce((acc: any, event) => {
    acc[event.date] = { marked: true, dotColor: 'blue' };
    return acc;
  }, {});

  const eventsForSelectedDate = allEvents.filter((ev) => ev.date === selectedDate);

  {/*when user clicks on an event, set the selected event and open the modal*/ }
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
    //validate form inputs
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.type) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // create a new event object with a unique random id
    const eventToAdd: Event = {
      id: Math.random().toString(36),
      ...newEvent,
      type: newEvent.type as '',
    };

    // add the new event to the allEvents array and update markedDates
    setAllEvents([...allEvents, eventToAdd]);
    setAddEventsModalVisible(false);
    setToastMessage('Event added successfully');
    setTimeout(() => setToastMessage(null), 3000);
  }

  const handleCancelAddEvent = () => {
    setAddEventsModalVisible(false);
  };

  const handleButtonPressRsvp = () => {
    setIsPressed(!isPressed);
  }

  const handleButtonPressMandatory = () => {
    setIsMandatoryPressed(!isMandatoryPressed);
  }

  {/* helper function to determine label text and style for event based on type and RSVP status */ }
  const getLabelTextAndStyle = (event: { type: string; rsvpStatus?: boolean; id: string }): [any, string] => {
    if (event.type === 'Mandatory') {
      return [styles.mandatoryLabel, 'Mandatory'];
    }
    const status = rsvpStatus[event.id];
    if (status === undefined) {
      return [styles.rsvpLabel, 'RSVP'];
    } else {
      return status ? [styles.confirmButton, 'Confirmed'] : [styles.declineButton, 'Declined'];
    }
  }

  return (
    <View style={styles.container}>
      {/* Calendar */}
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            selected: true,
            selectedColor: '#1e90ff',
          },
        }}
      />

      {/* events list for selected date*/}
      {selectedDate && eventsForSelectedDate.length > 0 && (
        <View style={styles.eventsContainer}>
          <Text style={styles.sectionTitle}> Events for {selectedDate}</Text>
          <ScrollView>
            {eventsForSelectedDate.map((event) => {

              const [labelStyle, labelText] = getLabelTextAndStyle(event);

              return (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventRow}
                  onPress={() => handleEventPress(event)}
                >
                  <View style={styles.eventContent}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTime}>{event.time}</Text>
                    <Text style={styles.eventLocation}>{event.location}</Text>
                  </View>
                  <View style={styles.eventTypeContainer}>

                    <Text style={[styles.rsvpButton, labelStyle]}>
                      {labelText}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* no events message */}
      {selectedDate && eventsForSelectedDate.length === 0 && (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No events scheduled for this date</Text>
        </View>
      )}

      {/* add event button */}
      <TouchableOpacity
        style={styles.addEventButton}
        onPress={handleAddEvent}
      >
        <Text style={styles.addEventButtonText}>+</Text>
      </TouchableOpacity>

      {/* event details pop up */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={eventInfoModalVisible}
        onRequestClose={handleCloseEventInfoModal}
      >

        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseEventInfoModal}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            {selectedEvent && (
              <ScrollView>
                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>

                <Text style={styles.modalLabel}>Date:</Text>
                <Text style={styles.modalText}>{selectedEvent.date}</Text>

                <Text style={styles.modalLabel}>Time:</Text>
                <Text style={styles.modalText}>{selectedEvent.time}</Text>

                <Text style={styles.modalLabel}>Location:</Text>
                <Text style={styles.modalText}>{selectedEvent.location}</Text>

                <Text style={styles.modalLabel}>Description:</Text>
                <Text style={styles.modalText}>{selectedEvent.description}</Text>

                {/* only show RSVP button if it's an RSVP event and user hasn't responded yet */}
                {selectedEvent.type === 'RSVP' && !rsvpStatus[selectedEvent.id] && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                    <TouchableOpacity
                      onPress={() => handleRSVP(selectedEvent.id, true)}
                      style={[styles.rsvpButton, styles.confirmButton]}
                    >
                      <Text style={styles.confirmButton}>Confirm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRSVP(selectedEvent.id, false)}
                      style={[styles.rsvpButton, styles.declineButton]}
                    >
                      <Text style={styles.declineButton}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                )}

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/*add event modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addEventsModalVisible}
        onRequestClose={handleCancelAddEvent}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCancelAddEvent}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <ScrollView>
              <Text style={styles.modalTitle}>Add New Event</Text>
              {/* form inputs for new event details */}
              <TextInput
                style={styles.textInput}
                placeholder='Enter Event Title'
                value={newEvent.title}
                onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
              />
              <TextInput
                style={styles.textInput}
                placeholder='Enter Event Date (YYYY-MM-DD)'
                value={newEvent.date}
                onChangeText={(text) => setNewEvent({ ...newEvent, date: text })}
              />
              <TextInput
                style={styles.textInput}
                placeholder='HH:MM AM/PM'
                value={newEvent.time}
                onChangeText={(text) => setNewEvent({ ...newEvent, time: text })}
              />
              <TextInput
                style={styles.textInput}
                placeholder='Enter Location'
                value={newEvent.location}
                onChangeText={(text) => setNewEvent({ ...newEvent, location: text })}
              />
              <TextInput
                style={[styles.textInput, { height: 80 }]}
                placeholder='Enter Event Description'
                value={newEvent.description}
                onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                multiline
              />

              <Text style={styles.modalLabel}>Event Type:</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                {/*rsvp or mandatory button*/}
                <Pressable
                  style={[
                    styles.rsvpButton,
                    newEvent.type === 'RSVP'  && styles.buttonPressed,
                  ]
                  }
                  onPress={() => 
                    setNewEvent({ ...newEvent, type: newEvent.type === 'RSVP' ? '' : 'RSVP' })
                  }
                >
                  <Text 
                    style ={
                      newEvent.type === 'RSVP' ? 
                      styles.buttonPressed : styles.generalText
                      }>RSVP</Text> 
                </Pressable>
            
                <Pressable
                  style={[
                    styles.mandatoryButton,
                    newEvent.type === 'Mandatory' && styles.buttonPressed,
                  ]}
                  onPress={() => {
                    setNewEvent({ ...newEvent, type: newEvent.type === 'Mandatory' ? '' : 'Mandatory' });
                    }
                  }
                >
                  <Text 
                    style ={
                      newEvent.type === 'Mandatory' ?
                       styles.buttonPressed : styles.generalText
                       }>Mandatory</Text>
                </Pressable>
              </View>

              {/* confirm add event button */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmAddEvent}
                >
                  <Text style={styles.generalText}>Confirm</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCancelAddEvent}
                  style={styles.declineButton}
                >
                  <Text style={styles.generalText}>Cancel</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>

          </View>
        </View>


      </Modal>
    </View>
  );
}
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Pressable } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { eventsStyles as styles } from '../../../styles/EventsStyles';
import { useEvents } from './EventsLogic';
import TimePicker from './timePicker';

/*
main events component that contains all UI. EventLogic contains
all state and logic for this component, 
which is accessed through the EventLogic custom hook
*/
export function Events(): React.ReactElement {
  // Use the custom hook to manage all event state and logic
  const {
    selectedDate,
    setSelectedDate,
    selectedEvent,
    eventInfoModalVisible,
    rsvpStatus,
    toastMessage,
    addEventsModalVisible,
    allEvents,
    newEvent,
    setNewEvent,
    markedDates,
    eventsForSelectedDate,
    handleEventPress,
    handleRSVP,
    handleCloseEventInfoModal,
    handleAddEvent,
    handleConfirmAddEvent,
    handleCancelAddEvent,
    getLabelTextAndStyle,
  } = useEvents();

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
                    <Text style={styles.eventTime}>{event.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
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
                <Text style={styles.modalText}>{selectedEvent.date.toLocaleDateString()}</Text>

                <Text style={styles.modalLabel}>Time:</Text>
                <Text style={styles.modalText}>{selectedEvent.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>

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
      {/* TODO: validate input and show error messages... maybe drop down instead of buttons for mandatory vs rsvp?*/}
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
                value={newEvent.date.toLocaleDateString()}
                onChangeText={(text) => setNewEvent({ ...newEvent, date: new Date(text) })}
              />

              {/* time picker component handles platform differences */}
              <TimePicker
                value={newEvent.time}
                onChange={(date) =>
                  setNewEvent({ ...newEvent, time: date })
                }
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
                    newEvent.type === 'RSVP' && styles.buttonPressed,
                  ]
                  }
                  onPress={() =>
                    setNewEvent({ ...newEvent, type: newEvent.type === 'RSVP' ? '' : 'RSVP' })
                  }
                >
                  <Text
                    style={
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
                    style={
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
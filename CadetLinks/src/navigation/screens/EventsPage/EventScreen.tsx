import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Pressable } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { eventsStyles as styles, calendarTheme } from '../../../styles/EventStyles';
import { useEvents } from './EventsLogic';
import TimePicker from './Components/timePicker';
import DatePicker from './Components/datePicker';
import { DarkColors as colors } from '../../../styles/colors';
import { ScreenLayout } from '../../Components/ScreenLayout';

export function Events(): React.ReactElement {
  const {
    selectedDate,
    setSelectedDate,
    selectedEvent,
    eventInfoModalVisible,
    rsvpStatus,
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
    getLabelTextAndStyle
  } = useEvents();

  return (
    <ScreenLayout>
      <View style={styles.body_container}>

        {/* Calendar */}
        <Calendar
          style={styles.calendar}
          theme={calendarTheme}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              selected: true,
              selectedColor: colors.accent,
            },
          }}
        />

        {/* Events List */}
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
                      <Text style={styles.eventTime}>
                        {event.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
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

        {/* No Events */}
        {selectedDate && eventsForSelectedDate.length === 0 && (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No events scheduled for this date</Text>
          </View>
        )}

        {/* Add Event Button */}
        <TouchableOpacity
          style={styles.addEventButton}
          onPress={handleAddEvent}
        >
          <Text style={styles.addEventButtonText}>+</Text>
        </TouchableOpacity>

        {/* Event Info Modal */}
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
                  <Text style={styles.modalText}>
                    {selectedEvent.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>

                  <Text style={styles.modalLabel}>Location:</Text>
                  <Text style={styles.modalText}>{selectedEvent.location}</Text>

                  <Text style={styles.modalLabel}>Description:</Text>
                  <Text style={styles.modalText}>{selectedEvent.description}</Text>

                  {selectedEvent.type === 'RSVP' && rsvpStatus[selectedEvent.id] === undefined && (
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

        {/* Add Event Modal */}
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

                {/* Title */}
                <TextInput
                  value={newEvent.title}
                  onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
                  placeholder='Enter Event Title'
                  placeholderTextColor={styles.inputPlaceholder.color}
                  style={[
                    styles.inputPlaceholder,
                    newEvent.title.length > 0 ? styles.inputUser : styles.inputPlaceholder
                  ]}
                />

                <DatePicker
                  value={newEvent.date}
                  onChange={(date) =>
                    setNewEvent({ ...newEvent, date })
                  }
                />

                <TimePicker
                  value={newEvent.time}
                  onChange={(date) =>
                    setNewEvent({ ...newEvent, time: date })
                  }
                />

                {/* Location */}
                <TextInput
                  value={newEvent.location}
                  onChangeText={(text) => setNewEvent({ ...newEvent, location: text })}
                  placeholder='Enter Location'
                  placeholderTextColor={styles.inputPlaceholder.color}
                  style={[
                    styles.inputPlaceholder,
                    newEvent.location.length > 0 ? styles.inputUser : styles.inputPlaceholder
                  ]}
                />

                {/* Description */}
                <TextInput
                  value={newEvent.description}
                  onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                  multiline
                  placeholder='Enter Event Description'
                  placeholderTextColor={styles.inputPlaceholder.color}
                  style={[
                    styles.inputPlaceholder,
                    newEvent.description.length > 0 ? styles.inputUser : styles.inputPlaceholder,
                    { height: 80 }
                  ]}
                />

                {/* 🔥 NEW TOGGLE */}
                <Text style={styles.modalLabel}>Event Type:</Text>

                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: "#2A3140",
                    borderRadius: 14,
                    padding: 4,
                    marginBottom: 14,
                    borderWidth: 1,
                    borderColor: "#3A4357",
                  }}
                >
                  <Pressable
                    onPress={() => setNewEvent({ ...newEvent, type: "RSVP" })}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 10,
                      alignItems: "center",
                      backgroundColor:
                        newEvent.type === "RSVP" ? "#4A5568" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: newEvent.type === "RSVP" ? "white" : "#C9D1D9",
                        fontWeight: newEvent.type === "RSVP" ? "700" : "600",
                      }}
                    >
                      RSVP
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setNewEvent({ ...newEvent, type: "Mandatory" })}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 10,
                      alignItems: "center",
                      backgroundColor:
                        newEvent.type === "Mandatory" ? "#4A5568" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: newEvent.type === "Mandatory" ? "white" : "#C9D1D9",
                        fontWeight: newEvent.type === "Mandatory" ? "700" : "600",
                      }}
                    >
                      Mandatory
                    </Text>
                  </Pressable>
                </View>

                {/* Buttons */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirmAddEvent}
                  >
                    <Text style={styles.text}>Confirm</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleCancelAddEvent}
                    style={styles.declineButton}
                  >
                    <Text style={styles.text}>Cancel</Text>
                  </TouchableOpacity>
                </View>

              </ScrollView>
            </View>
          </View>
        </Modal>

      </View>
    </ScreenLayout>
  );
}
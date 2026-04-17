import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { eventsStyles as styles, calendarTheme } from '../../../styles/EventStyles';
import { useEvents } from './EventsLogic';
import TimePicker from './Components/timePicker';
import DatePicker from './Components/datePicker';
import { DarkColors as colors } from '../../../styles/colors';
import { ScreenLayout } from '../../Components/ScreenLayout';
import { PERMISSIONS } from '../../../assets/constants';
import { useHomeLogic } from '../HomePage/HomeLogic';
import Checkbox from 'expo-checkbox';

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
    getLabelTextAndStyle,
    eventConfig,
  } = useEvents();

  const { cadetPermissionsMap } = useHomeLogic();

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

                    {cadetPermissionsMap.get(PERMISSIONS.EVENT_MAKING) && (
                      <Pressable
                        onPress={() => handleDeleteEvent(event)}
                        style={{ marginLeft: 12 }}
                        hitSlop={8}
                      >
                        <Ionicons name="trash-outline" size={20} color="red" />
                      </Pressable>
                    )}
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
        {cadetPermissionsMap.get(PERMISSIONS.EVENT_MAKING) && (
          <TouchableOpacity
            style={styles.addEventButton}
            onPress={handleAddEvent}
          >
            <Text style={styles.addEventButtonText}>+</Text>
          </TouchableOpacity>
        )}

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
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                  {eventConfig.mode === 'fixed' ? (
                    <TextInput value={newEvent.title} editable={false} style={styles.inputBox}/>
                  ) : eventConfig.mode === 'checkbox' ? (
                    <>
                      {eventConfig.options?.map((option) => (
                        <View key={option} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <Checkbox
                            value={selectedOptions.includes(option)}
                            onValueChange={(checked) => {
                              if (checked) {
                                setSelectedOptions([option]);
                              } else {
                                setSelectedOptions(prev => prev.filter(o => o !== option));
                              }
                            }}
                          />
                          <Text style={{ color: 'white', marginLeft: 8 }}>{option}</Text>
                        </View>
                      ))}
                    </>
                  ) : (
                    <TextInput
                      value={newEvent.title}
                      onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
                      placeholder='Enter Event Title'
                      placeholderTextColor={styles.inputBox.color}
                      style={[styles.inputBox]}
                      editable={true}
                    />
                  )}

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
                    placeholderTextColor={styles.inputBox.color}
                    style={[ styles.inputBox ]}
                  />

                  {/* Description */}
                  <TextInput
                    value={newEvent.description}
                    onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
                    multiline
                    placeholder='Enter Event Description'
                    placeholderTextColor={styles.inputBox.color}
                    style={[ styles.inputBox, { height: 80 } ]}
                  />

                  {/* MANDATORY OR RSVP TOGGLE */}
                  <Text style={styles.modalLabel}>Event Type:</Text>

                  {eventConfig.type === 'either' ? (
                  <View style={styles.eventTypeToggleButton}>
                    {['RSVP', 'Mandatory'].map((typeOption) => {
                      const isActive = newEvent.type === typeOption;

                      return (
                        <Pressable
                          key={typeOption}
                          onPress={() => setNewEvent({ ...newEvent, type: typeOption as '' | 'RSVP' | 'Mandatory' })}
                          style={{
                            flex: 1,
                            paddingVertical: 12,
                            borderRadius: 10,
                            alignItems: "center",
                            backgroundColor:
                              isActive ? "#FB9E50" : "transparent",
                          }}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontWeight: "600",
                            }}
                          >
                            {typeOption}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  ) : (<View style={styles.eventTypeToggleButton}>
                    {['RSVP', 'Mandatory'].map((typeOption) => {
                      const isFixed = eventConfig.type !== 'either';
                      const isActive = newEvent.type === typeOption;
                      const isDisabled = isFixed && !isActive;

                      return (
                        <View
                          key={typeOption}
                          style={{
                            flex: 1,
                            paddingVertical: 12,
                            borderRadius: 10,
                            alignItems: "center",
                            backgroundColor:
                              isDisabled ? "transparent" : "#FB9E50",
                          }}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontWeight: "600",
                            }}
                          >
                            {typeOption}
                          </Text>
                        </View>
                      );
                    })}
                  </View>)}

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
          </KeyboardAvoidingView>
        </Modal>

      </View>
    </ScreenLayout>
  );
}
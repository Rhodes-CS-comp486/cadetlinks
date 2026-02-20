import React, { useState } from 'react';
import {View,Text,ScrollView,TouchableOpacity,Modal,Alert,} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { eventsStyles as styles } from '../../styles/EventsStyles';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
  type: 'RSVP' | 'mandatory';
}

export function Events(): React.ReactElement {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<{ [eventId: string]: boolean }>({});

  {/* sample event data. remove later */}
  const allEvents: Event[] = [
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
      type: 'mandatory',
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
  ];

  const markedDates = allEvents.reduce((acc: any, event) => {
    acc[event.date] = { marked: true, dotColor: 'blue' };
    return acc;
  }, {});

  const eventsForSelectedDate = allEvents.filter((ev) => ev.date === selectedDate);

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const handleRSVP = () => {
    if (selectedEvent) {
      setRsvpStatus((prev) => ({
        ...prev,
        [selectedEvent.id]: !prev[selectedEvent.id],
      }));
      const newStatus = !rsvpStatus[selectedEvent.id];
      Alert.alert(
        'RSVP Confirmed',
        newStatus
          ? `You have RSVP'd to ${selectedEvent.title}`
          : `You have cancelled RSVP for ${selectedEvent.title}`
      );
      setModalVisible(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  const getLabelStyle = (event:{type: string; rsvpStatus?: boolean; id:string}): [any, string] => {
    if(event.type === 'mandatory') {
        return [styles.mandatoryLabel, 'mandatory'];
    } 
    const status = rsvpStatus[event.id];
    if(status === undefined) {
        return [styles.rsvpLabel, 'rsvp'];    
    }else{
        return status ? [styles.rsvpButtonConfirm, 'confirmed'] : [styles.rsvpButtonDecline, 'declined'];
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

      {/* Events List for Selected Date*/}
      {selectedDate && eventsForSelectedDate.length > 0 && (
        <View style={styles.eventsContainer}>
          <Text style={styles.sectionTitle}>Events for {selectedDate}</Text>
          <ScrollView>
            {eventsForSelectedDate.map((event) => {

            const [labelStyle, labelText] = getLabelStyle(event);
    
            return(
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

                  <Text style={labelStyle}>
                    {labelText}
                  </Text>
                </View>
              </TouchableOpacity>
            );
            })}
          </ScrollView>
        </View>
      )}

      {/* No Events Message */}
      {selectedDate && eventsForSelectedDate.length === 0 && (
        <View style={styles.noEventsContainer}>
          <Text style={styles.noEventsText}>No events scheduled for this date</Text>
        </View>
      )}

      {/* Event Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
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

                {selectedEvent.type === 'RSVP' ? (
                  <TouchableOpacity
                    style={[
                      styles.rsvpButton,
                      rsvpStatus[selectedEvent.id] && styles.rsvpButtonConfirm,
                    ]}
                    onPress={handleRSVP}
                  >
                    <Text style={styles.rsvpButtonText}>
                      {rsvpStatus[selectedEvent.id] ? '✓ Coming' : 'RSVP'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.mandatoryContainer}>
                    <Text style={styles.mandatoryText}>
                      This is a mandatory event
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
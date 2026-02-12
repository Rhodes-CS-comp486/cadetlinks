import { Button } from '@react-navigation/elements';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useLayoutEffect } from 'react';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

export function Home({ navigation }) {
  //Calendar Stuff
  const [selectedDate, setSelectedDate] = useState('');

  const events = {
    "2026-02-10": [
      {id: "1", title: "PT 0600" },
      {id: "2", title: "LLAB 1500"},
    ],
    "2026-02-11": [
      {id: "3", title: "PT 0600" },
    ],
  };

  const markedDates = Object.keys(events).reduce((acc, date) => {
    acc[date] = {
      marked: true,
      dotColor: 'blue',
    };
  return acc;
}, {});



  return (
    <View style={styles.container}>
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

      {selectedDate && events[selectedDate] && (
        <View style={{ padding: 15 }}>
          <Text style={styles.sectionTitle}>Events</Text>
          {events[selectedDate].map(event => (
            <Text key={event.id} style={{ marginVertical: 5 }}>
              • {event.title}
            </Text>
          ))}a
        </View>
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});

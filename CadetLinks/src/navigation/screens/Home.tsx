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


  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
          console.log('Selected:', day.dateString);
        }}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: '#007bff',
          },
        }}
      />
      <Button screen="Profile" params={{ user: 'jane' }}>
        Go to Profile
      </Button>
      <Button screen="Settings">Go to Settings</Button>
      <Button screen="Settings"> Also Go Settings</Button>
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

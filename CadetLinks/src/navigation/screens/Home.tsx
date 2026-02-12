import { Button } from '@react-navigation/elements';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

export function Home(props) {
  //Settings Button
  const navigation = useNavigation();

  useLayoutEffect(() => {
    if (!navigation || typeof navigation.setOptions !== 'function') return;

    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => navigation.navigate('Settings')}
          style={{ marginRight: 15 }}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  //Announcements
  const announcements = [
  { id: '1', title: 'LLAB Uniform', body: 'ABUs required this Thursday.' },
  { id: '2', title: 'PT Location Change', body: 'Meet at track instead of gym.' },
  ];

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
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.announcementContainer}>
      <Text style={styles.sectionTitle}>Announcements</Text>

      {announcements.map(item => (
        <View key={item.id} style={styles.announcementCard}>
          <Text style={styles.announcementTitle}>{item.title}</Text>
          <Text>{item.body}</Text>
        </View>
      ))}
    </View>
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
          ))}
        </View>
      )}
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  announcementContainer: {
    padding: 15,
    backgroundColor: '#eb8d0e'
  },
  announcementCard: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  announcementTitle: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

import { Button } from '@react-navigation/elements';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import React, { useState, useLayoutEffect, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { onValue, ref, get, onChildRemoved } from 'firebase/database';
import { db } from '../../firebase/config';

export function Home() {
  const profileRef = ref(db, 'cadets/icdixon_memphis_edu');
  get(profileRef)
  .then(snapshot => {
    if (snapshot.exists()) {
      console.log("Cadet data in Home:", snapshot.val());
    } else {
      console.log("No cadet data available");
    }
  })
  .catch(error => {
    console.error("Error reading cadet profile:", error);
  });
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
  { id: '1', title: 'LLAB Uniform', body: 'OCPs required this Thursday.' },
  { id: '2', title: 'PT Location Change', body: 'Meet at gym instead of track this week.' },
  { id: '3', title: 'LLAB Uniform', body: 'Dress Blues required next Thursday.' },
  { id: '4', title: 'PT Cancellation', body: 'PT on 23 Feb has been cancelled.' },
  { id: '5', title: 'Upcoming PFD', body: 'The next PFD is scheduled for 28 Feb.' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.announcementContainer}>
        <Text style={styles.sectionTitle}>Announcements</Text>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 10 }}>
          {announcements.map(item => (
            <View key={item.id} style={styles.announcementCard}>
              <Text style={styles.announcementTitle}>{item.title}</Text>
              <Text>{item.body}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
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
  announcementContainer: {
    padding: 15,
    backgroundColor: '#eb8d0e',
    height: '35%',
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

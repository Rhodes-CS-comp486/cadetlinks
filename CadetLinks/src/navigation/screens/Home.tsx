import { Button } from '@react-navigation/elements';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import React, { useState, useLayoutEffect, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { onValue, ref, get, onChildRemoved } from 'firebase/database';
import { db } from '../../firebase/config';
import { homeStyles as styles } from '../../styles/HomeStyles';
import { HomeScreenLayout } from '../Components/ScreenLayout';
import { PERMISSIONS } from '../../assets/constants';
import { cadetKey } from './LoginPage/LoginLogic';
import AsyncStorage from '@react-native-async-storage/async-storage';

export let cadetObject: any = null;
export const cadetPermissionsMap = new Map<string, boolean>([
  [PERMISSIONS.EVENT_MAKING, false],
  [PERMISSIONS.FILE_UPLOADING, false],
  [PERMISSIONS.ATTENDANCE_EDITING, false]
]);

export function Home() {
  const navigation = useNavigation();
  //const [cadetData, setCadetData] = useState<any>(null);

  useEffect(() => {
    const loadCadetData = async() =>{
      try {
        const storedCadetKey = await AsyncStorage.getItem("currentCadetKey");
        if (!storedCadetKey) {
          console.warn("No cadetKey found in AsyncStorage");
          return;
        }
        const profileRef = ref(db, "cadets/" + storedCadetKey);

        const snapshot = await get(profileRef);

        if (snapshot.exists()) {
          console.log("Cadet data in Home:", snapshot.val());
          cadetObject = snapshot.val();
          if (cadetObject.permissions) {
            const listOfPermissions = cadetObject.permissions.split(",");
            //console.log("Raw permissions string:", cadetObject.permissions);
            listOfPermissions.forEach((permission: string) =>{
              cadetPermissionsMap.set(permission.trim(), true);
            })
            console.log("Cadet permissions:", cadetPermissionsMap);
            
          }
        } else {
          console.log("No cadet data available");
        }
      } catch (error) {
        console.error("Error fetching cadet data:", error);
      }
    };
    loadCadetData();
  }, []);



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
    <HomeScreenLayout>
      <View style={styles.body_container}>
        
        <View style={styles.announcementContainer}>
          <Text style={styles.sectionTitle}>Announcements</Text>

          <ScrollView 
          style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 10 }}
          persistentScrollbar={true}
          >
            {announcements.map(item => (
              <View key={item.id} style={styles.announcementCard}>
                <Text style={styles.announcementTitle}>{item.title}</Text>
                <Text style={styles.announcementBody}>{item.body}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.eventsContainer}>
        <Text style={styles.sectionTitle}> Upcoming Events </Text>
        </View>

      </View>
    </HomeScreenLayout>
  );
}

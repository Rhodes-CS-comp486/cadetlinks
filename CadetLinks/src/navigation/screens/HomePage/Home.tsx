//import { Button } from '@react-navigation/elements';
//import React, { use, useEffect, useMemo} from 'react';
//import { Calendar } from 'react-native-calendars';
//import { Ionicons } from '@expo/vector-icons';
//import { onValue, ref, get, onChildRemoved } from 'firebase/database';
//import { db } from '../../../firebase/config';
//import { PERMISSIONS } from '../../../assets/constants';
//import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHomeLogic } from './HomeLogic';
import { useNavigation } from '@react-navigation/native';
import { homeStyles as styles } from '../../../styles/HomeStyles';
import { HomeScreenLayout } from '../../Components/ScreenLayout';
import { View, Text, ScrollView} from 'react-native';


export function HomePage() {
  //const navigation = useNavigation();
  const{
    cadetPermissionsMap,
    hasPermission,
    announcements,
    navigation
  } = useHomeLogic();

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

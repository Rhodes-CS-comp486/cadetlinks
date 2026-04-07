
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { onValue, ref, get } from 'firebase/database';
import { db } from '../../../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERMISSIONS } from '../../../assets/constants';
import {TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../../../assets/types';
// import { ca } from 'react-native-paper-dates';


export let cadetObject: any = null;


export function useHomeLogic() {
  const navigation = useNavigation();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [cadetPermissionsMap, setCadetPermissionsMap] = useState<Map<string, boolean>>(
    new Map([
        [PERMISSIONS.EVENT_MAKING, false],
        [PERMISSIONS.FILE_UPLOADING, false],
        [PERMISSIONS.ATTENDANCE_EDITING, false]
    ])
);

  const parseLocalDateTime = (dateStr: string, timeStr: string): Date | null => {
    const [year, month, day] = String(dateStr).split('-').map(Number);
    const [hours = 0, minutes = 0, seconds = 0] = String(timeStr || '00:00:00')
      .split(':')
      .map(Number);

    const localDate = new Date(year, (month ?? 1) - 1, day ?? 1, hours, minutes, seconds, 0);
    if (isNaN(localDate.getTime())) {
      return null;
    }

    return localDate;
  };

  useEffect(() => {
    const eventsRef = ref(db, 'events');

    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const eventsData = snapshot.val();
      if (!eventsData) {
        setAllEvents([]);
        return;
      }

      const loadedEvents: Event[] = Object.keys(eventsData)
        .map((key) => {
          const event = eventsData[key];
          const combinedDateTime = parseLocalDateTime(event.date, event.time);

          if (!combinedDateTime) {
            return null;
          }

          return {
            id: key,
            title: event.eventName,
            date: combinedDateTime,
            time: combinedDateTime,
            description: event.details,
            location: event.locationId,
            type: event.mandatory === true || event.mandatory === 'true' ? 'Mandatory' : 'RSVP',
          };
        })
        .filter((event): event is Event => event !== null);

      setAllEvents(loadedEvents);
    });

    return () => unsubscribe();
  }, []);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const dayAfterTomorrowEndExclusive = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 3,
      0,
      0,
      0,
      0
    );

    return allEvents
      .filter((event) => event.time >= todayStart && event.time < dayAfterTomorrowEndExclusive)
      .sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [allEvents]);

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

        if (!snapshot.exists()) {
          setCadetPermissionsMap(new Map());
          return;
        }

        console.log("Cadet data in Home:", snapshot.val());
        cadetObject = snapshot.val();

        const cadetData = snapshot.val();

        //console.log("Initial permissions map:", cadetPermissionsMap);   

        const job = cadetData.job;

        const permissionsRef = ref(db,"indexes/permissions/" + job);
        const permissionsSnap = await get(permissionsRef);

        console.log("Permissions for: ",job, "are: ", permissionsSnap.val());

        if (!permissionsSnap.exists()) {
            return;
        }
        //const permissionsList: string[] = permissionsSnap.val();
        const permEntries = Object.entries(permissionsSnap.val());
        
        setCadetPermissionsMap(prev => {
            const newMap = new Map(prev);
            permEntries.forEach(([perm, value]) => {
                newMap.set(perm, value === true); // Ensure value is boolean
            });
            return newMap;
        });
        
      } catch (error) {
        console.error("Error fetching cadet data:", error);
      }
    };
    loadCadetData();
  },[] );

  //console.log("Permissions map:",cadetPermissionsMap);


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

  const hasPermission = (permission: string): boolean => {
    return cadetPermissionsMap.get(permission) || false;
  };

  return{
    navigation,
    cadetPermissionsMap,
    hasPermission,
    announcements,
    upcomingEvents,
  };
  
}
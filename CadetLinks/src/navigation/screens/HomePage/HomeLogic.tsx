
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ref, onValue, get, set } from "firebase/database";
import { db } from '../../../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERMISSIONS } from '../../../assets/constants';
import {TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event } from '../../../assets/types';


export let cadetObject: any = null;

export interface Announcement {
  id: string;
  title: string;
  body: string;
  importance: string;
  retirementDate: Date;
}

type AnnouncementDbValue = {
  title: string;
  body: string;
  importance: string;
  retirementDate: string;
};


export function useHomeLogic() {
  const navigation = useNavigation();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [userRsvpEventIds, setUserRsvpEventIds] = useState<Set<string>>(new Set());
  const [cadetPermissionsMap, setCadetPermissionsMap] = useState<Map<string, boolean>>(
    new Map([
        [PERMISSIONS.EVENT_MAKING, false],
        [PERMISSIONS.FILE_UPLOADING, false],
        [PERMISSIONS.ATTENDANCE_EDITING, false],
        [PERMISSIONS.ADMIN, false]
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
    const loadRsvps = async () => {
      const cadetKey = await AsyncStorage.getItem("currentCadetKey");
      if (!cadetKey) return;

      const unsubscribe = onValue(ref(db, 'rsvps'), (snapshot) => {
        const rsvpData = snapshot.val() || {};
        const ids = new Set<string>();

        Object.entries(rsvpData).forEach(([eventId, eventNode]) => {
          const userNode = (eventNode as any)[cadetKey];
          if (userNode?.status === "Y") {
            ids.add(eventId);
          }
        });

        setUserRsvpEventIds(ids);
      });

      return () => unsubscribe();
    };

    loadRsvps();
  }, []);

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
      .filter((event) => 
        event.type === 'Mandatory' || userRsvpEventIds.has(event.id)
      )
      .sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [allEvents, userRsvpEventIds]);

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

  {/** Announcements */}
  // Loading announcements and listening for changes in real-time
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [addAnnouncementModalVisible, setAddAnnouncementModalVisible] = useState(false);
  const [deleteAnnouncementModalVisible, setDeleteAnnouncementModalVisible] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string>('');
  const [newAnnouncement, setNewAnnouncement] = useState<Announcement>({
    id: '',
    title: '',
    body: '',
    importance: 'Low',
    retirementDate: new Date(),
  });
  
  useEffect(() => {
    const announcementsRef = ref(db, 'announcements');

    const unsubscribe = onValue(announcementsRef, (snapshot) => {
      const announcementsData = snapshot.val() as Record<string, AnnouncementDbValue> | null;
      if (!announcementsData) {
        setAnnouncements([]);
        return;
      }
      const announcementsList: Announcement[] = Object.entries(announcementsData).map(([id, value]) => {
        const parsedDate = parseLocalDateTime(value.retirementDate, '00:00:00');
        if (!parsedDate) return null;

        return {
          id,
          title: value.title,
          body: value.body,
          importance: value.importance,
          retirementDate: parsedDate,
        };
      }).filter((a): a is Announcement => a !== null);

      // Sorting announcements by importance (High > Medium > Low)
      const importanceOrder: Record<string, number> = {
        'High': 3,
        'Medium': 2,
        'Low': 1,
      };
      announcementsList.sort((a, b) => importanceOrder[b.importance] - importanceOrder[a.importance]);

      setAnnouncements(announcementsList);
      console.log("Loaded announcements:", announcementsList);
    });

    return () => unsubscribe();
  }, []);

  const handleAddAnnouncement = () => {
    setNewAnnouncement({
      id: '',
      title: '',
      body: '',
      importance: 'Low',
      retirementDate: new Date(),
    });
    setAddAnnouncementModalVisible(true);
  }

  const handleCancelAddAnnouncement = () => {
    setAddAnnouncementModalVisible(false);
  }

  const handleConfirmAddAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.body || !newAnnouncement.importance || !newAnnouncement.retirementDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    await writeToAnnouncementsdb(newAnnouncement);
    setAddAnnouncementModalVisible(false);
  }

  const formatDateOnly = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const generateUniqueId = (): string => {
    return `announcement-${Date.now()}`;
  };

  const writeToAnnouncementsdb = async (announcement: Announcement) => {

    announcement = reformatAnnouncementforDB(announcement); // This will set the ID and reformat the date for DB storage

    try {
      await set(ref(db, 'announcements/' + announcement.id), {
        title: announcement.title,
        retirementDate: formatDateOnly(announcement.retirementDate),
        body: announcement.body,
        importance: announcement.importance,
      });
      console.log("Announcement written to DB:", announcement);
    } catch (error) {
      console.error("Error writing announcement to DB:", error);
    }
  }

  const handleDeleteAnnouncement = async (announcementId: string) => {
    setSelectedAnnouncementId(announcementId);
    setDeleteAnnouncementModalVisible(true);
  }

  const handleCancelDeleteAnnouncement = () => {
    setSelectedAnnouncementId('');
    setDeleteAnnouncementModalVisible(false);
  }

  const handleConfirmDeleteAnnouncement = async () => {
    try {
      await set(ref(db, 'announcements/' + selectedAnnouncementId), null);
      console.log("Announcement deleted from DB:", selectedAnnouncementId);
      setSelectedAnnouncementId('');
      setDeleteAnnouncementModalVisible(false);
    } catch (error) {
      console.error("Error deleting announcement from DB:", error);
    }
  }

  const reformatAnnouncementforDB = (announcement: Announcement): Announcement => {
    const id = announcement.id || generateUniqueId();
    return {
      ...announcement,
      id,
    };
  }


  const hasPermission = (permission: string): boolean => {
    return cadetPermissionsMap.get(permission) || false;
  };

  return{
    navigation,
    cadetPermissionsMap,
    hasPermission,
    announcements,
    newAnnouncement,
    setNewAnnouncement,
    upcomingEvents,
    addAnnouncementModalVisible,
    handleAddAnnouncement,
    handleConfirmAddAnnouncement,
    handleCancelAddAnnouncement,
    deleteAnnouncementModalVisible,
    handleDeleteAnnouncement,
    handleConfirmDeleteAnnouncement,
    handleCancelDeleteAnnouncement,
    selectedAnnouncementId,
  };
  
}


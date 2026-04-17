import { useState, useMemo, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { eventsStyles as styles } from '../../../styles/EventStyles';
import { getDatabase, ref, onValue, set, get } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CadetProfile } from '../ProfilePage/ProfileLogic';
import { db } from '../../../firebase/config';

export interface Event {
  id: string
  title: string;
  date: Date;
  time: Date;
  description: string;
  location: string;
  type: '' | 'RSVP' | 'Mandatory';
}
/*
TODO: 
- Get user-specific ID to update EventRSVP status in DB when user RSVPs to an event
- Add ability to edit/delete events (optional)
*/


export function useEvents() {

  // helper used throughout the hook - must be defined before any computed values that call it
  const formatDate = (d: Date | string): string => {
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) {
      console.error("Invalid date provided to formatDate:", d);
      return ''; // Return empty string for invalid dates
    }
    return date.toISOString().split('T')[0]; // Return just the date part (YYYY-MM-DD)
  };

  const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventInfoModalVisible, setEventInfoModalVisible] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<{ [eventId: string]: boolean }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addEventsModalVisible, setAddEventsModalVisible] = useState(false);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [cadetKey, setCadetKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CadetProfile | null>(null);

  const [newEvent, setNewEvent] = useState<Event>({
    id: '',
    title: '',
    date: new Date(),
    time: new Date(),
    description: '',
    location: '',
    type: '' as '' | 'RSVP' | 'Mandatory',
  });

  //loading persisted cadetKey from AsyncStorage on component mount
  useEffect(() => {
    const loadCadetKey = async () => {
      setLoading(true);
      setError(null);

      try {
        const key = await AsyncStorage.getItem('currentCadetKey');
          setCadetKey(key);
          //console.log("Loaded cadet key from storage:", key);
          if (!key) {
            setError("No user is logged in.");
            return;
          }
          
          // load logged-in cadet profile
          const profileRef = ref(db, `cadets/${key}`);
          const profileSnap = await get(profileRef);
          if (!profileSnap.exists()) {
            setError("No profile found for this user.");
            return;
          }
          const cadetData = profileSnap.val() as CadetProfile;
          
          setProfile(cadetData);

      } catch (error) {
        console.error('Error loading cadet key from storage:', error);
      }
      finally {
        setLoading(false);
      }
    };

    loadCadetKey();
  }, []);

  // marked dates for calendar component 
  const markedDates = allEvents.reduce((acc: any, event) => {
    const dateKey = formatDate(event.date);
    acc[dateKey] = { marked: true, dotColor: 'blue' };
    return acc;
  }, {});

  // Memoized, filtered, and sorted events for the selected date
  const eventsForSelectedDate = useMemo(() => {
    return allEvents
      .filter((ev) => formatDate(ev.date) === selectedDate)
      .sort((a, b) =>
        a.time.getTime() - b.time.getTime()
      );

  }, [allEvents, selectedDate]);


  // Load events from Firebase Realtime Database
  useEffect(() => {
    const eventsDBRef = ref(db, "events");

    const unsubscribe = onValue(eventsDBRef, (snapshot) => {
      const eventsData = snapshot.val();
      console.log("Loaded events from DB:", eventsData);
      //console.log("User ID for RSVP tracking:", cadetKey);
      if (!eventsData) {
        setAllEvents([]);
        console.log("No events data found in DB, setting allEvents to empty array");
        return;
      }

      // Transform the events data from the DB into the Event[] format expected by the app
      const loadedEvents: Event[] = Object.keys(eventsData).map((key) => {
        const event = eventsData[key];

        const dateStr = `${event.date}T${event.time}`; // Combine date and time into ISO string
        const combinedDateTime = new Date(dateStr);
        if (isNaN(combinedDateTime.getTime())) {
          console.error(`Invalid date for event ${key}:`, event.date, event.time);
          return null;
        }
        return {
          id: key,
          title: event.eventName,
          date: combinedDateTime,
          time: combinedDateTime,
          description: event.details,
          location: event.locationId,
          type: event.mandatory === true ? "Mandatory" : "RSVP", // assuming DB stores type as boolean true/false
        };
      })
        .filter((event): event is Event => event !== null);
      setAllEvents(loadedEvents);
      console.log("Transformed events for app:", loadedEvents);
    });
    return () => unsubscribe();
  }, []);


  // Listen for changes in RSVP status for the curr user across all events
  useEffect(() => {
    setRsvpStatus({}); // Clear RSVP status when events load to avoid showing stale data
    if (!cadetKey) {
      console.warn('No cadet key found in storage; cannot load RSVP status.');
      return;
    }

    const rsvpRef = ref(db, `rsvps/`);
    const unsubscribeRsvp = onValue(rsvpRef, (snapshot) => {
      const rsvpData = snapshot.val() || {};
      console.log("Loaded RSVP data from DB:", rsvpData);
      const userRsvpStatus: { [eventId: string]: boolean } = {};

      Object.entries(rsvpData).forEach(([eventId, eventNode]) => {
        const userNode = (eventNode as any)[cadetKey.toString() || ""]; // Access the current user's RSVP status for this event
        const status = userNode?.status;
        //console.log(`Processing RSVP for event ${eventId}:`, { userNode, status });

        if (status === "Y") userRsvpStatus[eventId] = true;
        if (status === "N") userRsvpStatus[eventId] = false;
      });
      setRsvpStatus(userRsvpStatus);
      console.log("Processed RSVP status for user:", cadetKey, userRsvpStatus);
    });

    return () => {
      unsubscribeRsvp();
    };
  }, [cadetKey]);


  /*
  when event is pressed, set it as the selected event, open the modal:
  if RSVP event load user's current RSVP status for that event from the DB to display in the modal
  */

  const handleEventPress = async (event: Event) => {
    setSelectedEvent(event);
    if (event.type === 'RSVP') {
      const status = await getRSVPStatus(event.id);
      if (status !== undefined) {
        setRsvpStatus((prev) => ({ ...prev, [event.id]: status }));
      }
    }
    setEventInfoModalVisible(true);
  };

  //called from eventscreen when user confirms or declines an RSVP - updates local state and DB
  const handleRSVP = (eventId: string, confirming: boolean) => {
    setRsvpStatus((prev) => ({ ...prev, [eventId]: confirming }));
    void updateRSVPStatusInDB(eventId, confirming); // Update RSVP status in DB for the current user and event
    setEventInfoModalVisible(false);
    setSelectedEvent(null);
    setToastMessage(confirming ? 'RSVP Confirmed' : 'RSVP Declined');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // push RSVP status to DB for the current user and event
  const updateRSVPStatusInDB = async (eventId: string, confirming: boolean) => {
    if (!cadetKey) {
      console.warn('Cannot update RSVP without a persisted cadet key.');
      return;
    }

    console.log("Updating RSVP in DB for user:", cadetKey, "event:", eventId, "confirming:", confirming);
    try {
      const rsvpRef = ref(db, `rsvps/${eventId}/` + `${cadetKey}`);
      await set(rsvpRef, {
        status: confirming ? "Y" : "N"
      });
      console.log("RSVP successfully written to DB:", { eventId, userId: cadetKey, status: confirming ? "Y" : "N" });
    }
    catch (error) {
      console.error("Error updating RSVP in DB:", error);
    }
  }

  // helper to get current user's RSVP status for a given event -> called from handleEventPress
  const getRSVPStatus = async (eventId: string): Promise<boolean | undefined> => {
    if (!cadetKey) {
      console.warn('Cannot load RSVP status without a persisted cadet key.');
      return undefined;
    }

    try {
      const rsvpRef = ref(db, `rsvps/${eventId}/` + `${cadetKey}`);
      const snapshot = await get(rsvpRef);

      if (!snapshot.exists()) return undefined; // No RSVP status found for this user and event

      const value = snapshot.val();
      // The DB structure is assumed to be: rsvps/{eventId}/{userId}: { status: "Y" or "N" }
      const status = typeof value === 'object' && 'status' in value ? value.status : undefined;

      if (status === "Y") return true;
      if (status === "N") return false;
      return undefined; // In case of unexpected value

    } catch (error) {
      console.error("Error getting RSVP status from DB:", error);
      return undefined;
    }

  }

  const handleCloseEventInfoModal = () => {
    setEventInfoModalVisible(false);
    setSelectedEvent(null);
  };


  //Determining event title based on user's job title or admin permission
  const job = profile?.job || "—";
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const getEventConfig = (job?: string, permissions?: string) => {
    if (permissions?.includes('Admin')) {
      return { mode: 'free', type: 'either', title: '', options: []};
    }
    switch (job) {
      case 'Physical Fitness Officer (PFO)':
        return { mode: 'fixed', type: 'Mandatory', title: 'PT', options:[] };
      case 'Leadership Lab (LLAB) Commander':
        return { mode: 'fixed', type: 'Mandatory', title: 'LLAB', options:[] };
      case 'A3 Director':
        return { mode: 'checkbox', type: 'Mandatory', title: '', options: ['LLAB', 'PT'] };
      case 'Remedial Marching Practice (RMP) Commander':
        return { mode: 'fixed', type: 'either', title: 'RMP', options:[] };
      case 'Honor Guard Officer':
        return { mode: 'checkbox', type: 'RSVP', title: '', options: ['Honor Guard', 'Honor Guard Practice'] };
      case 'Morale Officer':
        return { mode: 'fixed', type: 'RSVP', title: 'Morale', options:[], baseTitle: '' };
      case 'A4, A5 Director':
        return { mode: 'checkbox', type: 'RSVP', title: '', options: ['RMP', 'Honor Guard', 'Honor Guard Practice', 'Morale'] };
      case 'Community Service Officer':
        return { mode: 'fixed', type: 'RSVP', title: 'Community Service', options:[] };
      case 'Recruiting Officer':
        return { mode: 'fixed', type: 'RSVP', title: 'Recruiting', options:[] };
      case 'A8, A9 Director':
      case 'A9 Director':
        return { mode: 'checkbox', type: 'RSVP', title: '', options: ['Community Service', 'Recruiting'] };
      case 'Special Projects Officer':
        return { mode: 'free', type: 'either', title: '', options: [] };
      default:
        return { mode: 'free', type: 'either', title: '', options: [] };
    }
  };

  useEffect(() => {
    if (addEventsModalVisible) {
      const config = getEventConfig(profile?.job, profile?.permissions);
      if (config.mode === 'checkbox') {
        let title = '';
        if (selectedOptions.length > 0) {
          title = selectedOptions[0];
        }
        setNewEvent(prev => ({ ...prev, title }));
      }
    }
  }, [selectedOptions, addEventsModalVisible, profile]);


  // Reset newEvent state to default values when opening the add event modal
  const handleAddEvent = () => {
    const config = getEventConfig(profile?.job, profile?.permissions);
    let title = '';
    if (config.mode === 'fixed') {
      title = config.title;
    } else if (config.mode === 'checkbox') {
      setSelectedOptions(config.options.length > 0 ? [config.options[0]] : []);
      title = config.options.length > 0 ? config.options[0] : '';
    } else {
      title = '';
    }

    const [year, month, day] = selectedDate.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date

    const type = config.type === 'either' ? '' : (config.type as '' | 'RSVP' | 'Mandatory');
    setNewEvent({
      id: '',
      title,
      date: parsedDate,
      time: new Date(),
      description: '',
      location: '',
      type,
    });
    setAddEventsModalVisible(true);
  };


  // validate new event inputs and write to DB then close modal and show confirmation toast
  const handleConfirmAddEvent = async () => {
    // Validate form inputs
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location || !newEvent.type) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    //Temporary fix for date being added two days ahead in DB - think there is something wrong with the DatePicker component
    const correctedDate = new Date(newEvent.date.getFullYear(), newEvent.date.getMonth(), newEvent.date.getDate() - 2);
    const correctedEvent = { ...newEvent, date: correctedDate };

    await writeToEventsDB(correctedEvent); // Write the new event to the database

    if(newEvent.title.toUpperCase() === "LLAB" || newEvent.title.toUpperCase() === "PT" || newEvent.title.toUpperCase() === "RMP"){
      await writeToSpecialEventsDB(newEvent.title.toUpperCase(), formatDate(correctedDate) ); // Write to special events DB if event is LLAB, PT, RMP for easy filtering on home screen
      console.log("Wrote to Special Events DB with title:", newEvent.title.toUpperCase(), "date:", formatDate(correctedDate));
    }
    setAddEventsModalVisible(false);
    setToastMessage('Event added successfully');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper function to write a new event to the Firebase Realtime Database
  const writeToEventsDB = async (event: Event) => {
    // Convert event object to the format expected by the DB
    event = reformatEventForDB(event); // This will set the ID and reformat the date/time for DB storage
    try {
      await set(ref(db, 'events/' + event.id), {
        eventName: event.title,
        date: formatDate(event.date),
        time: event.time.toTimeString().split(' ')[0], // Store time as HH:MM:SS
        details: event.description,
        locationId: event.location,
        mandatory: event.type === 'Mandatory' ? "true" : "false",
      });
      console.log("Event written to DB:", event);
    } catch (error) {
      console.error("Error writing event to DB:", error);
    }

    if (event.type === 'RSVP') {
      await initializeRsvpEntryToDB(event.id); // Create corresponding entry in RSVP section of DB for the new event
      console.log("Initialized RSVP entry in DB for event:", event.id);
    }

    //await initializeRsvpEntryToDB(event.id); // Create corresponding entry in RSVP section of DB for the new event
    console.log("Wrote to Events DB with ID:", event.id);
  };

  // helper function to initialize an RSVP entry in the DB for a new event
  const initializeRsvpEntryToDB = async (eventId: string) => {
    if (!cadetKey) {
      console.warn('Cannot initialize RSVP entry without a persisted cadet key.');
      return;
    }

    try {
      const userId = cadetKey;
      console.log("Initializing RSVP entry in DB for event:", eventId, "user:", userId);
      const rsvpRef = ref(db, `rsvps/` + `${eventId}` + `/${userId}`);
      //const childSnapshot = push(rsvpRef);
      await set(rsvpRef, {
        status: ""
      });
    } catch (error) {
      console.error("Error initializing RSVP entry in DB:", error);
    }
  };

  const writeToSpecialEventsDB = async (eventTitle: string, eventDate: string) => {
    const db = getDatabase();
    console.log("Writing to Special Events DB with title:", eventTitle, "date:", eventDate, "for user:", /**cadetObject.lastName*/'Last Name');
    
    try {
      await set(ref(db, 'attendance/' + `${eventTitle}/${eventDate}/${/**cadetObject.lastName*/'Last Name'}`), {
        status:"."
      });
      console.log("Special event written to DB:", { title: eventTitle, date: eventDate });
    } catch (error) {
      console.error("Error writing special event to DB:", error);
    }
  };


  // helper function to reformat event object for DB storage: sets ID and date/time formatting
  const reformatEventForDB = (event: Event) => {
    const combinedDateTime = new Date(event.date);

    combinedDateTime.setHours(event.time.getHours());
    combinedDateTime.setMinutes(event.time.getMinutes());
    combinedDateTime.setSeconds(0);
    combinedDateTime.setMilliseconds(0);

    //setting Id and reformating date for DB storage before writing to DB
    const eventToAdd: Event = {
      ...event,
      id: Math.floor(Math.random() * 10000).toString(), // random number generator
      date: combinedDateTime,
      time: combinedDateTime,
    };

    console.log("Reformatted event for DB:", eventToAdd);
    return eventToAdd;
  };

  const handleCancelAddEvent = () => {
    setAddEventsModalVisible(false);
  };

  // Delete an event from Firebase (and its RSVP entries)
  const deleteEventFromDB = async (eventId: string) => {
    const db = getDatabase();
    await set(ref(db, `events/${eventId}`), null);
    await set(ref(db, `rsvps/${eventId}`), null);
    console.log('Event deleted from DB:', eventId);
  };

  const handleDeleteEvent = (event: Event) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
        void deleteEventFromDB(event.id);
      }
      return;
    }

    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void deleteEventFromDB(event.id),
        },
      ]
    );
  };

  // Helper function to determine label text and style for event based on type and RSVP status
  const getLabelTextAndStyle = (event: { type: string; id: string }): [any, string] => {
    if (event.type === 'Mandatory') {
      return [styles.mandatoryLabel, 'Mandatory'];
    }

    const status = rsvpStatus[event.id];

    if (status === true) {
      return [styles.confirmButton, 'Confirmed'];
    }

    if (status === false) {
      return [styles.declineButton, 'Declined'];
    }
    return [styles.rsvpLabel, 'RSVP']; // default for RSVP events with no response yet

  };

  // Return all state, computed values, handlers, and helpers
  return {
    // State
    selectedDate,
    setSelectedDate,
    selectedEvent,
    eventInfoModalVisible,
    setEventInfoModalVisible,
    rsvpStatus,
    toastMessage,
    addEventsModalVisible,
    allEvents,
    newEvent,
    setNewEvent,
    selectedOptions,
    setSelectedOptions,
    // Computed values
    markedDates,
    eventsForSelectedDate,
    // Handlers
    handleEventPress,
    handleRSVP,
    handleCloseEventInfoModal,
    handleAddEvent,
    handleConfirmAddEvent,
    handleCancelAddEvent,
    handleDeleteEvent,
    // Helpers
    getLabelTextAndStyle,
    eventConfig: getEventConfig(profile?.job, profile?.permissions),
  };
}
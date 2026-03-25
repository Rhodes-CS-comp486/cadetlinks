import { useState, useMemo, useEffect } from 'react';
import { Alert } from 'react-native';
import { eventsStyles as styles } from '../../../styles/EventStyles';
import { getDatabase, ref, onValue, set, get } from "firebase/database";
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const formatLocalDateKey = (input: Date | string): string => {
    if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
      return input;
    }

    const d = typeof input === "string" ? new Date(input) : input;
    if (isNaN(d.getTime())) {
      console.error("Invalid date provided to formatLocalDateKey:", input);
      return "";
    }

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatLocalTimeString = (date: Date): string => {
    if (isNaN(date.getTime())) {
      console.error("Invalid date provided to formatLocalTimeString:", date);
      return "00:00:00";
    }

    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  const parseLocalDateTime = (dateStr: string, timeStr: string): Date | null => {
    const [year, month, day] = String(dateStr).split("-").map(Number);
    const [hours = 0, minutes = 0, seconds = 0] = String(timeStr || "00:00:00")
      .split(":")
      .map(Number);

    const localDate = new Date(year, (month ?? 1) - 1, day ?? 1, hours, minutes, seconds, 0);
    if (isNaN(localDate.getTime())) {
      return null;
    }

    return localDate;
  };


  const [selectedDate, setSelectedDate] = useState<string>(formatLocalDateKey(new Date()));
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventInfoModalVisible, setEventInfoModalVisible] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<{ [eventId: string]: boolean }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addEventsModalVisible, setAddEventsModalVisible] = useState(false);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [cadetKeyFromStorage, setCadetKeyFromStorage] = useState<string | null>(null);
  const [cadetKeyLoaded, setCadetKeyLoaded] = useState<boolean>(false);

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
    let isMounted = true;

    const loadCadetKey = async () => {
      try {
        const storedCadetKey = await AsyncStorage.getItem('currentCadetKey');
        if (isMounted) {
          setCadetKeyFromStorage(storedCadetKey);
          setCadetKeyLoaded(true); // Mark that we've finished loading the cadet key
          console.log("Loaded cadet key from storage:", storedCadetKey);
        }
      } catch (error) {
        console.error('Error loading cadet key from storage:', error);
      }
    };

    loadCadetKey();

    return () => {
      isMounted = false;
    };
  }, []);

  // marked dates for calendar component 
  const markedDates = allEvents.reduce((acc: any, event) => {
    const dateKey = formatLocalDateKey(event.date);
    acc[dateKey] = { marked: true, dotColor: 'blue' };
    return acc;
  }, {});

  // Memoized, filtered, and sorted events for the selected date
  const eventsForSelectedDate = useMemo(() => {
    return allEvents
      .filter((ev) => formatLocalDateKey(ev.date) === selectedDate)
      .sort((a, b) =>
        a.time.getTime() - b.time.getTime()
      );

  }, [allEvents, selectedDate]);


  // Load events from Firebase Realtime Database
  useEffect(() => {
    const db = getDatabase();
    const eventsDBRef = ref(db, "events");

    const unsubscribe = onValue(eventsDBRef, (snapshot) => {
      const eventsData = snapshot.val();
      console.log("Loaded events from DB:", eventsData);
      //console.log("User ID for RSVP tracking:", cadetKeyFromStorage);
      if (!eventsData) {
        setAllEvents([]);
        console.log("No events data found in DB, setting allEvents to empty array");
        return;
      }

      // Transform the events data from the DB into the Event[] format expected by the app
      const loadedEvents: Event[] = Object.keys(eventsData).map((key) => {
        const event = eventsData[key];

        const combinedDateTime = parseLocalDateTime(event.date, event.time);
        if (!combinedDateTime) {
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
          type: event.mandatory === true || event.mandatory === "true" ? "Mandatory" : "RSVP",
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
    if (!cadetKeyLoaded) return;

    setRsvpStatus({}); // Clear RSVP status when events load to avoid showing stale data
    if (!cadetKeyFromStorage) {
      console.warn('No cadet key found in storage; cannot load RSVP status.');
      return;
    }

    const db = getDatabase();
    const rsvpRef = ref(db, `rsvps/`);
    const unsubscribeRsvp = onValue(rsvpRef, (snapshot) => {
      const rsvpData = snapshot.val() || {};
      console.log("Loaded RSVP data from DB:", rsvpData);
      const userRsvpStatus: { [eventId: string]: boolean } = {};

      Object.entries(rsvpData).forEach(([eventId, eventNode]) => {
        const userNode = (eventNode as any)[cadetKeyFromStorage.toString() || ""]; // Access the current user's RSVP status for this event
        const status = userNode?.status;
        //console.log(`Processing RSVP for event ${eventId}:`, { userNode, status });

        if (status === "Y") userRsvpStatus[eventId] = true;
        if (status === "N") userRsvpStatus[eventId] = false;
      });
      setRsvpStatus(userRsvpStatus);
      console.log("Processed RSVP status for user:", cadetKeyFromStorage, userRsvpStatus);
    });

    return () => {
      unsubscribeRsvp();
    };
  }, [cadetKeyFromStorage, cadetKeyLoaded]);


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
    if (!cadetKeyFromStorage) {
      console.warn('Cannot update RSVP without a persisted cadet key.');
      return;
    }

    console.log("Updating RSVP in DB for user:", cadetKeyFromStorage, "event:", eventId, "confirming:", confirming);
    try {
      const db = getDatabase();
      const rsvpRef = ref(db, `rsvps/${eventId}/` + `${cadetKeyFromStorage}`);
      await set(rsvpRef, {
        status: confirming ? "Y" : "N"
      });
      console.log("RSVP successfully written to DB:", { eventId, userId: cadetKeyFromStorage, status: confirming ? "Y" : "N" });
    }
    catch (error) {
      console.error("Error updating RSVP in DB:", error);
    }
  }

  // helper to get current user's RSVP status for a given event -> called from handleEventPress
  const getRSVPStatus = async (eventId: string): Promise<boolean | undefined> => {
    if (!cadetKeyFromStorage) {
      console.warn('Cannot load RSVP status without a persisted cadet key.');
      return undefined;
    }

    try {
      const db = getDatabase();
      const rsvpRef = ref(db, `rsvps/${eventId}/` + `${cadetKeyFromStorage}`);
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


  // Reset newEvent state to default values when opening the add event modal
  const handleAddEvent = () => {
    setNewEvent({
      id: '',
      title: '',
      date: new Date(),
      time: new Date(),
      description: '',
      location: '',
      type: '' as '' | 'RSVP' | 'Mandatory',
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

    await writeToEventsDB(newEvent); // Write the new event to the database
    if (newEvent.title === "PT" || newEvent.title === "LLAB") {
      Alert.alert('Event Added', 'PT/LLAB events must be added through the attendance section to properly track attendance.');
      await addAttendanceForNewEvent(newEvent.title, newEvent.date); // If it's a PT/LLAB event, also add it to the attendance tracking in the DB
    }


    setAddEventsModalVisible(false);
    setToastMessage('Event added successfully');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper function to write a new event to the Firebase Realtime Database
  const writeToEventsDB = async (event: Event) => {
    // Convert event object to the format expected by the DB
    event = reformatEventForDB(event); // This will set the ID and reformat the date/time for DB storage
    const db = getDatabase();
    try {
      await set(ref(db, 'events/' + event.id), {
        eventName: event.title,
        date: formatLocalDateKey(event.date),
        time: formatLocalTimeString(event.time),
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

  const addAttendanceForNewEvent = async (eventTitle: string, eventDate: Date) => {
      const db = getDatabase();
      try {
        const title = eventTitle.trim().toUpperCase();
        const attendanceRef = ref(db, `attendance/${title}/${formatLocalDateKey(eventDate)}`);
        await set (attendanceRef, {
          status: "."
         });
          console.log(`Initialized attendance tracking in DB for new event: ${title}`);
       
      } catch (error) {
        console.error("Error adding attendance for new event:", error);
      }
    };

  // helper function to initialize an RSVP entry in the DB for a new event
  const initializeRsvpEntryToDB = async (eventId: string) => {
    if (!cadetKeyFromStorage) {
      console.warn('Cannot initialize RSVP entry without a persisted cadet key.');
      return;
    }

    try {
      const db = getDatabase();
      const userId = cadetKeyFromStorage;
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
    // Helpers
    getLabelTextAndStyle,
  };
}

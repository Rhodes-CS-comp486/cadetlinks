import { useState, useMemo, useEffect } from 'react';
import { Alert } from 'react-native';
import { eventsStyles as styles } from '../../../styles/GeneralStyles';
import { getDatabase, ref, onValue, set, get, push } from "firebase/database";
import { getProfileID } from '../ProfilePage/ProfileLogic';
import {cadetKey} from '../Login';

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
    if(isNaN(date.getTime())) {
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


  // Load events from Firebase Realtime Database
  useEffect(() => {
    const db = getDatabase();
    const eventsDBRef = ref(db, "events");
    
    const unsubscribe = onValue(eventsDBRef, (snapshot) => {
      const eventsData = snapshot.val();
      console.log("Loaded events from DB:", eventsData);
      console.log("User ID for RSVP tracking:", cadetKey);
      //console.log("trying to access title of first event:", eventsData ? eventsData[Object.keys(eventsData)[0]].eventName : "No events found");
      if(eventsData) {
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
              type: event.mandatory === "true" ? "Mandatory" :"RSVP", // assuming DB stores type as string "True"/"False"
            };
          })
          .filter((event): event is Event => event !== null);
        setAllEvents(loadedEvents);
        console.log("Transformed events for app:", loadedEvents);
      }
      else{
        console.log("No events found in DB");
        setAllEvents([]); // setting events to empty array if no data found in DB
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const [newEvent, setNewEvent] = useState<Event>({
    id: '',
    title: '',
    date: new Date(),
    time: new Date(),
    description: '',
    location: '',
    type: '' as '' | 'RSVP' | 'Mandatory',
  });

  // Computed values
  const markedDates = allEvents.reduce((acc: any, event) => {
    const dateKey = formatDate(event.date);
    acc[dateKey] = { marked: true, dotColor: 'blue' };
    return acc;
  }, {});

  // Memoized filtered and sorted events for the selected date
  const eventsForSelectedDate = useMemo(() => {
    return allEvents
      .filter((ev) => formatDate(ev.date) === selectedDate)
      .sort((a, b) => 
        a.time.getTime() - b.time.getTime()
    );
       
  }, [allEvents, selectedDate]);

  // Event handlers
  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setEventInfoModalVisible(true);
  };

  const handleRSVP = (eventId: string, confirming: boolean) => {
    setRsvpStatus((prev) => ({ ...prev, [eventId]: confirming }));
    updateRSVPInDB(eventId, confirming); // Update RSVP status in DB for the current user and event
    setEventInfoModalVisible(false);
    setSelectedEvent(null);
    setToastMessage(confirming ? 'RSVP Confirmed' : 'RSVP Declined');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // push RSVP status to DB for the current user and event
  const updateRSVPInDB = (eventId: string, confirming: boolean) => {
    const userId = cadetKey
    console.log("Updating RSVP in DB for user:", userId, "event:", eventId, "confirming:", confirming);
    
    if (!userId) {
      console.error("No user ID found for RSVP update");
      return;
    }
  
    try{
      const db = getDatabase();
      const rsvpRef = ref(db, `rsvps/${eventId}/ + ${userId}`);
      set(rsvpRef,{
        status: confirming? "Y":"N"
      });
      console.log("RSVP successfully written to DB:", `rsvps/${eventId}/${userId}`);
    }
    catch(error){
      console.error("Error updating RSVP in DB:", error);
    }
  }

  // helper to get current user's RSVP status for a given event.
  const getRSVPStatus = (eventId: string): boolean | undefined => {
    const db = getDatabase();
    const userId = cadetKey;
    const [status, setStatus] = useState<boolean | undefined>(undefined);
      const rsvpRef = ref(db, `eventRSVPs/${eventId}/`+ userId);
      const unsubscribe = onValue(rsvpRef, (snapshot) => {
        const value = snapshot.val();
        console.log("Loaded RSVP status from DB for user:", userId, "event:", eventId, "value:", value);
        if (value === "Y") {
          setStatus(true);
        } else if (value === "N") {
          setStatus(false);
        }
      });
      unsubscribe(); // Unsubscribe immediately since we just want the current value
      return status;
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

    setAddEventsModalVisible(false);
    setToastMessage('Event added successfully');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper function to write a new event to the Firebase Realtime Database
  const writeToEventsDB = async (event: Event) => {
    // Convert event object to the format expected by the DB
    event = reformatEventForDB(event); // This will set the ID and reformat the date/time for DB storage
    const db = getDatabase();
    try{
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

    if(event.type === 'RSVP'){
      await initializeRsvpEntryToDB(event.id); // Create corresponding entry in RSVP section of DB for the new event
      console.log("Initialized RSVP entry in DB for event:", event.id);
    }

    //await initializeRsvpEntryToDB(event.id); // Create corresponding entry in RSVP section of DB for the new event
    console.log("Wrote to Events DB with ID:", event.id);
  };

  const initializeRsvpEntryToDB = async (eventId: string) => {
    
    // adding entry for the event in the RSVP section of the DB 
    try {
      const db = getDatabase();
      const userId = cadetKey;
      console.log("Initializing RSVP entry in DB for event:", eventId, "user:", userId);
      const rsvpRef = ref(db, `rsvps/`+ `${eventId}` + `/${userId}`);
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
    if (status === undefined) {
      return [styles.rsvpLabel, 'RSVP'];
    } else {
      return status ? [styles.confirmButton, 'Confirmed'] : [styles.declineButton, 'Declined'];
    }
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

import { useMemo, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, get, update, remove } from "firebase/database";
import { db } from "../../../firebase/config";
import type { CadetProfile } from "../../../assets/types";

export type EventItem = {
  id: string;
  eventName?: string;
  date?: string;
  time?: string;
  details?: string;
  locationId?: string;
  mandatory?: boolean;
};

export type CadetListItem = {
  cadetKey: string;
  firstName: string;
  lastName: string;
  fullName: string;
  attendanceKey: string;
  flight?: string;
};

export type AttendanceStatus = "P" | "A" | "L";

type AttendanceOverrides = Record<string, AttendanceStatus>;

function normalizeAttendanceKey(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function inferAttendanceBucket(eventName?: string): "PT" | "LLAB" | null {
  const name = (eventName ?? "").toLowerCase();

  if (name.includes("pt")) return "PT";
  if (name.includes("llab") || name.includes("lab")) return "LLAB";

  return null;
}

export function useAttendanceLogic() {
  const [todayEvents, setTodayEvents] = useState<EventItem[]>([]);
  const [allCadets, setAllCadets] = useState<CadetListItem[]>([]);
  const [loadingAttendanceTools, setLoadingAttendanceTools] = useState(false);
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [flightDropdownOpen, setFlightDropdownOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<string | undefined>(undefined);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [clearingAttendance, setClearingAttendance] = useState(false);
  const [attendanceOverrides, setAttendanceOverrides] = useState<AttendanceOverrides>({});

  const selectedEvent = useMemo(
    () => todayEvents.find((event) => event.id === selectedEventId),
    [todayEvents, selectedEventId]
  );

  const markedAbsentCount = useMemo(
    () =>
      Object.values(attendanceOverrides).filter((status) => status === "A")
        .length,
    [attendanceOverrides]
  );

  const markedLateCount = useMemo(
    () =>
      Object.values(attendanceOverrides).filter((status) => status === "L")
        .length,
    [attendanceOverrides]
  );

  async function loadAttendanceModalData() {
    setLoadingAttendanceTools(true);

    try {
      const today = getTodayString();

      const eventsRef = ref(db, "events");
      const eventsSnap = await get(eventsRef);
      const eventsData = (eventsSnap.val() ?? {}) as Record<string, EventItem>;

      const todaysEvents = Object.entries(eventsData)
        .map(([id, value]) => {
          const { id: _ignoredId, ...rest } = value;
          return {
            id,
            ...rest,
          };
        })
        .filter((event) => event.date === today && !!event.eventName)
        .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));

      setTodayEvents(todaysEvents);

      const cadetsRef = ref(db, "cadets");
      const cadetsSnap = await get(cadetsRef);
      const cadetsData = (cadetsSnap.val() ?? {}) as Record<string, CadetProfile>;

      const cadetList = Object.entries(cadetsData)
        .map(([key, value]) => {
          const firstName = value.firstName ?? "";
          const lastName = value.lastName ?? "";
          const fullName = `${firstName} ${lastName}`.trim() || key;

          return {
            cadetKey: key,
            firstName,
            lastName,
            fullName,
            attendanceKey: normalizeAttendanceKey(lastName || key),
            flight: value.flight,
          };
        })
        .sort((a, b) => a.lastName.localeCompare(b.lastName));

      setAllCadets(cadetList);
    } catch (e) {
      console.error("❌ Error loading attendance modal data:", e);
      throw e;
    } finally {
      setLoadingAttendanceTools(false);
    }
  }

  const openAttendanceModal = async () => {
    try {
      await loadAttendanceModalData();
      setAttendanceModalVisible(true);
      setSelectedEventId("");
      setAttendanceOverrides({});
      setEventDropdownOpen(false);
    } catch {
      Alert.alert("Error", "Could not load attendance tools.");
    }
  };

  const closeAttendanceModal = () => {
    setAttendanceModalVisible(false);
    setEventDropdownOpen(false);
  };

  const toggleEventDropdown = () => {
    setEventDropdownOpen((prev) => !prev);
  };

  const selectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setEventDropdownOpen(false);
  };

  const toggleFlightDropdown = () => {
    setFlightDropdownOpen((prev) => !prev);
  };

   const selectFlight = (flightName: string) => {
    setSelectedFlight(flightName === "All" ? undefined : flightName);
    setFlightDropdownOpen(false);
  };

  const setCadetStatus = (
    cadetKeyToUpdate: string,
    status: AttendanceStatus
  ) => {
    setAttendanceOverrides((prev) => {
      const next = { ...prev };

      if (status === "P") {
        delete next[cadetKeyToUpdate];
      } else {
        next[cadetKeyToUpdate] = status;
      }

      return next;
    });
  };

  const getCadetStatus = (cadetKeyToCheck: string): AttendanceStatus => {
    return attendanceOverrides[cadetKeyToCheck] ?? "P";
  };

  async function saveAttendanceForEvent(
    eventId: string,
    overrides: AttendanceOverrides
  ) {
    const chosenEvent = todayEvents.find((event) => event.id === eventId);

    if (!chosenEvent) {
      throw new Error("Please select an event.");
    }

    const bucket = inferAttendanceBucket(chosenEvent.eventName);

    if (!bucket) {
      throw new Error(
        'Could not tell whether this event is PT or LLAB. Add "PT" or "LLAB" to the event name, or add an attendanceType field.'
      );
    }

    const date = chosenEvent.date;

    const updates: Record<string, { status: AttendanceStatus }> = {};

    for (const cadet of allCadets) {
      const chosenStatus = overrides[cadet.cadetKey] ?? "P";
      updates[`attendance/${bucket}/${date}/${cadet.attendanceKey}`] = {
        status: chosenStatus,
      };
    }

    await update(ref(db), updates);
  }

  async function clearAttendanceForEvent(eventId: string) {
    const chosenEvent = todayEvents.find((event) => event.id === eventId);

    if (!chosenEvent) {
      throw new Error("Please select an event.");
    }

    const bucket = inferAttendanceBucket(chosenEvent.eventName);

    if (!bucket) {
      throw new Error(
        'Could not tell whether this event is PT or LLAB. Add "PT" or "LLAB" to the event name, or add an attendanceType field.'
      );
    }

    const date = chosenEvent.date;
  
    await remove(ref(db, `attendance/${bucket}/${date}`));
  }

  const submitAttendance = async () => {
    if (!selectedEventId) {
      Alert.alert("Select an event", "Please choose today's event first.");
      return;
    }

    try {
      setSavingAttendance(true);
      await saveAttendanceForEvent(selectedEventId, attendanceOverrides);
      setAttendanceModalVisible(false);
      Alert.alert("Success", "Attendance was saved.");
    } catch (e: any) {
      Alert.alert("Could not save attendance", e?.message ?? "Unknown error.");
    } finally {
      setSavingAttendance(false);
    }
  };

  const clearSelectedAttendance = () => {
    if (!selectedEventId) {
      Alert.alert("Select an event", "Please choose an event first.");
      return;
    }

    Alert.alert(
      "Clear Attendance",
      "This will remove all saved attendance for the selected event date. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              setClearingAttendance(true);
              await clearAttendanceForEvent(selectedEventId);
              setAttendanceOverrides({});
              setAttendanceModalVisible(false);
              Alert.alert("Cleared", "Attendance was cleared for that event.");
            } catch (e: any) {
              Alert.alert(
                "Could not clear attendance",
                e?.message ?? "Unknown error."
              );
            } finally {
              setClearingAttendance(false);
            }
          },
        },
      ]
    );
  };

  return useMemo(
    () => ({
      todayEvents,
      allCadets,
      loadingAttendanceTools,
      attendanceModalVisible,
      selectedEventId,
      selectedEvent,
      eventDropdownOpen,
      savingAttendance,
      clearingAttendance,
      markedAbsentCount,
      markedLateCount,
      openAttendanceModal,
      closeAttendanceModal,
      toggleEventDropdown,
      selectEvent,
      flightDropdownOpen,
      selectFlight,
      selectedFlight,
      toggleFlightDropdown,
      setCadetStatus,
      getCadetStatus,
      submitAttendance,
      clearSelectedAttendance,
    }),
    [
      todayEvents,
      allCadets,
      loadingAttendanceTools,
      attendanceModalVisible,
      selectedEventId,
      selectedEvent,
      eventDropdownOpen,
      selectedFlight,
      flightDropdownOpen,
      savingAttendance,
      clearingAttendance,
      markedAbsentCount,
      markedLateCount,
      openAttendanceModal,
      closeAttendanceModal,
      toggleEventDropdown,
      selectEvent,
      setCadetStatus,
      getCadetStatus,
      submitAttendance,
      clearSelectedAttendance
    ]
  );
}

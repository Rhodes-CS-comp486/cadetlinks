import { useMemo, useState } from "react";
import { Alert } from "react-native";
import {
  clearAttendanceForEvent as clearAttendanceForEventGlobal,
  loadAttendanceToolsData,
  saveAttendanceForEvent as saveAttendanceForEventGlobal,
} from "../../../firebase/dbController";

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

  const setCadetStatus = (
    cadetKeyToUpdate: string,
    status: AttendanceStatus
  ) => {
    setAttendanceOverrides((prev) => {
      const next = { ...prev };

      // Absent is the default, so remove override when set to A
      if (status === "A") {
        delete next[cadetKeyToUpdate];
      } else {
        next[cadetKeyToUpdate] = status;
      }

      return next;
    });
  };

  const getCadetStatus = (cadetKeyToCheck: string): AttendanceStatus => {
    // Default is Absent
    return attendanceOverrides[cadetKeyToCheck] ?? "A";
  };

  const markedAbsentCount = useMemo(
    () =>
      allCadets.filter((cadet) => getCadetStatus(cadet.cadetKey) === "A").length,
    [allCadets, attendanceOverrides]
  );

  const markedLateCount = useMemo(
    () =>
      Object.values(attendanceOverrides).filter((status) => status === "L").length,
    [attendanceOverrides]
  );

  async function loadAttendanceModalData() {
    setLoadingAttendanceTools(true);

    try {
      const { todayEvents: loadedEvents, cadets } = await loadAttendanceToolsData();
      setTodayEvents(loadedEvents);
      setAllCadets(cadets as CadetListItem[]);
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
      setSelectedFlight(undefined);
      setAttendanceOverrides({});
      setEventDropdownOpen(false);
      setFlightDropdownOpen(false);
    } catch {
      Alert.alert("Error", "Could not load attendance tools.");
    }
  };

  const closeAttendanceModal = () => {
    setAttendanceModalVisible(false);
    setEventDropdownOpen(false);
    setFlightDropdownOpen(false);
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

  async function saveAttendanceForEvent(
    eventId: string,
    overrides: AttendanceOverrides
  ) {
    await saveAttendanceForEventGlobal(eventId, todayEvents, allCadets, overrides);
  }

  async function clearAttendanceForEvent(eventId: string) {
    await clearAttendanceForEventGlobal(eventId, todayEvents);
  }

  const onSubmitAttendance = async () => {
    if (!selectedEventId) {
      Alert.alert("Select an event", "Please choose today's event first.");
      return;
    }

    try {
      console.log("Saving attendance with overrides:", attendanceOverrides);
      setSavingAttendance(true);
      await saveAttendanceForEvent(selectedEventId, attendanceOverrides);
      setAttendanceModalVisible(false);
      Alert.alert("Success", "Attendance was saved.");
    } catch (e: any) {
      console.error(" Error saving attendance:", e);
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
      onSubmitAttendance,
      submitAttendance: onSubmitAttendance,
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
    ]
  );
}
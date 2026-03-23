// Jobs.tsx
import React, { useMemo, useState } from "react";

import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { jobStyles as styles } from "../../../styles/JobStyles";
import { ScreenLayout } from "../../Components/ScreenLayout";

import {
  useJobsLogic,
  JobsAction,
  AttendanceStatus,
} from "./JobsLogic";

type NavAny = ReturnType<typeof useNavigation<any>>;

function iconForAction(id: JobsAction["id"]) {
  switch (id) {
    case "attendance":
      return "checkbox-outline";
    case "files":
      return "cloud-upload-outline";
    case "create_accounts":
      return "person-add-outline";
    case "event_making":
      return "calendar-outline";
    default:
      return "briefcase-outline";
  }
}

export function Jobs(): React.ReactElement {
  const navigation: NavAny = useNavigation();

  const {
    cadetKey,
    profile,
    loading,
    error,
    permissionNames,
    actions,
    todayEvents,
    allCadets,
    loadingAttendanceTools,
    loadAttendanceModalData,
    saveAttendanceForEvent,
    clearAttendanceForEvent,
  } = useJobsLogic();

  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [clearingAttendance, setClearingAttendance] = useState(false);
 const [attendanceOverrides, setAttendanceOverrides] = useState<Record<string, AttendanceStatus>>({});

  const fullName =
    profile?.firstName || profile?.lastName
      ? `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()
      : "Cadet";

  const jobText = profile?.job ?? "—";

  const permissionText =
    permissionNames.length > 0 ? permissionNames.join(", ") : "None";

  const selectedEvent = useMemo(
    () => todayEvents.find((event) => event.id === selectedEventId),
    [todayEvents, selectedEventId]
  );

  const markedAbsentCount = useMemo(
    () =>
      Object.values(attendanceOverrides).filter((s) => s === "A").length,
    [attendanceOverrides]
  );

  const markedLateCount = useMemo(
    () =>
      Object.values(attendanceOverrides).filter((s) => s === "L").length,
    [attendanceOverrides]
  );

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

  const setCadetStatus = (cadetKeyToUpdate: string, status: AttendanceStatus) => {
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

  const onClearAttendance = () => {
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
              Alert.alert("Could not clear attendance", e?.message ?? "Unknown error.");
            } finally {
              setClearingAttendance(false);
            }
          },
        },
      ]
    );
  };

  const onPressAction = async (a: JobsAction) => {
    if (!a.allowed) return;

    if (a.id === "attendance") {
      await openAttendanceModal();
      return;
    }

    if (a.id === "create_accounts") {
      Alert.alert("Coming soon", "Account creation will be added later.");
      return;
    }

    if (!a.routeHint) return;
    navigation.navigate(a.routeHint);
  };

  const anyVisibleActions = actions.length > 0;

  return (
    <ScreenLayout title="Jobs">
      <View style={styles.body_container}>
        <ScrollView
          style={styles.body_container}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* USER INFO CARD */}
          <View style={styles.userinfo_card}>
            <View style={styles.avatar_container}>
              <Ionicons name="briefcase" size={26} color="white" />
            </View>

            <View style={styles.userinfo_text_container}>
              {loading ? (
                <View style={styles.loadingBlock}>
                  <ActivityIndicator />
                  <Text style={styles.userinfo_sub}>Loading jobs…</Text>
                </View>
              ) : error ? (
                <>
                  <Text style={styles.userinfo_sub}>{error}</Text>
                  {cadetKey ? (
                    <Text style={styles.userinfo_sub}>
                      <Text style={styles.label_bold}>Key: </Text>
                      {cadetKey}
                    </Text>
                  ) : null}
                </>
              ) : (
                <>
                  <Text style={styles.userinfo_name}>{fullName}</Text>
                  <Text style={styles.userinfo_sub}>
                    <Text style={styles.label_bold}>Job: </Text>
                    {jobText}
                  </Text>
                  <Text style={styles.userinfo_sub}>
                    <Text style={styles.label_bold}>Permissions: </Text>
                    {permissionText}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* ACTION CARDS */}
          {!loading && !error && anyVisibleActions ? (
            <>
              <Text style={styles.sectionTitle}>Actions</Text>
              {actions.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => onPressAction(a)}
                  style={styles.action_card}
                >
                  <View style={styles.action_left}>
                    <View style={styles.action_icon_circle}>
                      <Ionicons
                        name={iconForAction(a.id) as any}
                        size={22}
                        color="white"
                      />
                    </View>
                    <View style={styles.flexOne}>
                      <Text style={styles.action_title}>{a.title}</Text>
                      <Text style={styles.action_subtitle}>{a.subtitle}</Text>
                    </View>
                  </View>
                  <View style={styles.action_right}>
                    <Ionicons name="chevron-forward" size={22} color="white" />
                  </View>
                </Pressable>
              ))}
            </>
          ) : null}
        </ScrollView>
      </View>

      {/* ATTENDANCE MODAL */}
      <Modal
        visible={attendanceModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAttendanceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            {/* HEADER */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Take Attendance</Text>
              <Pressable onPress={() => setAttendanceModalVisible(false)}>
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
            </View>

            {loadingAttendanceTools ? (
              <View style={styles.modalLoadingBlock}>
                <ActivityIndicator />
                <Text style={styles.modalLoadingText}>
                  Loading today's events and cadets…
                </Text>
              </View>
            ) : (
              <>
                <ScrollView showsVerticalScrollIndicator={false}>

                  {/* EVENT DROPDOWN */}
                  <Text style={styles.fieldLabel}>Select Event</Text>
                  <Pressable
                    onPress={() => setEventDropdownOpen((prev) => !prev)}
                    style={styles.dropdownButton}
                  >
                    <Text style={styles.dropdownButtonText}>
                      {selectedEvent
                        ? `${selectedEvent.eventName} (${selectedEvent.time ?? "No time"})`
                        : "Choose today's event"}
                    </Text>
                  </Pressable>

                  {eventDropdownOpen ? (
                    <View style={styles.dropdownMenu}>
                      {todayEvents.length === 0 ? (
                        <Text style={styles.dropdownEmptyText}>
                          No events found for today.
                        </Text>
                      ) : (
                        todayEvents.map((event) => (
                          <Pressable
                            key={event.id}
                            onPress={() => {
                              setSelectedEventId(event.id);
                              setEventDropdownOpen(false);
                            }}
                            style={styles.dropdownItem}
                          >
                            <Text style={styles.dropdownItemTitle}>
                              {event.eventName}
                            </Text>
                            <Text style={styles.dropdownItemSubtitle}>
                              {event.time ?? "No time"} •{" "}
                              {event.locationId ?? "No location"}
                            </Text>
                          </Pressable>
                        ))
                      )}
                    </View>
                  ) : null}

                  {/* SUMMARY */}
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Quick Summary</Text>
                    <Text style={styles.summaryText}>
                      Everyone is Present by default.
                    </Text>
                    <Text style={styles.summaryTextSmallGap}>
                      Absent marked: {markedAbsentCount}
                    </Text>
                    <Text style={styles.summaryTextSmallGap}>
                      Late marked: {markedLateCount}
                    </Text>
                  </View>

                  {/* CADET LIST */}
                  <Text style={styles.fieldLabel}>Cadets</Text>
                  <View style={styles.cadetListCard}>
                    {allCadets.map((cadet, index) => {
                      const status = getCadetStatus(cadet.cadetKey);
                      return (
                        <View
                          key={cadet.cadetKey}
                          style={[
                            styles.cadetRow,
                            index === allCadets.length - 1
                              ? { borderBottomWidth: 0 }
                              : null,
                          ]}
                        >
                          <Text style={styles.cadetName}>{cadet.fullName}</Text>
                          <View style={styles.statusRow}>
                            <Pressable
                              onPress={() => setCadetStatus(cadet.cadetKey, "P")}
                              style={[
                                styles.statusButton,
                                status === "P" && styles.presentButtonActive,
                              ]}
                            >
                              <Text style={styles.statusButtonText}>Present</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => setCadetStatus(cadet.cadetKey, "A")}
                              style={[
                                styles.statusButton,
                                status === "A" && styles.absentButtonActive,
                              ]}
                            >
                              <Text style={styles.statusButtonText}>Absent</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => setCadetStatus(cadet.cadetKey, "L")}
                              style={[
                                styles.statusButton,
                                status === "L" && styles.lateButtonActive,
                              ]}
                            >
                              <Text style={styles.statusButtonText}>Late</Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* FOOTER BUTTONS */}
                <View style={styles.footerButtons}>
                  <Pressable
                    onPress={() => setAttendanceModalVisible(false)}
                    disabled={savingAttendance || clearingAttendance}
                    style={[
                      styles.footerButton,
                      (savingAttendance || clearingAttendance) &&
                        styles.footerButtonDisabled,
                    ]}
                  >
                    <Text style={styles.statusButtonText}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    onPress={onClearAttendance}
                    disabled={clearingAttendance || savingAttendance}
                    style={[
                      styles.footerButton,
                      (clearingAttendance || savingAttendance) &&
                        styles.footerButtonDisabled,
                    ]}
                  >
                    {clearingAttendance ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.statusButtonText}>Clear Attendance</Text>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={submitAttendance}
                    disabled={savingAttendance || clearingAttendance}
                    style={[
                      styles.footerButton,
                      (savingAttendance || clearingAttendance) &&
                        styles.footerButtonDisabled,
                    ]}
                  >
                    {savingAttendance ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.statusButtonText}>Save Attendance</Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}
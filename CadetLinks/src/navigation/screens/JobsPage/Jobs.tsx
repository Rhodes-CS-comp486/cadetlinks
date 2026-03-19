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

  // only stores cadets who are NOT present
  const [attendanceOverrides, setAttendanceOverrides] = useState<
    Record<string, AttendanceStatus>
  >({});

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

  const setCadetStatus = (
    cadetKeyToUpdate: string,
    status: AttendanceStatus
  ) => {
    setAttendanceOverrides((prev) => {
      const next = { ...prev };

      // Present is default, so remove override
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
    <ScreenLayout>
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
                <View style={{ marginTop: 4 }}>
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

          {/* ACTIONS */}
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

                    <View style={{ flex: 1 }}>
                      <Text style={styles.action_title}>{a.title}</Text>
                      <Text style={styles.action_subtitle}>{a.subtitle}</Text>
                    </View>
                  </View>

                  <View style={styles.action_right}>
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color="white"
                    />
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
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "center",
            padding: 18,
          }}
        >
          <View
            style={{
              backgroundColor: "#1E2430",
              borderRadius: 18,
              padding: 18,
              maxHeight: "90%",
              borderWidth: 1,
              borderColor: "#31394A",
            }}
          >
            {/* HEADER */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 20,
                  fontWeight: "700",
                }}
              >
                Take Attendance
              </Text>

              <Pressable onPress={() => setAttendanceModalVisible(false)}>
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
            </View>

            {loadingAttendanceTools ? (
              <View style={{ paddingVertical: 24 }}>
                <ActivityIndicator />
                <Text
                  style={{
                    color: "#C9D1D9",
                    textAlign: "center",
                    marginTop: 10,
                  }}
                >
                  Loading today's events and cadets…
                </Text>
              </View>
            ) : (
              <>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* EVENT DROPDOWN */}
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "700",
                      marginBottom: 8,
                      marginTop: 4,
                    }}
                  >
                    Select Event
                  </Text>

                  <Pressable
                    onPress={() => setEventDropdownOpen((prev) => !prev)}
                    style={{
                      backgroundColor: "#2A3140",
                      borderRadius: 12,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: "#3A4357",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: "white" }}>
                      {selectedEvent
                        ? `${selectedEvent.eventName} (${selectedEvent.time ?? "No time"})`
                        : "Choose today's event"}
                    </Text>
                  </Pressable>

                  {eventDropdownOpen ? (
                    <View
                      style={{
                        backgroundColor: "#151A22",
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "#3A4357",
                        marginBottom: 16,
                        overflow: "hidden",
                      }}
                    >
                      {todayEvents.length === 0 ? (
                        <Text style={{ color: "#C9D1D9", padding: 14 }}>
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
                            style={{
                              padding: 14,
                              borderBottomWidth: 1,
                              borderBottomColor: "#2A3140",
                            }}
                          >
                            <Text style={{ color: "white", fontWeight: "600" }}>
                              {event.eventName}
                            </Text>
                            <Text style={{ color: "#B9C2CF", marginTop: 2 }}>
                              {event.time ?? "No time"} •{" "}
                              {event.locationId ?? "No location"}
                            </Text>
                          </Pressable>
                        ))
                      )}
                    </View>
                  ) : null}

                  {/* SUMMARY */}
                  <View
                    style={{
                      backgroundColor: "#151A22",
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 14,
                      borderWidth: 1,
                      borderColor: "#31394A",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "700" }}>
                      Quick Summary
                    </Text>
                    <Text style={{ color: "#C9D1D9", marginTop: 4 }}>
                      Everyone is Present by default.
                    </Text>
                    <Text style={{ color: "#C9D1D9", marginTop: 2 }}>
                      Absent marked: {markedAbsentCount}
                    </Text>
                    <Text style={{ color: "#C9D1D9", marginTop: 2 }}>
                      Late marked: {markedLateCount}
                    </Text>
                  </View>

                  {/* CADET LIST */}
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "700",
                      marginBottom: 10,
                    }}
                  >
                    Cadets
                  </Text>

                  <View
                    style={{
                      backgroundColor: "#151A22",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#31394A",
                      overflow: "hidden",
                      marginBottom: 16,
                    }}
                  >
                    {allCadets.map((cadet, index) => {
                      const status = getCadetStatus(cadet.cadetKey);

                      return (
                        <View
                          key={cadet.cadetKey}
                          style={{
                            padding: 12,
                            borderBottomWidth:
                              index === allCadets.length - 1 ? 0 : 1,
                            borderBottomColor: "#2A3140",
                          }}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontWeight: "600",
                              marginBottom: 10,
                            }}
                          >
                            {cadet.fullName}
                          </Text>

                          <View
                            style={{
                              flexDirection: "row",
                              gap: 8,
                            }}
                          >
                            <Pressable
                              onPress={() => setCadetStatus(cadet.cadetKey, "P")}
                              style={{
                                flex: 1,
                                backgroundColor:
                                  status === "P" ? "#2E7D32" : "#2A3140",
                                paddingVertical: 10,
                                borderRadius: 10,
                                alignItems: "center",
                              }}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  fontWeight: "700",
                                }}
                              >
                                Present
                              </Text>
                            </Pressable>

                            <Pressable
                              onPress={() => setCadetStatus(cadet.cadetKey, "A")}
                              style={{
                                flex: 1,
                                backgroundColor:
                                  status === "A" ? "#A63D40" : "#2A3140",
                                paddingVertical: 10,
                                borderRadius: 10,
                                alignItems: "center",
                              }}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  fontWeight: "700",
                                }}
                              >
                                Absent
                              </Text>
                            </Pressable>

                            <Pressable
                              onPress={() => setCadetStatus(cadet.cadetKey, "L")}
                              style={{
                                flex: 1,
                                backgroundColor:
                                  status === "L" ? "#C78B2A" : "#2A3140",
                                paddingVertical: 10,
                                borderRadius: 10,
                                alignItems: "center",
                              }}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  fontWeight: "700",
                                }}
                              >
                                Late
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* FOOTER BUTTONS */}
                                {/* FOOTER BUTTONS */}
                <View
                  style={{
                    marginTop: 10,
                    gap: 10,
                  }}
                >
                  <Pressable
                    onPress={() => setAttendanceModalVisible(false)}
                    disabled={savingAttendance || clearingAttendance}
                    style={{
                      backgroundColor: "#2A3140",
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#3A4357",
                      opacity: savingAttendance || clearingAttendance ? 0.7 : 1,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "700" }}>
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={onClearAttendance}
                    disabled={clearingAttendance || savingAttendance}
                    style={{
                      backgroundColor: "#2A3140",
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#3A4357",
                      opacity: clearingAttendance || savingAttendance ? 0.7 : 1,
                    }}
                  >
                    {clearingAttendance ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={{ color: "white", fontWeight: "700" }}>
                        Clear Attendance
                      </Text>
                    )}
                  </Pressable>

                  <Pressable
                    onPress={submitAttendance}
                    disabled={savingAttendance || clearingAttendance}
                    style={{
                      backgroundColor: "#2A3140",
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: "#3A4357",
                      opacity: savingAttendance || clearingAttendance ? 0.7 : 1,
                    }}
                  >
                    {savingAttendance ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={{ color: "white", fontWeight: "700" }}>
                        Save Attendance
                      </Text>
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
import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { jobStyles as styles } from "../../../../styles/JobStyles";
import { AttendanceModalProps } from "../../../../assets/types";

export function AttendanceModal({
  visible,
  onRequestClose,
  loadingAttendanceTools,
  selectedEvent,
  eventDropdownOpen,
  onToggleEventDropdown,
  todayEvents,
  onSelectEvent,
  markedAbsentCount,
  markedLateCount,
  onToggleFlightDropdown,
  selectedFlight,
  flightDropdownOpen,
  onSelectFlight,
  allCadets,
  getCadetStatus,
  setCadetStatus,
  savingAttendance,
  onSubmitAttendance,
}: AttendanceModalProps): React.ReactElement {
  const filteredCadets = selectedFlight
    ? allCadets.filter((cadet) => cadet.flight === selectedFlight)
    : allCadets;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onRequestClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Take Attendance</Text>

            <Pressable onPress={onRequestClose}>
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
                <Text style={styles.fieldLabel}>Select Event</Text>

                <Pressable
                  onPress={onToggleEventDropdown}
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
                          onPress={() => onSelectEvent(event.id)}
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

                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>Quick Summary</Text>
                  <Text style={styles.summaryText}>
                    Everyone is Absent by default.
                  </Text>
                  <Text style={styles.summaryTextSmallGap}>
                    Absent marked: {markedAbsentCount}
                  </Text>
                  <Text style={styles.summaryTextSmallGap}>
                    Late marked: {markedLateCount}
                  </Text>
                </View>

                <Text style={styles.fieldLabel}>Filter by Flight</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.flightFilterRow}
                  style={{ marginBottom: 12 }}
                >
                  <Pressable
                    style={[
                      styles.flightChip,
                      selectedFlight === "All" && styles.flightChipActive,
                    ]}
                    onPress={() => onSelectFlight("All")}
                  >
                    <Text
                      style={[
                        styles.flightChipText,
                        selectedFlight === "All" && styles.flightChipTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </Pressable>

                  {(["POC", "Alpha", "Bravo"] as const).map((flightName) => {
                    const isActive = selectedFlight === flightName;

                    return (
                      <Pressable
                        key={flightName}
                        style={[
                          styles.flightChip,
                          isActive && styles.flightChipActive,
                        ]}
                        onPress={() => onSelectFlight(isActive ? "All" : flightName)}
                      >
                        <Text
                          style={[
                            styles.flightChipText,
                            isActive && styles.flightChipTextActive,
                          ]}
                        >
                          {flightName}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <Text style={styles.fieldLabel}>Cadets</Text>
                <View style={styles.cadetListCard}>
                  {filteredCadets.map((cadet, index) => {
                    const status = getCadetStatus(cadet.cadetKey);

                    return (
                      <View
                        key={cadet.cadetKey}
                        style={[
                          styles.cadetRow,
                          index === filteredCadets.length - 1
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

              <View style={styles.footerButtons}>
                <Pressable
                  onPress={onSubmitAttendance}
                  disabled={savingAttendance}
                  style={[
                    styles.footerButton,
                    savingAttendance && styles.footerButtonDisabled,
                  ]}
                >
                  {savingAttendance ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.statusButtonText}>
                      Confirm Attendance
                    </Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
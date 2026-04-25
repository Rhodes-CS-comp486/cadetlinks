import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { generalStyles as g } from "../../../../styles/GeneralStyles";
import { AttendanceCadetItem } from "../../../../firebase/dbController";
import { PTScoreModalProps } from "../../../../assets/types";



export function PTScoreModal({
  visible,
  onRequestClose,
  loading,
  allCadets,
  scores,
  onScoreChange,
  selectedFlight,
  flightDropdownOpen,
  onToggleFlightDropdown,
  onSelectFlight,
  saving,
  onSubmit,
}: PTScoreModalProps): React.ReactElement {
  const filteredCadets = selectedFlight
    ? allCadets.filter((c) => c.flight === selectedFlight)
    : allCadets;

  const filledCount = filteredCadets.filter(
    (c) => (scores[c.cadetKey] ?? "").trim() !== ""
  ).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onRequestClose}
    >
      <View style={g.modalOverlay}>
        <View style={g.modalContent}>

          {/* Header */}
          <View style={s.headerRow}>
            <Text style={g.modalTitle}>Update PT Scores</Text>
            <Pressable onPress={onRequestClose} style={g.closeButton}>
              <Ionicons name="close" size={24} color="white" />
            </Pressable>
          </View>

          {loading ? (
            <View style={s.loadingBlock}>
              <ActivityIndicator />
              <Text style={g.modalText}>Loading cadets…</Text>
            </View>
          ) : (
            <>
              <ScrollView showsVerticalScrollIndicator={false}>

                {/* Summary card */}
                <View style={g.userinfo_card}>
                  <View style={g.avatar_container}>
                    <Ionicons name="fitness-outline" size={26} color="white" />
                  </View>
                  <View style={g.userinfo_text_container}>
                    <Text style={g.userinfo_name}>Quick Summary</Text>
                    <Text style={g.userinfo_sub}>
                      Scores entered: {filledCount} / {filteredCadets.length}
                    </Text>
                    <Text style={g.userinfo_sub}>
                      Saves to each cadet's profile as Latest PT Score.
                    </Text>
                  </View>
                </View>

                {/* Flight filter row */}
                <View style={s.flightRow}>
                  <Text style={g.sectionTitle}>Cadets</Text>
                  <Text style={[g.modalLabel, s.flightLabel]}>Flight:</Text>
                  <Pressable
                    onPress={onToggleFlightDropdown}
                    style={[g.dropDownBox, s.flightDropdown]}
                  >
                    <Text style={g.text}>{selectedFlight ?? "All"}</Text>
                    <Ionicons name="chevron-down" size={16} color="white" />
                  </Pressable>
                </View>

                {flightDropdownOpen && (
                  <View style={[g.dropdownMenu, s.flightDropdownMenu]}>
                    {(["All", "POC", "Alpha", "Bravo"] as const).map((f) => (
                      <Pressable
                        key={f}
                        onPress={() => onSelectFlight(f)}
                        style={g.dropdownItem}
                      >
                        <Text style={g.dropdownItemText}>{f}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Cadet rows */}
                <View style={s.cadetListCard}>
                  {filteredCadets.map((cadet, index) => (
                    <View
                      key={cadet.cadetKey}
                      style={[
                        s.cadetRow,
                        index === filteredCadets.length - 1
                          ? { borderBottomWidth: 0 }
                          : null,
                      ]}
                    >
                      <Text style={[g.text, s.cadetName]}>{cadet.fullName}</Text>
                      <TextInput
                        style={[g.inputUser, s.scoreInput]}
                        placeholder="00.0"
                        placeholderTextColor="#888"
                        keyboardType="decimal-pad"
                        value={scores[cadet.cadetKey] ?? ""}
                        onChangeText={(v) => {
                          // Allow only digits and a single decimal point, max 4 chars (00.0)
                          const cleaned = v.replace(/[^0-9.]/g, "");
                          const parts = cleaned.split(".");
                          // At most one decimal point, max 1 digit after decimal
                          let formatted = cleaned;
                          if (parts.length > 2) {
                            formatted = parts[0] + "." + parts.slice(1).join("");
                          }
                          if (parts[1] !== undefined && parts[1].length > 1) {
                            formatted = parts[0] + "." + parts[1].slice(0, 1);
                          }
                          onScoreChange(cadet.cadetKey, formatted);
                        }}
                        maxLength={5}
                      />
                    </View>
                  ))}
                </View>
              </ScrollView>

              {/* Footer */}
              <Pressable
                onPress={onSubmit}
                disabled={saving}
                style={[g.confirmButton, saving && s.buttonDisabled]}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={g.text}>Save PT Scores</Text>
                )}
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loadingBlock: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },
  flightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    position: "relative",
  },
  flightLabel: {
    marginLeft: 16,
    marginTop: 0,
    marginBottom: 0,
  },
  flightDropdown: {
    flex: 1,
    marginLeft: 8,
    marginBottom: 0,
  },
  flightDropdownMenu: {
    top: 44,
    right: 0,
    zIndex: 100,
  },
  cadetListCard: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cadetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  cadetName: {
    flex: 1,
    marginRight: 10,
  },
  scoreInput: {
    width: 80,
    textAlign: "center",
    marginBottom: 0,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
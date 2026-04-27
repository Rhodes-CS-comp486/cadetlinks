import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { generalStyles as g } from "../../../../styles/GeneralStyles";
import { ptScoreStyles as s } from "../../../../styles/PTScoreStyles";
import { AttendanceCadetItem } from "../../../../firebase/dbController";
import { PTScoreModalProps, PTScoreEntry } from "../../../../assets/types";

// ─── PT Score History Modal ───────────────────────────────────────────────────

interface PTScoreHistoryModalProps {
  visible: boolean;
  cadetName: string;
  scores: PTScoreEntry[];
  onClose: () => void;
}

function PTScoreHistoryModal({
  visible,
  cadetName,
  scores,
  onClose,
}: PTScoreHistoryModalProps): React.ReactElement {
  // Sort descending by date so the most recent entry appears first.
  const sorted = [...scores].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.historyModalOverlay}>
        <View style={s.historyModalContent}>
          {/* Header */}
          <View style={s.headerRow}>
            <View>
              <Text style={s.historyTitle}>PT Score History</Text>
              <Text style={s.historySubtitle}>{cadetName}</Text>
            </View>
            <Pressable onPress={onClose} style={g.closeButton}>
              <Ionicons name="close" size={22} color="white" />
            </Pressable>
          </View>

          {sorted.length === 0 ? (
            <Text style={s.historyEmptyText}>No PT scores recorded yet.</Text>
          ) : (
            <FlatList
              data={sorted}
              keyExtractor={(item) => item.recordedAt}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <View style={s.historyEntryRow}>
                  <Text style={s.historyDate}>{formatDate(item.recordedAt)}</Text>
                  <View style={s.historyScoreRow}>
                    <Text style={s.historyScore}>{item.score.toFixed(1)}</Text>
                    {index === 0 && (
                      <View style={s.historyLatestBadge}>
                        <Text style={s.historyLatestBadgeText}>Latest</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Main PT Score Modal ──────────────────────────────────────────────────────

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
  ptScoresByCadet,
}: PTScoreModalProps): React.ReactElement {
  const [historyTarget, setHistoryTarget] = useState<{
    cadetKey: string;
    fullName: string;
  } | null>(null);

  const filteredCadets = selectedFlight
    ? allCadets.filter((c) => c.flight === selectedFlight)
    : allCadets;

  const filledCount = filteredCadets.filter(
    (c) => (scores[c.cadetKey] ?? "").trim() !== ""
  ).length;

  // History entries for the currently selected cadet.
  const historyEntries: PTScoreEntry[] = historyTarget
    ? Object.values(ptScoresByCadet?.[historyTarget.cadetKey] ?? {})
    : [];

  return (
    <>
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
                        Saves to each cadet's PT Score history file.
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

                        {/* History button — opens the per-cadet score file */}
                        <Pressable
                          style={s.historyButton}
                          onPress={() =>
                            setHistoryTarget({
                              cadetKey: cadet.cadetKey,
                              fullName: cadet.fullName,
                            })
                          }
                        >
                          <Ionicons name="time-outline" size={18} color="white" />
                        </Pressable>

                        <TextInput
                          style={[g.inputUser, s.scoreInput]}
                          placeholder="00.0"
                          placeholderTextColor="#888"
                          keyboardType="decimal-pad"
                          value={scores[cadet.cadetKey] ?? ""}
                          onChangeText={(v) => {
                            // Allow only digits and a single decimal point, max 5 chars (100.0)
                            const cleaned = v.replace(/[^0-9.]/g, "");
                            const parts = cleaned.split(".");
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

      {/* Per-cadet PT Score history file modal */}
      {historyTarget && (
        <PTScoreHistoryModal
          visible={!!historyTarget}
          cadetName={historyTarget.fullName}
          scores={historyEntries}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </>
  );
}
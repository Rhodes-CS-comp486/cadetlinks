import { useState, useCallback } from "react";
import { Alert } from "react-native";
import {
  loadAttendanceToolsData,
  savePTScores,
} from "../../../firebase/dbController";
import { globals } from "../../../firebase/dbController";
import type { AttendanceCadetItem } from "../../../firebase/dbController";

export function usePTScoreLogic() {
  const { ptScores: ptScoresByCadet } = globals();

  const [modalVisible, setModalVisible]             = useState(false);
  const [allCadets, setAllCadets]                   = useState<AttendanceCadetItem[]>([]);
  const [loading, setLoading]                       = useState(false);
  const [scores, setScores]                         = useState<Record<string, string>>({});
  const [selectedFlight, setSelectedFlight]         = useState<string | null>(null);
  const [flightDropdownOpen, setFlightDropdownOpen] = useState(false);
  const [saving, setSaving]                         = useState(false);

  // ── Open ──────────────────────────────────────────────────────────────────

  const openModal = useCallback(async () => {
    setModalVisible(true);
    setLoading(true);
    setScores({});
    setSelectedFlight(null);
    setFlightDropdownOpen(false);

    try {
      const { cadets } = await loadAttendanceToolsData();
      setAllCadets(cadets);
    } catch (err) {
      console.error("PTScoreLogic: failed to load cadets", err);
      Alert.alert("Error", "Could not load cadets. Please try again.");
      setModalVisible(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Close ─────────────────────────────────────────────────────────────────

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setScores({});
    setSelectedFlight(null);
    setFlightDropdownOpen(false);
  }, []);

  // ── Score input ───────────────────────────────────────────────────────────

  const onScoreChange = useCallback((cadetKey: string, value: string) => {
    setScores((prev) => ({ ...prev, [cadetKey]: value }));
  }, []);

  // ── Flight filter ─────────────────────────────────────────────────────────

  const toggleFlightDropdown = useCallback(() => {
    setFlightDropdownOpen((prev) => !prev);
  }, []);

  const selectFlight = useCallback((flight: string) => {
    setSelectedFlight(flight === "All" ? null : flight);
    setFlightDropdownOpen(false);
  }, []);

  // ── Validate format ───────────────────────────────────────────────────────

  /**
   * Validates that a score string is a valid number between 0–100.
   * Accepts whole numbers (e.g. "85") and decimals (e.g. "85.5").
   * Returns the parsed float or null if invalid.
   */
  const parseScore = (raw: string): number | null => {
    const trimmed = raw.trim();
    if (trimmed === "") return null;
    const numeric = parseFloat(trimmed);
    if (isNaN(numeric) || numeric < 0 || numeric > 100) return null;
    return numeric;
  };

  // ── Submit ────────────────────────────────────────────────────────────────

  const submit = useCallback(async () => {
    // Build valid entries only — skip blanks, flag invalid values.
    const validEntries: Array<{ cadetKey: string; score: number }> = [];
    const invalidNames: string[] = [];

    for (const cadet of allCadets) {
      const raw = scores[cadet.cadetKey] ?? "";
      if (raw.trim() === "") continue; // blank = skip, not an error

      const score = parseScore(raw);
      if (score === null) {
        invalidNames.push(cadet.fullName);
      } else {
        validEntries.push({ cadetKey: cadet.cadetKey, score });
      }
    }

    if (invalidNames.length > 0) {
      Alert.alert(
        "Invalid Scores",
        `The following cadets have invalid scores (must be 0–100):\n\n${invalidNames.join(", ")}\n\nPlease correct them before saving.`
      );
      return;
    }

    if (validEntries.length === 0) {
      Alert.alert("No Scores", "Please enter at least one score before saving.");
      return;
    }

    Alert.alert(
      "Confirm Save",
      `Save PT scores for ${validEntries.length} cadet(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async () => {
            setSaving(true);
            try {
              // Delegate all Firebase writes to dbController.savePTScores.
              // That function appends a timestamped entry under
              //   cadets/{cadetKey}/ptScores/{timestamp}
              // AND updates cadets/{cadetKey}/lastPTScore for quick display.
              await savePTScores(validEntries);

              Alert.alert(
                "Success",
                `PT scores saved for ${validEntries.length} cadet(s).`
              );
              closeModal();
            } catch (err) {
              console.error("PTScoreLogic: save failed", err);
              Alert.alert("Error", "Failed to save scores. Please try again.");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  }, [allCadets, scores, closeModal]);

  return {
    modalVisible,
    openModal,
    closeModal,
    allCadets,
    loading,
    scores,
    onScoreChange,
    selectedFlight,
    flightDropdownOpen,
    toggleFlightDropdown,
    selectFlight,
    saving,
    submit,
    /** Pass-through so the modal can render per-cadet score history. */
    ptScoresByCadet,
  };
}
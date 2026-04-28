import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { loadAttendanceToolsData, savePTScores } from "../../../firebase/dbController";
import type { AttendanceCadetItem } from "../../../firebase/dbController";

export function usePTScoreLogic() {
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
      console.log("PTScoreLogic: loaded", cadets.length, "cadets");
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

  // ── Submit ────────────────────────────────────────────────────────────────

  const submit = useCallback(async () => {
    const invalidNames: string[] = [];
    const validEntries: Array<{ cadetKey: string; score: number }> = [];

    for (const cadet of allCadets) {
      const raw = (scores[cadet.cadetKey] ?? "").trim();
      if (raw === "") continue;

      const numeric = parseFloat(raw);
      if (isNaN(numeric) || numeric < 0 || numeric > 100) {
        invalidNames.push(cadet.fullName);
      } else {
        validEntries.push({ cadetKey: cadet.cadetKey, score: numeric });
      }
    }

    if (invalidNames.length > 0) {
      Alert.alert(
        "Invalid Scores",
        `These cadets have invalid scores (must be 0–100):\n\n${invalidNames.join(", ")}\n\nPlease correct them before saving.`
      );
      return;
    }

    if (validEntries.length === 0) {
      Alert.alert("No Scores", "Please enter at least one score before saving.");
      return;
    }

    // Save directly without a nested confirmation Alert — nested Alerts inside
    // Modals can be swallowed on some React Native / Expo versions.
    setSaving(true);
    try {
      console.log("PTScoreLogic: calling savePTScores with", validEntries.length, "entries");
      await savePTScores(validEntries);
      console.log("PTScoreLogic: save succeeded");
      closeModal();
      // Show success after modal is closed so it is not blocked by the overlay
      setTimeout(() => {
        Alert.alert("Success", `PT scores saved for ${validEntries.length} cadet(s).`);
      }, 300);
    } catch (err) {
      console.error("PTScoreLogic: savePTScores threw:", err);
      Alert.alert("Error", "Failed to save scores. Please try again.");
    } finally {
      setSaving(false);
    }
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
  };
}
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CreateAccountForm } from "../CreateAccountLogic";
import { PERMISSIONS } from "../../../../assets/constants";
import { actionStyles as styles } from "../../../../styles/ActionStyles";

const ALL_PERMISSIONS = [
  PERMISSIONS.ATTENDANCE_EDITING,
  PERMISSIONS.FILE_UPLOADING,
  PERMISSIONS.EVENT_MAKING,
  PERMISSIONS.ADMIN,
];

const YEARS   = ["100", "150", "200", "250"];
const FLIGHTS = ["Alpha", "Bravo", "POC"];
const RANKS   = [
  "CWCD", "CYBERGMCA", "ILLABCC", "PFO", "PFOA",
  "ALLABCC", "ALPHABCLFITCC", "BRAVOBCFITCC",
  "RECRUITING", "ACAD", "MXSUPPLY", "CSO", "SPECPROJECTS", "HG",
];

interface Props {
  visible: boolean;
  onClose: () => void;
  form: CreateAccountForm;
  updateField: <K extends keyof CreateAccountForm>(k: K, v: CreateAccountForm[K]) => void;
  updatePhone: (raw: string) => void;
  saving: boolean;
  onSubmit: () => void;
}

// ── Reusable inline dropdown ──────────────────────────────────────────────────
function DropdownPicker({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: string[];
  value: string;
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={styles.fieldLabel}>{label}</Text>

      {/* Trigger button */}
      <Pressable
        style={[styles.dropdownButton, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}
        onPress={() => setOpen((o) => !o)}
      >
        <Text style={{ color: value ? "white" : "#9AA3B2", fontSize: 14 }}>
          {value || `Select ${label}`}
        </Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color="#9AA3B2" />
      </Pressable>

      {/* Options list */}
      {open && (
        <View style={styles.dropdownMenu}>
          {options.map((opt, index) => (
            <Pressable
              key={opt}
              style={[
                styles.dropdownItem,
                value === opt && { backgroundColor: "#1E3A5F" },
                index === options.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              <Text style={[styles.dropdownItemTitle, value === opt && { color: "#6B9FFF" }]}>
                {opt}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export function CreateAccountModal({
  visible, onClose, form, updateField, updatePhone, saving, onSubmit,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Account</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="#9AA3B2" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {/* Last Name */}
            <Text style={styles.fieldLabel}>Last Name</Text>
            <TextInput
              style={styles.dropdownButton}
              placeholder="Smith"
              placeholderTextColor="#9AA3B2"
              value={form.lastName}
              onChangeText={(v) => updateField("lastName", v)}
            />

            {/* First Name */}
            <Text style={styles.fieldLabel}>First Name</Text>
            <TextInput
              style={styles.dropdownButton}
              placeholder="John"
              placeholderTextColor="#9AA3B2"
              value={form.firstName}
              onChangeText={(v) => updateField("firstName", v)}
            />

            {/* Class Year dropdown */}
            <DropdownPicker
              label="Class Year"
              options={YEARS}
              value={form.classYear}
              onSelect={(v) => updateField("classYear", v)}
            />

            {/* Flight dropdown */}
            <DropdownPicker
              label="Flight"
              options={FLIGHTS}
              value={form.flight}
              onSelect={(v) => updateField("flight", v)}
            />

            {/* Cell Phone */}
            <Text style={styles.fieldLabel}>Cell Phone</Text>
            <TextInput
              style={styles.dropdownButton}
              placeholder="(555) 000-0000"
              placeholderTextColor="#9AA3B2"
              keyboardType="phone-pad"
              value={form.cellPhone}
              onChangeText={updatePhone}
            />

            {/* School Email */}
            <Text style={styles.fieldLabel}>School Email</Text>
            <TextInput
              style={styles.dropdownButton}
              placeholder="jsmith@university.edu"
              placeholderTextColor="#9AA3B2"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.schoolEmail}
              onChangeText={(v) => updateField("schoolEmail", v)}
            />

            {/* Personal Email */}
            <Text style={styles.fieldLabel}>Personal Email</Text>
            <TextInput
              style={styles.dropdownButton}
              placeholder="jsmith@gmail.com"
              placeholderTextColor="#9AA3B2"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.personalEmail}
              onChangeText={(v) => updateField("personalEmail", v)}
            />

            {/* Password */}
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              style={styles.dropdownButton}
              placeholder="Min. 6 characters"
              placeholderTextColor="#9AA3B2"
              secureTextEntry
              autoCapitalize="none"
              value={form.password}
              onChangeText={(v) => updateField("password", v)}
            />

       
            {/* Buttons */}
            <View style={styles.footerButtons}>
              <Pressable
                onPress={onSubmit}
                disabled={saving}
                style={[
                  styles.footerButton,
                  saving && styles.footerButtonDisabled,
                  { backgroundColor: "#4a6cf7", borderColor: "#4a6cf7" },
                ]}
              >
                {saving
                  ? <ActivityIndicator color="white" />
                  : <Text style={[styles.statusButtonText, { fontSize: 15 }]}>Create Account</Text>
                }
              </Pressable>

              <Pressable
                onPress={onClose}
                disabled={saving}
                style={[styles.footerButton, saving && styles.footerButtonDisabled]}
              >
                <Text style={styles.statusButtonText}>Cancel</Text>
              </Pressable>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
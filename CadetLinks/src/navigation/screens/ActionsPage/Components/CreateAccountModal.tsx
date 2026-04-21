import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CreateAccountForm } from "../../../../assets/types";
import { YEARS, FLIGHTS, RANKS} from "../../../../assets/constants";
import { actionStyles as styles } from "../../../../styles/ActionStyles";
import { eventsStyles } from "../../../../styles/EventStyles";


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
  const safeValue = typeof value === "string" ? value : "";
  const safeOptions = Array.isArray(options)
    ? options.filter((opt): opt is string => typeof opt === "string")
    : [];

  return (
    <View style={[styles.dropdownWrapper, open && styles.dropdownWrapperOpen]}>
      <Text style={styles.fieldLabel}>{label}</Text>

      {/* Trigger button */}
      <Pressable
        style={eventsStyles.dropDownBox}
        onPress={() => setOpen((o) => !o)}
      >
        <Text>
          {safeValue || `Select ${label}`}
        </Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color="#9AA3B2" />
      </Pressable>

      {/* Options list */}
      {open && (
        <View style={styles.dropdownMenu}>
          {safeOptions.map((opt, index) => (
            <Pressable
              key={`${opt}-${index}`}
              style={[
                styles.dropdownItem,
                safeValue === opt && { backgroundColor: "#1E3A5F" },
                index === safeOptions.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              <Text style={[styles.dropdownItemTitle, safeValue === opt && { color: "#6B9FFF" }]}>
                {opt}
              </Text>
            </Pressable>
          ))}

          {safeOptions.length === 0 ? (
            <Text style={styles.dropdownEmptyText}>No options available</Text>
          ) : null}
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
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            nestedScrollEnabled
          >
            {/* Last Name */}
            <Text style={styles.fieldLabel}>Last Name</Text>
            <TextInput
              style={eventsStyles.inputBox}
              placeholder="Smith"
              placeholderTextColor="#9AA3B2"
              value={form.lastName}
              onChangeText={(v) => updateField("lastName", v)}
            />

            {/* First Name */}
            <Text style={styles.fieldLabel}>First Name</Text>
            <TextInput
              style={eventsStyles.inputBox}
              placeholder="John"
              placeholderTextColor="#9AA3B2"
              value={form.firstName}
              onChangeText={(v) => updateField("firstName", v)}
            />

            {/* Cadet Rank dropdown */}
            <DropdownPicker
              label="Cadet Rank"
              options={RANKS}
              value={form.cadetRank}
              onSelect={(v) => updateField("cadetRank", v)}
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
              style={eventsStyles.inputBox}
              placeholder="(555) 000-0000"
              placeholderTextColor="#9AA3B2"
              keyboardType="phone-pad"
              value={form.cellPhone}
              onChangeText={updatePhone}
            />

            {/* School Email */}
            <Text style={styles.fieldLabel}>School Email</Text>
            <TextInput
              style={eventsStyles.inputBox}
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
              style={eventsStyles.inputBox}
              placeholder="jsmith@gmail.com"
              placeholderTextColor="#9AA3B2"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.personalEmail}
              onChangeText={(v) => updateField("personalEmail", v)}
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
import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CreateAccountModalProps } from "../../../../assets/types";
import { INTRO_YEARS, FLIGHTS, INTRO_RANKS} from "../../../../assets/constants";
import { actionStyles as styles } from "../../../../styles/ActionStyles";
import { eventsStyles } from "../../../../styles/EventStyles";
import { DropdownPicker } from "./DropdownPicker";

export function CreateAccountModal({
  visible, onClose, form, updateField, updatePhone, saving, onSubmit,
}: CreateAccountModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 2 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
              keyboardDismissMode="on-drag"
              nestedScrollEnabled
              contentContainerStyle={{ paddingBottom: 120 }}
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

              <DropdownPicker
                label="Cadet Rank"
                options={INTRO_RANKS}
                value={form.cadetRank}
                onSelect={(v) => updateField("cadetRank", v)}
              />

              <DropdownPicker
                label="Class Year"
                options={INTRO_YEARS}
                value={form.classYear}
                onSelect={(v) => updateField("classYear", v)}
              />

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
      </KeyboardAvoidingView>
    </Modal>
  );
}
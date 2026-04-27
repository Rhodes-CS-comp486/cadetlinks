import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DropdownPickerProps } from "../../../../assets/types";
import { actionStyles as styles } from "../../../../styles/ActionStyles";
import { eventsStyles } from "../../../../styles/EventStyles";
import { generalStyles as genStyles } from "../../../../styles/GeneralStyles";

export function DropdownPicker({
  label,
  options,
  value,
  onSelect,
}: DropdownPickerProps) {
  const [open, setOpen] = useState(false);
  const safeValue = typeof value === "string" ? value : "";
  const isCompact = !label;
  const safeOptions = Array.isArray(options)
    ? options.filter((opt): opt is string => typeof opt === "string")
    : [];

  return (
    <View style={[styles.dropdownWrapper, open && styles.dropdownWrapperOpen]}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}

      <Pressable
        style={[
          genStyles.dropDownBox,
          isCompact && { marginBottom: 0, minHeight: 32, height: 32 },
        ]}
        onPress={() => setOpen((o) => !o)}
      >
        <Text>
          {safeValue || (label ? `Select ${label}` : "Select")}
        </Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color="#9AA3B2" />
      </Pressable>

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

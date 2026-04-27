import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DropdownPickerProps } from "../../../../assets/types";
import { actionStyles as styles } from "../../../../styles/ActionStyles";
import { eventsStyles } from "../../../../styles/EventStyles";
import { generalStyles as genStyles } from "../../../../styles/GeneralStyles";

let dropdownOpenLayerCounter = 1;

export function DropdownPicker({
  label,
  options,
  value,
  onSelect,
  onOpenChange,
}: DropdownPickerProps) {
  const [open, setOpen] = useState(false);
  const [openLayer, setOpenLayer] = useState(1);
  const safeValue = typeof value === "string" ? value : "";
  const isCompact = !label;
  const menuTop = isCompact ? 34 : 80;
  const safeOptions = Array.isArray(options)
    ? options.filter((opt): opt is string => typeof opt === "string")
    : [];

  return (
    <View
      style={[
        styles.dropdownWrapper,
        open && styles.dropdownWrapperOpen,
        open && { zIndex: 1000 + openLayer, elevation: 1000 + openLayer },
      ]}
    >
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}

      <Pressable
        style={[
          genStyles.dropDownBox,
          isCompact && { marginBottom: 0, minHeight: 32, height: 32 },
        ]}
        onPress={() => {
          setOpen((prevOpen) => {
            if (!prevOpen) {
              const nextLayer = dropdownOpenLayerCounter++;
              setOpenLayer(nextLayer);
            }
            const nextOpen = !prevOpen;
            onOpenChange?.(nextOpen);
            return nextOpen;
          });
        }}
      >
        <Text>
          {safeValue || (label ? `Select ${label}` : "Select")}
        </Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color="#9AA3B2" />
      </Pressable>

      {open && (
        <View
          style={[
            styles.dropdownMenu,
            {
              position: "absolute",
              top: menuTop,
              left: 0,
              right: 0,
              marginBottom: 0,
            },
          ]}
        >
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
                onOpenChange?.(false);
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

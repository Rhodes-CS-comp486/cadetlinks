import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { generalStyles as g_styles, generalStyles } from "../../../../styles/GeneralStyles";
import { DarkColors as colors } from "../../../../styles/colors";
import { actionStyles as styles } from "../../../../styles/ActionStyles";
import { eventsStyles } from "../../../../styles/EventStyles";
import { UploadDocsModalProps } from "../../../../assets/types";

function formatBytes(sizeBytes: number): string {
  if (!sizeBytes) return "0 B";
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  const kb = sizeBytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function UploadDocsModal({
  visible,
  onClose,
  selectedDocument,
  isPickingDocument,
  isUploadingDocument,
  uploadError,
  uploadSuccessMessage,
  onPickDocument,
  onClearDocument,
  onUploadDocument,
}: UploadDocsModalProps): React.ReactElement {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload Documents</Text>
            <Pressable onPress={onClose} style={g_styles.avatar_container}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          <Pressable
            style={eventsStyles.mandatoryButton}
            onPress={() => { void onPickDocument(); }}
            disabled={isPickingDocument || isUploadingDocument}
          >
            {isPickingDocument ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={g_styles.text}>Choose Local File</Text>
            )}
          </Pressable>

          {selectedDocument ? (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Selected File</Text>
              <Text style={styles.summaryText}>File Name: {selectedDocument.name}</Text>
              <Text style={styles.summaryText}>Type: {selectedDocument.mimeType}</Text>
              <Text style={styles.summaryText}>Size: {formatBytes(selectedDocument.size)}</Text>

              <Pressable
                style={styles.footerButton}
                onPress={onClearDocument}
                disabled={isUploadingDocument}
              >
                <Text style={styles.errorText}>Clear Selection</Text>
              </Pressable>
            </View>
          ) : null}

          {/* document name input — only shown after a file is picked */}
          {selectedDocument ? (
            <TextInput
              placeholder="Enter document name"
              placeholderTextColor={colors.text}
              editable={!isUploadingDocument}
              style={[
                g_styles.text,
                {
                  borderWidth: 1,
                  borderColor: colors.border ?? "#ccc",
                  borderRadius: 8,
                  padding: 10,
                  marginVertical: 10,
                  color: colors.text,
                },
              ]}
            />
          ) : null}

          {uploadError ? <Text style={styles.errorText}>{uploadError}</Text> : null}
          {uploadSuccessMessage ? (
            <Text style={styles.successText}>{uploadSuccessMessage}</Text>
          ) : null}

          <Pressable
            style={eventsStyles.mandatoryButton}
            onPress={() => { void onUploadDocument(); }}
            disabled={isUploadingDocument || isPickingDocument}
          >
            {isUploadingDocument ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.dropdownItemText}>Upload</Text>
            )}
          </Pressable>

        </View>
      </View>
    </Modal>
  );
}
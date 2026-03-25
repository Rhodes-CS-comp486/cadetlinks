import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { generalStyles as g_styles, generalStyles } from "../../../../styles/GeneralStyles";
import { DarkColors as colors } from "../../../../styles/colors";
import { jobStyles as styles } from "../../../../styles/JobStyles";
import { eventsStyles } from "../../../../styles/EventsStyles";
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
      {/*container for entire modal*/}
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload Documents</Text>
            
            {/* close button in header */}
            <Pressable onPress={onClose} style={g_styles.avatar_container}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>

          </View>

          {/* instructions and file picking section */}
          <Text style={g_styles.text}>
            Choose a local file, then upload it to Firebase.
          </Text>

          {/*file picking button and status -> calls onPickDocument in logic portion*/}
          <Pressable
            style={eventsStyles.mandatoryButton}
            onPress={() => {
              void onPickDocument();
            }}
            disabled={isPickingDocument || isUploadingDocument}
          >
            {isPickingDocument ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={g_styles.text}>Choose Local File</Text>
            )}
          </Pressable>

          {/* selected document details -> shows nothing if nothing is selected */}
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

          {uploadError ? <Text style={styles.errorText}>{uploadError}</Text> : null}
          {uploadSuccessMessage ? (
            <Text style={styles.successText}>{uploadSuccessMessage}</Text>
          ) : null}

          <Pressable
            style={eventsStyles.mandatoryButton}
            onPress={() => {
              void onUploadDocument();
            }}
            disabled={isUploadingDocument || isPickingDocument}
          >
            {isUploadingDocument ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.dropdownItemText}>Upload to Firebase</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

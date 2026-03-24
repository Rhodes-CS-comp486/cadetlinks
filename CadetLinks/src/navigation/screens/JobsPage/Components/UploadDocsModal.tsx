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
import { generalStyles } from "../../../../styles/GeneralStyles";
import { DarkColors as colors } from "../../../../styles/colors";

type UploadDocsModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedDocument: {
    name: string;
    mimeType: string;
    size: number;
  } | null;
  isPickingDocument: boolean;
  isUploadingDocument: boolean;
  uploadError: string | null;
  uploadSuccessMessage: string | null;
  onPickDocument: () => Promise<void>;
  onClearDocument: () => void;
  onUploadDocument: () => Promise<void>;
};

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
            <Pressable onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          <Text style={styles.helperText}>
            Choose a local file, then upload it to Firebase.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              void onPickDocument();
            }}
            disabled={isPickingDocument || isUploadingDocument}
          >
            {isPickingDocument ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.primaryButtonText}>Choose Local File</Text>
            )}
          </Pressable>

          {selectedDocument ? (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Selected File</Text>
              <Text style={styles.infoText}>{selectedDocument.name}</Text>
              <Text style={styles.infoText}>Type: {selectedDocument.mimeType}</Text>
              <Text style={styles.infoText}>Size: {formatBytes(selectedDocument.size)}</Text>

              <Pressable
                style={styles.secondaryButton}
                onPress={onClearDocument}
                disabled={isUploadingDocument}
              >
                <Text style={styles.secondaryButtonText}>Clear Selection</Text>
              </Pressable>
            </View>
          ) : null}

          {uploadError ? <Text style={styles.errorText}>{uploadError}</Text> : null}
          {uploadSuccessMessage ? (
            <Text style={styles.successText}>{uploadSuccessMessage}</Text>
          ) : null}

          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              void onUploadDocument();
            }}
            disabled={isUploadingDocument || isPickingDocument}
          >
            {isUploadingDocument ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.primaryButtonText}>Upload to Firebase</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  ...generalStyles,
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 16,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  iconButton: {
    padding: 6,
  },
  helperText: {
    color: colors.muted,
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryButton: {
    marginTop: 8,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    color: colors.text,
    fontWeight: "700",
    marginBottom: 6,
  },
  infoText: {
    color: colors.text,
    fontSize: 13,
    marginBottom: 2,
  },
  errorText: {
    color: "#F87171",
    fontWeight: "600",
  },
  successText: {
    color: "#4ADE80",
    fontWeight: "600",
  },
});


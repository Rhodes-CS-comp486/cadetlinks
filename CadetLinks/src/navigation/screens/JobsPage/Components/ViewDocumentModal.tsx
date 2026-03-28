import React from "react";
import {
    View,
    Text,
    Pressable,
    ActivityIndicator,
    Modal,
    FlatList,
    Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { generalStyles as g_styles } from "../../../../styles/GeneralStyles";
import { DarkColors as colors } from "../../../../styles/colors";
import { jobStyles as styles } from "../../../../styles/JobStyles";
import { ViewDocumentModalProps } from "../../../../assets/types";

function formatBytes(sizeBytes: number): string {
    if (!sizeBytes) return "0 B";
    if (sizeBytes < 1024) return `${sizeBytes} B`;
    const kb = sizeBytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString();
}

type Document = {
    dbKey: string;
    displayName: string;
    mimeType: string;
    sizeBytes: number;
    uploadedAt: string;
    downloadURL: string;
    storagePath: string;
};

type Props = {
    visible: boolean;
    onClose: () => void;
    documents: Document[];
    isLoading: boolean;
    deleteError: string | null;
    deletingKey: string | null;
    onDelete: (dbKey: string, storagePath: string) => Promise<void>;
};

export function ViewDocumentModal({
    visible,
    onClose,
    documents,
    isLoading,
    deleteError,
    deletingKey,
    onDelete,
    canEditFiles,
}: ViewDocumentModalProps): React.ReactElement {
    
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
                        <Text style={styles.modalTitle}>Uploaded Documents</Text>
                        <Pressable onPress={onClose} style={g_styles.avatar_container}>
                            <Ionicons name="close" size={22} color={colors.text} />
                        </Pressable>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator color={colors.text} style={{ marginTop: 20 }} />
                    ) : documents.length === 0 ? (
                        <Text style={styles.summaryText}>No documents uploaded yet.</Text>
                    ) : (
                        <FlatList
                            data={documents}
                            keyExtractor={(item) => item.dbKey}
                            renderItem={({ item }) => (
                                <View style={[styles.summaryCard, { marginVertical: 6 }]}>
                                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                        <Text style={[styles.summaryTitle, { flex: 1 }]} numberOfLines={1}>
                                            {item.displayName}
                                        </Text>

                                        {/* Download button */}
                                        <Pressable
                                            onPress={() => Linking.openURL(item.downloadURL)}
                                            style={{ marginHorizontal: 8 }}
                                        >
                                            <Ionicons name="download-outline" size={20} color={colors.text} />
                                        </Pressable>

                                        {/* Delete button */}
                                        {canEditFiles ? (
                                            <Pressable
                                                onPress={() => void onDelete(item.dbKey, item.storagePath)}
                                                disabled={deletingKey === item.dbKey}
                                            >
                                                {deletingKey === item.dbKey ? (
                                                    <ActivityIndicator color={colors.text} size="small" />
                                                ) : (
                                                    <Ionicons name="trash-outline" size={20} color="red" />
                                                )}
                                            </Pressable> ) : null}
                                    </View>

                                    <Text style={styles.summaryText}>
                                        {formatBytes(item.sizeBytes)} · {formatDate(item.uploadedAt)}
                                    </Text>
                                </View>
                            )}
                        />
                    )}

                    {deleteError ? (
                        <Text style={styles.errorText}>{deleteError}</Text>
                    ) : null}

                </View>
            </View>
        </Modal>
    );
}
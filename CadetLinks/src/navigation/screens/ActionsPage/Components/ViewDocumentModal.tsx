import React from "react";
import {
    View,
    Text,
    Pressable,
    ActivityIndicator,
    Modal,
    FlatList,
    Linking,
    Image,
    Dimensions,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { generalStyles as g_styles } from "../../../../styles/GeneralStyles";
import { DarkColors as colors } from "../../../../styles/colors";
import { actionStyles as styles } from "../../../../styles/ActionStyles";

interface DocumentItem {
    dbKey: string;
    displayName: string;
    mimeType: string;
    downloadURL: string;
    sizeBytes: number;
    uploadedAt: string;
    storagePath: string;
}

interface ViewDocumentModalProps {
    visible: boolean;
    onClose: () => void;
    documents: DocumentItem[];
    isLoading: boolean;
    deleteError: string | null;
    deletingKey: string | null;
    onDelete: (dbKey: string, storagePath: string) => void;
    canEditFiles: boolean;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

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

function isImage(mimeType: string): boolean {
    return mimeType.startsWith("image/");
}

function isPDF(mimeType: string): boolean {
    return mimeType === "application/pdf";
}

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

    const [previewURL, setPreviewURL] = React.useState<string | null>(null);
    const [previewMime, setPreviewMime] = React.useState<string | null>(null);
    const [previewName, setPreviewName] = React.useState<string | null>(null);

    const openPreview = (url: string, mime: string, name: string) => {
        setPreviewURL(url);
        setPreviewMime(mime);
        setPreviewName(name);
    };

    const closePreview = () => {
        setPreviewURL(null);
        setPreviewMime(null);
        setPreviewName(null);
    };

    const renderPreviewContent = () => {
        if (!previewURL || !previewMime) return null;

        // Mobile only
        if (isImage(previewMime)) {
            return (
                <Image
                    source={{ uri: previewURL }}
                    style={{ flex: 1, resizeMode: "contain", margin: 16 }}
                />
            );
        }

        if (isPDF(previewMime)) {
            const { WebView } = require("react-native-webview");
            return (
                <WebView
                    source={{ uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(previewURL)}` }}
                    style={{ flex: 1, margin: 16, borderRadius: 8 }}
                    startInLoadingState
                    renderLoading={() => (
                        <ActivityIndicator color="#fff" size="large" />
                    )}
                />
            );
        }

        return null;
    };

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

                                        {/* Preview button — images and PDFs only */}
                                        {isImage(item.mimeType) || isPDF(item.mimeType) ? (
                                            <Pressable
                                                onPress={() => openPreview(item.downloadURL, item.mimeType, item.displayName)}
                                                style={{ marginHorizontal: 8 }}
                                            >
                                                <Ionicons name="eye-outline" size={20} color={colors.text} />
                                            </Pressable>
                                        ) : null}

                                        {/* Download button */}
                                        <Pressable
                                            onPress={() => Linking.openURL(item.downloadURL)}
                                            style={{ marginHorizontal: 8 }}
                                        >
                                            <Ionicons name="download-outline" size={20} color={colors.text} />
                                        </Pressable>

                                        {/* Delete button — permission only */}
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
                                            </Pressable>
                                        ) : null}
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

            {/* PREVIEW — web uses div overlay, mobile uses Modal */}
            {!!previewURL && (
                Platform.OS === "web" ? (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0,0,0,0.92)",
                        zIndex: 9999,
                        display: "flex",
                        flexDirection: "column",
                    } as any}>

                        {/* Header */}
                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: 16,
                            paddingTop: 48,
                        } as any}>
                            <span style={{
                                color: "#fff",
                                fontSize: 16,
                                fontWeight: 500,
                                flex: 1,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            } as any}>
                                {previewName}
                            </span>
                            <Pressable onPress={closePreview}>
                                <Ionicons name="close" size={26} color="#fff" />
                            </Pressable>
                        </div>

                        {/* Content */}
                        {isImage(previewMime ?? "") ? (
                            <img
                                src={previewURL}
                                style={{
                                    width: "100%",
                                    height: "calc(100vh - 160px)",
                                    objectFit: "contain",
                                    padding: "0 16px",
                                    display: "block",
                                    boxSizing: "border-box",
                                } as any}
                            />
                        ) : isPDF(previewMime ?? "") ? (
                            <iframe
                                src={previewURL}
                                style={{
                                    width: "calc(100% - 32px)",
                                    height: "calc(100vh - 160px)",
                                    border: "none",
                                    borderRadius: 8,
                                    margin: "0 16px",
                                    display: "block",
                                    backgroundColor: "#fff",
                                } as any}
                            />
                        ) : null}

                        {/* Download button */}
                        <Pressable
                            onPress={() => previewURL && Linking.openURL(previewURL)}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                margin: 16,
                                padding: 12,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: "#fff",
                            }}
                        >
                            <Ionicons name="download-outline" size={20} color="#fff" />
                            <Text style={{ color: "#fff", fontSize: 14 }}>Download</Text>
                        </Pressable>

                    </div>
                ) : (
                    // Mobile Modal
                    <Modal
                        visible={!!previewURL}
                        transparent
                        animationType="fade"
                        onRequestClose={closePreview}
                    >
                        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)" }}>

                            <View style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: 16,
                                paddingTop: 48,
                            }}>
                                <Text style={[styles.summaryTitle, { flex: 1, color: "#fff" }]} numberOfLines={1}>
                                    {previewName}
                                </Text>
                                <Pressable onPress={closePreview}>
                                    <Ionicons name="close" size={26} color="#fff" />
                                </Pressable>
                            </View>

                            {renderPreviewContent()}

                            <Pressable
                                onPress={() => previewURL && Linking.openURL(previewURL)}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    margin: 16,
                                    padding: 12,
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: "#fff",
                                }}
                            >
                                <Ionicons name="download-outline" size={20} color="#fff" />
                                <Text style={{ color: "#fff", fontSize: 14 }}>Download</Text>
                            </Pressable>

                        </View>
                    </Modal>
                )
            )}

        </Modal>
    );
}
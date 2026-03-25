import React from "react";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { push, ref, set } from "firebase/database";
import { db } from "../../../firebase/config";

type SelectedDocument = {
    name: string;
    uri: string;
    mimeType: string;
    size: number;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;


export function useDocumentUploadingLogic() {
    const [documentUploadingModalVisible, setDocumentUploadingModalVisible] =
        React.useState(false);
    const [selectedDocument, setSelectedDocument] = React.useState<SelectedDocument | null>(null);
    const [isPickingDocument, setIsPickingDocument] = React.useState(false);
    const [isUploadingDocument, setIsUploadingDocument] = React.useState(false);
    const [uploadError, setUploadError] = React.useState<string | null>(null);
    const [uploadSuccessMessage, setUploadSuccessMessage] = React.useState<string | null>(null);

    const openDocumentUploadingModal = () => {
        setUploadError(null);
        setUploadSuccessMessage(null);
        setDocumentUploadingModalVisible(true);
    };

    const closeDocumentUploadingModal = () => {
        setDocumentUploadingModalVisible(false);
        setUploadError(null);
        setUploadSuccessMessage(null);
    };  

    const clearSelectedDocument = () => {
        setSelectedDocument(null);
    };

    const pickDocument = async () => {
        setUploadError(null);
        setUploadSuccessMessage(null);
        setIsPickingDocument(true);

        try {
            const result = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (result.canceled) {
                return;
            }

            const file = result.assets?.[0];

            if (!file) {
                setUploadError("No file was selected.");
                return;
            }

            if ((file.size ?? 0) > MAX_FILE_SIZE_BYTES) {
                setUploadError("File is too large. Please select a file under 5 MB.");
                return;
            }

            setSelectedDocument({
                name: file.name ?? "document",
                uri: file.uri,
                mimeType: file.mimeType ?? "application/octet-stream",
                size: file.size ?? 0,
            });
        } catch (error) {
            console.error("Document picker failed:", error);
            setUploadError("Could not open local files. Please try again.");
        } finally {
            setIsPickingDocument(false);
        }
    };

    const uploadSelectedDocument = async () => {
        setUploadError(null);
        setUploadSuccessMessage(null);

        if (!selectedDocument) {
            setUploadError("Please choose a document first.");
            return;
        }

        setIsUploadingDocument(true);

        try {
            const base64Data = await FileSystem.readAsStringAsync(selectedDocument.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const cadetKey = await AsyncStorage.getItem("currentCadetKey");
            const uploadsRef = ref(db, "uploadedDocuments");
            const newUploadRef = push(uploadsRef);

            await set(newUploadRef, {
                uploadedBy: cadetKey ?? "unknown",
                fileName: selectedDocument.name,
                mimeType: selectedDocument.mimeType,
                sizeBytes: selectedDocument.size,
                uploadedAt: new Date().toISOString(),
                fileDataBase64: base64Data,
            });

            setUploadSuccessMessage("Document uploaded to Firebase.");
            setSelectedDocument(null);
        } catch (error) {
            console.error("Upload failed:", error);
            setUploadError("Upload failed. Please try again.");
        } finally {
            setIsUploadingDocument(false);
        }
    };

    return {
        documentUploadingModalVisible,
        openDocumentUploadingModal,
        closeDocumentUploadingModal,
        selectedDocument,
        isPickingDocument,
        isUploadingDocument,
        uploadError,
        uploadSuccessMessage,
        pickDocument,
        clearSelectedDocument,
        uploadSelectedDocument,
    };
}

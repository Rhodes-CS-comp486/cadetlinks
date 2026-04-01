import React from "react";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { push, ref as dbRef, set } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../../firebase/config";

type SelectedDocument = {
    name: string;
    uri: string;
    mimeType: string;
    size: number;
    file?: File;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export function useDocumentUploadingLogic() {
    const [documentUploadingModalVisible, setDocumentUploadingModalVisible] =
        React.useState(false);
    const [selectedDocument, setSelectedDocument] = React.useState<SelectedDocument | null>(null);
    const [documentName, setDocumentName] = React.useState("");  // custom name
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
        setDocumentName("");
    };

    const clearSelectedDocument = () => {
        setSelectedDocument(null);
        setDocumentName("");
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

            if (result.canceled) return;

            const file = result.assets?.[0];
            if (!file) { setUploadError("No file was selected."); return; }
            if ((file.size ?? 0) > MAX_FILE_SIZE_BYTES) {
                setUploadError("File is too large. Please select a file under 5 MB.");
                return;
            }

            setSelectedDocument({
                name: file.name ?? "document",
                uri: file.uri,
                mimeType: file.mimeType ?? "application/octet-stream",
                size: file.size ?? 0,
                file: (file as any).file ?? undefined,
            });

            // Pre-fill the name field with the original filename (without extension)
            const nameWithoutExtension = (file.name ?? "document").replace(/\.[^/.]+$/, "");
            setDocumentName(nameWithoutExtension);

        } catch (error) {
            console.error("Document picker failed:", error);
            setUploadError("Could not open local files. Please try again.");
        } finally {
            setIsPickingDocument(false);
        }
    };

    const getBlob = async (doc: SelectedDocument): Promise<Blob> => {
        if (Platform.OS === "web") {
            if (doc.file) return doc.file;
            const response = await fetch(doc.uri);
            return await response.blob();
        }

        const base64Data = await FileSystem.readAsStringAsync(doc.uri, {
            encoding: FileSystem.EncodingType.Base64,
        });
        const byteCharacters = atob(base64Data);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteArray[i] = byteCharacters.charCodeAt(i);
        }
        return new Blob([byteArray], { type: doc.mimeType });
    };

    const uploadSelectedDocument = async () => {
        setUploadError(null);
        setUploadSuccessMessage(null);

        if (!selectedDocument) {
            setUploadError("Please choose a document first.");
            return;
        }

        const trimmedName = documentName.trim();
        if (!trimmedName) {
            setUploadError("Please enter a name for the document.");
            return;
        }

        setIsUploadingDocument(true);

        try {
            const cadetKey = await AsyncStorage.getItem("currentCadetKey");
            const blob = await getBlob(selectedDocument);

            // Preserve the original file extension, use custom name as label
            const extension = selectedDocument.name.match(/\.[^/.]+$/)?.[0] ?? "";
            const fileName = `${Date.now()}_${trimmedName}${extension}`;
            const fileRef = storageRef(storage, `uploadedDocuments/${fileName}`);
            await uploadBytes(fileRef, blob);

            const downloadURL = await getDownloadURL(fileRef);

            const uploadsRef = dbRef(db, "uploadedDocuments");
            const newUploadRef = push(uploadsRef);
            await set(newUploadRef, {
                uploadedBy: cadetKey ?? "unknown",
                displayName: trimmedName,          // custom name shown in the app
                fileName: selectedDocument.name,   // original filename
                mimeType: selectedDocument.mimeType,
                sizeBytes: selectedDocument.size,
                uploadedAt: new Date().toISOString(),
                downloadURL,
                storagePath: `uploadedDocuments/${fileName}`,
            });

            setUploadSuccessMessage(`"${trimmedName}" uploaded successfully.`);
            setSelectedDocument(null);
            setDocumentName("");
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
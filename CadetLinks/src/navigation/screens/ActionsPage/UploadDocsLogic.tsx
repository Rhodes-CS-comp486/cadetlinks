import React from "react";
import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import { uploadDocumentFromUri } from "../../../firebase/dbController";
 
type SelectedDocument = {
    name: string;
    uri: string;
    mimeType: string;
    size: number;
    file?: File;
};
 
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
 
const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
 
export function useDocumentUploadingLogic() {
    const [documentUploadingModalVisible, setDocumentUploadingModalVisible] =
        React.useState(false);
    const [selectedDocument, setSelectedDocument] = React.useState<SelectedDocument | null>(null);
    const [documentName, setDocumentName] = React.useState("");
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
                type: ALLOWED_MIME_TYPES,
                copyToCacheDirectory: true,
                multiple: false,
            });
 
            if (result.canceled) return;
 
            const file = result.assets?.[0];
            if (!file) { setUploadError("No file was selected."); return; }
            if (!ALLOWED_MIME_TYPES.includes(file.mimeType ?? "")) {
                setUploadError("Only PDF and DOCX files are allowed.");
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
                file: (file as any).file ?? undefined,
            });
 
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
 
        // Expo Go safe — fetch local URI directly as blob
        const response = await fetch(doc.uri);
        return await response.blob();
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
            if (Platform.OS === "web") {
                await getBlob(selectedDocument);
            }

            await uploadDocumentFromUri({
                displayName: trimmedName,
                mimeType: selectedDocument.mimeType,
                sizeBytes: selectedDocument.size,
                uri: selectedDocument.uri,
                originalFileName: selectedDocument.name,
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
 
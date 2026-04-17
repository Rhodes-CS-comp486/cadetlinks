import React from "react";
import { ref as dbRef, onValue, remove } from "firebase/database";
import { ref as storageRef, deleteObject } from "firebase/storage";
import { db, storage } from "../../../firebase/config";

type UploadedDocument = {
    dbKey: string;
    displayName: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    uploadedAt: string;
    downloadURL: string;
    storagePath: string;
    uploadedBy: string;
};

export function ViewDocumentLogic() {
    const [documents, setDocuments] = React.useState<UploadedDocument[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [deleteError, setDeleteError] = React.useState<string | null>(null);
    const [deletingKey, setDeletingKey] = React.useState<string | null>(null);

    // Fetch documents from Realtime Database in real time
    React.useEffect(() => {
        const uploadsRef = dbRef(db, "uploadedDocuments");
        const unsubscribe = onValue(uploadsRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                setDocuments([]);
                setIsLoading(false);
                return;
            }

            const parsed: UploadedDocument[] = Object.entries(data).map(
                ([key, value]: [string, any]) => ({
                    dbKey: key,
                    displayName: value.displayName ?? value.fileName,
                    fileName: value.fileName,
                    mimeType: value.mimeType,
                    sizeBytes: value.sizeBytes,
                    uploadedAt: value.uploadedAt,
                    downloadURL: value.downloadURL,
                    storagePath: value.storagePath,
                    uploadedBy: value.uploadedBy,
                })
            );

            // Sort newest first
            parsed.sort((a, b) =>
                new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
            );

            setDocuments(parsed);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const deleteDocument = async (dbKey: string, storagePath: string) => {
        setDeleteError(null);
        setDeletingKey(dbKey);
        try {
            // Delete from Cloud Storage
            await deleteObject(storageRef(storage, storagePath));
            // Delete metadata from Realtime Database
            await remove(dbRef(db, `uploadedDocuments/${dbKey}`));
        } catch (error) {
            console.error("Delete failed:", error);
            setDeleteError("Failed to delete. Please try again.");
        } finally {
            setDeletingKey(null);
        }
    };

    return {
        documents,
        isLoading,
        deleteError,
        deletingKey,
        deleteDocument,
    };
}
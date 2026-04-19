import React from "react";
import { deleteUploadedDocument, globals, initializeGlobals, type UploadedDocument } from "../../../firebase/dbController";

export function ViewDocumentLogic() {
    const globalState = globals();
    const [deleteError, setDeleteError] = React.useState<string | null>(null);
    const [deletingKey, setDeletingKey] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!globalState.isInitialized && !globalState.isInitializing) {
            void initializeGlobals();
        }
    }, []);

    const deleteDocument = async (dbKey: string, storagePath: string) => {
        setDeleteError(null);
        setDeletingKey(dbKey);
        try {
            await deleteUploadedDocument(dbKey, storagePath);
        } catch (error) {
            console.error("Delete failed:", error);
            setDeleteError("Failed to delete. Please try again.");
        } finally {
            setDeletingKey(null);
        }
    };

    return {
        documents: globalState.uploadedDocuments as UploadedDocument[],
        isLoading: globalState.isInitializing || !globalState.isInitialized,
        deleteError,
        deletingKey,
        deleteDocument,
    };
}
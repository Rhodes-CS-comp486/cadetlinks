export type UploadDocsModalProps = {
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

export interface Event {
  id: string
  title: string;
  date: Date;
  time: Date;
  description: string;
  location: string;
  type: '' | 'RSVP' | 'Mandatory';
}
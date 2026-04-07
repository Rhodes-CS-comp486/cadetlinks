import { useNavigation } from "@react-navigation/native";
import {PERMISSIONS} from "./constants";
import type {
  AttendanceStatus,
  CadetListItem,
  EventItem,
} from "../navigation/screens/JobsPage/AttendanceLogic";

export type UploadDocsModalProps = {
  visible: boolean;
  onClose: () => void;
  selectedDocument: {
    name: string;
    mimeType: string;
    size: number;
    //documentName: string; // custom name for the document
  } | null;
  isPickingDocument: boolean;
  isUploadingDocument: boolean;
  uploadError: string | null;
  uploadSuccessMessage: string | null;
  onPickDocument: () => Promise<void>;
  onClearDocument: () => void;
  onUploadDocument: () => Promise<void>;
};

export type AttendanceModalProps = {
  visible: boolean;
  onRequestClose: () => void;
  loadingAttendanceTools: boolean;
  selectedEvent?: EventItem;
  eventDropdownOpen: boolean;
  onToggleEventDropdown: () => void;
  todayEvents: EventItem[];
  onSelectEvent: (eventId: string) => void;
  markedAbsentCount: number;
  markedLateCount: number;
  allCadets: CadetListItem[];
  getCadetStatus: (cadetKey: string) => AttendanceStatus;
  setCadetStatus: (cadetKey: string, status: AttendanceStatus) => void;
  savingAttendance: boolean;
  clearingAttendance: boolean;
  onClearAttendance: () => void;
  onSubmitAttendance: () => void;
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

export type CadetProfile = {
  firstName?: string;
  lastName?: string;
  cadetRank?: string;
  job?: string;
  flight?: string;
  classYear?: number;
  permissions?: string;
  contact?: {
    schoolEmail?: string;
    personalEmail?: string;
    cellPhone?: string;
  };
};

type JobsActionId =
| typeof PERMISSIONS.ATTENDANCE_EDITING
| typeof PERMISSIONS.FILE_UPLOADING
| typeof PERMISSIONS.EVENT_MAKING
| typeof PERMISSIONS.CREATE_ACCOUNTS;

export type JobsAction = {
  id: JobsActionId;
  title: string;
  subtitle: string;
  routeHint?: string;
  allowed: boolean;
};

export type NavAny = ReturnType<typeof useNavigation<any>>;
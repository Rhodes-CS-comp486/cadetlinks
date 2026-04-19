import { useNavigation } from "@react-navigation/native";
import { PERMISSIONS } from "./constants";
import type {
  AttendanceStatus as AttendanceLogicStatus,
  CadetListItem,
  EventItem,
} from "../navigation/screens/ActionsPage/AttendanceLogic";

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
  onToggleFlightDropdown: () => void;
  selectedFlight?: string;
  flightDropdownOpen: boolean;
  onSelectFlight: (flightName: string) => void;
  allCadets: CadetListItem[];
  getCadetStatus: (cadetKey: string) => AttendanceLogicStatus;
  setCadetStatus: (cadetKey: string, status: AttendanceLogicStatus) => void;
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

type ActionId =
| typeof PERMISSIONS.ATTENDANCE_EDITING
| typeof PERMISSIONS.FILE_UPLOADING
| typeof PERMISSIONS.EVENT_MAKING
| typeof PERMISSIONS.ADMIN;

export type Action = {
  id: ActionId;
  title: string;
  subtitle: string;
  routeHint?: string;
  allowed: boolean;
};

export type NavAny = ReturnType<typeof useNavigation<any>>;

export type Announcement = {
  id: string;
  title: string;
  body: string;
  importance: string;
  retirementDate: Date;
};

export type UploadedDocument = {
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

export type AttendanceStatus = "P" | "A" | "L";
export type AttendanceRecordStatus = "P" | "A" | "E" | "L" | ".";
export type AttendanceSubtree = Record<string, Record<string, { status?: AttendanceRecordStatus }>>;

export type AttendanceEventItem = {
  id: string;
  eventName?: string;
  date?: string;
  time?: string;
};

export type AttendanceCadetItem = {
  cadetKey: string;
  firstName: string;
  lastName: string;
  fullName: string;
  attendanceKey: string;
  flight?: string;
};

export type StoreDomainErrors = {
  profile?: string;
  permissions?: string;
  events?: string;
  announcements?: string;
  rsvps?: string;
  cadets?: string;
  documents?: string;
  attendance?: string;
};

export type GlobalFirebaseState = {
  isInitialized: boolean;
  isInitializing: boolean;
  cadetKey: string | null;
  profile: CadetProfile | null;
  permissionsMap: Map<string, boolean>;
  events: Event[];
  announcements: Announcement[];
  userRsvpEventIds: Set<string>;
  userRsvpStatusByEvent: Record<string, boolean>;
  rsvpCadetKeysByEvent: Record<string, string[]>;
  cadetsByKey: Record<string, CadetProfile>;
  uploadedDocuments: UploadedDocument[];
  attendancePT: AttendanceSubtree;
  attendanceLLAB: AttendanceSubtree;
  errors: StoreDomainErrors;
  lastUpdated: Record<string, number | null>;
};

export type UploadDocumentInput = {
  displayName: string;
  mimeType: string;
  sizeBytes: number;
  uri: string;
  originalFileName: string;
};
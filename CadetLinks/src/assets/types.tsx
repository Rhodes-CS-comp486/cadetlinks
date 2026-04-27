import { useNavigation } from "@react-navigation/native";
import { PERMISSIONS } from "./constants";
import type {
  AttendanceStatus as AttendanceLogicStatus,
  CadetListItem,
  EventItem,
} from "../navigation/screens/ActionsPage/AttendanceLogic";
import { useState } from "react";

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
  id: string;
  title: string;
  date: Date;
  time: Date;
  description: string;
  location: string;
  type: "" | "RSVP" | "Mandatory";
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
  directSupervisor?: string;
  lastPTScore?: string;
  bio?: string;
  photoUrl?: string;
};

type ActionId =
  | typeof PERMISSIONS.ATTENDANCE_EDITING
  | typeof PERMISSIONS.FILE_UPLOADING
  | typeof PERMISSIONS.EVENT_MAKING
  | typeof PERMISSIONS.ADMIN


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
export type AttendanceRecordStatus =
  | "P"
  | "A"
  | "E"
  | "L"
  | "."
  | "MP"
  | "ML"
  | "MA";
export type AttendanceSubtree = Record<
  string,
  Record<string, { status?: AttendanceRecordStatus }>
>;

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

/**
 * The absencesAllowed node in Firebase.
 *
 * Firebase path:
 *   absencesAllowed/PT   → number  (max unexcused PT absences)
 *   absencesAllowed/LLAB → number  (max unexcused LLAB absences)
 *   absencesAllowed/RMP  → number  (max unexcused RMP absences)
 *
 * A value of 0 means the node hasn't been set yet (safe default).
 */
export type AbsencesAllowed = {
  PT: number;
  LLAB: number;
  RMP: number;
};

/** Default when the Firebase node doesn't exist yet. */
export const DEFAULT_ABSENCES_ALLOWED: AbsencesAllowed = {
  PT: 0,
  LLAB: 0,
  RMP: 0,
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
  ptScores?: string;
  absencesAllowed?: string;
};

export type PTScoreEntry = {
  score: number;
  recordedAt: string;
};

export type PTScoresSubtree = Record<
  string,
  Record<string, PTScoreEntry>
>;

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
  attendanceRMP: AttendanceSubtree;
  ptScores: PTScoresSubtree;
  absencesAllowed: AbsencesAllowed;
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

export interface CreateAccountForm {
  classYear: string;
  lastName: string;
  firstName: string;
  cellPhone: string;
  schoolEmail: string;
  personalEmail: string;
  cadetRank: string;
  flight: string;
  job: string;
}

export interface DropdownPickerProps {
  label: string;
  options: string[];
  value: string;
  onSelect: (v: string) => void;
}

export interface CreateAccountModalProps {
  visible: boolean;
  onClose: () => void;
  form: CreateAccountForm;
  updateField: <K extends keyof CreateAccountForm>(
    k: K,
    v: CreateAccountForm[K]
  ) => void;
  updatePhone: (raw: string) => void;
  saving: boolean;
  onSubmit: () => void;
}

export interface PTScoreModalProps {
  visible: boolean;
  onRequestClose: () => void;
  loading: boolean;
  allCadets: AttendanceCadetItem[];
  scores: Record<string, string>;
  onScoreChange: (cadetKey: string, value: string) => void;
  selectedFlight: string | null;
  flightDropdownOpen: boolean;
  onToggleFlightDropdown: () => void;
  onSelectFlight: (flight: string) => void;
  saving: boolean;
  onSubmit: () => void;
  /** Full PT score history for every cadet, sourced from globals().ptScores. */
  ptScoresByCadet?: PTScoresSubtree;
}
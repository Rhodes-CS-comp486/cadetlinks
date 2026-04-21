/**
 * globals.ts — Centralized Firebase singleton store
 *
 * All Firebase Realtime Database listeners and write actions live here.
 * Components subscribe via the `globals()` React hook (backed by useSyncExternalStore),
 * which re-renders them whenever relevant state changes.
 *
 * Lifecycle:
 *   - Call `initializeGlobals(cadetKey?)` after login to start all listeners.
 *   - Call `teardownGlobals()` on logout to stop listeners and reset state.
 */

import { useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { get, onValue, ref, set } from "firebase/database";
import { remove, update } from "firebase/database";
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { ADMIN_PERMISSIONS, ATTENDANCE_EDITING_PERMISSION, EVENT_MAKING_PERMISSION, FILE_UPLOADING_PERMISSION, TEMP_PASSWORD } from "../assets/constants";
import type {
  Announcement,
  AttendanceCadetItem,
  AttendanceRecordStatus,
  AttendanceEventItem,
  AttendanceStatus,
  AttendanceSubtree,
  CadetProfile,
  Event as CadetEvent,
  GlobalFirebaseState,
  StoreDomainErrors,
  UploadDocumentInput,
  UploadedDocument,
  CreateAccountForm
} from "../assets/types";
import { db, storage } from "./config";

export type {
  Announcement,
  AttendanceCadetItem,
  AttendanceEventItem,
  AttendanceStatus,
  AttendanceSubtree,
  GlobalFirebaseState,
  StoreDomainErrors,
  UploadDocumentInput,
  UploadedDocument,
} from "../assets/types";

// Permission string constants re-exported for convenient access in screens.
export const PERMISSIONS = {
  EVENT_MAKING: EVENT_MAKING_PERMISSION,
  FILE_UPLOADING: FILE_UPLOADING_PERMISSION,
  ATTENDANCE_EDITING: ATTENDANCE_EDITING_PERMISSION,
  ADMIN: ADMIN_PERMISSIONS,
};

// ─── Store internals ─────────────────────────────────────────────────────────

/** Returns a Map with every permission key defaulting to false. */
const defaultPermissionsMap = () =>
  new Map<string, boolean>([
    [PERMISSIONS.EVENT_MAKING, false],
    [PERMISSIONS.FILE_UPLOADING, false],
    [PERMISSIONS.ATTENDANCE_EDITING, false],
    [PERMISSIONS.ADMIN, false],
  ]);

const initialState: GlobalFirebaseState = {
  isInitialized: false,
  isInitializing: false,
  cadetKey: null,
  profile: null,
  permissionsMap: defaultPermissionsMap(),
  events: [],
  announcements: [],
  userRsvpEventIds: new Set<string>(),
  userRsvpStatusByEvent: {},
  rsvpCadetKeysByEvent: {},
  cadetsByKey: {},
  uploadedDocuments: [],
  attendancePT: {},
  attendanceLLAB: {},
  attendanceRMP: {},
  errors: {},
  lastUpdated: {
    profile: null,
    permissions: null,
    events: null,
    announcements: null,
    rsvps: null,
    cadets: null,
    documents: null,
    attendance: null,
  },
};

/** Module-level singleton state. Never reassign — use patchStore() instead. */
let store: GlobalFirebaseState = initialState;
/** useSyncExternalStore subscriber callbacks registered by React components. */
const subscribers = new Set<() => void>();
/** Firebase onValue unsubscribe functions; cleared on teardown. */
const activeListeners: Array<() => void> = [];

/** Notify all React subscribers that the store has changed. */
const emit = () => {
  subscribers.forEach((listener) => listener());
};

/** Shallow-merge `patch` into the store and notify subscribers. */
const patchStore = (patch: Partial<GlobalFirebaseState>) => {
  store = { ...store, ...patch };
  emit();
};

/** Set or clear a domain-scoped error message in the store. */
const patchError = (domain: keyof StoreDomainErrors, message?: string) => {
  const nextErrors = { ...store.errors };
  if (message) {
    nextErrors[domain] = message;
  } else {
    delete nextErrors[domain];
  }
  patchStore({ errors: nextErrors });
};

/** Stamp the current timestamp for a domain (used by screens to detect freshness). */
const touch = (domain: keyof GlobalFirebaseState["lastUpdated"]) => {
  patchStore({
    lastUpdated: {
      ...store.lastUpdated,
      [domain]: Date.now(),
    },
  });
};

/** Register a Firebase unsubscribe function so it is cleaned up on teardown. */
const addListener = (unsubscribe: () => void) => {
  activeListeners.push(unsubscribe);
};

/** Call every registered unsubscribe and empty the list. */
const clearListeners = () => {
  while (activeListeners.length > 0) {
    const unsubscribe = activeListeners.pop();
    if (unsubscribe) {
      unsubscribe();
    }
  }
};

// ─── Utilities ───────────────────────────────────────────────────────────────

/**
 * Build a local (non-UTC) Date from separate date and time strings.
 * Returns null when either string cannot be parsed.
 */
const parseLocalDateTime = (dateStr: string, timeStr: string): Date | null => {
  const [year, month, day] = String(dateStr).split("-").map(Number);
  const [hours = 0, minutes = 0, seconds = 0] = String(timeStr || "00:00:00")
    .split(":")
    .map(Number);

  const localDate = new Date(year, (month ?? 1) - 1, day ?? 1, hours, minutes, seconds, 0);
  if (isNaN(localDate.getTime())) {
    return null;
  }
  return localDate;
};

/** Format a Date as "YYYY-MM-DD" using local timezone. */
const formatDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Generate a unique announcement DB key. */
const generateAnnouncementId = () => `announcement-${Date.now()}`;

/** Generate a random 4-digit numeric string for use as an event DB key. */
const generateEventId = () => `${Math.floor(1000 + Math.random() * 9000)}`;

/**
 * Convert a cadet's email address to the Firebase key used to identify them.
 * e.g. "john.doe@example.com" → "john_doe_example_com"
 */
export const deriveCadetKeyFromEmail = (email: string): string =>
  email.trim().toLowerCase().replace(/@/g, "_").replace(/\./g, "_").replace(/-/g, "_");

/** Strip non-alphanumeric characters so last names match their attendance DB keys. */
const normalizeAttendanceKey = (input: string) => input.toLowerCase().replace(/[^a-z0-9]/g, "");
const sanitizeIndexKey = (input: string) => input.replace(/[\s\/\(\),\-]/g, "_");

/**
 * Determine which attendance subtree (PT or LLAB) an event belongs to
 * based on keywords in its name. Returns null if neither keyword is found.
 */
const inferAttendanceBucket = (eventName?: string): "PT" | "LLAB" | "RMP" | null => {
  const normalized = (eventName ?? "").toLowerCase();
  if (normalized.includes("pt")) return "PT";
  if (normalized.includes("rmp")) return "RMP";
  if (normalized.includes("llab") || normalized.includes("lab")) return "LLAB";
  return null;
};

// ─── Private listener starters ──────────────────────────────────────────────

/**
 * Fetch the permission map for a given AFROTC job title and patch the store.
 * Called once during initialization because job changes are semester-based.
 */
const fetchPermissionsForJob = async (job?: string) => {
  if (!job) {
    patchStore({ permissionsMap: defaultPermissionsMap() });
    touch("permissions");
    return;
  }

  try {
    const permissionsSnap = await get(ref(db, `indexes/permissions/${job}`));
    if (!permissionsSnap.exists()) {
      patchStore({ permissionsMap: defaultPermissionsMap() });
      patchError("permissions", undefined);
      touch("permissions");
      return;
    }

    const next = defaultPermissionsMap();
    Object.entries(permissionsSnap.val() as Record<string, unknown>).forEach(([permission, value]) => {
      next.set(permission, value === true);
    });

    patchStore({ permissionsMap: next });
    patchError("permissions", undefined);
    touch("permissions");
  } catch (error) {
    console.error("Failed to load permissions:", error);
    patchError("permissions", "Could not load permissions.");
  }
};

/**
 * Attach a realtime listener to the logged-in cadet's profile node.
 */
const startProfileListener = (cadetKey: string) => {
  const profileRef = ref(db, `cadets/${cadetKey}`);
  const unsubscribe = onValue(
    profileRef,
    (snapshot) => {
      const profile = (snapshot.val() as CadetProfile | null) ?? null;
      patchStore({ profile });
      patchError("profile", undefined);
      touch("profile");
    },
    (error) => {
      console.error("Profile listener failed:", error);
      patchError("profile", "Could not load profile.");
    }
  );

  addListener(unsubscribe);
};

/** Attach a realtime listener to the events node and normalize each entry into a CadetEvent. */
const startEventsListener = () => {
  const eventsRef = ref(db, "events");
  const unsubscribe = onValue(
    eventsRef,
    (snapshot) => {
      const eventsData = snapshot.val() as Record<string, any> | null;
      if (!eventsData) {
        patchStore({ events: [] });
        patchError("events", undefined);
        touch("events");
        return;
      }

      const loadedEvents: CadetEvent[] = Object.keys(eventsData)
        .map((key) => {
          const event = eventsData[key];
          const combinedDateTime = parseLocalDateTime(event.date, event.time);
          if (!combinedDateTime) {
            return null;
          }

          return {
            id: key,
            title: event.eventName,
            date: combinedDateTime,
            time: combinedDateTime,
            description: event.details,
            location: event.locationId,
            type: event.mandatory === true || event.mandatory === "true" ? "Mandatory" : "RSVP",
          } as CadetEvent;
        })
        .filter((event): event is CadetEvent => event !== null);

      patchStore({ events: loadedEvents });
      patchError("events", undefined);
      touch("events");
    },
    (error) => {
      console.error("Events listener failed:", error);
      patchError("events", "Could not load events.");
    }
  );

  addListener(unsubscribe);
};

/** Attach a realtime listener to announcements, sorted by importance (High → Low). */
const startAnnouncementsListener = () => {
  const announcementsRef = ref(db, "announcements");
  const unsubscribe = onValue(
    announcementsRef,
    (snapshot) => {
      const announcementsData = snapshot.val() as Record<string, any> | null;
      if (!announcementsData) {
        patchStore({ announcements: [] });
        patchError("announcements", undefined);
        touch("announcements");
        return;
      }

      const parsedAnnouncements: Announcement[] = Object.entries(announcementsData)
        .map(([id, value]) => {
          const parsedDate = parseLocalDateTime(value.retirementDate, "00:00:00");
          if (!parsedDate) {
            return null;
          }
          return {
            id,
            title: value.title,
            body: value.body,
            importance: value.importance,
            retirementDate: parsedDate,
          } as Announcement;
        })
        .filter((announcement): announcement is Announcement => announcement !== null);

      const importanceOrder: Record<string, number> = {
        High: 3,
        Medium: 2,
        Low: 1,
      };
      parsedAnnouncements.sort((a, b) => importanceOrder[b.importance] - importanceOrder[a.importance]);

      patchStore({ announcements: parsedAnnouncements });
      patchError("announcements", undefined);
      touch("announcements");
    },
    (error) => {
      console.error("Announcements listener failed:", error);
      patchError("announcements", "Could not load announcements.");
    }
  );

  addListener(unsubscribe);
};

/** Attach a realtime listener to the full RSVPs node and extract the current cadet's status for each event. */
const startRsvpListener = (cadetKey: string) => {
  const rsvpRef = ref(db, "rsvps");
  const unsubscribe = onValue(
    rsvpRef,
    (snapshot) => {
      const rsvpData = (snapshot.val() as Record<string, any>) || {};
      const selectedIds = new Set<string>();
      const statusByEvent: Record<string, boolean> = {};
      const rsvpCadetKeysByEvent: Record<string, string[]> = {};

      Object.entries(rsvpData).forEach(([eventId, eventNode]) => {
        const eventEntries = Object.entries((eventNode as Record<string, any>) || {});
        rsvpCadetKeysByEvent[eventId] = eventEntries
          .filter(([, attendeeNode]) => attendeeNode?.status === "Y")
          .map(([attendeeCadetKey]) => attendeeCadetKey);

        const userNode = (eventNode as Record<string, any>)[cadetKey];
        const status = userNode?.status;
        if (status === "Y") {
          selectedIds.add(eventId);
          statusByEvent[eventId] = true;
        } else if (status === "N") {
          statusByEvent[eventId] = false;
        }
      });

      patchStore({
        userRsvpEventIds: selectedIds,
        userRsvpStatusByEvent: statusByEvent,
        rsvpCadetKeysByEvent,
      });
      patchError("rsvps", undefined);
      touch("rsvps");
    },
    (error) => {
      console.error("RSVP listener failed:", error);
      patchError("rsvps", "Could not load RSVP status.");
    }
  );

  addListener(unsubscribe);
};

/** Attach a realtime listener to all cadet profiles; used as a lookup cache by Search and Public Profile. */
const startCadetsListener = () => {
  const cadetsRef = ref(db, "cadets");
  const unsubscribe = onValue(
    cadetsRef,
    (snapshot) => {
      const cadets = (snapshot.val() as Record<string, CadetProfile>) || {};
      patchStore({ cadetsByKey: cadets });
      patchError("cadets", undefined);
      touch("cadets");
    },
    (error) => {
      console.error("Cadets listener failed:", error);
      patchError("cadets", "Could not load cadets.");
    }
  );

  addListener(unsubscribe);
};

/** Attach a realtime listener to uploadedDocuments, sorted alphabetically by display name. */
const startDocumentsListener = () => {
  const uploadsRef = ref(db, "uploadedDocuments");
  const unsubscribe = onValue(
    uploadsRef,
    (snapshot) => {
      const data = snapshot.val() as Record<string, any> | null;
      if (!data) {
        patchStore({ uploadedDocuments: [] });
        patchError("documents", undefined);
        touch("documents");
        return;
      }

      const parsedDocuments: UploadedDocument[] = Object.entries(data).map(([key, value]) => ({
        dbKey: key,
        displayName: value.displayName ?? value.fileName,
        fileName: value.fileName,
        mimeType: value.mimeType,
        sizeBytes: value.sizeBytes,
        uploadedAt: value.uploadedAt,
        downloadURL: value.downloadURL,
        storagePath: value.storagePath,
        uploadedBy: value.uploadedBy,
      }));

      parsedDocuments.sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" }));

      patchStore({ uploadedDocuments: parsedDocuments });
      patchError("documents", undefined);
      touch("documents");
    },
    (error) => {
      console.error("Documents listener failed:", error);
      patchError("documents", "Could not load documents.");
    }
  );

  addListener(unsubscribe);
};

/** Attach realtime listeners to PT and LLAB attendance subtrees. */
const startAttendanceListeners = () => {
  const attendancePTRef = ref(db, "attendance/PT");
  const unsubscribePT = onValue(
    attendancePTRef,
    (snapshot) => {
      const attendancePT = (snapshot.val() as AttendanceSubtree | null) ?? {};
      patchStore({ attendancePT });
      patchError("attendance", undefined);
      touch("attendance");
    },
    (error) => {
      console.error("Attendance PT listener failed:", error);
      patchError("attendance", "Could not load attendance.");
    }
  );

  const attendanceLLABRef = ref(db, "attendance/LLAB");
  const unsubscribeLLAB = onValue(
    attendanceLLABRef,
    (snapshot) => {
      const attendanceLLAB = (snapshot.val() as AttendanceSubtree | null) ?? {};
      patchStore({ attendanceLLAB });
      patchError("attendance", undefined);
      touch("attendance");
    },
    (error) => {
      console.error("Attendance LLAB listener failed:", error);
      patchError("attendance", "Could not load attendance.");
    }
  );

  addListener(unsubscribePT);
  addListener(unsubscribeLLAB);

  const attendanceRMPRef = ref(db, "attendance/RMP");
  const unsubscribeRMP = onValue(
    attendanceRMPRef,
    (snapshot) => {
      const attendanceRMP = (snapshot.val() as AttendanceSubtree | null) ?? {};
      patchStore({ attendanceRMP });
      patchError("attendance", undefined);
      touch("attendance");
    },
    (error) => {
      console.error("Attendance RMP listener failed:", error);
      patchError("attendance", "Could not load attendance.");
    }
  );

  addListener(unsubscribeRMP);
};

// ─── Public lifecycle API ────────────────────────────────────────────────────

/**
 * Initialize the global store for the logged-in cadet.
 *
 * - If `cadetKeyInput` is omitted, the key is read from AsyncStorage.
 * - Starts all realtime listeners (profile, events, announcements, RSVPs, cadets, documents, attendance).
 * - Safe to call multiple times; re-entrant calls while initializing are ignored.
 */
export const initializeGlobals = async (cadetKeyInput?: string | null) => {
  if (store.isInitializing) {
    return;
  }

  patchStore({ isInitializing: true });

  try {
    const cadetKey = cadetKeyInput ?? (await AsyncStorage.getItem("currentCadetKey"));

    clearListeners();

    if (!cadetKey) {
      patchStore({
        ...initialState,
        isInitialized: true,
        isInitializing: false,
      });
      return;
    }

    patchStore({
      cadetKey,
      isInitialized: false,
      isInitializing: true,
      errors: {},
    });

    startProfileListener(cadetKey);
    startEventsListener();
    startAnnouncementsListener();
    startRsvpListener(cadetKey);
    startCadetsListener();
    startDocumentsListener();
    startAttendanceListeners();

    // Cadet jobs change infrequently (semester cadence), so load permissions once at init.
    const initialProfileSnap = await get(ref(db, `cadets/${cadetKey}`));
    const initialProfile = (initialProfileSnap.val() as CadetProfile | null) ?? null;
    await fetchPermissionsForJob(initialProfile?.job);

    patchStore({
      isInitialized: true,
      isInitializing: false,
    });
  } catch (error) {
    console.error("Failed to initialize globals:", error);
    patchStore({
      isInitialized: false,
      isInitializing: false,
      errors: {
        ...store.errors,
        profile: "Could not initialize session.",
      },
    });
  }
};

/**
 * Stop all realtime listeners and reset the store to its initial (logged-out) state.
 * Call this on logout.
 */
export const teardownGlobals = () => {
  clearListeners();
  patchStore({
    ...initialState,
    isInitialized: true,
    isInitializing: false,
  });
};

/** Non-hook snapshot access for use outside React components (e.g. write actions). */
export const getGlobalsSnapshot = () => store;

/**
 * React hook that subscribes a component to the global store.
 *
 * IMPORTANT: Must be called inside a React component or custom hook body —
 * never at module scope, as it calls useSyncExternalStore internally.
 *
 * The snapshot getter returns `store` directly (not a spread copy) to maintain
 * referential stability and avoid an infinite render loop.
 */
export const globals = () =>
  useSyncExternalStore(
    (listener) => {
      subscribers.add(listener);
      return () => {
        subscribers.delete(listener);
      };
    },
    () => store,
    () => store
  );

// ─── Convenience helpers ─────────────────────────────────────────────────────

/** Synchronous permission check against the current store (no React subscription). */
export const hasPermission = (permission: string): boolean => store.permissionsMap.get(permission) ?? false;

// ─── Admin write helpers ─────────────────────────────────────────────────────

export const updateCadetField = async (
  cadetKey: string,
  fieldPath: "firstName" | "lastName" | "cadetRank" | "classYear" | "flight" | "job" | "contact/schoolEmail" | "contact/personalEmail" | "contact/cellPhone",
  value: string
) => {
  const fieldRef = ref(db, `cadets/${cadetKey}/${fieldPath}`);
  const oldValueSnap = await get(fieldRef);
  const oldRawValue = oldValueSnap.exists() ? oldValueSnap.val() : "";
  const normalized = value.trim();
  await set(fieldRef, normalized);

  if (fieldPath !== "classYear" && fieldPath !== "flight") {
    return;
  }

  const oldValue = oldRawValue == null ? "" : String(oldRawValue);
  const oldKey = sanitizeIndexKey(oldValue);
  const newKey = sanitizeIndexKey(normalized);
  const indexRoot = fieldPath === "classYear" ? "indexes/classYear" : "indexes/flight";

  if (oldKey && oldKey !== newKey) {
    await remove(ref(db, `${indexRoot}/${oldKey}/${cadetKey}`));
  }
  if (newKey) {
    await set(ref(db, `${indexRoot}/${newKey}/${cadetKey}`), true);
  }
};

export const updateCadetJobAssignment = async (cadetKey: string, job: string) => {
  await updateCadetField(cadetKey, "job", job);
};

export const updateAttendanceCell = async (
  bucket: "PT" | "LLAB" | "RMP",
  date: string,
  cadetRowKey: string,
  status: AttendanceRecordStatus
) => {
  const nextStatus = status.trim().toUpperCase() as AttendanceRecordStatus;
  const allowed = new Set<AttendanceRecordStatus>(["P", "A", "E", "L", "MP", "MA", "ME", "ML", "."]);
  if (!allowed.has(nextStatus)) {
    throw new Error("Attendance status must be one of: P, A, E, L, MP, MA, ME, ML, .");
  }

  await set(ref(db, `attendance/${bucket}/${date}/${cadetRowKey}`), {
    status: nextStatus,
    Status: nextStatus,
  });
};

// ─── Write actions ───────────────────────────────────────────────────────────

/** Create or update an announcement. Returns the DB key used. */
export const upsertAnnouncement = async (announcement: Omit<Announcement, "id"> & { id?: string }) => {
  const id = announcement.id || generateAnnouncementId();
  await set(ref(db, `announcements/${id}`), {
    title: announcement.title,
    retirementDate: formatDateOnly(announcement.retirementDate),
    body: announcement.body,
    importance: announcement.importance,
  });
  return id;
};

/** Remove an announcement from the database by its ID. */
export const deleteAnnouncement = async (announcementId: string) => {
  await set(ref(db, `announcements/${announcementId}`), null);
};

/** Set the logged-in cadet's RSVP for an event to Y (confirming=true) or N. */
export const setUserRsvpStatus = async (eventId: string, confirming: boolean) => {
  if (!store.cadetKey) {
    throw new Error("No user is logged in.");
  }

  await set(ref(db, `rsvps/${eventId}/${store.cadetKey}`), {
    status: confirming ? "Y" : "N",
  });
};

/**
 * Persist a new event to the database.
 * For RSVP events, also initialises the rsvps node.
 * For special events (LLAB / PT / RMP), seeds the attendance subtree.
 */
export const addEvent = async (event: Omit<CadetEvent, "id"> & { id?: string }) => {
  const id = event.id || generateEventId();
  const eventDate = formatDateOnly(event.date);

  await set(ref(db, `events/${id}`), {
    eventName: event.title,
    date: eventDate,
    time: event.time.toTimeString().split(" ")[0],
    details: event.description,
    locationId: event.location,
    mandatory: event.type === "Mandatory" ? "true" : "false",
  });

  if (event.type === "RSVP") {
    await set(ref(db, `rsvps/${id}`), "");
  }

  const title = event.title.toUpperCase();
  if (title === "LLAB" || title === "PT" || title === "RMP") {
    await set(ref(db, `attendance/${title}/${eventDate}/Last Name`), {
      status: ".",
    });
  }

  return id;
};

/** Delete an event and its associated RSVP node. */
export const removeEvent = async (eventId: string) => {
  await set(ref(db, `events/${eventId}`), null);
  await set(ref(db, `rsvps/${eventId}`), null);
};

/**
 * Fetch today's events and build the cadet list needed by the Attendance tool.
 * Cadets are derived from the in-memory cadetsByKey cache (startCadetsListener must
 * have run first). Events are fetched fresh from the DB to guarantee up-to-date times.
 */
export const loadAttendanceToolsData = async () => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const eventsSnap = await get(ref(db, "events"));
  const eventsData = (eventsSnap.val() ?? {}) as Record<string, AttendanceEventItem>;
  const todayEvents = Object.entries(eventsData)
    .map(([id, value]) => {
      const { id: _ignoredId, ...rest } = value;
      return { id, ...rest };
    })
    .filter((event) => event.date === today && !!event.eventName)
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));

  const cadets = Object.entries(store.cadetsByKey)
    .map(([key, value]) => {
      const firstName = value.firstName ?? "";
      const lastName = value.lastName ?? "";
      const fullName = `${firstName} ${lastName}`.trim() || key;

      return {
        cadetKey: key,
        firstName,
        lastName,
        fullName,
        attendanceKey: normalizeAttendanceKey(lastName || key),
        flight: value.flight,
      } as AttendanceCadetItem;
    })
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

  return {
    todayEvents,
    cadets,
  };
};

/**
 * Write attendance statuses for all cadets for a given event.
 * The event name must contain "PT" or "LLAB" so the correct bucket can be inferred.
 */
export const saveAttendanceForEvent = async (
  eventId: string,
  todayEvents: AttendanceEventItem[],
  allCadets: AttendanceCadetItem[],
  overrides: Record<string, AttendanceStatus>
) => {
  const chosenEvent = todayEvents.find((event) => event.id === eventId);
  if (!chosenEvent) {
    throw new Error("Please select an event.");
  }

  const bucket = inferAttendanceBucket(chosenEvent.eventName);
  if (!bucket) {
    throw new Error('Could not tell whether this event is PT or LLAB. Add "PT" or "LLAB" to the event name.');
  }

  const date = chosenEvent.date;
  if (!date) {
    throw new Error("Selected event is missing a date.");
  }

  const updates: Record<string, { status: AttendanceStatus }> = {};
  for (const cadet of allCadets) {
    const chosenStatus = overrides[cadet.cadetKey] ?? "A";
    updates[`attendance/${bucket}/${date}/${cadet.attendanceKey}`] = {
      status: chosenStatus,
    };
  }

  await update(ref(db), updates);
};

/** Remove all attendance records for a given event date from the database. */
export const clearAttendanceForEvent = async (eventId: string, todayEvents: AttendanceEventItem[]) => {
  const chosenEvent = todayEvents.find((event) => event.id === eventId);
  if (!chosenEvent) {
    throw new Error("Please select an event.");
  }

  const bucket = inferAttendanceBucket(chosenEvent.eventName);
  if (!bucket) {
    throw new Error('Could not tell whether this event is PT or LLAB. Add "PT" or "LLAB" to the event name.');
  }

  if (!chosenEvent.date) {
    throw new Error("Selected event is missing a date.");
  }

  await remove(ref(db, `attendance/${bucket}/${chosenEvent.date}`));
};

/**
 * Upload a local file URI to Firebase Storage and record its metadata in the database.
 * Returns the generated DB key and the uploads root ref.
 */
export const uploadDocumentFromUri = async (input: UploadDocumentInput) => {
  const cadetKey = store.cadetKey ?? (await AsyncStorage.getItem("currentCadetKey")) ?? "unknown";
  const extension = input.originalFileName.match(/\.[^/.]+$/)?.[0] ?? "";
  const fileName = `${Date.now()}_${input.displayName}${extension}`;
  const storagePath = `uploadedDocuments/${fileName}`;

  const response = await fetch(input.uri);
  const blob = await response.blob();
  const fileRef = storageRef(storage, storagePath);
  await uploadBytes(fileRef, blob);
  const downloadURL = await getDownloadURL(fileRef);

  const uploadsRoot = ref(db, "uploadedDocuments");
  const uploadKey = `upload-${Date.now()}`;
  await set(ref(db, `uploadedDocuments/${uploadKey}`), {
    uploadedBy: cadetKey,
    displayName: input.displayName,
    fileName: input.originalFileName,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
    uploadedAt: new Date().toISOString(),
    downloadURL,
    storagePath,
  });

  return { uploadKey, uploadsRoot };
};

/** Delete a document from both Firebase Storage and the database index. */
export const deleteUploadedDocument = async (dbKey: string, path: string) => {
  await deleteObject(storageRef(storage, path));
  await remove(ref(db, `uploadedDocuments/${dbKey}`));
};

/**
 * Return a cadet's profile by their key.
 * Checks the in-memory cache first; falls back to a one-time database read.
 */
export const getProfileByCadetKey = async (cadetKey: string) => {
  const cached = store.cadetsByKey[cadetKey];
  if (cached) {
    return cached;
  }
  const profileSnap = await get(ref(db, `cadets/${cadetKey}`));
  return (profileSnap.val() as CadetProfile | null) ?? null;
};

// ─── Cadet account creation ──────────────────────────────────────────────────

/**
 * Get or create a secondary Firebase Auth instance for account creation.
 * (Used to create new user accounts without logging in as them.)
 */
const getSecondaryAuth = () => {
  const existing = getApps().find((a: any) => a.name === "secondary");
  if (existing) return getAuth(existing);

  const primaryApp = getApps().find((a: any) => a.name === "[DEFAULT]");
  if (!primaryApp) throw new Error("Firebase not initialized yet.");

  const secondary = initializeApp(primaryApp.options, "secondary");
  return getAuth(secondary);
};


/**
 * Create a new cadet account with auth and database entries.
 *
 * Steps:
 * 1. Create auth user with secondary Firebase instance
 * 2. Build cadet key from email and write profile to database
 * 3. Write indexes for classYear, flight, and job
 *
 * Throws an error if any step fails.
 */
export const 

createCadetAccount = async (input: CreateAccountForm) => {
  // Step 1 — Auth
  console.log("Step 1: Getting secondary auth...");
  const secondaryAuth = getSecondaryAuth();
  await createUserWithEmailAndPassword(secondaryAuth, input.schoolEmail, TEMP_PASSWORD);
  await secondaryAuth.signOut();
  console.log("Step 1: Auth done.");

  // Step 2 — Build cadet key and write profile
  const cadetId = deriveCadetKeyFromEmail(input.schoolEmail);
  console.log("Step 2: cadetId =", cadetId);

  await set(ref(db, `cadets/${cadetId}`), {
    classYear: input.classYear,
    lastName: input.lastName,
    firstName: input.firstName,
    cadetRank: input.cadetRank,
    flight: input.flight,
    job: "",
    contact: {
      schoolEmail: input.schoolEmail,
      personalEmail: input.personalEmail,
      cellPhone: input.cellPhone,
    },
  });
  console.log("Step 2: Cadet profile written.");

  // Step 3 — Write indexes
  const classYearKey = input.classYear.replace(/[\s\/\(\),\-]/g, "_");
  console.log("Step 3a: classYearKey =", classYearKey);
  if (classYearKey) {
    await set(ref(db, `indexes/classYear/${classYearKey}/${cadetId}`), true);
    console.log("Step 3a: classYear index written.");
  } else {
    console.log("Step 3a: SKIPPED — classYear was empty.");
  }

  const flightKey = input.flight.replace(/[\s\/\(\),\-]/g, "_");
  console.log("Step 3b: flightKey =", flightKey);
  if (flightKey) {
    await set(ref(db, `indexes/flight/${flightKey}/${cadetId}`), true);
    console.log("Step 3b: flight index written.");
  } else {
    console.log("Step 3b: SKIPPED — flight was empty.");
  }

  return cadetId;
};
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, get, update, remove } from "firebase/database";
import { db } from "../../../firebase/config";

export type CadetProfile = {
  firstName?: string;
  lastName?: string;
  cadetRank?: string;
  job?: string;
  flight?: string;
  classYear?: number;
  contact?: {
    schoolEmail?: string;
    personalEmail?: string;
    cellPhone?: string;
  };
};

export type JobsActionId =
  | "attendance"
  | "files"
  | "create_accounts"
  | "event_making";

export type JobsAction = {
  id: JobsActionId;
  title: string;
  subtitle: string;
  routeHint?: string;
  allowed: boolean;
};

export type EventItem = {
  id: string;
  eventName?: string;
  date?: string;
  time?: string;
  details?: string;
  locationId?: string;
  mandatory?: boolean;
};

export type CadetListItem = {
  cadetKey: string;
  firstName: string;
  lastName: string;
  fullName: string;
  attendanceKey: string;
};

export type AttendanceStatus = "P" | "A" | "L";

function sanitizeKey(value: string): string {
  return value.trim().replace(/[.#$[\]/]/g, "_");
}

function normalizeAttendanceKey(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function inferAttendanceBucket(eventName?: string): "PT" | "LLAB" | null {
  const name = (eventName ?? "").toLowerCase();
  if (name.includes("pt")) return "PT";
  if (name.includes("llab") || name.includes("lab")) return "LLAB";
  return null;
}

export function useJobsLogic() {
  const [cadetKey, setCadetKey] = useState<string | null>(null);
  const [profile, setProfile] = useState<CadetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [permissionNames, setPermissionNames] = useState<string[]>([]);
  const [isAll, setIsAll] = useState(false);
  const [canTakeAttendance, setCanTakeAttendance] = useState(false);
  const [canUploadFiles, setCanUploadFiles] = useState(false);
  const [canMakeEvents, setCanMakeEvents] = useState(false);

  // attendance modal data
  const [todayEvents, setTodayEvents] = useState<EventItem[]>([]);
  const [allCadets, setAllCadets] = useState<CadetListItem[]>([]);
  const [loadingAttendanceTools, setLoadingAttendanceTools] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const key = await AsyncStorage.getItem("currentCadetKey");
        setCadetKey(key);

        if (!key) {
          setError("No user is logged in.");
          return;
        }

        // 1. Load cadet profile to get their job title
        const profileSnap = await get(ref(db, `cadets/${key}`));
        if (!profileSnap.exists()) {
          setError("No profile found for this user.");
          return;
        }

        const cadetData = profileSnap.val() as CadetProfile;
        setProfile(cadetData);

        // 2. Use job to look up permissions from the index
        const job = cadetData.job;
        if (!job || job === "N/A") {
          setPermissionNames([]);
          return;
        }

        const jobKey = sanitizeKey(job);
        const permSnap = await get(ref(db, `indexes/permissions/${jobKey}`));

        if (!permSnap.exists()) {
          setPermissionNames([]);
          return;
        }

        // Firebase shape: { "All": true, "Attendance_Taking": true, ... }
        const permObj = permSnap.val() as Record<string, boolean>;
        const perms = Object.keys(permObj).filter((k) => permObj[k] === true);
        setPermissionNames(perms);

        // 3. Derive capability flags from permission keys
        const all = perms.includes("All");
        setIsAll(all);
        setCanTakeAttendance(all || perms.includes("Attendance_Taking"));
        setCanUploadFiles(all || perms.includes("File_Uploading"));
        setCanMakeEvents(all || perms.includes("Event_Making"));

      } catch (e) {
        console.error("❌ Error reading jobs/permissions:", e);
        setError("Could not load jobs & permissions.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  async function loadAttendanceModalData() {
    setLoadingAttendanceTools(true);

    try {
      const today = getTodayString();

      // load today's events
      const eventsSnap = await get(ref(db, "events"));
      const eventsData = (eventsSnap.val() ?? {}) as Record<string, EventItem>;

      const todaysEvents = Object.entries(eventsData)
        .map(([id, value]) => {
          const { id: _ignoredId, ...rest } = value;
          return { id, ...rest };
        })
        .filter((event) => event.date === today && !!event.eventName)
        .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));

      setTodayEvents(todaysEvents);

      // load cadets
      const cadetsSnap = await get(ref(db, "cadets"));
      const cadetsData = (cadetsSnap.val() ?? {}) as Record<string, CadetProfile>;

      const cadetList = Object.entries(cadetsData)
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
          };
        })
        .sort((a, b) => a.fullName.localeCompare(b.fullName));

      setAllCadets(cadetList);
    } catch (e) {
      console.error("❌ Error loading attendance modal data:", e);
      throw e;
    } finally {
      setLoadingAttendanceTools(false);
    }
  }

  async function saveAttendanceForEvent(
    selectedEventId: string,
    overrides: Record<string, AttendanceStatus>
  ) {
    const selectedEvent = todayEvents.find((event) => event.id === selectedEventId);
    if (!selectedEvent) throw new Error("Please select an event.");

    const bucket = inferAttendanceBucket(selectedEvent.eventName);
    if (!bucket) throw new Error('Add "PT" or "LLAB" to the event name.');

    const date = selectedEvent.date;
    if (!date) throw new Error("Selected event does not have a valid date.");

    const updates: Record<string, { status: AttendanceStatus }> = {};

    for (const cadet of allCadets) {
      const chosenStatus = overrides[cadet.cadetKey] ?? "P";
      updates[`attendance/${bucket}/${date}/${cadet.attendanceKey}`] = {
        status: chosenStatus,
      };
    }

    await update(ref(db), updates);
  }

  async function clearAttendanceForEvent(selectedEventId: string) {
    const selectedEvent = todayEvents.find((event) => event.id === selectedEventId);
    if (!selectedEvent) throw new Error("Please select an event.");

    const bucket = inferAttendanceBucket(selectedEvent.eventName);
    if (!bucket) throw new Error('Add "PT" or "LLAB" to the event name.');

    const date = selectedEvent.date;
    if (!date) throw new Error("Selected event does not have a valid date.");

    await remove(ref(db, `attendance/${bucket}/${date}`));
  }

  const actions = useMemo<JobsAction[]>(() => {
    const result: JobsAction[] = [];

    if (canTakeAttendance) {
      result.push({
        id: "attendance",
        title: "Take Attendance",
        subtitle: "Mark PT / LLAB attendance for cadets",
        allowed: true,
        // no routeHint — opens modal in Jobs.tsx instead
      });
    }

    if (canUploadFiles) {
      result.push({
        id: "files",
        title: "Upload Files",
        subtitle: "Upload PDFs and other documents for cadets",
        routeHint: "Files",
        allowed: true,
      });
    }

    if (canMakeEvents) {
      result.push({
        id: "event_making",
        title: "Event Making",
        subtitle: "Create and publish events to the wing calendar",
        routeHint: "Events",
        allowed: true,
      });
    }

    if (isAll) {
      result.push({
        id: "create_accounts",
        title: "Create Accounts",
        subtitle: "Create new cadet accounts (admin-only)",
        allowed: true,
      });
    }

    return result;
  }, [canTakeAttendance, canUploadFiles, canMakeEvents, isAll]);

  return useMemo(
    () => ({
      cadetKey,
      profile,
      loading,
      error,
      permissionNames,
      isAll,
      canTakeAttendance,
      canUploadFiles,
      canMakeEvents,
      actions,
      todayEvents,
      allCadets,
      loadingAttendanceTools,
      loadAttendanceModalData,
      saveAttendanceForEvent,
      clearAttendanceForEvent,
    }),
    [
      cadetKey,
      profile,
      loading,
      error,
      permissionNames,
      isAll,
      canTakeAttendance,
      canUploadFiles,
      canMakeEvents,
      actions,
      todayEvents,
      allCadets,
      loadingAttendanceTools,
    ]
  );
}
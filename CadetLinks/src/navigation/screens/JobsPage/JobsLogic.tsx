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
  permissions?: string;
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

function parsePermissions(permissionString?: string): string[] {
  if (!permissionString) return [];

  return permissionString
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.toLowerCase() !== "n/a");
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
          setProfile(null);
          setPermissionNames([]);
          setIsAll(false);
          setCanTakeAttendance(false);
          setCanUploadFiles(false);
          setCanMakeEvents(false);
          setError("No user is logged in.");
          return;
        }

        // load logged-in cadet profile
        const profileRef = ref(db, `cadets/${key}`);
        const profileSnap = await get(profileRef);

        if (!profileSnap.exists()) {
          setProfile(null);
          setPermissionNames([]);
          setIsAll(false);
          setCanTakeAttendance(false);
          setCanUploadFiles(false);
          setCanMakeEvents(false);
          setError("No profile found for this user.");
          return;
        }

        const cadetData = profileSnap.val() as CadetProfile;
        setProfile(cadetData);

        // permissions come from cadets/{key}/permissions
        const parsedPermissions = parsePermissions(cadetData.permissions);
        setPermissionNames(parsedPermissions);

        const all = parsedPermissions.includes("All");
        const attendance =
          all || parsedPermissions.includes("Attendance Taking");
        const files = all || parsedPermissions.includes("File Uploading");
        const events = all || parsedPermissions.includes("Event Making");

        setIsAll(all);
        setCanTakeAttendance(attendance);
        setCanUploadFiles(files);
        setCanMakeEvents(events);
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
      const eventsRef = ref(db, "events");
      const eventsSnap = await get(eventsRef);
      const eventsData = (eventsSnap.val() ?? {}) as Record<string, EventItem>;

      const todaysEvents = Object.entries(eventsData)
        .map(([id, value]) => {
          const { id: _ignoredId, ...rest } = value;
          return {
            id,
            ...rest,
          };
        })
        .filter((event) => event.date === today && !!event.eventName)
        .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));

      setTodayEvents(todaysEvents);

      // load cadets
      const cadetsRef = ref(db, "cadets");
      const cadetsSnap = await get(cadetsRef);
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

    if (!selectedEvent) {
      throw new Error("Please select an event.");
    }

    const bucket = inferAttendanceBucket(selectedEvent.eventName);

    if (!bucket) {
      throw new Error(
        'Could not tell whether this event is PT or LLAB. Add "PT" or "LLAB" to the event name, or add an attendanceType field.'
      );
    }

    const date = selectedEvent.date;
    if (!date) {
      throw new Error("Selected event does not have a valid date.");
    }

    const updates: Record<string, { status: AttendanceStatus }> = {};

    // everyone defaults to present
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

    if (!selectedEvent) {
      throw new Error("Please select an event.");
    }

    const bucket = inferAttendanceBucket(selectedEvent.eventName);

    if (!bucket) {
      throw new Error(
        'Could not tell whether this event is PT or LLAB. Add "PT" or "LLAB" to the event name, or add an attendanceType field.'
      );
    }

    const date = selectedEvent.date;
    if (!date) {
      throw new Error("Selected event does not have a valid date.");
    }

    await remove(ref(db, `attendance/${bucket}/${date}`));
  }

  // only show actions the cadet is actually allowed to use
  const actions: JobsAction[] = [];

  if (canTakeAttendance) {
    actions.push({
      id: "attendance",
      title: "Take Attendance",
      subtitle: "Mark PT / LLAB attendance for cadets",
      allowed: true,
    });
  }

  if (canUploadFiles) {
    actions.push({
      id: "files",
      title: "Upload Files",
      subtitle: "Upload PDFs and other documents for cadets",
      routeHint: "Files",
      allowed: true,
    });
  }

  if (canMakeEvents) {
    actions.push({
      id: "event_making",
      title: "Event Making",
      subtitle: "Create and publish events to the wing calendar",
      routeHint: "Events",
      allowed: true,
    });
  }

  // Create Accounts = All only
  if (isAll) {
    actions.push({
      id: "create_accounts",
      title: "Create Accounts",
      subtitle: "Create new cadet accounts (admin-only)",
      allowed: true,
    });
  }

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
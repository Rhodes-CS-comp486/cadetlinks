// JobsLogic.tsx
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, get } from "firebase/database";
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

function parsePermissions(permissionString?: string): string[] {
  if (!permissionString) return [];

  // handles:
  // "All"
  // "Attendance Taking"
  // "File Uploading, Attendance Taking"
  // "n/a"
  return permissionString
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.toLowerCase() !== "n/a");
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

        // NEW: permissions now come directly from cadets/{key}/permissions
        const parsedPermissions = parsePermissions(cadetData.permissions);
        setPermissionNames(parsedPermissions);

        const all = parsedPermissions.includes("All");
        const attendance =
          all || parsedPermissions.includes("Attendance Taking");
        const files =
          all || parsedPermissions.includes("File Uploading");
        const events =
          all || parsedPermissions.includes("Event Making");

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

  // only show actions the cadet is actually allowed to use
  const actions: JobsAction[] = [];

  if (canTakeAttendance) {
    actions.push({
      id: "attendance",
      title: "Take Attendance",
      subtitle: "Mark PT / LLAB attendance for cadets",
      routeHint: "Attendance", // change if your real route name is different
      allowed: true,
    });
  }

  if (canUploadFiles) {
    actions.push({
      id: "files",
      title: "Upload Files",
      subtitle: "Upload PDFs and other documents for cadets",
      routeHint: "Files", // change if your real route name is different
      allowed: true,
    });
  }

  if (canMakeEvents) {
    actions.push({
      id: "event_making",
      title: "Event Making",
      subtitle: "Create and publish events to the wing calendar",
      routeHint: "Events", // change if your real route name is different
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
    ]
  );
}
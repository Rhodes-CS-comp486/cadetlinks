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

function sanitizeKey(value: string): string {
  return value.trim().replace(/[.#$[\]/]/g, "_");
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

  const actions = useMemo<JobsAction[]>(() => {
    const result: JobsAction[] = [];

    if (canTakeAttendance) {
      result.push({
        id: "attendance",
        title: "Take Attendance",
        subtitle: "Mark PT / LLAB attendance for cadets",
        routeHint: "Attendance",
        allowed: true,
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
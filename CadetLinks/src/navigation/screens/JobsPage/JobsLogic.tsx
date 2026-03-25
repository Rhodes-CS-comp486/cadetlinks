import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, get } from "firebase/database";
import { db } from "../../../firebase/config";
import { useHomeLogic } from "../HomePage/HomeLogic";
import { PERMISSIONS } from "../../../assets/constants";
import { CadetProfile, JobsActionId} from "../../../assets/types";


// export type JobsActionId =
//   | "attendance_editing"
//   | "file_uploading"
//   | "create_accounts"
//   | "event_making";



export type JobsAction = {
  id: JobsActionId;
  title: string;
  subtitle: string;
  routeHint?: string;
  allowed: boolean;
};

export function useJobsLogic() {
  const { cadetPermissionsMap } = useHomeLogic();
  const [cadetKey, setCadetKey] = useState<string | null>(null);

  const [profile, setProfile] = useState<CadetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canTakeAttendance = cadetPermissionsMap.get(PERMISSIONS.ATTENDANCE_EDITING) ?? false;
  const canUploadFiles = cadetPermissionsMap.get(PERMISSIONS.FILE_UPLOADING) ?? false;
  const canMakeEvents = cadetPermissionsMap.get(PERMISSIONS.EVENT_MAKING) ?? false;
  const isAll = canTakeAttendance && canUploadFiles && canMakeEvents;
  
  const permissionNames = useMemo(
    () =>
      Array.from(cadetPermissionsMap.entries())
        .filter(([_, value]) => value === true)
        .map(([key, _]) => key),
    [cadetPermissionsMap]
  );

  //loading users overview of data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const key = await AsyncStorage.getItem("currentCadetKey");
        setCadetKey(key);

        if (!key) {
          setProfile(null);
          setError("No user is logged in.");
          return;
        }

        // load logged-in cadet profile
        const profileRef = ref(db, `cadets/${key}`);
        const profileSnap = await get(profileRef);

        if (!profileSnap.exists()) {
          setProfile(null);
          setError("No profile found for this user.");
          return;
        }

        const cadetData = profileSnap.val() as CadetProfile;
        setProfile(cadetData);


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
      id: PERMISSIONS.ATTENDANCE_EDITING,
      title: "Take Attendance",
      subtitle: "Mark PT / LLAB attendance for cadets",
      allowed: true,
    });
  }

  if (canUploadFiles) {
    actions.push({
      id: PERMISSIONS.FILE_UPLOADING,
      title: "Upload Files",
      subtitle: "Upload PDFs and other documents for cadets",
      routeHint: "Files",
      allowed: true,
    });
  }

  if (canMakeEvents) {
    actions.push({
      id: PERMISSIONS.EVENT_MAKING,
      title: "Event Making",
      subtitle: "Create and publish events to the wing calendar",
      routeHint: "Events",
      allowed: true,
    });
  }

  // Create Accounts = All only
  if (isAll) {
    actions.push({
      id: PERMISSIONS.CREATE_ACCOUNTS,
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
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, get } from "firebase/database";
import { db } from "../../../firebase/config";
import { useHomeLogic } from "../HomePage/HomeLogic";
import { PERMISSIONS } from "../../../assets/constants";
import { CadetProfile, JobsAction } from "../../../assets/types";
import { useDocumentUploadingLogic } from "./UploadDocsLogic";
import { useAttendanceLogic } from "./AttendanceLogic";
import { useNavigation } from "@react-navigation/core";

type NavAny = ReturnType<typeof useNavigation<any>>;

export function iconForAction(id: JobsAction["id"]) { // this function maps icons to actions.
  switch (id) {
    case PERMISSIONS.ATTENDANCE_EDITING:
      return "checkbox-outline";
    case PERMISSIONS.FILE_UPLOADING:
      return "cloud-upload-outline";
    case PERMISSIONS.CREATE_ACCOUNTS:
      return "person-add-outline";
    case PERMISSIONS.EVENT_MAKING:
      return "calendar-outline";
    default:
      return "briefcase-outline";
  }
}

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
  const attendance = useAttendanceLogic();
  const documentUploading = useDocumentUploadingLogic();
  const navigation: NavAny = useNavigation();

  const permissionNames = useMemo(
    () =>
      Array.from(cadetPermissionsMap.entries())
        .filter(([_, value]) => value === true)
        .map(([key, _]) => key),
    [cadetPermissionsMap]
  );

  const permissionText =
    permissionNames.length > 0 ? permissionNames.join(", ") : "None"; // gets permission names or "none"

 

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
  
  const onPressAction = async (a: JobsAction) => {
      if (!a.allowed) return;
  
      if (a.id === PERMISSIONS.ATTENDANCE_EDITING) {
        console.log("Opening attendance modal and type:", attendance.attendanceModalVisible, typeof attendance.openAttendanceModal);
        attendance.openAttendanceModal();
        return;
      }
  
      if (a.id === PERMISSIONS.FILE_UPLOADING) {
        await documentUploading.openDocumentUploadingModal();
        return;
      }
  
      if (!a.routeHint) return; 
      navigation.navigate(a.routeHint);
    };

    const fullName =
    profile?.firstName || profile?.lastName
      ? `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()
      : "Cadet"; // grabs cadet name from profile (cadet if no name)

  const jobText = profile?.job ?? "—"; // grabs job from profile (dash if no job)

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

  const anyVisibleActions = actions.length > 0;

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
      onPressAction,
      attendance,
      documentUploading,
      fullName,
      jobText,
      permissionText,
      anyVisibleActions,
      navigation
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
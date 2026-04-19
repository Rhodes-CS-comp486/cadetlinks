import { useEffect, useMemo } from "react";
import { PERMISSIONS } from "../../../assets/constants";
import { CadetProfile, Action } from "../../../assets/types";
import { useDocumentUploadingLogic } from "./UploadDocsLogic";
import { useAttendanceLogic } from "./AttendanceLogic";
import { useNavigation } from "@react-navigation/core";
import { globals, initializeGlobals } from "../../../firebase/dbController";

type NavAny = ReturnType<typeof useNavigation<any>>;

export function iconForAction(id: Action["id"]) { // this function maps icons to actions.
  switch (id) {
    case PERMISSIONS.ATTENDANCE_EDITING:
      return "checkbox-outline";
    case PERMISSIONS.FILE_UPLOADING:
      return "cloud-upload-outline";
    case PERMISSIONS.ADMIN:
      return "person-add-outline";
    case PERMISSIONS.EVENT_MAKING:
      return "calendar-outline";
    default:
      return "briefcase-outline";
  }
}

export function useActionsLogic() {
  const globalState = globals();
  const cadetPermissionsMap = globalState.permissionsMap;
  const cadetKey = globalState.cadetKey;
  const profile = globalState.profile as CadetProfile | null;
  const loading = globalState.isInitializing || !globalState.isInitialized;
  const error = globalState.errors.profile ?? null;

  const canTakeAttendance = cadetPermissionsMap.get(PERMISSIONS.ATTENDANCE_EDITING) ?? false;
  const canUploadFiles = cadetPermissionsMap.get(PERMISSIONS.FILE_UPLOADING) ?? false;
  const isAll = canTakeAttendance && canUploadFiles;
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

  useEffect(() => {
    if (!globalState.isInitialized && !globalState.isInitializing) {
      void initializeGlobals();
    }
  }, [globalState.isInitialized, globalState.isInitializing]);
  
  const onPressAction = async (a: Action) => {
      if (!a.allowed) return;
  
      if (a.id === PERMISSIONS.ATTENDANCE_EDITING) {
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
  const actions: Action[] = [];

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

  // Create Accounts = All only
  if (isAll) {
    actions.push({
      id: PERMISSIONS.ADMIN,
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
      actions,
    ]
  );
}
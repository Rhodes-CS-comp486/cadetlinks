import { useEffect, useMemo } from "react";
import { PERMISSIONS } from "../../../assets/constants";
import { CadetProfile, Action } from "../../../assets/types";
import { useDocumentUploadingLogic } from "./UploadDocsLogic";
import { useAttendanceLogic } from "./AttendanceLogic";
import { useNavigation } from "@react-navigation/core";
import { globals, initializeGlobals } from "../../../firebase/dbController";
import { useCreateAccountLogic } from "./CreateAccountLogic";
import { usePTScoreLogic } from "./PTScoreLogic";

type NavAny = ReturnType<typeof useNavigation<any>>;

export function iconForAction(id: Action["id"]) {
  switch (id) {
    case PERMISSIONS.ATTENDANCE_EDITING: return "checkbox-outline";
    case PERMISSIONS.FILE_UPLOADING:     return "cloud-upload-outline";
    case PERMISSIONS.ADMIN:              return "person-add-outline";
    case PERMISSIONS.EVENT_MAKING:       return "calendar-outline";
    case PERMISSIONS.PT_SCORE_EDITING:   return "fitness-outline";
    default:                             return "briefcase-outline";
  }
}

export const PT_SCORE_ACTION_ID = PERMISSIONS.PT_SCORE_EDITING;

export function useActionsLogic() {
  const globalState = globals();
  const cadetPermissionsMap = globalState.permissionsMap;
  const cadetKey = globalState.cadetKey;
  const profile = globalState.profile as CadetProfile | null;
  const loading = globalState.isInitializing || !globalState.isInitialized;
  const error = globalState.errors.profile ?? null;

  const canTakeAttendance = cadetPermissionsMap.get(PERMISSIONS.ATTENDANCE_EDITING) ?? false;
  const canUploadFiles    = cadetPermissionsMap.get(PERMISSIONS.FILE_UPLOADING) ?? false;
  const isAdmin           = cadetPermissionsMap.get(PERMISSIONS.ADMIN) ?? false;
  const canEditPTScores   = cadetPermissionsMap.get(PERMISSIONS.PT_SCORE_EDITING) ?? false;

  const attendance        = useAttendanceLogic();
  const documentUploading = useDocumentUploadingLogic();
  const createAccount     = useCreateAccountLogic();
  const ptScore           = usePTScoreLogic();
  const navigation: NavAny = useNavigation();

  const permissionNames = useMemo(
    () =>
      Array.from(cadetPermissionsMap.entries())
        .filter(([_, v]) => v === true)
        .map(([k]) => k),
    [cadetPermissionsMap]
  );

  const permissionText = permissionNames.length > 0 ? permissionNames.join(", ") : "None";

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
    if (a.id === PERMISSIONS.ADMIN) {
      createAccount.openModal();
      return;
    }
    if (a.id === PERMISSIONS.PT_SCORE_EDITING) {
      await ptScore.openModal();
      return;
    }
    if (!a.routeHint) return;
    navigation.navigate(a.routeHint);
  };

  const fullName =
    profile?.firstName || profile?.lastName
      ? `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()
      : "Cadet";

  const jobText = profile?.job ?? "—";

  const actions: Action[] = [];

  if (canTakeAttendance) {
    actions.push({
      id: PERMISSIONS.ATTENDANCE_EDITING,
      title: "Take Attendance",
      subtitle: "Mark PT / LLAB attendance for cadets",
      allowed: true,
    });
  }

  if (canEditPTScores) {
    actions.push({
      id: PERMISSIONS.PT_SCORE_EDITING,
      title: "Update PT Scores",
      subtitle: "Enter latest PT scores for cadets (00.0 format)",
      allowed: true,
    });
  }

  if (canUploadFiles) {
    actions.push({
      id: PERMISSIONS.FILE_UPLOADING,
      title: "Upload Files",
      subtitle: "Upload PDFs and other documents for cadets",
      allowed: true,
    });
  }

  if (isAdmin) {
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
      cadetKey, profile, loading, error,
      permissionNames, isAdmin,
      canTakeAttendance, canUploadFiles, canEditPTScores,
      actions, onPressAction,
      attendance, documentUploading,
      createAccount,
      ptScore,
      fullName, jobText, permissionText,
      anyVisibleActions, navigation,
    }),
    [cadetKey, profile, loading, error, permissionNames,
     isAdmin, canTakeAttendance, canUploadFiles, canEditPTScores, actions]
  );
}
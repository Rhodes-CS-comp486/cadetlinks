import { useEffect, useMemo } from "react";
import { globals, initializeGlobals } from "../../../firebase/dbController";

// USER INFO STRUCTURE (from FB)
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
};

// ATTENDANCE STATUS
type AttendanceStatus = "P" | "A" | "E" | "L" | ".";

// attendance subtree: date -> cadetKey -> { status }
type AttendanceSubtree = Record<
  string,
  Record<string, { status?: AttendanceStatus }>
>;

function normalizePTKey(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// returns cadet attendance counts for PT or LLAB
function countAttendance(tree: AttendanceSubtree, cadetId: string) {
  let p = 0;
  let a = 0;
  let e = 0;
  let l = 0;

  for (const date of Object.keys(tree)) {
    const status = tree?.[date]?.[cadetId]?.status;
    if (!status || status === ".") continue;

    if (status === "P") p++;
    else if (status === "A") a++;
    else if (status === "E") e++;
    else if (status === "L") l++;
  }

  return { attended: p, missed: a, excused: e, late: l };
}

export function useProfileLogic() {
  const globalState = globals();
  const globalProfile = globalState.profile;
  const cadetKey = globalState.cadetKey;

  const profile = (globalProfile as CadetProfile | null) ?? null;
  const loadingProfile = globalState.isInitializing;
  const profileError = !cadetKey ? "No user is logged in." : globalState.errors.profile ?? null;

  const attendanceError = !cadetKey ? "No user is logged in." : globalState.errors.attendance ?? null;
  const loadingAttendance = globalState.isInitializing || (!globalState.lastUpdated.attendance && !attendanceError);

  useEffect(() => {
    if (!globalState.isInitialized && !globalState.isInitializing) {
      void initializeGlobals();
    }
  }, [globalState.isInitialized, globalState.isInitializing]);

  const attendanceLookupKey = profile?.lastName
    ? normalizePTKey(profile.lastName)
    : cadetKey ?? "";

  const ptCounts = useMemo(
    () => countAttendance(globalState.attendancePT, attendanceLookupKey),
    [globalState.attendancePT, attendanceLookupKey]
  );

  const llabCounts = useMemo(
    () => countAttendance(globalState.attendanceLLAB, attendanceLookupKey),
    [globalState.attendanceLLAB, attendanceLookupKey]
  );

  const ptAttended = ptCounts.attended;
  const ptMissed = ptCounts.missed;
  const ptExcused = ptCounts.excused;
  const ptLate = ptCounts.late;

  const llabAttended = llabCounts.attended;
  const llabMissed = llabCounts.missed;
  const llabExcused = llabCounts.excused;
  const llabLate = llabCounts.late;

  // --- PT attendance percentage (excused doesn't count toward missed) ---
  const ptCountedTotal = ptAttended + ptMissed + ptLate;
  const ptAttendancePercent =
    ptCountedTotal === 0
      ? 0
      : Math.round(((ptAttended + ptLate / 2) / ptCountedTotal) * 100);
  const ptInGoodStanding = ptAttendancePercent >= 90;

  // --- LLAB attendance percentage (excused doesn't count toward missed) ---
  const llabCountedTotal = llabAttended + llabMissed + llabLate;
  const llabAttendancePercent =
    llabCountedTotal === 0
      ? 0
      : Math.round(((llabAttended + llabLate / 2) / llabCountedTotal) * 100);
  const llabInGoodStanding = llabAttendancePercent >= 90;

  return useMemo(
    () => ({
      cadetKey,

      profile,
      loadingProfile,
      profileError,

      loadingAttendance,
      attendanceError,

      ptAttended,
      ptMissed,
      ptExcused,
      ptLate,
      ptAttendancePercent,
      ptInGoodStanding,

      llabAttended,
      llabMissed,
      llabExcused,
      llabLate,
      llabAttendancePercent,
      llabInGoodStanding,
    }),
    [
      cadetKey,
      profile,
      loadingProfile,
      profileError,
      loadingAttendance,
      attendanceError,

      ptAttended,
      ptMissed,
      ptExcused,
      ptLate,
      ptAttendancePercent,
      ptInGoodStanding,

      llabAttended,
      llabMissed,
      llabExcused,
      llabLate,
      llabAttendancePercent,
      llabInGoodStanding,
    ]
  );
}
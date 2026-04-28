import { useEffect, useMemo, useState } from "react";
import { globals, initializeGlobals } from "../../../firebase/dbController";
import { ref, update } from "firebase/database";
import { db } from "../../../firebase/config";

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

  bio?: string;
  photoUrl?: string;
};

// ATTENDANCE STATUS
type AttendanceStatus = "P" | "A" | "E" | "L" | "." | "MP" | "ML" | "MA"; // Present, Absent, Excused, Late, Not Recorded, Mandatory Present, Mandatory Late, Mandatory Absent

// attendance subtree: date -> cadetKey -> { status }
type AttendanceSubtree = Record<
  string,
  Record<string, { status?: AttendanceStatus }>
>;

function normalizePTKey(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// returns cadet attendance counts for PT or LLAB
function countAttendance(tree: AttendanceSubtree | undefined, cadetId: string) {
  if (!tree) return { attended: 0, missed: 0, excused: 0, late: 0 };

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

// RMP has additional "Mandatory" attendance statuses, so we need a separate counting function
function countRMPAttendance(tree: AttendanceSubtree | undefined, cadetId: string) {
  if (!tree) return { attended: 0, missed: 0, excused: 0, late: 0 };

  let p = 0;
  let a = 0;
  let e = 0;
  let l = 0;

  for (const date of Object.keys(tree)) {
    const status = tree?.[date]?.[cadetId]?.status;
    if (!status || status === ".") continue;

    if (status === "P" || status === "MP") p++;
    else if (status === "A" || status === "MA") a++;
    else if (status === "E") e++;
    else if (status === "L" || status === "ML") l++;
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
  const loadingAttendance =
    globalState.isInitializing ||
    (!globalState.lastUpdated.attendance && !attendanceError);

  const [bioDraft, setBioDraft] = useState(""); // is user typing
  const [savingBio, setSavingBio] = useState(false); // is user saving
  const [bioMessage, setBioMessage] = useState<string | null>(null); // did it successfully save

  useEffect(() => { // loads in fb data on app start
    if (!globalState.isInitialized && !globalState.isInitializing) {
      void initializeGlobals();
    }
  }, [globalState.isInitialized, globalState.isInitializing]);

  useEffect(() => { // when profile loads, set bioDraft to current bio (or empty string if no bio)
    setBioDraft(profile?.bio ?? "");
  }, [profile?.bio]);

  const attendanceLookupKey = profile?.lastName // look up attendance by normalized last name if possible, otherwise fall back to cadetKey
    ? normalizePTKey(profile.lastName)
    : cadetKey ?? "";

  const ptCounts = useMemo( // calculate PT attendance counts
    () => countAttendance(globalState.attendancePT, attendanceLookupKey),
    [globalState.attendancePT, attendanceLookupKey]
  );

  const llabCounts = useMemo( // calculate LLAB attendance counts
    () => countAttendance(globalState.attendanceLLAB, attendanceLookupKey),
    [globalState.attendanceLLAB, attendanceLookupKey]
  );

  const rmpCounts = useMemo( // calculate RMP attendance counts
    () => countRMPAttendance(globalState.attendanceRMP, attendanceLookupKey),
    [globalState.attendanceRMP, attendanceLookupKey]
  );

  // extract counts for easier use later
  const ptAttended = ptCounts.attended;
  const ptMissed = ptCounts.missed;
  const ptExcused = ptCounts.excused;
  const ptLate = ptCounts.late;

  const llabAttended = llabCounts.attended;
  const llabMissed = llabCounts.missed;
  const llabExcused = llabCounts.excused;
  const llabLate = llabCounts.late;

  const rmpAttended = rmpCounts.attended;
  const rmpMissed = rmpCounts.missed;
  const rmpExcused = rmpCounts.excused;
  const rmpLate = rmpCounts.late;

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

  // --- RMP attendance percentage (excused doesn't count toward missed) ---
  const rmpCountedTotal = rmpAttended + rmpMissed + rmpLate;
  const rmpAttendancePercent =
    rmpCountedTotal === 0
      ? 0
      : Math.round(((rmpAttended + rmpLate / 2) / rmpCountedTotal) * 100);
  const rmpInGoodStanding = rmpAttendancePercent >= 90;

  async function handleSaveBio() {
    if (!cadetKey) {
      setBioMessage("No user is logged in.");
      return false;
    }

    setSavingBio(true);
    setBioMessage(null);

    // writes to FB under the cadet's name
    try {
      await update(ref(db, `cadets/${cadetKey}`), {
        bio: bioDraft.trim(),
      });

      await initializeGlobals();
      setBioMessage("Bio saved!");
      return true;
    } 
    catch (error) {
      console.error("❌ Error saving bio:", error);
      setBioMessage("Could not save bio.");
      return false;
    } finally {
      setSavingBio(false);
    }
  }

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

      rmpAttended,
      rmpMissed,
      rmpExcused,
      rmpLate,
      rmpAttendancePercent,
      rmpInGoodStanding,

      bioDraft,
      setBioDraft,
      savingBio,
      bioMessage,
      handleSaveBio,
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

      rmpAttended,
      rmpMissed,
      rmpExcused,
      rmpLate,
      rmpAttendancePercent,
      rmpInGoodStanding,

      bioDraft,
      savingBio,
      bioMessage,
    ]
  );
}
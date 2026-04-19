import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, onValue } from "firebase/database";
import { db } from "../../../firebase/config";
import { globals, initializeGlobals } from "../../../firebase/globals";

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

// normalizing strings to match FB keys (for attendance lookup)
function normalizeLlabKey(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]/g, "");
}

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
  const [cadetKey, setCadetKey] = useState<string | null>(null);

  // ---- Firebase profile state ----
  const [profile, setProfile] = useState<CadetProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // ---- Firebase attendance state ----
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  // PT counts
  const [ptAttended, setPtAttended] = useState(0);
  const [ptMissed, setPtMissed] = useState(0);
  const [ptExcused, setPtExcused] = useState(0);
  const [ptLate, setPtLate] = useState(0);

  // LLAB counts
  const [llabAttended, setLlabAttended] = useState(0);
  const [llabMissed, setLlabMissed] = useState(0);
  const [llabExcused, setLlabExcused] = useState(0);
  const [llabLate, setLlabLate] = useState(0);

  useEffect(() => {
    if (!globalState.isInitialized && !globalState.isInitializing) {
      void initializeGlobals();
    }
  }, [globalState.isInitialized, globalState.isInitializing]);

  useEffect(() => {
    setProfile((globalProfile as CadetProfile | null) ?? null);
  }, [globalProfile]);

  useEffect(() => {
    let unsubscribePT: (() => void) | null = null;
    let unsubscribeLLAB: (() => void) | null = null;

    const load = async () => {
      setLoadingProfile(true);
      setProfileError(null);

      setLoadingAttendance(true);
      setAttendanceError(null);

      try {
        const key = await AsyncStorage.getItem("currentCadetKey");
        setCadetKey(key);

        if (!key) {
          setProfile(null);
          setProfileError("No user is logged in.");

          setPtAttended(0);
          setPtMissed(0);
          setPtExcused(0);
          setPtLate(0);

          setLlabAttended(0);
          setLlabMissed(0);
          setLlabExcused(0);
          setLlabLate(0);

          setAttendanceError("No user is logged in.");
          setLoadingProfile(false);
          setLoadingAttendance(false);
          return;
        }

        // figure out the keys used in attendance
        const ptKey =
          globalProfile?.lastName ? normalizePTKey(globalProfile.lastName) : key;

        const llabKey =
          globalProfile?.lastName ? normalizeLlabKey(globalProfile.lastName) : key;

        // listens for PT attendance in real time
        const ptRef = ref(db, "attendance/PT"); 
        unsubscribePT = onValue( // listens for changes in PT attendance and updates counts
          ptRef,
          (snapshot) => {
            const ptData = (snapshot.val() ?? {}) as AttendanceSubtree;
            const ptCounts = countAttendance(ptData, ptKey);

            setPtAttended(ptCounts.attended);
            setPtMissed(ptCounts.missed);
            setPtExcused(ptCounts.excused);
            setPtLate(ptCounts.late);

            setAttendanceError(null);
            setLoadingAttendance(false);
          },
          (error) => {
            console.error("❌ Error listening to PT attendance:", error);
            setAttendanceError("Could not load PT attendance.");
            setLoadingAttendance(false);
          }
        );

        // listens for LLAB attendance in real time
        const llabRef = ref(db, "attendance/LLAB");
        unsubscribeLLAB = onValue(
          llabRef,
          (snapshot) => {
            const llabData = (snapshot.val() ?? {}) as AttendanceSubtree;
            const llabCounts = countAttendance(llabData, llabKey);

            setLlabAttended(llabCounts.attended);
            setLlabMissed(llabCounts.missed);
            setLlabExcused(llabCounts.excused);
            setLlabLate(llabCounts.late);

            setAttendanceError(null);
            setLoadingAttendance(false);
          },
          (error) => {
            console.error("❌ Error listening to LLAB attendance:", error);
            setAttendanceError("Could not load LLAB attendance.");
            setLoadingAttendance(false);
          }
        );
      } catch (error) {
        console.error("❌ Error reading profile/attendance (Profile):", error);
        console.log(error);
        setProfileError("Could not load profile.");
        setAttendanceError("Could not load attendance.");
        setLoadingAttendance(false);
      } finally {
        setLoadingProfile(false);
      }
    };

    load();

    return () => {
      if (unsubscribePT) unsubscribePT();
      if (unsubscribeLLAB) unsubscribeLLAB();
    };
  }, []);

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
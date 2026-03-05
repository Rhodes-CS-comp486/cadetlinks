// ProfileLogic.tsx
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, get } from "firebase/database";
import { db } from "../../../firebase/config";

// USER INFO (from DB)
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

// attendance tree: attendance -> date -> cadetKey -> { status }
type AttendanceRoot = Record<
  string, // "YYYY-MM-DD"
  Record<string, { status?: AttendanceStatus }>
>;

export function useProfileLogic() {
  const [cadetKey, setCadetKey] = useState<string | null>(null);

  // ---- Firebase profile state ----
  const [profile, setProfile] = useState<CadetProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // ---- Firebase attendance state (treat everything as PT for now) ----
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const [ptAttended, setPtAttended] = useState(0);
  const [ptMissed, setPtMissed] = useState(0);
  const [ptExcused, setPtExcused] = useState(0);
  const [ptLate, setPtLate] = useState(0);

  useEffect(() => {
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

          // attendance should also stop
          setPtAttended(0);
          setPtMissed(0);
          setPtExcused(0);
          setPtLate(0);
          setAttendanceError("No user is logged in.");
          return;
        }

        // Load the logged-in cadet from your database
        const profileRef = ref(db, `cadets/${key}`);
        const profileSnap = await get(profileRef);

        if (profileSnap.exists()) {
          setProfile(profileSnap.val());
        } else {
          setProfile(null);
          setProfileError("No profile found for this user.");
        }

        // ---- Load attendance from your database (everything = PT for now) ----
        const attendanceRef = ref(db, "attendance");
        const attendanceSnap = await get(attendanceRef);

        const attendanceData = (attendanceSnap.val() ?? {}) as AttendanceRoot;

        let p = 0;
        let a = 0;
        let e = 0;
        let l = 0;

        // go through every date and find THIS cadet's status on that date
        for (const date of Object.keys(attendanceData)) {
          const status = attendanceData?.[date]?.[key]?.status;

          // "." or missing = ignore
          if (!status || status === ".") continue;

          if (status === "P") p++;
          else if (status === "A") a++;
          else if (status === "E") e++;
          else if (status === "L") l++;
        }

        setPtAttended(p);
        setPtMissed(a);
        setPtExcused(e);
        setPtLate(l);
      } catch (error) {
        console.error("❌ Error reading profile/attendance (Profile):", error);
        setProfileError("Could not load profile.");
        setAttendanceError("Could not load attendance.");
      } finally {
        setLoadingProfile(false);
        setLoadingAttendance(false);
      }
    };

    load();
  }, []);

  // --- PT attendance percentage (excused DOES NOT count toward missed) ---
  const ptCountedTotal = ptAttended + ptMissed;
  const ptAttendancePercent =
    ptCountedTotal === 0 ? 0 : Math.round((ptAttended / ptCountedTotal) * 100);

  const ptInGoodStanding = ptAttendancePercent >= 90;

  // --- For now, treat LLAB as "coming soon" (keeping your UI the same) ---
  const llabAttended = ptAttended;
  const llabMissed = ptMissed;
  const llabTotal = llabAttended + llabMissed;
  const llabAttendancePercent =
    llabTotal === 0 ? 0 : Math.round((llabAttended / llabTotal) * 100);
  const llabInGoodStanding = llabAttendancePercent >= 90;

  // useMemo not required, but keeps a stable object identity (nice for rerenders)
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
      llabAttendancePercent,
      llabInGoodStanding,
    ]
  );
}
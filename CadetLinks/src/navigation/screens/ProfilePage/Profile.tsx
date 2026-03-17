import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { Props, CadetProfile, loadGlobalProfile} from "./ProfileLogic";
import { ref, get, set } from "firebase/database";
import { db } from "../../../firebase/config";
import { profileStyles as styles } from "../../../styles/ProfileStyles";
import { ScreenLayout } from "../../Components/ScreenLayout";

import AsyncStorage from "@react-native-async-storage/async-storage";

// ATTENDANCE STATUS
type AttendanceStatus = "P" | "A" | "E" | "L" | ".";

export function Profile({ route }: Props) {
  const PROFILE_DB_REF = "icdixon_memphis_edu"; //  path in DB

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
  const [ptLate, setPtLate] = useState(0); // rn just for show, not in the profile or attendance percent calculations. not sure how to incorporate

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
  // percent = Present / (Present + Absent)
  const ptCountedTotal = ptAttended + ptMissed; // excused ignored
  const ptAttendancePercent =
    ptCountedTotal === 0 ? 0 : Math.round((ptAttended / ptCountedTotal) * 100);

  //if PT attendance > 90% then it's good standing
  const ptInGoodStanding = ptAttendancePercent >= 90;

  // --- For now, treat LLAB as "coming soon" (keeping your UI the same) ---
  // If you want to DELETE the LLAB card instead, say so and I’ll strip it.
  const llabAttended = ptAttended;
  const llabMissed = ptMissed;
  const llabTotal = llabAttended + llabMissed;
  const llabAttendancePercent =
    llabTotal === 0 ? 0 : Math.round((llabAttended / llabTotal) * 100);
  const llabInGoodStanding = llabAttendancePercent >= 90;

  return (
    // parent containter
    <ScreenLayout title="Profile">
      {/* body */}
      <ScrollView
        style={styles.body_container}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* USER INFO CARD */}
        <View style={styles.userinfo_card}>
          {/* avatar */}
          <View style={styles.avatar_container}>
            <Ionicons name="person" size={28} color="white" />
          </View>

          {/* user info */}
          <View style={styles.userinfo_text_container}>
            {loadingProfile ? (
              <View style={{ marginTop: 4 }}>
                <ActivityIndicator />
                <Text style={styles.userinfo_sub}>Loading profile…</Text>
              </View>
            ) : profileError ? (
              <>
                <Text style={styles.userinfo_sub}>{profileError}</Text>
                {cadetKey ? (
                  <Text style={styles.userinfo_sub}>
                    <Text style={styles.label_bold}>Key: </Text>
                    {cadetKey}
                  </Text>
                ) : null}
              </>
            ) : !profile ? (
              <Text style={styles.userinfo_sub}>No profile found.</Text>
            ) : (
              <>
                <Text style={styles.userinfo_name}>
                  {profile.firstName ?? "First"} {profile.lastName ?? "Last"}
                </Text>

                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>Flight: </Text>
                  {profile.flight ?? "—"}
                </Text>

                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>Rank: </Text>
                  {profile.cadetRank ?? "—"}
                </Text>

                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>Job: </Text>
                  {profile.job ?? "—"}
                </Text>

                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>Class Year: </Text>
                  {profile.classYear ?? "—"}
                </Text>

                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>School Email: </Text>
                  {profile.contact?.schoolEmail ?? "—"}
                </Text>

                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>Direct Supervisor: </Text>
                  {profile.directSupervisor ?? "—"}
                </Text>

                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>PT Attendance: </Text>
                  {ptAttendancePercent}%
                </Text>

                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>Lab Attendance: </Text>
                  {ptAttendancePercent}%
                </Text>


                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>Last PT Score: </Text>
                  {profile.lastPTScore ?? "—"}
                </Text>
              </>
            )}

            {/* attendance loading/error line (so you can tell if the PT card is "real" yet) */}
            {loadingAttendance ? (
              <Text style={styles.userinfo_sub}>Loading attendance…</Text>
            ) : attendanceError ? (
              <Text style={styles.userinfo_sub}>{attendanceError}</Text>
            ) : null}
          </View>
        </View>

        {/* SECTION HEADER */}
        <Text style={styles.sectionTitle}>PT Attendance</Text>

        {/* PT ATTENDANCE CARD */}
        <View style={styles.attendance_card}>
          <View style={styles.attendance_top_row}>
            <View
              style={[
                styles.attendance_circle,
                ptInGoodStanding ? styles.circle_good : styles.circle_bad,
              ]}
            >
              <Text style={styles.attendance_percent_text}>
                {ptAttendancePercent}%
              </Text>
            </View>

            <View style={styles.standing_container}>
              <View
                style={[
                  styles.standing_pill,
                  ptInGoodStanding ? styles.pill_good : styles.pill_bad,
                ]}
              >
                <Text style={styles.standing_pill_text}>
                  {ptInGoodStanding ? "Good Standing" : "Bad Standing"}
                </Text>
              </View>

              <Text style={styles.standing_hint}>
                Good standing requires ≥ 90%
              </Text>
              <Text style={styles.standing_hint}>
                Excused does not count against you
              </Text>
            </View>
          </View>

          <View style={styles.stacked_bar}>
            <View
              style={[
                styles.bar_segment,
                styles.bar_attended,
                { flex: Math.max(ptAttended, 0.001) },
              ]}
            />
            <View
              style={[
                styles.bar_segment,
                styles.bar_missed,
                { flex: Math.max(ptMissed, 0.001) },
              ]}
            />
          </View>

          <View style={styles.legend_row}>
            <View style={styles.legend_item}>
              <View style={[styles.legend_dot, styles.bar_attended]} />
              <Text style={styles.legend_text}>Attended ({ptAttended})</Text>
            </View>

            <View style={styles.legend_item}>
              <View style={[styles.legend_dot, styles.bar_missed]} />
              <Text style={styles.legend_text}>Missed ({ptMissed})</Text>
            </View>
          </View>

          {/*added stuff for excused and late */}
          <View style={[styles.legend_row, { marginTop: 6 }]}>
            <View style={styles.legend_item}>
              <View style={[styles.legend_dot, { backgroundColor: "#9AA3B2" }]} />
              <Text style={styles.legend_text}>Excused ({ptExcused})</Text>
            </View>

            <View style={styles.legend_item}>
              <View style={[styles.legend_dot, { backgroundColor: "#9AA3B2" }]} />
              <Text style={styles.legend_text}>Late ({ptLate})</Text>
            </View>
          </View>
        </View>

        {/* SECTION HEADER */}
        <Text style={styles.sectionTitle}>LLAB Attendance</Text>
        <Text style={[styles.userinfo_sub, { marginLeft: 4, marginBottom: 8 }]}>
          Coming soon — using PT data for now
        </Text>

        {/* LLAB ATTENDANCE CARD (rn just pt attendance) */}
        <View style={styles.attendance_card}>
          <View style={styles.attendance_top_row}>
            <View
              style={[
                styles.attendance_circle,
                llabInGoodStanding ? styles.circle_good : styles.circle_bad,
              ]}
            >
              <Text style={styles.attendance_percent_text}>
                {llabAttendancePercent}%
              </Text>
            </View>

            <View style={styles.standing_container}>
              <View
                style={[
                  styles.standing_pill,
                  llabInGoodStanding ? styles.pill_good : styles.pill_bad,
                ]}
              >
                <Text style={styles.standing_pill_text}>
                  {llabInGoodStanding ? "Good Standing" : "Bad Standing"}
                </Text>
              </View>

              <Text style={styles.standing_hint}>
                Good standing requires ≥ 90%
              </Text>
            </View>
          </View>

          <View style={styles.stacked_bar}>
            <View
              style={[
                styles.bar_segment,
                styles.bar_attended,
                { flex: Math.max(llabAttended, 0.001) },
              ]}
            />
            <View
              style={[
                styles.bar_segment,
                styles.bar_missed,
                { flex: Math.max(llabMissed, 0.001) },
              ]}
            />
          </View>

          <View style={styles.legend_row}>
            <View style={styles.legend_item}>
              <View style={[styles.legend_dot, styles.bar_attended]} />
              <Text style={styles.legend_text}>Attended ({llabAttended})</Text>
            </View>

            <View style={styles.legend_item}>
              <View style={[styles.legend_dot, styles.bar_missed]} />
              <Text style={styles.legend_text}>Missed ({llabMissed})</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

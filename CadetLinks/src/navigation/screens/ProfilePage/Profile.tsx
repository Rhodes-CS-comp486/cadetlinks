import React from "react";
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
import { profileStyles as styles } from "../../../styles/ProfileStyles";
import { ScreenLayout } from "../../Components/ScreenLayout";

//import AsyncStorage from "@react-native-async-storage/async-storage";
//import { ref, get } from "firebase/database";
//import { db } from "./../firebase/config";
//import {db} from "../../../firebase/config";

// USER INFO (from DB)
type CadetProfile = {
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
// ...imports unchanged

import { useProfileLogic } from "./ProfileLogic"; // ✅ adjust path if needed

export function Profile(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const {
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
  } = useProfileLogic();

  return (
    // parent containter
    <ScreenLayout>
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
                  {llabAttendancePercent}%
                </Text>

                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>Last PT Score: </Text>
                  {profile.lastPTScore ?? "—"}
                </Text>
              </>
            )}

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

          <View style={[styles.legend_row, { marginTop: 6 }]}>
            <View style={styles.legend_item}>
              <View
                style={[styles.legend_dot, { backgroundColor: "#9AA3B2" }]}
              />
              <Text style={styles.legend_text}>Excused ({ptExcused})</Text>
            </View>

            <View style={styles.legend_item}>
              <View
                style={[styles.legend_dot, { backgroundColor: "#9AA3B2" }]}
              />
              <Text style={styles.legend_text}>Late ({ptLate})</Text>
            </View>
          </View>
        </View>

        {/* SECTION HEADER */}
        <Text style={styles.sectionTitle}>LLAB Attendance</Text>

        {/* LLAB ATTENDANCE CARD */}
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

          <View style={[styles.legend_row, { marginTop: 6 }]}>
            <View style={styles.legend_item}>
              <View
                style={[styles.legend_dot, { backgroundColor: "#9AA3B2" }]}
              />
              <Text style={styles.legend_text}>Excused ({llabExcused})</Text>
            </View>

            <View style={styles.legend_item}>
              <View
                style={[styles.legend_dot, { backgroundColor: "#9AA3B2" }]}
              />
              <Text style={styles.legend_text}>Late ({llabLate})</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

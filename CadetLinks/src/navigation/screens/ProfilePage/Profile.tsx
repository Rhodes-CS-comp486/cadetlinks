import React, { use, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StaticScreenProps, useNavigation } from "@react-navigation/native";
import { Props, CadetProfile, loadGlobalProfile} from "./ProfileLogic";
import { ref, get, set } from "firebase/database";
import { db } from "../../../firebase/config";
import { profileStyles as styles } from "../../../styles/ProfileStyles";
import { ScreenLayout } from "../../Components/ScreenLayout";



// curr profile "icdixon_memphis_edu" which is the path to the Db

export var globalProfile: CadetProfile | null = null; // global variable to hold the profile data across the app

export function Profile({ route }: Props) {
  const PROFILE_DB_REF = "icdixon_memphis_edu"; //  path in DB


  // should probs set this in the login page cuz this stuff gets loaded when profile page gets clicked ://
  const { profile, loadingProfile, profileError } = loadGlobalProfile(PROFILE_DB_REF); 
  globalProfile = profile; // set the global variable to the loaded profile so other pages can access it (not best practice but simplest for now)


  // test data for attendance -> will call from db later
  const attended = 20;
  const missed = 5;

  // calculating attendance percentage
  const total = attended + missed;
  const attendancePercent =
    total === 0 ? 0 : Math.round((attended / total) * 100);

  //if attendance > 90% then it's good standing
  const inGoodStanding = attendancePercent >= 90;

  // test data for PT attendance -> will call from db later
  const ptAttended = 18;
  const ptMissed = 2;

  // calculating PT attendance percentage
  const ptTotal = ptAttended + ptMissed;
  const ptAttendancePercent =
    ptTotal === 0 ? 0 : Math.round((ptAttended / ptTotal) * 100);

  //if PT attendance > 90% then it's good standing
  const ptInGoodStanding = ptAttendancePercent >= 90;

  // test data for LLAB attendance -> will call from db later
  const llabAttended = 8;
  const llabMissed = 2;

  // calculating LLAB attendance percentage
  const llabTotal = llabAttended + llabMissed;
  const llabAttendancePercent =
    llabTotal === 0 ? 0 : Math.round((llabAttended / llabTotal) * 100);

  //if LLAB attendance > 90% then it's good standing
  const llabInGoodStanding = llabAttendancePercent >= 90;

  return (
    // parent containter
    <ScreenLayout title="Profile">
      {/* body */}
      <ScrollView
        style={styles.body_container}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false} // stacks children basically
      >
        {/* USER INFO CARD */}
        <View style={styles.userinfo_card}>
          {/* avatar */}
          <View style={styles.avatar_container}>
            <Ionicons name="person" size={28} color="white" />
          </View>

          {/* user info */}
          <View style={styles.userinfo_text_container}>
            {/* loading/error states just for the profile block */}
            {loadingProfile ? (
              <View style={{ marginTop: 4 }}>
                <ActivityIndicator />
                <Text style={styles.userinfo_sub}>Loading profile…</Text>
              </View>
            ) : profileError ? (
              <Text style={styles.userinfo_sub}>{profileError}</Text>
            ) : !profile ? (
              <Text style={styles.userinfo_sub}>No profile found.</Text>
            ) : (
              <>
                <Text style={styles.userinfo_name}>
                  {profile.firstName ?? "First"} {profile.lastName ?? "Last"}
                </Text>

                {/* Use what exists in your DB right now  hellogi*/}
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

                {/* These are placeholders in your UI right now (keep them until DB has them) */}
                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>Detachment : </Text>
                  {profile.detachment ?? "—"}
                </Text>
                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>Direct Supervisor: </Text>
                  {profile.directSupervisor ?? "—"}
                </Text>

                {/* You can swap these to real DB attendance later */}
                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>Lab Attendance: </Text>{attendancePercent}%
                </Text>
                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>PT Attendance: </Text>{ptAttendancePercent}%
                </Text>
                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>Last PT Score: </Text>
                  {profile.lastPTScore ?? "—"}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* SECTION HEADER */}
        <Text style={styles.sectionTitle}>PT Attendance</Text>

        {/* PT ATTENDANCE CARD */}
        <View style={styles.attendance_card}>
          <View style={styles.attendance_top_row}>
            {/* so that top row is circle and standing label are side by side */}
            {/* circle with percent */}
            <View
              style={[
                styles.attendance_circle,
                ptInGoodStanding ? styles.circle_good : styles.circle_bad, // if in good standing, circle is green, else red
              ]}
            >
              <Text style={styles.attendance_percent_text}>
                {ptAttendancePercent}%
              </Text>
            </View>

            {/* Standing label */}
            <View style={styles.standing_container}>
              <View
                style={[
                  styles.standing_pill,
                  ptInGoodStanding ? styles.pill_good : styles.pill_bad, // if ingoodstanding, good, else, bad
                ]}
              >
                <Text style={styles.standing_pill_text}>
                  {ptInGoodStanding ? "Good Standing" : "Bad Standing"}
                </Text>
              </View>

              <Text style={styles.standing_hint}>
                Good standing requires ≥ 90%
              </Text>
            </View>
          </View>

          {/* Stacked Bar (Attendance Bottom Row) */}
          <View style={styles.stacked_bar}>
            {/* so that bar is underneath circle and standing label */}
            <View
              style={[
                styles.bar_segment,
                styles.bar_attended,
                { flex: Math.max(ptAttended, 0.001) }, // stacked bar has flex row (children left to right) but this changes it based on percentage
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

          {/* Labels for bar */}
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
        </View>

        {/* SECTION HEADER */}
        <Text style={styles.sectionTitle}>LLAB Attendance</Text>

        {/* LLAB ATTENDANCE CARD */}
        <View style={styles.attendance_card}>
          <View style={styles.attendance_top_row}>
            {/* so that top row is circle and standing label are side by side */}
            {/* circle with percent */}
            <View
              style={[
                styles.attendance_circle,
                llabInGoodStanding ? styles.circle_good : styles.circle_bad, // if in good standing, circle is green, else red
              ]}
            >
              <Text style={styles.attendance_percent_text}>
                {llabAttendancePercent}%
              </Text>
            </View>

            {/* Standing label */}
            <View style={styles.standing_container}>
              <View
                style={[
                  styles.standing_pill,
                  llabInGoodStanding ? styles.pill_good : styles.pill_bad, // if ingoodstanding, good, else, bad
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

          {/* Stacked Bar (Attendance Bottom Row) */}
          <View style={styles.stacked_bar}>
            {/* so that bar is underneath circle and standing label */}
            <View
              style={[
                styles.bar_segment,
                styles.bar_attended,
                { flex: Math.max(llabAttended, 0.001) }, // stacked bar has flex row (children left to right) but this changes it based on percentage
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

          {/* Labels for bar */}
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
import React from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StaticScreenProps, useNavigation } from "@react-navigation/native";

type Props = StaticScreenProps<{
  user: string;
}>;

export function Profile({ route }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

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
  const llabAttended = 9;
  const llabMissed = 1;

  // calculating LLAB attendance percentage
  const llabTotal = llabAttended + llabMissed;
  const llabAttendancePercent =
    llabTotal === 0 ? 0 : Math.round((llabAttended / llabTotal) * 100);

  //if LLAB attendance > 90% then it's good standing
  const llabInGoodStanding = llabAttendancePercent >= 90;

  return (
    // parent containter
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header_container, { paddingTop: insets.top + 10 }]}>
        <View style={styles.header_row}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.back_button}
          >
            <Ionicons name="chevron-back" size={26} color="white" />
          </Pressable>

          <Text style={styles.header_text}>Profile</Text>
          <View style={styles.right_space} />
        </View>
      </View>

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
            <Text style={styles.userinfo_name}>First Name Last Name</Text>
            <Text style={styles.userinfo_sub}>Detachment</Text>
            <Text style={styles.userinfo_sub}>Rank</Text>
            <Text style={styles.userinfo_sub}>Job Group</Text>
            <Text style={styles.userinfo_sub}>Direct Supervisor</Text>
            <Text style={styles.userinfo_sub}>% Lab Attendance</Text>
            <Text style={styles.userinfo_sub}>% PT Attendance</Text>
            <Text style={styles.userinfo_sub}>Last PT Score</Text>
          </View>
        </View>

        {/* SECTION HEADER */}
        <Text style={styles.section_header}>PT Attendance</Text>

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
        <Text style={styles.section_header}>LLAB Attendance</Text>  

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
    </View>
  );
}

// Add for PT and LLab
const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
    backgroundColor: "#0B1220",
  },

  header_container: {
    backgroundColor: "#111B2E",
    width: "100%",
    paddingBottom: 12,
    paddingHorizontal: 16,
  },

  header_row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  back_button: { width: 40, alignItems: "flex-start" },
  right_space: { width: 40 },

  header_text: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },

  body_container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#0B1220",
  },

  // USER INFO
  userinfo_card: {
    backgroundColor: "#111B2E",
    borderRadius: 18,
    padding: 16, // doesn't get to edges
    flexDirection: "row", // so they can be side by side
    alignItems: "center",
  },

  avatar_container: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0B1220",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  userinfo_text_container: { flex: 1 },

  userinfo_name: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  userinfo_sub: {
    color: "#9AA3B2",
    fontSize: 14,
    marginTop: 4,
  },

  // section header
  section_header: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 18, // gives space from user info card
    marginBottom: 8, // space from attendance card
    marginLeft: 4,
  },

  // ATTENDANCE CARD //
  attendance_card: {
    backgroundColor: "#111B2E",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12, // space between cards
  },

  attendance_top_row: {
    flexDirection: "row", // so circle and standing are side by side
    alignItems: "center",
    gap: 14,
  },

  attendance_circle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B1220",
  },

  circle_good: { borderColor: "green" },
  circle_bad: { borderColor: "red" },

  attendance_percent_text: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
  },

  attendance_sub_text: { color: "#9AA3B2", fontSize: 12, marginTop: 2 },

  standing_container: { flex: 1 },

  standing_pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999, // rounds it as much as possible to make pill
  },

  pill_good: { backgroundColor: "rgba(0, 128, 0, 0.18)" }, // when ingoodstanding is true, green
  pill_bad: { backgroundColor: "rgba(255, 0, 0, 0.18)" },

  standing_pill_text: { color: "white", fontWeight: "700" }, // text in pill
  standing_hint: { color: "#9AA3B2", marginTop: 6, fontSize: 12 }, // above 80%

  // AI Part that broke my brain
  stacked_bar: {
    marginTop: 14,
    height: 12,
    borderRadius: 8, // rounds the corners
    overflow: "hidden", // keeps the bar same length and rounds the ends
    flexDirection: "row", // so attended and missed bars can be side by side
    backgroundColor: "#0B1220",
  },

  bar_segment: { height: "100%" },
  bar_attended: { backgroundColor: "green" },
  bar_missed: { backgroundColor: "red" },

  legend_row: {
    flexDirection: "row", // so attended and missed legend can be side by side
    justifyContent: "space-between",
    marginTop: 10,
  },

  legend_item: { flexDirection: "row", alignItems: "center", gap: 6 },
  legend_dot: { width: 10, height: 10, borderRadius: 5 },
  legend_text: { color: "#9AA3B2", fontSize: 12 },
});

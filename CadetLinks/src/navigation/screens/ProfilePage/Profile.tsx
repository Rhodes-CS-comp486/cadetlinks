import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { profileStyles as styles } from "../../../styles/ProfileStyles";
import { ScreenLayout } from "../../Components/ScreenLayout";
import { useProfileLogic } from "./ProfileLogic";

export function Profile(): React.ReactElement {
  const [profileView, setProfileView] = useState<"private" | "public">("private"); // toggle between private and public profile views

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

  const bioText = "This is where the cadet bio will go!";

  function getAttendanceColor(percent: number) {
    if (percent >= 90) return "good";     // green
    if (percent >= 80) return "warning";  // yellow
    return "bad";                         // red
  }

  const ptColor = getAttendanceColor(ptAttendancePercent);
  const llabColor = getAttendanceColor(llabAttendancePercent);

  return (
    <ScreenLayout>
      <ScrollView
        style={styles.body_container}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE TOGGLE BUTTON AT THE TOP */}
        <View style={styles.profileToggleRow}>
          <Pressable
            onPress={() => setProfileView("private")}
            style={[
              styles.profileToggleButton,
              profileView === "private" && styles.profileToggleButtonActive,
            ]}
          >
            <Text
              style={[ // if profileView is "private", apply active text style
                styles.profileToggleText,
                profileView === "private" && styles.profileToggleTextActive,
              ]}
            >
              Private
            </Text>
          </Pressable>
          {/* Public profile button */}
          <Pressable
            onPress={() => setProfileView("public")}
            style={[
              styles.profileToggleButton,
              profileView === "public" && styles.profileToggleButtonActive,
            ]}
          >
            <Text
              style={[
                styles.profileToggleText,
                profileView === "public" && styles.profileToggleTextActive,
              ]}
            >
              Public
            </Text>
          </Pressable>
        </View>

        {/* PRIVATE PROFILE TAB */}
        {profileView === "private" ? (
          <>
            <View style={styles.userinfo_card}>
              <View style={styles.avatar_container}>
                <Ionicons name="person" size={28} color="white" />
              </View>

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

            <Text style={styles.sectionTitle}>PT Attendance</Text>

            <View style={styles.attendance_card}>
              <View style={styles.attendance_top_row}>
                <View
                  style={[
                    styles.attendance_circle,
                    ptColor === "good"
                      ? styles.circle_good
                      : ptColor === "warning"
                      ? styles.circle_warning
                      : styles.circle_bad,
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
                      ptColor === "good"
                        ? styles.pill_good
                        : ptColor === "warning"
                        ? styles.pill_warning
                        : styles.pill_bad,
                    ]}
                  >
                    <Text style={styles.standing_pill_text}>
                      {ptColor === "good"
                        ? "Good Standing"
                        : ptColor === "warning"
                        ? "Warning"
                        : "Bad Standing"}
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

            <Text style={styles.sectionTitle}>LLAB Attendance</Text>

            <View style={styles.attendance_card}>
              <View style={styles.attendance_top_row}>
                <View
                  style={[
                    styles.attendance_circle,
                    llabColor === "good"
                      ? styles.circle_good
                      : llabColor === "warning"
                      ? styles.circle_warning
                      : styles.circle_bad,
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
                      llabColor === "good"
                        ? styles.pill_good
                        : llabColor === "warning"
                        ? styles.pill_warning
                        : styles.pill_bad,
                    ]}
                  >
                    <Text style={styles.standing_pill_text}>
                      {llabColor === "good"
                        ? "Good Standing"
                        : llabColor === "warning"
                        ? "Warning"
                        : "Bad Standing"}
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
          </>
        ) : (
          <>
            {/* PUBLIC PROFILE TAB */}
            <View style={styles.publicProfileCard}>
              <View style={styles.publicInfoColumn}>
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
                      <Text style={styles.label_bold}>Rank: </Text>
                      {profile.cadetRank ?? "—"}
                    </Text>

                    <Text style={styles.userinfo_sub}>
                      <Text style={styles.label_bold}>Class Year: </Text>
                      {profile.classYear ?? "—"}
                    </Text>

                    <Text style={styles.userinfo_sub}>
                      <Text style={styles.label_bold}>Job: </Text>
                      {profile.job ?? "—"}
                    </Text>

                    <Text style={styles.userinfo_sub}>
                      <Text style={styles.label_bold}>Email: </Text>
                      {profile.contact?.schoolEmail ?? "—"}
                    </Text>
                  </>
                )}
              </View>

              <View style={styles.publicImagePlaceholder}>
                <Ionicons name="image-outline" size={34} color="#9AA3B2" />
                <Text style={styles.publicImagePlaceholderText}>Photo</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Bio</Text>
            <View style={styles.bioCard}>
              <Text style={styles.bioText}>{bioText}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { profileStyles as pStyles } from "../../../styles/ProfileStyles";
import { searchStyles as sStyles } from "../../../styles/SearchStyles";
import { ScreenLayout } from "../../Components/ScreenLayout";
import { DarkColors as colors } from "../../../styles/colors";

import { useProfileLogic } from "./ProfileLogic";
import { useSearchLogic } from "../SearchPage/SearchLogic";
import { globals } from "../../../firebase/dbController";
import type { RootStackParamList } from "../../index";

export function Profile(): React.ReactElement {
  const [profileView, setProfileView] = useState<"myProfile" | "search">("myProfile");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [showBioMenu, setShowBioMenu] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { cadetKey, ptScores } = globals();

  const {
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
    llabAttended,
    llabMissed,
    llabExcused,
    llabLate,
    llabAttendancePercent,
    rmpAttended,
    rmpMissed,
    rmpExcused,
    rmpLate,
    rmpAttendancePercent,
    bioDraft,
    setBioDraft,
    savingBio,
    bioMessage,
    handleSaveBio,
  } = useProfileLogic();

  const {
    query,
    setQuery,
    selectedFlight,
    setSelectedFlight,
    flightOptions,
    filteredCadets,
    loadingCadets,
    searchError,
  } = useSearchLogic();

  // Derive the most recent PT score from the history collection.
  // Keys are "YYYY-MM-DD" so lexicographic sort gives us chronological order.
  const latestPTScore = (() => {
    if (!cadetKey) return null;
    const history = ptScores[cadetKey];
    if (!history) return null;
    const keys = Object.keys(history).sort();
    if (keys.length === 0) return null;
    const latest = history[keys[keys.length - 1]];
    return latest ? latest.score.toFixed(1) : null;
  })();

  function getAttendanceColor(percent: number) {
    if (percent >= 90) return "good";
    if (percent >= 80) return "warning";
    return "bad";
  }

  const ptColor = getAttendanceColor(ptAttendancePercent);
  const llabColor = getAttendanceColor(llabAttendancePercent);
  const rmpColor = getAttendanceColor(rmpAttendancePercent);

  return (
    <ScreenLayout>
      <ScrollView
        style={pStyles.body_container}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP TOGGLE */}
        <View style={pStyles.profileToggleRow}>
          <Pressable
            onPress={() => setProfileView("myProfile")}
            style={[
              pStyles.profileToggleButton,
              profileView === "myProfile" && pStyles.profileToggleButtonActive,
            ]}
          >
            <Text
              style={[
                pStyles.profileToggleText,
                profileView === "myProfile" && pStyles.profileToggleTextActive,
              ]}
            >
              My Profile
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setProfileView("search")}
            style={[
              pStyles.profileToggleButton,
              profileView === "search" && pStyles.profileToggleButtonActive,
            ]}
          >
            <Text
              style={[
                pStyles.profileToggleText,
                profileView === "search" && pStyles.profileToggleTextActive,
              ]}
            >
              Search
            </Text>
          </Pressable>
        </View>

        {/* MY PROFILE TAB */}
        {profileView === "myProfile" ? (
          <>
            <View style={pStyles.userinfo_card}>
              <View style={pStyles.avatar_container}>
                <Ionicons name="person" size={28} color="white" />
              </View>

              <View style={pStyles.userinfo_text_container}>
                {loadingProfile ? (
                  <View style={{ marginTop: 4 }}>
                    <ActivityIndicator />
                    <Text style={pStyles.userinfo_sub}>Loading profile…</Text>
                  </View>
                ) : profileError ? (
                  <>
                    <Text style={pStyles.userinfo_sub}>{profileError}</Text>
                    {cadetKey ? (
                      <Text style={pStyles.userinfo_sub}>
                        <Text style={pStyles.label_bold}>Key: </Text>
                        {cadetKey}
                      </Text>
                    ) : null}
                  </>
                ) : !profile ? (
                  <Text style={pStyles.userinfo_sub}>No profile found.</Text>
                ) : (
                  <>
                    <Text style={pStyles.userinfo_name}>
                      {profile.firstName ?? "First"} {profile.lastName ?? "Last"}
                    </Text>

                    <Text style={pStyles.userinfo_sub}>
                      <Text style={pStyles.label_bold}>Rank: </Text>
                      {profile.cadetRank ?? "—"}
                    </Text>

                    <Text style={pStyles.userinfo_sub}>
                      <Text style={pStyles.label_bold}>Class Year: </Text>
                      {profile.classYear ?? "—"}
                    </Text>

                    <Text style={pStyles.userinfo_sub}>
                      <Text style={pStyles.label_bold}>Flight: </Text>
                      {profile.flight ?? "—"}
                    </Text>

                    <Text style={pStyles.userinfo_sub}>
                      <Text style={pStyles.label_bold}>Job: </Text>
                      {profile.job ?? "—"}
                    </Text>

                    <Text style={pStyles.userinfo_sub}>
                      <Text style={pStyles.label_bold}>School Email: </Text>
                      {profile.contact?.schoolEmail ?? "—"}
                    </Text>

                    <Text style={pStyles.userinfo_sub}>
                      <Text style={pStyles.label_bold}>Phone Number: </Text>
                      {profile.contact?.cellPhone ?? "—"}
                    </Text>

                    <Text style={pStyles.userinfo_sub}>
                      <Text style={pStyles.label_bold}>Last PT Score: </Text>
                      {latestPTScore ?? "—"}
                    </Text>
                  </>
                )}

                {loadingAttendance ? (
                  <Text style={pStyles.userinfo_sub}>Loading attendance…</Text>
                ) : attendanceError ? (
                  <Text style={pStyles.userinfo_sub}>{attendanceError}</Text>
                ) : null}
              </View>
            </View>

            {/* BIO SECTION */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 4,
              }}
            >
              <Text style={sStyles.sectionTitle}>My Bio</Text>

              {!isEditingBio ? (
                <View style={{ position: "relative" }}>
                  <Pressable
                    onPress={() => setShowBioMenu((prev) => !prev)}
                    hitSlop={8}
                    style={{ padding: 6 }}
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={20}
                      color={colors.text}
                    />
                  </Pressable>

                  {showBioMenu ? (
                    <View
                      style={{
                        position: "absolute",
                        top: 34,
                        right: 0,
                        backgroundColor: colors.card,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 12,
                        paddingVertical: 6,
                        minWidth: 110,
                        zIndex: 20,
                      }}
                    >
                      <Pressable
                        onPress={() => {
                          setIsEditingBio(true);
                          setShowBioMenu(false);
                        }}
                        style={{ paddingVertical: 10, paddingHorizontal: 14 }}
                      >
                        <Text style={{ color: colors.text, fontSize: 15 }}>
                          Edit Bio
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>

            {/* Bio Card */}
            <View style={sStyles.bioCard}>
              {isEditingBio ? (
                <TextInput
                  value={bioDraft}
                  onChangeText={setBioDraft}
                  multiline
                  placeholder="Write your bio here..."
                  placeholderTextColor={colors.muted}
                  editable={!savingBio}
                  style={[
                    sStyles.bioText,
                    {
                      minHeight: 90,
                      textAlignVertical: "top",
                    },
                  ]}
                />
              ) : (
                <Text
                  style={[
                    sStyles.bioText,
                    {
                      minHeight: 90,
                    },
                  ]}
                >
                  {bioDraft?.trim() ? bioDraft : "No bio yet."}
                </Text>
              )}
            </View>

            {isEditingBio ? (
              <Pressable
                onPress={async () => {
                  const didSave = await handleSaveBio();
                  if (didSave) {
                    setIsEditingBio(false);
                    setShowBioMenu(false);
                  }
                }}
                disabled={savingBio}
                style={[
                  sStyles.flightChip,
                  {
                    alignSelf: "flex-start",
                    marginTop: 10,
                    marginBottom: 6,
                    opacity: savingBio ? 0.7 : 1,
                  },
                  sStyles.flightChipActive,
                ]}
              >
                <Text style={sStyles.flightChipTextActive}>
                  {savingBio ? "Saving..." : "Save Bio"}
                </Text>
              </Pressable>
            ) : null}

            {bioMessage ? (
              <Text
                style={[
                  sStyles.stateText,
                  { textAlign: "left", marginBottom: 12 },
                ]}
              >
                {bioMessage}
              </Text>
            ) : null}

            {/* ATTENDANCE SECTION */}
            {/* PT ATTENDANCE */}
            <Text style={pStyles.sectionTitle}>PT Attendance</Text>

            <View style={pStyles.attendance_card}>
              <View style={pStyles.attendance_top_row}>
                <View
                  style={[
                    pStyles.attendance_circle,
                    ptColor === "good"
                      ? pStyles.circle_good
                      : ptColor === "warning"
                      ? pStyles.circle_warning
                      : pStyles.circle_bad,
                  ]}
                >
                  <Text style={pStyles.attendance_percent_text}>
                    {ptAttendancePercent}%
                  </Text>
                </View>

                <View style={pStyles.standing_container}>
                  <View
                    style={[
                      pStyles.standing_pill,
                      ptColor === "good"
                        ? pStyles.pill_good
                        : ptColor === "warning"
                        ? pStyles.pill_warning
                        : pStyles.pill_bad,
                    ]}
                  >
                    <Text style={pStyles.standing_pill_text}>
                      {ptColor === "good"
                        ? "Good Standing"
                        : ptColor === "warning"
                        ? "Warning"
                        : "Bad Standing"}
                    </Text>
                  </View>

                  <Text style={pStyles.standing_hint}>
                    Good standing requires ≥ 90%
                  </Text>
                  <Text style={pStyles.standing_hint}>
                    Excused does not count against you
                  </Text>
                </View>
              </View>

              <View style={pStyles.stacked_bar}>
                <View
                  style={[
                    pStyles.bar_segment,
                    pStyles.bar_attended,
                    { flex: Math.max(ptAttended, 0.001) },
                  ]}
                />
                <View
                  style={[
                    pStyles.bar_segment,
                    pStyles.bar_missed,
                    { flex: Math.max(ptMissed, 0.001) },
                  ]}
                />
              </View>

              <View style={pStyles.legend_row}>
                <View style={pStyles.legend_item}>
                  <View style={[pStyles.legend_dot, pStyles.bar_attended]} />
                  <Text style={pStyles.legend_text}>Attended ({ptAttended})</Text>
                </View>

                <View style={pStyles.legend_item}>
                  <View style={[pStyles.legend_dot, pStyles.bar_missed]} />
                  <Text style={pStyles.legend_text}>Missed ({ptMissed})</Text>
                </View>
              </View>

              <View style={[pStyles.legend_row, { marginTop: 6 }]}>
                <View style={pStyles.legend_item}>
                  <View
                    style={[pStyles.legend_dot, { backgroundColor: "#9AA3B2" }]}
                  />
                  <Text style={pStyles.legend_text}>Excused ({ptExcused})</Text>
                </View>

                <View style={pStyles.legend_item}>
                  <View
                    style={[pStyles.legend_dot, { backgroundColor: "#9AA3B2" }]}
                  />
                  <Text style={pStyles.legend_text}>Late ({ptLate})</Text>
                </View>
              </View>
            </View>

            {/* LLAB ATTENDANCE */}
            <Text style={pStyles.sectionTitle}>LLAB Attendance</Text>

            <View style={pStyles.attendance_card}>
              <View style={pStyles.attendance_top_row}>
                <View
                  style={[
                    pStyles.attendance_circle,
                    llabColor === "good"
                      ? pStyles.circle_good
                      : llabColor === "warning"
                      ? pStyles.circle_warning
                      : pStyles.circle_bad,
                  ]}
                >
                  <Text style={pStyles.attendance_percent_text}>
                    {llabAttendancePercent}%
                  </Text>
                </View>

                <View style={pStyles.standing_container}>
                  <View
                    style={[
                      pStyles.standing_pill,
                      llabColor === "good"
                        ? pStyles.pill_good
                        : llabColor === "warning"
                        ? pStyles.pill_warning
                        : pStyles.pill_bad,
                    ]}
                  >
                    <Text style={pStyles.standing_pill_text}>
                      {llabColor === "good"
                        ? "Good Standing"
                        : llabColor === "warning"
                        ? "Warning"
                        : "Bad Standing"}
                    </Text>
                  </View>

                  <Text style={pStyles.standing_hint}>
                    Good standing requires ≥ 90%
                  </Text>
                  <Text style={pStyles.standing_hint}>
                    Excused does not count against you
                  </Text>
                </View>
              </View>

              <View style={pStyles.stacked_bar}>
                <View
                  style={[
                    pStyles.bar_segment,
                    pStyles.bar_attended,
                    { flex: Math.max(llabAttended, 0.001) },
                  ]}
                />
                <View
                  style={[
                    pStyles.bar_segment,
                    pStyles.bar_missed,
                    { flex: Math.max(llabMissed, 0.001) },
                  ]}
                />
              </View>

              <View style={pStyles.legend_row}>
                <View style={pStyles.legend_item}>
                  <View style={[pStyles.legend_dot, pStyles.bar_attended]} />
                  <Text style={pStyles.legend_text}>Attended ({llabAttended})</Text>
                </View>

                <View style={pStyles.legend_item}>
                  <View style={[pStyles.legend_dot, pStyles.bar_missed]} />
                  <Text style={pStyles.legend_text}>Missed ({llabMissed})</Text>
                </View>
              </View>

              <View style={[pStyles.legend_row, { marginTop: 6 }]}>
                <View style={pStyles.legend_item}>
                  <View
                    style={[pStyles.legend_dot, { backgroundColor: "#9AA3B2" }]}
                  />
                  <Text style={pStyles.legend_text}>Excused ({llabExcused})</Text>
                </View>

                <View style={pStyles.legend_item}>
                  <View
                    style={[pStyles.legend_dot, { backgroundColor: "#9AA3B2" }]}
                  />
                  <Text style={pStyles.legend_text}>Late ({llabLate})</Text>
                </View>
              </View>
            </View>

            {/* RMP ATTENDANCE */}
            <Text style={pStyles.sectionTitle}>RMP Attendance</Text>

            <View style={pStyles.attendance_card}>
              <View style={pStyles.attendance_top_row}>
                <View
                  style={[
                    pStyles.attendance_circle,
                    rmpColor === "good"
                      ? pStyles.circle_good
                      : rmpColor === "warning"
                      ? pStyles.circle_warning
                      : pStyles.circle_bad,
                  ]}
                >
                  <Text style={pStyles.attendance_percent_text}>
                    {rmpAttendancePercent}%
                  </Text>
                </View>

                <View style={pStyles.standing_container}>
                  <View
                    style={[
                      pStyles.standing_pill,
                      rmpColor === "good"
                        ? pStyles.pill_good
                        : rmpColor === "warning"
                        ? pStyles.pill_warning
                        : pStyles.pill_bad,
                    ]}
                  >
                    <Text style={pStyles.standing_pill_text}>
                      {rmpColor === "good"
                        ? "Good Standing"
                        : rmpColor === "warning"
                        ? "Warning"
                        : "Bad Standing"}
                    </Text>
                  </View>

                  <Text style={pStyles.standing_hint}>
                    Good standing requires ≥ 90%
                  </Text>
                  <Text style={pStyles.standing_hint}>
                    Excused does not count against you
                  </Text>
                </View>
              </View>

              <View style={pStyles.stacked_bar}>
                <View
                  style={[
                    pStyles.bar_segment,
                    pStyles.bar_attended,
                    { flex: Math.max(rmpAttended, 0.001) },
                  ]}
                />
                <View
                  style={[
                    pStyles.bar_segment,
                    pStyles.bar_missed,
                    { flex: Math.max(rmpMissed, 0.001) },
                  ]}
                />
              </View>

              <View style={pStyles.legend_row}>
                <View style={pStyles.legend_item}>
                  <View style={[pStyles.legend_dot, pStyles.bar_attended]} />
                  <Text style={pStyles.legend_text}>Attended ({rmpAttended})</Text>
                </View>

                <View style={pStyles.legend_item}>
                  <View style={[pStyles.legend_dot, pStyles.bar_missed]} />
                  <Text style={pStyles.legend_text}>Missed ({rmpMissed})</Text>
                </View>
              </View>

              <View style={[pStyles.legend_row, { marginTop: 6 }]}>
                <View style={pStyles.legend_item}>
                  <View
                    style={[pStyles.legend_dot, { backgroundColor: "#9AA3B2" }]}
                  />
                  <Text style={pStyles.legend_text}>Excused ({rmpExcused})</Text>
                </View>

                <View style={pStyles.legend_item}>
                  <View
                    style={[pStyles.legend_dot, { backgroundColor: "#9AA3B2" }]}
                  />
                  <Text style={pStyles.legend_text}>Late ({rmpLate})</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* SEARCH TAB */}
            <Text style={sStyles.sectionTitle}>Search Cadets</Text>

            <View style={sStyles.searchBar}>
              <Ionicons
                name="search"
                size={18}
                color={colors.muted}
                style={sStyles.searchIcon}
              />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name or job...."
                placeholderTextColor={colors.muted}
                style={sStyles.searchInput}
              />
              {query.length > 0 ? (
                <Pressable onPress={() => setQuery("")}>
                  <Ionicons name="close-circle" size={18} color={colors.muted} />
                </Pressable>
              ) : null}
            </View>

            <Text style={sStyles.filterLabel}>Filter by Flight</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={sStyles.flightFilterRow}
            >
              <Pressable
                style={[
                  sStyles.flightChip,
                  selectedFlight === "" && sStyles.flightChipActive,
                ]}
                onPress={() => setSelectedFlight("")}
              >
                <Text
                  style={[
                    sStyles.flightChipText,
                    selectedFlight === "" && sStyles.flightChipTextActive,
                  ]}
                >
                  All
                </Text>
              </Pressable>

              {flightOptions.map((flight) => {
                const isActive = selectedFlight === flight;

                return (
                  <Pressable
                    key={flight}
                    style={[
                      sStyles.flightChip,
                      isActive && sStyles.flightChipActive,
                    ]}
                    onPress={() => setSelectedFlight(isActive ? "" : flight)}
                  >
                    <Text
                      style={[
                        sStyles.flightChipText,
                        isActive && sStyles.flightChipTextActive,
                      ]}
                    >
                      {flight}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {loadingCadets ? (
              <View style={sStyles.stateCard}>
                <ActivityIndicator />
                <Text style={sStyles.stateText}>Loading cadets…</Text>
              </View>
            ) : searchError ? (
              <View style={sStyles.stateCard}>
                <Text style={sStyles.stateText}>{searchError}</Text>
              </View>
            ) : filteredCadets.length === 0 ? (
              <View style={sStyles.stateCard}>
                <Text style={sStyles.stateText}>No cadets found.</Text>
              </View>
            ) : (
              filteredCadets.map((cadet) => (
                <Pressable
                  key={cadet.cadetKey}
                  style={sStyles.resultCard}
                  onPress={() =>
                    navigation.navigate("PublicProfile", {
                      cadetKey: cadet.cadetKey,
                    })
                  }
                >
                  <View style={sStyles.resultLeft}>
                    <View style={sStyles.avatar_container}>
                      <Ionicons name="person" size={22} color="white" />
                    </View>

                    <View style={sStyles.resultTextContainer}>
                      <Text style={sStyles.resultName}>
                        {cadet.firstName ?? "First"} {cadet.lastName ?? "Last"}
                      </Text>

                      <Text style={sStyles.resultSub}>
                        {cadet.cadetRank ?? "—"} • {cadet.job ?? "—"}
                      </Text>

                      <Text style={sStyles.resultSub}>
                        {cadet.flight ?? "—"} • {cadet.classYear ?? "—"}
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.muted}
                  />
                </Pressable>
              ))
            )}
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
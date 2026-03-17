// Jobs.tsx
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useJobsLogic, JobsAction } from "./JobsLogic";

type NavAny = ReturnType<typeof useNavigation<any>>;

function iconForAction(id: JobsAction["id"]) {
  switch (id) {
    case "attendance":
      return "checkbox-outline";
    case "files":
      return "cloud-upload-outline";
    case "create_accounts":
      return "person-add-outline";
    case "event_making":
      return "calendar-outline";
    default:
      return "briefcase-outline";
  }
}

export function Jobs(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const navigation: NavAny = useNavigation();

  const { cadetKey, profile, loading, error, permissionNames, actions } =
    useJobsLogic();

  const fullName =
    profile?.firstName || profile?.lastName
      ? `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()
      : "Cadet";

  const jobText = profile?.job ?? "—";

  const permissionText =
    permissionNames.length > 0 ? permissionNames.join(", ") : "None";

  const onPressAction = (a: JobsAction) => {
    if (!a.allowed) return;

    if (a.id === "create_accounts") {
      Alert.alert("Coming soon", "Account creation will be added later.");
      return;
    }

    if (!a.routeHint) return;
    navigation.navigate(a.routeHint);
  };

  const anyVisibleActions = actions.length > 0;

  return (
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

          <Text style={styles.header_text}>Jobs</Text>
          <View style={styles.right_space} />
        </View>
      </View>

      {/* BODY */}
      <ScrollView
        style={styles.body_container}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* USER INFO CARD */}
        <View style={styles.userinfo_card}>
          <View style={styles.avatar_container}>
            <Ionicons name="briefcase" size={26} color="white" />
          </View>

          <View style={styles.userinfo_text_container}>
            {loading ? (
              <View style={{ marginTop: 4 }}>
                <ActivityIndicator />
                <Text style={styles.userinfo_sub}>Loading jobs…</Text>
              </View>
            ) : error ? (
              <>
                <Text style={styles.userinfo_sub}>{error}</Text>
                {cadetKey ? (
                  <Text style={styles.userinfo_sub}>
                    <Text style={styles.label_bold}>Key: </Text>
                    {cadetKey}
                  </Text>
                ) : null}
              </>
            ) : (
              <>
                <Text style={styles.userinfo_name}>{fullName}</Text>

                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>Job: </Text>
                  {jobText}
                </Text>

                <Text style={styles.userinfo_sub}>
                  <Text style={styles.label_bold}>Permissions: </Text>
                  {permissionText}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* ACTIONS */}
        {!loading && !error && anyVisibleActions ? (
          <>
            <Text style={styles.section_header}>Actions</Text>

            {actions.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => onPressAction(a)}
                style={styles.action_card}
              >
                <View style={styles.action_left}>
                  <View style={styles.action_icon_circle}>
                    <Ionicons
                      name={iconForAction(a.id) as any}
                      size={22}
                      color="white"
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.action_title}>{a.title}</Text>
                    <Text style={styles.action_subtitle}>{a.subtitle}</Text>
                  </View>
                </View>

                <View style={styles.action_right}>
                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color="white"
                  />
                </View>
              </Pressable>
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

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

  userinfo_card: {
    backgroundColor: "#111B2E",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
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

  label_bold: {
    fontWeight: "700",
    color: "white",
  },

  section_header: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 4,
  },

  action_card: {
    backgroundColor: "#111B2E",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  action_left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },

  action_icon_circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0B1220",
    justifyContent: "center",
    alignItems: "center",
  },

  action_title: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },

  action_subtitle: {
    color: "#9AA3B2",
    fontSize: 12,
    marginTop: 4,
  },

  action_right: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
});
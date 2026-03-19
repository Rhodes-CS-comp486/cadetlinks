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
import { jobStyles as styles } from "../../../styles/JobStyles";
import { ScreenLayout } from '../../Components/ScreenLayout';

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
    <ScreenLayout>
      <View style={styles.body_container}>

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
              <Text style={styles.sectionTitle}>Actions</Text>

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
    </ScreenLayout>
  );
}
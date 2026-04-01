import React from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useRoute,
  RouteProp,
} from "@react-navigation/native";
import { ScreenLayout } from "../../Components/ScreenLayout";
import { searchStyles as styles } from "../../../styles/SearchStyles";
import { DarkColors as colors } from "../../../styles/colors";
import { usePublicProfileLogic } from "./PublicProfileLogic";
import type { RootStackParamList } from "../../index";

type PublicProfileRouteProp = RouteProp<RootStackParamList, "PublicProfile">;

export function PublicProfile(): React.ReactElement { 
  const route = useRoute<PublicProfileRouteProp>();
  const { cadetKey } = route.params;

  const { profile, loadingProfile, profileError } =
    usePublicProfileLogic(cadetKey);

  return (
    <ScreenLayout>
      <ScrollView
        style={styles.body_container}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Public Profile</Text>

        <View style={styles.publicProfileCard}>
          <View style={styles.publicInfoColumn}>
            {loadingProfile ? (
              <>
                <ActivityIndicator />
                <Text style={styles.userinfo_sub}>Loading profile…</Text>
              </>
            ) : profileError ? (
              <Text style={styles.userinfo_sub}>{profileError}</Text>
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

          {profile?.photoUrl ? (
            <Image
              source={{ uri: profile.photoUrl }}
              style={styles.publicPhoto}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.publicImagePlaceholder}>
              <Ionicons name="image-outline" size={34} color={colors.muted} />
              <Text style={styles.publicImagePlaceholderText}>Photo</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Bio</Text>
        <View style={styles.bioCard}>
          <Text style={styles.bioText}>
            {profile?.bio?.trim()
              ? profile.bio
              : "This cadet has not added a bio yet."}
          </Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}


import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenLayout } from "../../Components/ScreenLayout";
import { searchStyles as styles } from "../../../styles/SearchStyles";
import { DarkColors as colors } from "../../../styles/colors";
import { useSearchLogic } from "./SearchLogic";
import type { RootStackParamList } from "../../index";

export function Search(): React.ReactElement {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { query, setQuery, filteredCadets, loadingCadets, searchError } =
    useSearchLogic();

  return (
    <ScreenLayout>
      <ScrollView
        style={styles.body_container}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Search Cadets</Text>

        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color={colors.muted}
            style={styles.searchIcon}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, rank, job, flight..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
          {/* if there's text in the search bar, show an "X" button to clear it. */}
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>

        {/* show loading state, error, or "no results". otherwise show search results as a list of cards. */}
        {loadingCadets ? (
          <View style={styles.stateCard}>
            <ActivityIndicator />
            <Text style={styles.stateText}>Loading cadets…</Text>
          </View>
        ) : searchError ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>{searchError}</Text>
          </View>
        ) : filteredCadets.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateText}>No cadets found.</Text>
          </View>
        ) : (
          filteredCadets.map((cadet) => (
            <Pressable
              key={cadet.cadetKey}
              style={styles.resultCard}
              onPress={() =>
                navigation.navigate("PublicProfile", {
                  cadetKey: cadet.cadetKey,
                })
              }
            >
              {/* for each search result, show their name, rank, job, flight, class year. Clicking it goes to their public profile page. */}
              <View style={styles.resultLeft}>
                <View style={styles.avatar_container}>
                  <Ionicons name="person" size={22} color="white" />
                </View>

                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultName}>
                    {cadet.firstName ?? "First"} {cadet.lastName ?? "Last"}
                  </Text>

                  <Text style={styles.resultSub}>
                    {cadet.cadetRank ?? "—"} • {cadet.job ?? "—"}
                  </Text>

                  <Text style={styles.resultSub}>
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
      </ScrollView>
    </ScreenLayout>
  );
}
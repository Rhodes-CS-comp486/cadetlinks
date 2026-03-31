import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { searchStyles as styles } from "../../../styles/SearchStyles";
import { ScreenLayout } from "../../Components/ScreenLayout";

// something like this to capture the structure in the database
type SearchCadet = {
  firstName: string;
  lastName: string;
  rank: string;
  flight: string;
  job: string;
};

// maybe a filtering system? idk.
const filterOptions = ["All", "Flight", "Rank", "Job"] as const;
type FilterOption = (typeof filterOptions)[number];

export function Search(): React.ReactElement {
  const [query, setQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("All");



  return (
    <ScreenLayout title="Profile Search">
      <ScrollView
        style={styles.body_container}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          <Text style={styles.titleCadet}>Cadet</Text>
          <Text style={styles.titleLinks}> Search</Text>
        </Text>

        <Text style={styles.subtitle}>
          Search for cadets by name, rank, flight, or job.
        </Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={18}
            color="#9AA3B2"
            style={styles.searchIcon}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search cadets..."
            placeholderTextColor="#9AA3B2"
            style={styles.searchInput}
          />
        </View>

        {/* Filter chips */}
        <Text style={styles.sectionTitle}>Filter By</Text>
        <View style={styles.filterRow}>
          {filterOptions.map((option) => {
            const isSelected = selectedFilter === option;

            return (
              <Pressable
                key={option}
                onPress={() => setSelectedFilter(option)}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Results */}
        <Text style={styles.sectionTitle}>Results</Text>
      </ScrollView>
    </ScreenLayout>
  );
}
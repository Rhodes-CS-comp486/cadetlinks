import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase/config";

export default function Test() {
  return <View><Text>Test Screen</Text></View>;
}

export function Profile(){
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load a real cadet from your database
    const profileRef = ref(db, "cadets/icdixon_memphis_edu");

    const unsubscribe = onValue(profileRef, (snapshot) => {
      console.log("🔥 Loaded profile:", snapshot.val());
      setProfile(snapshot.val());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading profile…</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>No profile found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Name: {profile.firstName} {profile.lastName}
      </Text>
      <Text style={styles.label}>Rank: {profile.cadetRank}</Text>
      <Text style={styles.label}>Job: {profile.job}</Text>
      <Text style={styles.label}>Flight: {profile.flight}</Text>
      <Text style={styles.label}>Class Year: {profile.classYear}</Text>
      <Text style={styles.label}>School Email: {profile.contact?.schoolEmail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
});
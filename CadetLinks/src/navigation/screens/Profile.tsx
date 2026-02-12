import React, { useState } from "react"; // makes sure screen remembers data
import {
  View, // container
  Text, // displaying text
  TextInput, // stores user inputs
  Pressable, // for login button and forgot password
  StyleSheet, // basically a css file
  KeyboardAvoidingView, // so that when you type, you can still see everything
  Platform,
  Keyboard, // detects android or iphone
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context"; // keeps in mind phone notches

import { StaticScreenProps, useNavigation } from "@react-navigation/native"; // to navigate to the home screen 
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../index";

type Props = StaticScreenProps<{
  user: string;
}>;


export function Profile({ route }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
      <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header_container, { paddingTop: insets.top + 10 }]}>
        <View style={styles.header_row}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back_button}>
            <Ionicons name="chevron-back" size={26} color="white" />
          </Pressable>

          <Text style={styles.header_text}>Profile</Text>

          <View style={styles.right_space} />
        </View>
      </View>

      {/* BODY */}
      <View style={styles.body_container}>
        <View style={styles.userinfo_card}>
          <View style={styles.avatar_container}>
            <Ionicons name="person" size={28} color="#FB9E50" />
          </View>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B1220'},
    container: {
      flex: 1,
      gap: 10,
      backgroundColor: '#0B1220',
  },
  // HEADER
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

  back_button: {
    width: 40,
    alignItems: "flex-start",
  },

  right_space: { // centers Profile by taking into account the arrow on the left
    width: 40,
  },

header_text: {
  color: "white",
  fontSize: 22,
  fontWeight: "600",
  textAlign: "center",
  flex: 1, // centers text
},

// BODY (the rest of the screen besides the header)
body_container: {
  flex: 1,
  padding: 16,
  backgroundColor: "#0B1220", // matches overall container
},

// USER INFO CARD
userinfo_card: {
  backgroundColor: "#111B2E",
  borderRadius: 18,
  padding: 16,

  flexDirection: "row", // puts avatar and text next to each other by default instead of on top of each other
  alignItems: "center",
},

avatar_container: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "#0B1220",

  justifyContent: "center",
  alignItems: "center",

  marginRight: 14,  // space between icon and text
},

userinfo_text_container: {
  flex: 1, // so that the text takes the rest of the space
},

userinfo_name: {
  color: "#FB9E50",
  fontSize: 18,
  fontWeight: "700",
},

userinfo_sub: {
  color: "#9AA3B2",
  fontSize: 14,
  marginTop: 4,
},
});

// Here will be the attendance part
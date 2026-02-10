import React, { useState } from "react"; // makes sure screen remembers data
import {
  View, // container
  Text, // displaying text
  TextInput, // stores user inputs
  Pressable, // for login button and forgot password
  StyleSheet, // basically a css file
  KeyboardAvoidingView, // so that when you type, you can still see everything
  Platform, // detects android or iphone
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // keeps in mind phone notches

import { useNavigation } from "@react-navigation/native"; // to navigate to the home screen 
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../index";

export function Login() { // makes screen
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Login">>();

  return (
    <SafeAreaView style={styles.safe}> {/*safe for iphone (padding on top)*/}
      <KeyboardAvoidingView // moves content up when keyboard is open
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}> {/*main container to center everything*/}
          <Text style={styles.title}> 
            <Text style={{ color: "#FB9E50" }}>Cadet</Text>
            <Text style={{ color: "#FFFFFF" }}>Links</Text>
          </Text>
          <Text style={styles.subtitle}>AFROTC Cadet Portal</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@school.edu"
              placeholderTextColor="#8A94A6"
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#8A94A6"
              secureTextEntry
              style={styles.input}
            />

            <Pressable
              style={styles.primaryBtn}
              onPress={() => navigation.replace("HomeTabs")}
            >
              <Text style={styles.primaryBtnText}>Log in</Text>
            </Pressable>

            <Pressable onPress={() => {}}>
              <Text style={styles.link}>Forgot password?</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1220" }, // flex 1 means it takes up the whole screen
  container: { flex: 1, justifyContent: "center", padding: 24 }, // padding between the border and stuff
  title: { color: "white", fontSize: 34, fontWeight: "800" },
  subtitle: { color: "#B8C0CC", marginTop: 6, marginBottom: 20 },
  card: { backgroundColor: "#111B2E", borderRadius: 18, padding: 18 }, // radius rounds corners
  label: { color: "#DCE3F0", marginTop: 10, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "#0B1220",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "white",
  },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: "#FB9E50",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center", // horizontal center while jc is vertical
  },
  primaryBtnText: { color: "white", fontWeight: "800", fontSize: 16 },
  link: { marginTop: 12, textAlign: "center", color: "#f7b37c", fontWeight: "700" },
});

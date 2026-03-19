import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../index";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, get } from "firebase/database";
import { db } from "../../firebase/config";

/**
 * Turn what the user types into your RTDB key format.
 * Examples:
 *  - "icdixon@memphis.edu"  -> "icdixon_memphis_edu"
 *  - "camcoolsharp@gmail.com" -> "camcoolsharp_gmail_com"
 *  - If they already type "icdixon_memphis_edu", it stays basically the same.
 */
export let cadetKey: string | null = null; 

function toCadetKey(raw: string): string {
  cadetKey = raw.trim().toLowerCase();

  // If they typed the already-formatted key, keep it.
  if (cadetKey.includes("_") && !cadetKey.includes("@")) return cadetKey;

  // Otherwise, convert email-ish string to key
  return cadetKey
    .replace(/@/g, "_")
    .replace(/\./g, "_")
    .replace(/-/g, "_");
}

export function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>(""); // still required, but not validated here (no passwords in your export)
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "Login">>();

  const handleLogin = async () => {
    const enteredUsername = email.trim();
    const enteredPassword = password.trim();

    // require something to be typed
    if (!enteredUsername || !enteredPassword) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      cadetKey = toCadetKey(enteredUsername);

      // Check if this cadet exists in RTDB
      const cadetRef = ref(db, `cadets/${cadetKey}`);
      const snapshot = await get(cadetRef);

      if (!snapshot.exists()) {
        setError("User not found. (Check spelling / try your full email.)");
        return;
      }

      // Save who is logged in so Profile can load the correct record
      await AsyncStorage.setItem("currentCadetKey", cadetKey);

      // Go to app
      navigation.replace("HomeTabs");
    } catch (e) {
      console.error("Login error:", e);
      setError("Could not log in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>
            <Text style={{ color: "#FB9E50" }}>Cadet</Text>
            <Text style={{ color: "#FFFFFF" }}>Links</Text>
          </Text>

          <Text style={styles.subtitle}>AFROTC Cadet Portal</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email or cadet key"
              placeholderTextColor="#8A94A6"
              autoCapitalize="none"
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

            {error !== "" && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              style={[styles.primaryBtn, loading && { opacity: 0.8 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <ActivityIndicator />
                  <Text style={styles.primaryBtnText}>Logging in…</Text>
                </View>
              ) : (
                <Text style={styles.primaryBtnText}>Log in</Text>
              )}
            </Pressable>

            <Pressable onPress={() => navigation.navigate("ChangePassword")}>
              <Text style={styles.link}>Forgot password?</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1220" },
  container: { flex: 1, justifyContent: "center", padding: 24 },

  title: { color: "white", fontSize: 34, fontWeight: "800" },
  subtitle: { color: "#B8C0CC", marginTop: 6, marginBottom: 20 },

  card: { backgroundColor: "#111B2E", borderRadius: 18, padding: 18 },

  label: {
    color: "#DCE3F0",
    marginTop: 10,
    marginBottom: 6,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#0B1220",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "white",
  },

  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 4,
    fontWeight: "600",
  },

  primaryBtn: {
    marginTop: 16,
    backgroundColor: "#FB9E50",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  primaryBtnText: { color: "white", fontWeight: "800", fontSize: 16 },

  link: {
    marginTop: 12,
    textAlign: "center",
    color: "#f7b37c",
    fontWeight: "700",
  },
});
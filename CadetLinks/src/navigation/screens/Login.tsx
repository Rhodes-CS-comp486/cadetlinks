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

import { loginStyles as styles } from "../../styles/LoginStyles";

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
    <SafeAreaView style={styles.outer_container}>
      <KeyboardAvoidingView
        style={styles.outer_container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.body_container}>
          <Text>
            <Text style={styles.titleCadet}>Cadet</Text>
            <Text style={styles.titleLinks}>Links</Text>
          </Text>

          <Text style={styles.subtitle}>AFROTC Cadet Portal</Text>

          <View style={styles.card}>
            <Text style={styles.text}>Username</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email or cadet key"
              placeholderTextColor={styles.inputPlaceholder.color}
              autoCapitalize="none"
              style={[styles.inputPlaceholder, email.length > 0 ? styles.inputUser : styles.inputPlaceholder]}
            />

            <Text style={styles.text}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={styles.inputPlaceholder.color}
              secureTextEntry
              style={[styles.inputPlaceholder,password.length > 0 ? styles.inputUser : styles.inputPlaceholder]}
            />

            {error !== "" && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              style={[styles.primaryBtn, loading && { opacity: 0.8 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator />
                  <Text style={styles.primaryBtnText}>Logging in…</Text>
                </View>
              ) : (
                <Text style={styles.primaryBtnText}>Log in</Text>
              )}
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
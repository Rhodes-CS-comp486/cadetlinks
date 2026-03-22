// Login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "../../firebase/config";
import { loginStyles as styles } from "../../styles/LoginStyles";

export function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "Login">>();

  const handleLogin = async () => {
    const enteredEmail = email.trim().toLowerCase();
    const enteredPassword = password.trim();

    if (!enteredEmail || !enteredPassword) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Firebase Auth validates the password
      await signInWithEmailAndPassword(auth, enteredEmail, enteredPassword);

      // 2. Derive the old email-based key the same way your sheet sync does
      const cadetKey = enteredEmail
        .replace(/@/g, "_")
        .replace(/\./g, "_")
        .replace(/-/g, "_");

      // 3. Confirm cadet profile exists in database under that key
      const profileSnap = await get(ref(db, `cadets/${cadetKey}`));
      if (!profileSnap.exists()) {
        setError("No cadet profile found for this account.");
        return;
      }

      // 4. Save the email-derived key (not uid) for the rest of the app
      await AsyncStorage.setItem("currentCadetKey", cadetKey);

      navigation.replace("HomeTabs");
    } catch (e: any) {
      if (
        e.code === "auth/wrong-password" ||
        e.code === "auth/user-not-found" ||
        e.code === "auth/invalid-credential"
      ) {
        setError("Incorrect email or password.");
      } else if (e.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Try again later.");
      } else if (e.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Could not log in. Please try again.");
        console.error("❌ Login error:", e);
        console.error("❌ Login error code:", e.code);  // add this
        console.error("❌ Login error message:", e.message);  // add this
      }
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
            <Text style={styles.text}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@memphis.edu"
              placeholderTextColor={styles.inputPlaceholder.color}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[
                styles.inputPlaceholder,
                email.length > 0 ? styles.inputUser : styles.inputPlaceholder,
              ]}
            />

            <Text style={styles.text}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={styles.inputPlaceholder.color}
              secureTextEntry
              style={[
                styles.inputPlaceholder,
                password.length > 0
                  ? styles.inputUser
                  : styles.inputPlaceholder,
              ]}
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

            <Pressable onPress={() => navigation.navigate("ChangePassword")}>
              <Text style={styles.link}>Forgot password?</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../index";

export function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, "Login">>();

  // LOGIN CHECK
  const handleLogin = () => {
    const enteredUsername = email.trim().toLowerCase();
    const enteredPassword = password.trim();

    // require something to be typed
    if (!enteredUsername || !enteredPassword) {
      setError("Please enter both username and password.");
      return;
    }

    // fake credentials for now
    if (enteredUsername === "cadet" && enteredPassword === "cadet") {
      setError("");
      navigation.replace("HomeTabs");
    } else {
      setError("Invalid username or password.");
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
              placeholder="Username"
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

            <Pressable style={styles.primaryBtn} onPress={handleLogin}>
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

// screens/ForgotPassword.tsx
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
import { sendPasswordResetEmail } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "../../firebase/config";
import { generalStyles as styles } from "../../styles/GeneralStyles";
import { DarkColors as colors } from "../../styles/colors";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleReset = async () => {
    const enteredEmail = email.trim().toLowerCase();

    if (!enteredEmail) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Check if cadet exists in the database
      const cadetKey = enteredEmail
        .replace(/@/g, "_")
        .replace(/\./g, "_")
        .replace(/-/g, "_");

      const profileSnap = await get(ref(db, `cadets/${cadetKey}`));
      if (!profileSnap.exists()) {
        setError("No cadet account found with that email.");
        return;
      }

      // 2. Send Firebase password reset email
      await sendPasswordResetEmail(auth, enteredEmail);
      setSent(true);

    } catch (e: any) {
      if (e.code === "auth/user-not-found") {
        setError("No account found with that email.");
      } else if (e.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Could not send reset email. Please try again.");
        console.error("❌ Password reset error:", e.code, e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.body_container}>

          {/* Header */}
          <Text style={[styles.title, { color: colors.text, marginBottom: 4 }]}>
            Reset Password
          </Text>
          <Text style={styles.subtitle}>
            Enter your school email to receive a reset link.
          </Text>

          {sent ? (
            // ── Success state ──
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 18,
              padding: 24,
              marginTop: 8,
              gap: 16,
            }}>
              <Text style={[styles.text, { textAlign: "center", fontSize: 18, fontWeight: "700" }]}>
                ✅ Reset email sent!
              </Text>
              <Text style={[styles.text, { textAlign: "center", color: colors.muted }]}>
                Check your inbox for a link to reset your password.
              </Text>
              <Pressable
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: "center",
                  marginTop: 8,
                }}
                onPress={() => navigation.goBack()}
              >
                <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
                  Back to Login
                </Text>
              </Pressable>
            </View>

          ) : (
            // ── Input state ──
            <View style={{
              backgroundColor: colors.card,
              borderRadius: 18,
              padding: 20,
              marginTop: 8,
              gap: 12,
            }}>

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
                  { paddingHorizontal: 14, paddingVertical: 12 },
                  email.length > 0 && styles.inputUser,
                ]}
              />

              {error !== "" && (
                <Text style={{ color: colors.danger ?? "#ff4d4d", fontSize: 14 }}>
                  {error}
                </Text>
              )}

              <Pressable
                style={[
                  {
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: "center",
                    marginTop: 4,
                  },
                  loading && { opacity: 0.8 },
                ]}
                onPress={handleReset}
                disabled={loading}
              >
                {loading ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <ActivityIndicator color={colors.text} />
                    <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
                      Sending…
                    </Text>
                  </View>
                ) : (
                  <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
                    Send Reset Email
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={() => navigation.goBack()}
                style={{ alignItems: "center", marginTop: 4 }}
              >
                <Text style={{ color: colors.muted, fontSize: 14 }}>
                  Back to Login
                </Text>
              </Pressable>

            </View>
          )}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
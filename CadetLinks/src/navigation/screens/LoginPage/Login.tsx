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
import type { RootStackParamList } from "../../index";
import { useLoginLogic } from "./LoginLogic";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { ref, get } from "firebase/database";
// import { db } from "../../../firebase/config";

import { loginStyles as styles } from "../../../styles/LoginStyles";

//import { loginStyles as styles } from "./styles/loginStyles";
export function Login() {
  const { 
    handleLogin,
    email,
    setEmail,
    password, 
    setPassword, 
    error, 
    setError,
    loading, 
    setLoading,
    navigation
  } = useLoginLogic();

  return (
    <SafeAreaView style={styles.outer_container}>
      <KeyboardAvoidingView
        style={styles.outer_container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.body_container}>
          <Text>
            <Text style={[styles.title, styles.titleCadet]}>Cadet</Text>
            <Text style={[styles.title, styles.titleLinks]}>Links</Text>
          </Text>

          <Text style={styles.subtitle}>AFROTC Cadet Portal</Text>

          <View style={styles.card}>
            <Text style={styles.text}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder=" Cadet Email"
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
              placeholder=" ••••••••"
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
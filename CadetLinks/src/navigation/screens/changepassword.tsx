import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, Pressable } from "react-native";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";

export default function ChangePasswordScreen() {

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [oldPasswordVisible, setOldPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  const changePassword = async () => {

    if (!oldPassword || !newPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (!user || !user.email) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    try {

      const credential = EmailAuthProvider.credential(
        user.email,
        oldPassword
      );

      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      Alert.alert("Success", "Password updated");

      setOldPassword("");
      setNewPassword("");

    } catch (error: any) {

      console.log("Password change error:", error);

      Alert.alert("Error", "Password change failed");

    }

  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>Change Password</Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Old Password"
          secureTextEntry={!oldPasswordVisible}
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <Pressable onPress={() => setOldPasswordVisible(!oldPasswordVisible)}>
          <Text style={styles.toggleText}>{oldPasswordVisible ? "Hide" : "Show"}</Text>
        </Pressable>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry={!newPasswordVisible}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <Pressable onPress={() => setNewPasswordVisible(!newPasswordVisible)}>
          <Text style={styles.toggleText}>{newPasswordVisible ? "Hide" : "Show"}</Text>
        </Pressable>
      </View>

      <Button title="Change Password" onPress={changePassword} />

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0B1220",
    justifyContent: "center",
    padding: 20
  },

  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "800"
  },

  passwordContainer: {
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#111B2E",
    color: "#FFFFFF"
  },

  toggleText: {
    color: "#FB9E50",
    fontWeight: "600",
    paddingHorizontal: 8
  }

});
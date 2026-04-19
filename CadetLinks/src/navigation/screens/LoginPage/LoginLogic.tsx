import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../index";
import { auth, db } from "../../../firebase/config";
import { initializeGlobals, deriveCadetKeyFromEmail } from "../../../firebase/dbController";


export function useLoginLogic() {
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


      // 2. Derive the email-based key to find the cadet profile
      const cadetKey = deriveCadetKeyFromEmail(enteredEmail);


      // 3. Confirm cadet profile exists in database
      const profileSnap = await get(ref(db, `cadets/${cadetKey}`));
      if (!profileSnap.exists()) {
        setError("No cadet profile found for this account.");
        return;
      }


      // 4. Save the key for the rest of the app
      await AsyncStorage.setItem("currentCadetKey", cadetKey);
      await initializeGlobals(cadetKey);
      console.log("✅ Logged in, cadet key:", cadetKey);


      navigation.replace("HomeTabs");
    } catch (e: any) {
      console.error("❌ Login error code:", e.code);
      console.error("❌ Login error message:", e.message);


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
      }
    } finally {
      setLoading(false);
    }
  };


  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    handleLogin,
    loading,
    setLoading,
    navigation,
  };
}

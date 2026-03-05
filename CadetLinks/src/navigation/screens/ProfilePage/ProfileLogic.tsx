import { ref, get, set } from "firebase/database";
import { db } from "../../../firebase/config";
import { StaticScreenProps } from "@react-navigation/native";
import React, { use, useEffect, useState } from "react";
import { globalProfile } from "./Profile";

export type Props = StaticScreenProps<{
  user: string;
}>;

// typed shape of what we expect from Firebase (optional fields so it won't crash if missing)
export type CadetProfile = {
  firstName?: string;
  lastName?: string;
  cadetRank?: string;
  job?: string;
  flight?: string;
  classYear?: number;
  permissions?: string;
  contact?: {
    schoolEmail?: string;
    personalEmail?: string;
    cellPhone?: string;
  };
};

// Global profile state and loader function
export function loadGlobalProfile(PROFILE_DB_REF: string) {
  const [profile, setProfile] = useState<CadetProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  useEffect(() => {
    const profileRef = ref(db, `cadets/${PROFILE_DB_REF}`);

    get(profileRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log("Cadet data in Profile:", snapshot.val());
          setProfile(snapshot.val());
        } else {
          console.log(" No cadet data available (Profile)");
          setProfile(null);
        }
      })
      .catch((error) => {
        console.error(" Error reading cadet profile (Profile):", error);
        setProfileError("Could not load profile.");
      })
      .finally(() => {
        setLoadingProfile(false);
      });
}, [PROFILE_DB_REF]);
  return {profile, loadingProfile, profileError};
}


export const getProfileID = ():string => {
    console.log("global profile retrieved:", globalProfile)  
    const email = globalProfile?.contact?.schoolEmail;
    const id = email?.toString().trim().toLowerCase().replace(/[@.]/g, "_"); 
    return id || "";
}
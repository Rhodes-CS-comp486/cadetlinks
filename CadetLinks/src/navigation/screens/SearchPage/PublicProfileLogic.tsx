import { useEffect, useMemo, useState } from "react";
import { get, ref } from "firebase/database";
import { db } from "../../../firebase/config";

export type PublicCadetProfile = { // only public info for search results/profile page
  firstName?: string;
  lastName?: string;
  cadetRank?: string;
  job?: string;
  classYear?: number;
  bio?: string;
  photoUrl?: string; // optional photo URL for public profile in db maybe?
  contact?: {
    schoolEmail?: string;
  };
};

export function usePublicProfileLogic(cadetKey: string) { // takes cadetKey to load that cadet's public profile info
  const [profile, setProfile] = useState<PublicCadetProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      setProfileError(null);

      try {
        const profileRef = ref(db, `cadets/${cadetKey}`); // load the cadet's profile from the "cadets" subtree in FB using their cadetKey
        const snap = await get(profileRef);

        if (snap.exists()) { // if profile exists, set it. otherwise show "no profile found" error. if there's a problem with the request, show "could not load profile" error.
          setProfile(snap.val());
        } else {
          setProfile(null);
          setProfileError("No profile found for this cadet.");
        }
      } catch (error) {
        console.error("❌ Error loading public profile:", error);
        setProfileError("Could not load public profile.");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [cadetKey]);

  return useMemo(
    () => ({
      profile,
      loadingProfile,
      profileError,
    }),
    [profile, loadingProfile, profileError]
  );
}
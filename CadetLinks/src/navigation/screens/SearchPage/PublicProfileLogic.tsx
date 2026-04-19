import { useEffect, useMemo, useState } from "react";
import { getProfileByCadetKey, globals, initializeGlobals } from "../../../firebase/globals";

export type PublicCadetProfile = { // only public info for search results/profile page
  firstName?: string;
  lastName?: string;
  cadetRank?: string;
  job?: string;
  classYear?: number;
  bio?: string;
  photoUrl?: string; // optional photo URL for public profile in db maybe
  contact?: {
    schoolEmail?: string;
  };
};

export function usePublicProfileLogic(cadetKey: string) { // takes cadetKey to load that cadet's public profile info
  const globalState = globals();
  const [profile, setProfile] = useState<PublicCadetProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!globalState.isInitialized && !globalState.isInitializing) {
      void initializeGlobals();
    }
  }, [globalState.isInitialized, globalState.isInitializing]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      setProfileError(null);

      try {
        const cachedProfile = globalState.cadetsByKey[cadetKey];
        if (cachedProfile) {
          setProfile(cachedProfile as PublicCadetProfile);
          setLoadingProfile(false);
          return;
        }

        const loadedProfile = await getProfileByCadetKey(cadetKey);
        if (loadedProfile) {
          setProfile(loadedProfile as PublicCadetProfile);
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

    void loadProfile();
  }, [cadetKey, globalState.cadetsByKey]);

  return useMemo(
    () => ({
      profile,
      loadingProfile,
      profileError,
    }),
    [profile, loadingProfile, profileError]
  );
}
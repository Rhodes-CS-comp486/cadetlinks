import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onValue, ref } from "firebase/database";
import { db } from "../../../firebase/config";

export type SearchCadetProfile = {
  cadetKey: string;
  firstName?: string;
  lastName?: string;
  cadetRank?: string;
  job?: string;
  flight?: string;
  classYear?: number;
  bio?: string;
  photoUrl?: string;
  contact?: {
    schoolEmail?: string;
    personalEmail?: string;
    cellPhone?: string;
  };
};

function matchesQuery(cadet: SearchCadetProfile, query: string) { // checks if the cadet matches the search query by looking for the query as a substring in their name, rank, job, flight, class year, or school email. case-insensitive
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const fullName = `${cadet.firstName ?? ""} ${cadet.lastName ?? ""}`.toLowerCase();

  return (
    fullName.includes(q) ||
    (cadet.firstName ?? "").toLowerCase().includes(q) ||
    (cadet.lastName ?? "").toLowerCase().includes(q) ||
    (cadet.cadetRank ?? "").toLowerCase().includes(q) ||
    (cadet.job ?? "").toLowerCase().includes(q) ||
    (cadet.flight ?? "").toLowerCase().includes(q) ||
    String(cadet.classYear ?? "").includes(q) ||
    (cadet.contact?.schoolEmail ?? "").toLowerCase().includes(q)
  );
}

export function useSearchLogic() {
  const [query, setQuery] = useState("");
  const [allCadets, setAllCadets] = useState<SearchCadetProfile[]>([]);
  const [loadingCadets, setLoadingCadets] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeCadets: (() => void) | null = null;

    const load = async () => {
      setLoadingCadets(true);
      setSearchError(null);

      try {
        const currentCadetKey = await AsyncStorage.getItem("currentCadetKey");
        const cadetsRef = ref(db, "cadets");

        unsubscribeCadets = onValue( // listen in real-time to the "cadets" subtree in FB to get the list of cadets for searching, excluding the current user. sort them alphabetically by last name then first name.
          cadetsRef,
          (snapshot) => {
            const cadetsData = snapshot.val() ?? {};

            const cadetList: SearchCadetProfile[] = Object.entries(cadetsData)
              .map(([cadetKey, value]) => {
                const cadet = value as Omit<SearchCadetProfile, "cadetKey">;
                return {
                  cadetKey,
                  ...cadet,
                };
              })
              .filter((cadet) => cadet.cadetKey !== currentCadetKey)
              .sort((a, b) => {
                const aLast = (a.lastName ?? "").toLowerCase();
                const bLast = (b.lastName ?? "").toLowerCase();
                if (aLast !== bLast) return aLast.localeCompare(bLast);

                const aFirst = (a.firstName ?? "").toLowerCase();
                const bFirst = (b.firstName ?? "").toLowerCase();
                return aFirst.localeCompare(bFirst);
              });

            setAllCadets(cadetList);
            setLoadingCadets(false);
            setSearchError(null);
          },
          (error) => {
            console.error("❌ Error loading cadets:", error);
            setSearchError("Could not load cadets.");
            setLoadingCadets(false);
          }
        );
      } catch (error) {
        console.error("❌ Error starting search:", error);
        setSearchError("Could not start search.");
        setLoadingCadets(false);
      }
    };

    load();

    return () => {
      if (unsubscribeCadets) unsubscribeCadets();
    };
  }, []);

  const filteredCadets = useMemo(() => {
    return allCadets.filter((cadet) => matchesQuery(cadet, query));
  }, [allCadets, query]);

  return useMemo(
    () => ({
      query,
      setQuery,
      filteredCadets,
      loadingCadets,
      searchError,
    }),
    [query, filteredCadets, loadingCadets, searchError]
  );
}
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

function matchesQuery(cadet: SearchCadetProfile, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const fullName =
    `${cadet.firstName ?? ""} ${cadet.lastName ?? ""}`.toLowerCase();

  return (
    fullName.includes(q) ||
    (cadet.firstName ?? "").toLowerCase().includes(q) ||
    (cadet.lastName ?? "").toLowerCase().includes(q) ||
    (cadet.job ?? "").toLowerCase().includes(q)
  );
}

function matchesFlight(cadet: SearchCadetProfile, selectedFlight: string) {
  if (!selectedFlight) return true;

  return (cadet.flight ?? "").toLowerCase() === selectedFlight.toLowerCase();
}

export function useSearchLogic() {
  const [query, setQuery] = useState("");
  const [selectedFlight, setSelectedFlight] = useState("");
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

        unsubscribeCadets = onValue(
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

  const flightOptions = useMemo(() => {
    const uniqueFlights = Array.from(
      new Set(
        allCadets
          .map((cadet) => (cadet.flight ?? "").trim())
          .filter((flight) => flight.length > 0)
      )
    );

    return uniqueFlights.sort((a, b) => a.localeCompare(b));
  }, [allCadets]);

  const filteredCadets = useMemo(() => {
    return allCadets.filter(
      (cadet) =>
        matchesQuery(cadet, query) && matchesFlight(cadet, selectedFlight)
    );
  }, [allCadets, query, selectedFlight]);

  return useMemo(
    () => ({
      query,
      setQuery,
      selectedFlight,
      setSelectedFlight,
      flightOptions,
      filteredCadets,
      loadingCadets,
      searchError,
    }),
    [
      query,
      selectedFlight,
      flightOptions,
      filteredCadets,
      loadingCadets,
      searchError,
    ]
  );
}
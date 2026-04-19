import { useEffect, useMemo, useState } from "react";
import { globals, initializeGlobals } from "../../../firebase/globals";

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

  return ( // checks if the query matches the full name, first name, last name, or job of the cadet.
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
  const globalState = globals();
  const [query, setQuery] = useState("");
  const [selectedFlight, setSelectedFlight] = useState("");

  useEffect(() => {
    if (!globalState.isInitialized && !globalState.isInitializing) {
      void initializeGlobals();
    }
  }, [globalState.isInitialized, globalState.isInitializing]);

  const allCadets = useMemo(() => {
    const currentCadetKey = globalState.cadetKey;
    const cadetsData = globalState.cadetsByKey;

    return Object.entries(cadetsData)
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
  }, [globalState.cadetsByKey, globalState.cadetKey]);

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

  const loadingCadets = globalState.isInitializing || !globalState.isInitialized;
  const searchError = globalState.errors.cadets ?? null;

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
import { StyleSheet } from "react-native";
import { generalStyles } from "./GeneralStyles";
import { DarkColors as colors } from "./colors";

export const searchStyles = StyleSheet.create({
  ...generalStyles,

  /* SEARCH BAR */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },

  /* STATE / EMPTY / ERROR CARDS */
  stateCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stateText: {
    color: colors.muted,
    fontSize: 15,
    textAlign: "center",
  },

  /* SEARCH RESULTS */
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  resultTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  resultName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  resultSub: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },

  /* PUBLIC PROFILE CARD */
  publicProfileCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  publicInfoColumn: {
    flex: 1,
  },
  publicImagePlaceholder: {
    width: 110,
    height: 130,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  publicImagePlaceholderText: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 8,
    fontWeight: "600",
  },
  publicPhoto: {
    width: 110,
    height: 130,
    borderRadius: 16,
    backgroundColor: colors.background,
  },

  /* BIO */
  bioCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
  },
  bioText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },

  /* TEXT HELPERS */
  label_bold: {
    fontWeight: "700",
    color: colors.text,
  },
    /* FLIGHT FILTER */
  filterLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 8,
  },

  flightFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
  },

  flightChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },

  flightChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  flightChipText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
  },

  flightChipTextActive: {
    color: "#fff",
  },
});
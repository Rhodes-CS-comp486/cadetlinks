import { StyleSheet } from "react-native";
import { generalStyles } from "./GeneralStyles";
import { DarkColors as colors } from "./colors";

export const searchStyles = StyleSheet.create({
  ...generalStyles,

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 52,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  clearButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },

  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterChipText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  filterChipTextSelected: {
    color: colors.background,
  },

  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  resultTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  resultName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  resultSub: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 2,
  },

  emptyStateCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginTop: 8,
  },
  emptyStateTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 10,
  },
  emptyStateText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
  },

  label_bold: {
    fontWeight: "700",
    color: colors.text,
  },
});
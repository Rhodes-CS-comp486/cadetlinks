import { StyleSheet } from "react-native";
import { DarkColors as colors } from "./colors";

export const ptScoreStyles = StyleSheet.create({
  /* HEADER */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  /* LOADING */
  loadingBlock: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 12,
  },

  /* FLIGHT FILTER */
  flightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    position: "relative",
  },
  flightLabel: {
    marginLeft: 16,
    marginTop: 0,
    marginBottom: 0,
  },
  flightDropdown: {
    flex: 1,
    marginLeft: 8,
    marginBottom: 0,
  },
  flightDropdownMenu: {
    top: 44,
    right: 0,
    zIndex: 100,
  },

  /* CADET LIST */
  cadetListCard: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cadetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  cadetName: {
    flex: 1,
    marginRight: 10,
  },
  scoreInput: {
    width: 80,
    textAlign: "center",
    marginBottom: 0,
  },

  /* HISTORY MODAL */
  historyModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  historyModalContent: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    width: "100%",
    maxHeight: "70%",
  },
  historyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  historySubtitle: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 16,
  },
  historyEmptyText: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  historyEntryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  historyDate: {
    color: colors.muted,
    fontSize: 13,
  },
  historyScore: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  historyLatestBadge: {
    backgroundColor: colors.accent,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  historyLatestBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  historyScoreRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  /* HISTORY TRIGGER BUTTON (inside cadet row) */
  historyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginLeft: 8,
  },

  /* FOOTER */
  buttonDisabled: {
    opacity: 0.5,
  },
});
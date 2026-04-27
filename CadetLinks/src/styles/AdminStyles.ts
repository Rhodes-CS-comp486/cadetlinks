import { generalStyles } from "./GeneralStyles";
import {DarkColors as colors } from "./colors";
import { StyleSheet } from "react-native";

export const adminStyles = StyleSheet.create({
    ...generalStyles, //inherit general styles for container and others

adminSubtitle: {
        color: colors.muted,
        fontSize: 13,
        marginBottom: 4,
    },
    adminTabRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
        marginBottom: 12,
    },
    adminTabButton: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    adminTabButtonActive: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    adminTabButtonText: {
        color: colors.text,
        fontSize: 13,
        fontWeight: "600",
    },
    adminTabButtonTextActive: {
        color: colors.background,
    },
    adminSheetContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: colors.card,
    },
    adminSheetHeaderRow: {
        flexDirection: "row",
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    adminSheetRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    adminHeaderCell: {
        width: 150,
        paddingHorizontal: 10,
        paddingVertical: 10,
        color: colors.text,
        fontWeight: "700",
        fontSize: 12,
    },
    adminReadCell: {
        width: 150,
        paddingHorizontal: 10,
        paddingVertical: 12,
        color: colors.text,
        fontSize: 12,
        height: 50,
    },
    adminEditCell: {
        width: 150,
        paddingHorizontal: 10,
        paddingVertical: 10,
        color: colors.text,
        fontSize: 12,
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
    },
    adminEditCellWide: {
        width: 230,
        paddingHorizontal: 10,
        paddingVertical: 10,
        color: colors.text,
        fontSize: 12,
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
    },
    adminEditCellStatus: {
        width: 120,
        paddingHorizontal: 10,
        paddingVertical: 10,
        color: colors.text,
        fontSize: 12,
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
    },
    adminKeyCol: {
        width: 230,
    },
    attendanceToolbarRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 12,
        flexWrap: "wrap",
    },
    attendanceToolbarActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
    },
    attendanceAllowanceControl: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    attendanceAllowanceLabel: {
        color: colors.text,
        fontSize: 13,
        fontWeight: "600",
    },
    attendanceAllowanceInput: {
        minWidth: 72,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        color: colors.text,
        fontSize: 13,
    },
    attendanceAllowanceInputReadOnly: {
        opacity: 0.8,
    },
    attendanceSheetRow: {
        flex: 1,
        flexDirection: "row",
    },
    attendanceFrozenColumn: {
        borderRightWidth: 1,
        borderRightColor: colors.border,
        backgroundColor: colors.card,
        zIndex: 1,
    },
    attendanceRefreshButton: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    attendanceRefreshButtonText: {
        color: colors.text,
        fontSize: 13,
        fontWeight: "600",
    },
    attendanceNameCell: {
        width: 180,
    },
    attendanceRemainingCell: {
        width: 110,
        textAlign: "center",
    },
    attendanceRemainingValue: {
        fontWeight: "700",
    },
    attendanceDateCell: {
        width: 90,
        textAlign: "center",
    },
    attendanceStatusCell: {
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
    },
    attendanceCellButton: {
        justifyContent: "center",
        alignItems: "center",
    },
    attendanceCellReadOnly: {
        opacity: 0.8,
    },
    attendanceCellSaving: {
        opacity: 0.55,
    },
    attendanceStatusValue: {
        fontWeight: "700",
        color: colors.text,
        textAlignVertical: "center",
    },
});
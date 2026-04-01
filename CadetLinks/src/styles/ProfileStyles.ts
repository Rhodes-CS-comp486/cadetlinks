import { StyleSheet } from 'react-native';
import { generalStyles } from './GeneralStyles';
import {DarkColors as colors } from './colors';

export const profileStyles = StyleSheet.create({
    ...generalStyles,

    // ATTENDANCE CARD //
    attendance_card: {
        backgroundColor: colors.card,
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
    },
    attendance_top_row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    attendance_circle: {
        width: 92,
        height: 92,
        borderRadius: 46,
        borderWidth: 4,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    circle_good: { borderColor: colors.success },
    circle_bad: { borderColor: colors.danger },
    circle_warning: {
        borderColor: colors.warning,
    },

    pill_warning: {
        backgroundColor: colors.warning,
    },
    attendance_percent_text: {
        color: colors.text,
        fontSize: 22,
        fontWeight: "800",
    },
    attendance_sub_text: { 
        color: colors.muted, 
        fontSize: 12, 
        marginTop: 2, 
    },
    standing_container: { flex: 1 },
    standing_pill: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
    },
    pill_good: { backgroundColor: colors.success },
    pill_bad: { backgroundColor: colors.danger },
    standing_pill_text: { 
        color: colors.text, 
        fontWeight: "700" 
    },
    standing_hint: { 
        color: colors.muted, 
        marginTop: 6, 
        fontSize: 12 
    },

    stacked_bar: {
        marginTop: 14,
        height: 12,
        borderRadius: 8,
        overflow: "hidden",
        flexDirection: "row",
        backgroundColor: colors.background,
    },
    bar_segment: { height: "100%" },
    bar_attended: { backgroundColor: colors.success },
    bar_missed: { backgroundColor: colors.danger },
    legend_row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    legend_item: { 
        flexDirection: "row", 
        alignItems: "center", 
        gap: 6 
    },
    legend_dot: { 
        width: 10, 
        height: 10, 
        borderRadius: 5 
    },
    legend_text: { 
        color: colors.muted, 
        fontSize: 12 
    },
    label_bold: {
        fontWeight: "700",
        color: colors.text,
    },

    profileToggleRow: {
        flexDirection: "row",
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 4,
        marginBottom: 16,
        gap: 6,
    },

    profileToggleButton: {
        flex: 1,
        paddingVertical: 4,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    profileToggleButtonActive: {
        backgroundColor: colors.accent,
    },
    profileToggleText: {
        color: colors.text,
        fontSize: 14,
        fontWeight: "700",
    },
    profileToggleTextActive: {
        color: colors.background,
    },

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

});

import { StyleSheet } from 'react-native';
import { generalStyles } from './GeneralStyles';
import {DarkColors as colors } from './colors';

export const profileStyles = StyleSheet.create({
    ...generalStyles, //inherit general styles for container and others

    // USER INFO
    userinfo_card: {
        backgroundColor: colors.card,
        borderRadius: 18,
        padding: 16, // doesn't get to edges
        flexDirection: "row", // so they can be side by side
        alignItems: "center",
    },
    avatar_container: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#0B1220",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    userinfo_text_container: { flex: 1 },
    userinfo_name: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
    },
    userinfo_sub: {
        color: "#9AA3B2",
        fontSize: 14,
        marginTop: 4,
    },

    // ATTENDANCE CARD //
    attendance_card: {
        backgroundColor: "#111B2E",
        borderRadius: 18,
        padding: 16,
        marginBottom: 12, // space between cards
    },
    attendance_top_row: {
        flexDirection: "row", // so circle and standing are side by side
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
        backgroundColor: "#0B1220",
    },
    circle_good: { borderColor: "green" },
    circle_bad: { borderColor: "red" },
    attendance_percent_text: {
        color: "white",
        fontSize: 22,
        fontWeight: "800",
    },
    attendance_sub_text: { color: "#9AA3B2", fontSize: 12, marginTop: 2 },
    standing_container: { flex: 1 },
    standing_pill: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999, // rounds it as much as possible to make pill
    },
    pill_good: { backgroundColor: "rgba(0, 128, 0, 0.18)" }, // when ingoodstanding is true, green
    pill_bad: { backgroundColor: "rgba(255, 0, 0, 0.18)" },
    standing_pill_text: { color: "white", fontWeight: "700" }, // text in pill
    standing_hint: { color: "#9AA3B2", marginTop: 6, fontSize: 12 }, // above 80%

    // AI Part that broke my brain
    stacked_bar: {
        marginTop: 14,
        height: 12,
        borderRadius: 8, // rounds the corners
        overflow: "hidden", // keeps the bar same length and rounds the ends
        flexDirection: "row", // so attended and missed bars can be side by side
        backgroundColor: "#0B1220",
    },
    bar_segment: { height: "100%" },
    bar_attended: { backgroundColor: "green" },
    bar_missed: { backgroundColor: "red" },
    legend_row: {
        flexDirection: "row", // so attended and missed legend can be side by side
        justifyContent: "space-between",
        marginTop: 10,
    },
    legend_item: { flexDirection: "row", alignItems: "center", gap: 6 },
    legend_dot: { width: 10, height: 10, borderRadius: 5 },
    legend_text: { color: "#9AA3B2", fontSize: 12 },
    label_bold: {
        fontWeight: "700",
        color: "white", // optional — remove if you want it gray like the rest
    },
});
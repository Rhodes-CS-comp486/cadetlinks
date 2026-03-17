import { StyleSheet } from 'react-native';
import { generalStyles } from './GeneralStyles';
import {DarkColors as colors } from './colors';

export const profileStyles = StyleSheet.create({
    ...generalStyles, //inherit general styles for container and others

    // ATTENDANCE CARD //
    attendance_card: {
        backgroundColor: colors.card,
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
        backgroundColor: colors.background,
    },
    circle_good: { borderColor: colors.success },
    circle_bad: { borderColor: colors.danger },
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
        borderRadius: 999, // rounds it as much as possible to make pill
    },
    pill_good: { backgroundColor: colors.success }, // when ingoodstanding is true, green
    pill_bad: { backgroundColor: colors.danger }, // when ingoodstanding is false, red
    standing_pill_text: { 
        color: colors.text, 
        fontWeight: "700" 
    }, // text in pill
    standing_hint: { 
        color: colors.muted, 
        marginTop: 6, 
        fontSize: 12 
    }, // above 80%

    // AI Part that broke my brain
    stacked_bar: {
        marginTop: 14,
        height: 12,
        borderRadius: 8, // rounds the corners
        overflow: "hidden", // keeps the bar same length and rounds the ends
        flexDirection: "row", // so attended and missed bars can be side by side
        backgroundColor: colors.background,
    },
    bar_segment: { height: "100%" },
    bar_attended: { backgroundColor: colors.success },
    bar_missed: { backgroundColor: colors.danger },
    legend_row: {
        flexDirection: "row", // so attended and missed legend can be side by side
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
        color: colors.text, // optional — remove if you want it gray like the rest
    },
});
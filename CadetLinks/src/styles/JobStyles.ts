import { StyleSheet } from 'react-native';
import { generalStyles } from './GeneralStyles';
import {DarkColors as colors } from './colors';

export const jobStyles = StyleSheet.create({
    ...generalStyles, //inherit general styles for container and others

    label_bold: {
        fontWeight: "700",
        color: "white",
    },

    action_card: {
        backgroundColor: "#111B2E",
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    action_left: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
        paddingRight: 10,
    },

    action_icon_circle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#0B1220",
        justifyContent: "center",
        alignItems: "center",
    },

    action_title: {
        color: "white",
        fontSize: 16,
        fontWeight: "800",
    },

    action_subtitle: {
        color: "#9AA3B2",
        fontSize: 12,
        marginTop: 4,
    },

    action_right: {
        alignItems: "flex-end",
        justifyContent: "center",
    },
    });
import { StyleSheet } from 'react-native';
import { generalStyles } from './GeneralStyles';
import { DarkColors as colors } from './colors';

export const loginStyles = StyleSheet.create({
    ...generalStyles, //inherit general styles for container and others

    outer_container: { 
        flex: 1, 
        backgroundColor: colors.background 
    },

    body_container: {
        ...generalStyles.body_container,
        justifyContent: "center",
    },

    card: { backgroundColor: colors.card, borderRadius: 18, padding: 18 },

    errorText: {
        color: colors.danger,
        textAlign: "center",
        marginTop: 10,
        marginBottom: 4,
        fontWeight: "600",
    },

    primaryBtn: {
        marginTop: 16,
        backgroundColor: colors.accent,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
    },

    primaryBtnText: { color: colors.text, fontWeight: "800", fontSize: 16 },

    link: {
        marginTop: 12,
        textAlign: "center",
        color: colors.mutedAccent,
        fontWeight: "700",
    },

    loadingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
});
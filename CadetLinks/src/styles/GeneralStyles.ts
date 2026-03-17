import { StyleSheet } from 'react-native';
import {DarkColors as colors } from './colors';

export const generalStyles = StyleSheet.create({
    /* HEADER STYLES */
    header_container: {
        backgroundColor: colors.background,
        width: "100%",
        paddingBottom: 12,
        paddingHorizontal: 16,
    },
    header_row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    header_text: {
        color: colors.text,
        fontSize: 22,
        fontWeight: "600",
        textAlign: "center",
        flex: 1,
    },
    back_button: { width: 40, alignItems: "flex-start" },
    right_space: { width: 40 },

    container: {
            flex: 1,
            gap: 10,
            backgroundColor: colors.background,
    },

    /* Wrap everything in a screens returned view in a ScreenLayout, then in a body_container to apply the same header, padding and background color to all screens */
    body_container: {
        flex: 1,
        padding: 16,
        backgroundColor: colors.background,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 18,
        marginBottom: 8,
        marginLeft: 4,
        color: colors.text,
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 8,
        marginBottom: 12,
    },
    closeButtonText: {
        fontSize: 24,
        color: colors.muted,
        fontWeight: 'bold',
    },
    text: {
        color: colors.text,
        fontSize: 16,
    },
});
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
    header_button: { 
        width: 40,
        alignItems: "flex-start",
    },
    header_space: { width: 40 },

    /* Dropdown menu styles */
    dropdownMenu: {
        position: 'absolute',
        top: 60,        // adjust to sit just below header
        right: 16,
        backgroundColor: colors.shadow,
        borderRadius: 10,
        paddingVertical: 8,
        minWidth: 180,
        elevation: 5,       // Android shadow
        shadowColor: colors.background, // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    dropdownItem: {
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    dropdownItemText: {
        color: colors.text,
        fontSize: 16,
    },

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
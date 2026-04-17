import { StyleSheet } from 'react-native';
import { generalStyles } from './GeneralStyles';
import {DarkColors as colors } from './colors';

export const actionStyles = StyleSheet.create({
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

    userinfo_card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1E2430",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },

    avatar_container: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: "#2A3140",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },

    userinfo_text_container: {
        flex: 1,
    },

    userinfo_name: {
        color: "white",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 4,
    },

    userinfo_sub: {
        color: "#C9D1D9",
        fontSize: 14,
        marginTop: 2,
    },

    sectionTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
    },



    loadingBlock: {
        marginTop: 4,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        justifyContent: "center",
        padding: 18,
    },

    modalCard: {
        backgroundColor: "#1E2430",
        borderRadius: 18,
        padding: 18,
        maxHeight: "90%",
        borderWidth: 1,
        borderColor: "#31394A",
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
    },

    modalTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "700",
    },

    modalLoadingBlock: {
        paddingVertical: 24,
    },

    modalLoadingText: {
        color: "#C9D1D9",
        textAlign: "center",
        marginTop: 10,
    },

    fieldLabel: {
        color: "white",
        fontWeight: "700",
        marginBottom: 8,
        marginTop: 4,
    },

    dropdownButton: {
        backgroundColor: "#2A3140",
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "#3A4357",
        marginBottom: 8,
    },

    dropdownButtonText: {
        color: "white",
    },

    dropdownMenu: {
        backgroundColor: "#151A22",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#3A4357",
        marginBottom: 16,
        overflow: "hidden",
    },

    dropdownEmptyText: {
        color: "#C9D1D9",
        padding: 14,
    },

    dropdownItem: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#2A3140",
    },

    dropdownItemTitle: {
        color: "white",
        fontWeight: "600",
    },

    dropdownItemSubtitle: {
        color: "#B9C2CF",
        marginTop: 2,
    },

    summaryCard: {
        backgroundColor: "#151A22",
        borderRadius: 12,
        padding: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#31394A",
    },

    summaryTitle: {
        color: "white",
        fontWeight: "700",
    },

    summaryText: {
        color: "#C9D1D9",
        marginTop: 4,
    },

    summaryTextSmallGap: {
        color: "#C9D1D9",
        marginTop: 2,
    },

    cadetListCard: {
        backgroundColor: "#151A22",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#31394A",
        overflow: "hidden",
        marginBottom: 16,
    },

    cadetRow: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#2A3140",
    },

    cadetName: {
        color: "white",
        fontWeight: "600",
        marginBottom: 10,
    },

    statusRow: {
        flexDirection: "row",
        gap: 8,
    },

    statusButton: {
        flex: 1,
        backgroundColor: "#2A3140",
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },

    presentButtonActive: {
        backgroundColor: "#2E7D32",
    },

    absentButtonActive: {
        backgroundColor: "#A63D40",
    },

    lateButtonActive: {
        backgroundColor: "#C78B2A",
    },

    statusButtonText: {
        color: "white",
        fontWeight: "700",
    },

    footerButtons: {
        marginTop: 10,
        gap: 10,
    },

    footerButton: {
        backgroundColor: "#2A3140",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#3A4357",
    },

    footerButtonDisabled: {
        opacity: 0.7,
    },

    flexOne: {
        flex: 1,
    },
});

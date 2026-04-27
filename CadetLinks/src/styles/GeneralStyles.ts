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

    successText: {
        color: colors.success,
        marginTop: 8,
        fontSize: 14,
    },

    errorText: {
        color: colors.danger,
        marginTop: 8,
        fontSize: 14,
    },
    

    /* Wrap everything in a screens returned view in a ScreenLayout, then in a body_container to apply the same header, padding and background color to all screens */
    body_container: {
        flex: 1,
        padding: 16,
        backgroundColor: colors.background,
    },

    /* COMMON TEXT STYLES */
    titleCadet: { color: colors.accent },
    titleLinks: { color: colors.text },
    title: { 
        fontSize: 34, 
        fontWeight: "800" 
    },
    subtitle: { 
        color: colors.muted, 
        marginTop: 6, 
        marginBottom: 20 
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 18,
        marginBottom: 8,
        marginLeft: 4,
        color: colors.text,
    },
    text: {
        color: colors.text,
        fontSize: 16,
    },

    /* MODAL STYLES */
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
    inputBox: { 
        paddingStart: 12,
        color: colors.inputText,
        height: 40,
        borderWidth: 2,
        borderRadius: 6,
        marginBottom: 12,
        borderColor: colors.border,
        backgroundColor: colors.text,
    },
    dropDownBox:{
        paddingStart: 12,
        color: colors.inputText,
        height: 40,
        borderWidth: 2,
        borderRadius: 6,
        marginBottom: 12,
        borderColor: colors.border,
        backgroundColor: colors.text,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center" 

    },
    inputPlaceholder: { 
        color: colors.inputText,
        height: 40,
        borderWidth: 2,
        borderRadius: 12,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
        paddingHorizontal: 12,
     },
     inputUser: {
        color: colors.inputText,
        height: 40,
        borderWidth: 2,
        borderRadius: 12,
        borderColor: colors.border,
        backgroundColor: colors.inputBackground,
        paddingHorizontal: 12,
     },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 20,
        maxHeight: '85%',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    modalLabel: {
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 12,
        marginBottom: 4,
    },
    modalText: {
        fontSize: 14,
        color: colors.muted,
        lineHeight: 20,
    },
    confirmButton: {
        backgroundColor: colors.success,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    cancelButton: {
        backgroundColor: colors.danger,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },

    /* USER INFO CARD */
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
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    userinfo_text_container: { flex: 1 },
    userinfo_name: {
        color: colors.text,
        fontSize: 18,
        fontWeight: "700",
    },
    userinfo_sub: {
        color: colors.muted,
        fontSize: 14,
        marginTop: 4,
    },

    /* ADMIN SHEET STYLES */
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
        overflow: "visible",
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
    adminSheetRowOpen: {
        zIndex: 3000,
        elevation: 3000,
        position: "relative",
    },
    adminSheetContentContainer: {
        paddingBottom: 12,
    },
    adminHeaderCell: {
        width: 150,
        paddingHorizontal: 10,
        paddingVertical: 10,
        color: colors.text,
        fontWeight: "700",
        fontSize: 12,
    },
    adminHeaderCellWide: {
        width: 240,
    },
    adminReadCell: {
        width: 150,
        paddingHorizontal: 10,
        paddingVertical: 12,
        color: colors.text,
        fontSize: 12,
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
    adminContactCell: {
        width: 150,
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
        justifyContent: "center",
        position: "relative",
    },
    adminContactCellWide: {
        width: 240,
    },
    adminContactCellReadMode: {
        backgroundColor: colors.card,
    },
    adminContactCellEditMode: {
        backgroundColor: colors.background,
        borderColor: colors.accent,
        borderWidth: 1,
    },
    adminCellActionButton: {
        position: "absolute",
        top: 2,
        right: 4,
        zIndex: 2,
        padding: 4,
    },
    adminCellActionButtonEditMode: {
        backgroundColor: colors.accent,
        borderRadius: 10,
    },
    adminContactCellText: {
        color: colors.text,
        fontSize: 12,
        paddingRight: 18,
        minHeight: 20,
        paddingTop: 8,
    },
    adminContactCellInput: {
        color: colors.text,
        fontSize: 12,
        paddingRight: 18,
        minHeight: 20,
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.accent,
    },
    adminRowActionHeader: {
        width: 78,
        paddingHorizontal: 10,
        paddingVertical: 10,
        color: colors.text,
        fontWeight: "700",
        fontSize: 12,
        textAlign: "center",
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
    },
    adminRowActionCell: {
        width: 78,
        alignItems: "center",
        justifyContent: "center",
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
    },
    adminDeleteButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 107, 107, 0.12)",
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
    adminJobTitleCell: {
        width: 210,
        paddingHorizontal: 10,
        paddingVertical: 12,
        color: colors.text,
        fontWeight: "600",
        fontSize: 12,
    },
    adminCadetCellWrapper: {
        flex: 1,
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
    },
    adminCadetInput: {
        paddingHorizontal: 10,
        paddingVertical: 10,
        color: colors.text,
        fontSize: 12,
        minWidth: 200,
    },
    adminAutocompleteWrapper: {
        flex: 1,
    },
    adminSuggestionList: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
    },
    adminSuggestionItem: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    adminSuggestionText: {
        color: colors.text,
        fontSize: 12,
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
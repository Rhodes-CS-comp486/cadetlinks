import { StyleSheet } from 'react-native';
import { generalStyles } from './GeneralStyles';
import {DarkColors as colors } from './colors';

export const homeStyles = StyleSheet.create({
    ...generalStyles, //inherit general styles for container and others

    announcementContainer: {
        backgroundColor: colors.overlay,
        borderRadius: 18,
        padding: 15,
        height: '50%',
    },
    announcementCard: {
        backgroundColor: colors.background,
        padding: 10,
        borderRadius: 8,
        marginVertical: 5,
    },
    announcementTitle: {
        color: colors.text,
        fontWeight: 'bold',
    },
    announcementBody: {
        color: colors.muted,
        marginTop: 4,
    },
    addAnnouncementButton: {
        backgroundColor: colors.primary,
        height: 25,
        width: 140,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        marginLeft: 'auto',
        marginTop: 'auto',
        marginBottom: 'auto',
    },
    addAnnouncementButtonText: {
        color: colors.text,
    },
    importanceButton: {
        backgroundColor: colors.primary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginRight: 8,
    },
    importanceButtonSelected: {
        backgroundColor: colors.accent,
    },
    importanceButtonText: {
        color: colors.text,
    },
    eventsContainer: {
        backgroundColor: colors.overlay,
        borderRadius: 18,
        padding: 15,
        height: '45%',
        marginTop: '5%',
    },
    eventCard: {
        backgroundColor: colors.background,
        padding: 10,
        borderRadius: 8,
        marginVertical: 5,
    },
    eventTitle: {
        color: colors.text,
        fontWeight: 'bold',
    },
    eventMeta: {
        color: colors.muted,
        marginTop: 2,
    },
    noEventsText: {
        color: colors.muted,
        marginTop: 6,
    },
});
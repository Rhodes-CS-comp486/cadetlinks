import { StyleSheet } from 'react-native';
import { generalStyles } from './GeneralStyles';
import {DarkColors as colors } from './colors';

export const homeStyles = StyleSheet.create({
    ...generalStyles, //inherit general styles for container and others

    announcementContainer: {
        backgroundColor: colors.overlay,
        borderRadius: 18,
        padding: 15,
        height: '35%',
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
    eventsContainer: {
        padding: 15,
        backgroundColor: colors.background,
        height: '65%',
    }
});
import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';

export function Events(): React.ReactElement {
    const [selectedDate, setSelectedDate] = useState('');

    const events: { [date: string]: Array<{ id: string; title: string }> } = {
        '2026-02-10': [
            { id: '1', title: 'PT 0600' },
            { id: '2', title: 'LLAB 1500' },
        ],
        '2026-02-11': [{ id: '3', title: 'PT 0600' }],
    };

    const markedDates = Object.keys(events).reduce((acc: any, date) => {
        acc[date] = { marked: true, dotColor: 'blue' };
        return acc;
    }, {});

    return (
        <ScrollView style={{ flex: 1 }}>
            <View style={styles.container}>
                <Calendar
                    onDayPress={(day) => setSelectedDate(day.dateString)}
                    markedDates={{
                        ...markedDates,
                        [selectedDate]: {
                            selected: true,
                            selectedColor: '#1e90ff',
                        },
                    }}
                />

                {selectedDate && events[selectedDate] && (
                    <View style={styles.eventsContainer}>
                        <Text style={styles.sectionTitle}>Events</Text>
                        {events[selectedDate].map((ev) => (
                            <Text key={ev.id} style={styles.eventItem}>
                                • {ev.title}
                            </Text>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    eventsContainer: { padding: 15 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    eventItem: { marginVertical: 5 },
});
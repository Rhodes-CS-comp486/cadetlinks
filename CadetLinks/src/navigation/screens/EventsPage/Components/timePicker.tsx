import React, { useState } from 'react';
import {
    Platform,
    Pressable,
    Text,
    View,
    StyleSheet,
} from 'react-native';
import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { eventsStyles } from '../Styles/EventsStyles';

type TimePickerProps = {
    value: Date | null;
    onChange: (date: Date) => void;
    placeholder?: string;
};

export default function TimePicker({
    value,
    onChange,
    placeholder = 'Select time',
}: TimePickerProps) {
    const [show, setShow] = useState(false);

    const formatTime = (date: Date) =>
        date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

    const formatForWeb = (date: Date) => {
        const h = date.getHours().toString().padStart(2, '0');
        const m = date.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;

    }

    // web version
    if (Platform.OS === 'web') {
        // the style object produced by StyleSheet.create is a numeric ID; flatten
        // it into a plain object before passing to a DOM input.
        const webStyle = StyleSheet.flatten(eventsStyles.scrollWheelWeb) as any;

        return (
            <input
                type="time"
                value={
                    value ? formatForWeb(value) : ''
                }
                onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':');

                    const newDate = new Date();
                    newDate.setHours(Number(hours));
                    newDate.setMinutes(Number(minutes));
                    newDate.setSeconds(0);

                    onChange(newDate);
                }}
                style={webStyle}
            />
        );
    }

    //  iOS + Android
    return (
        <View>
            <Pressable
                style={eventsStyles.scrollWheelIOS}
                onPress={() => setShow(true)}
            >
                <Text>
                    {value ? formatTime(value) : placeholder}
                </Text>
            </Pressable>

            {show && (
                <DateTimePicker
                    value={value ?? new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(
                        event: DateTimePickerEvent,
                        selectedDate?: Date
                    ) => {
                        // only react when the user has finished selecting or dismissed
                        if (event.type === 'dismissed') {
                            setShow(false);
                            return;
                        }

                        if (event.type === 'set' && selectedDate) {
                            onChange(selectedDate);
                            if (Platform.OS === 'android') {
                                // android picker auto-closes after selection but explicitly
                                // hide the component state as well
                                setShow(false);
                            }
                        }
                    }}
                />
            )}
        </View>
    );
}

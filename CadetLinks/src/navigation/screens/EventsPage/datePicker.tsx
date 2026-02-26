import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { eventsStyles } from './Styles/EventsStyles';

type DatePickerProps = {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
};

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
}: DatePickerProps) {
  const [show, setShow] = useState(false);

  const formatDate = (date: Date) =>
    date.toLocaleDateString([], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

  // web version
  if (Platform.OS === 'web') {
    const formatForWeb = (d: Date) => {
      const y = d.getFullYear();
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    return (
      <input
        type="date"
        value={value ? formatForWeb(value) : ''}
        onChange={(e) => {
          if (e.target.value) {
            const [year, month, day] = e.target.value.split('-');
            const newDate = new Date();
            newDate.setFullYear(Number(year));
            newDate.setMonth(Number(month) - 1);
            newDate.setDate(Number(day));
            newDate.setHours(0, 0, 0, 0);
            onChange(newDate);
          }
        }}
        style={eventsStyles.scrollWheelWeb as any}
      />
    );
  }

  // iOS + Android
  return (
    <View>
      <Pressable
        style={eventsStyles.scrollWheelIOS as any}
        onPress={() => setShow(true)}
      >
        <Text>
          {value ? formatDate(value) : placeholder}
        </Text>
      </Pressable>

      {show && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
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

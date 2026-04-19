import React from 'react';
import { Modal, Pressable, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { Events } from '../../src/navigation/screens/EventsPage/EventScreen';

const mockUseEvents = jest.fn();
const mockUseHomeLogic = jest.fn();

let capturedCalendarProps: any = null;

jest.mock('../../src/navigation/screens/EventsPage/EventsLogic', () => ({
	useEvents: () => mockUseEvents(),
}));

jest.mock('../../src/navigation/screens/HomePage/HomeLogic', () => ({
	useHomeLogic: () => mockUseHomeLogic(),
}));

jest.mock('../../src/navigation/Components/ScreenLayout', () => ({
	ScreenLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('react-native-calendars', () => {
	const React = require('react');
	const { Pressable, Text, View } = require('react-native');

	return {
		Calendar: (props: any) => {
			capturedCalendarProps = props;
			return (
				<View testID="calendar">
					<Text testID="calendar-marked-dates">{JSON.stringify(props.markedDates ?? {})}</Text>
					<Pressable
						testID="calendar-day-press"
						onPress={() => props.onDayPress?.({ dateString: '2026-04-21' })}
					>
						<Text>Press Calendar Day</Text>
					</Pressable>
				</View>
			);
		},
	};
});

jest.mock('../../src/navigation/screens/EventsPage/Components/datePicker', () => ({
	__esModule: true,
	default: ({ onChange }: { onChange: (d: Date) => void }) => {
		const React = require('react');
		const { Pressable, Text } = require('react-native');
		return React.createElement(
			Pressable,
			{
				testID: 'mock-date-picker',
				onPress: () => onChange(new Date('2026-05-01T00:00:00.000Z')),
			},
			React.createElement(Text, null, 'Date Picker')
		);
	},
}));

jest.mock('../../src/navigation/screens/EventsPage/Components/timePicker', () => ({
	__esModule: true,
	default: ({ onChange }: { onChange: (d: Date) => void }) => {
		const React = require('react');
		const { Pressable, Text } = require('react-native');
		return React.createElement(
			Pressable,
			{
				testID: 'mock-time-picker',
				onPress: () => onChange(new Date('2026-05-01T14:30:00.000Z')),
			},
			React.createElement(Text, null, 'Time Picker')
		);
	},
}));

type EventLike = {
	id: string;
	title: string;
	date: Date;
	time: Date;
	description: string;
	location: string;
	type: 'RSVP' | 'Mandatory';
};

function buildDefaultUseEventsReturn(overrides: Partial<any> = {}) {
	const sampleEvent: EventLike = {
		id: 'e1',
		title: 'Drill Briefing',
		date: new Date('2026-04-20T00:00:00.000Z'),
		time: new Date('2026-04-20T13:00:00.000Z'),
		description: 'Uniform check and drill updates',
		location: 'Hangar A',
		type: 'RSVP',
	};

	return {
		selectedDate: '2026-04-20',
		setSelectedDate: jest.fn(),
		selectedEvent: null,
		eventInfoModalVisible: false,
		rsvpStatus: {},
		addEventsModalVisible: false,
		allEvents: [sampleEvent],
		selectedOptions: [],
		setSelectedOptions: jest.fn(),
		newEvent: {
			id: '',
			title: '',
			date: new Date('2026-04-20T00:00:00.000Z'),
			time: new Date('2026-04-20T13:00:00.000Z'),
			description: '',
			location: '',
			type: '' as '' | 'RSVP' | 'Mandatory',
		},
		setNewEvent: jest.fn(),
		markedDates: {
			'2026-04-20': { marked: true, dotColor: 'blue' },
			'2026-04-22': { marked: true, dotColor: 'blue' },
		},
		eventsForSelectedDate: [sampleEvent],
		handleEventPress: jest.fn(),
		handleRSVP: jest.fn(),
		handleCloseEventInfoModal: jest.fn(),
		handleAddEvent: jest.fn(),
		handleConfirmAddEvent: jest.fn(),
		handleCancelAddEvent: jest.fn(),
		handleDeleteEvent: jest.fn(),
		canDeleteEvent: jest.fn(() => false),
		getLabelTextAndStyle: jest.fn(() => [{ color: 'white' }, 'RSVP']),
		eventConfig: { mode: 'free', type: 'either', title: '', options: [] },
		...overrides,
	};
}

describe('EventScreen UI', () => {
	beforeEach(() => {
		capturedCalendarProps = null;
		jest.clearAllMocks();
		mockUseHomeLogic.mockReturnValue({
			cadetPermissionsMap: new Map<string, boolean>([['Event Making', true]]),
		});
	});

	it('renders events and pushes DB-marked dates into the calendar', () => {
		const state = buildDefaultUseEventsReturn();
		mockUseEvents.mockReturnValue(state);

		const { getByText } = render(<Events />);

		expect(getByText(' Events for 2026-04-20')).toBeTruthy();
		expect(getByText('Drill Briefing')).toBeTruthy();
		expect(getByText('Hangar A')).toBeTruthy();

		expect(capturedCalendarProps).toBeTruthy();
		expect(capturedCalendarProps.markedDates['2026-04-20']).toEqual(
			expect.objectContaining({ selected: true })
		);
		expect(capturedCalendarProps.markedDates['2026-04-22']).toEqual(
			expect.objectContaining({ dotColor: 'blue' })
		);
	});

	it('handles calendar day press and event row press', () => {
		const state = buildDefaultUseEventsReturn();
		mockUseEvents.mockReturnValue(state);

		const { getByTestId, getByText } = render(<Events />);

		fireEvent.press(getByTestId('calendar-day-press'));
		expect(state.setSelectedDate).toHaveBeenCalledWith('2026-04-21');

		fireEvent.press(getByText('Drill Briefing'));
		expect(state.handleEventPress).toHaveBeenCalledWith(state.eventsForSelectedDate[0]);
	});

	it('shows no-events state for selected date with zero events', () => {
		mockUseEvents.mockReturnValue(
			buildDefaultUseEventsReturn({
				eventsForSelectedDate: [],
			})
		);

		const { getByText, queryByText } = render(<Events />);
		expect(getByText('No events scheduled for this date')).toBeTruthy();
		expect(queryByText('Drill Briefing')).toBeNull();
	});

	it('shows and uses add-event floating button only when event-making permission is enabled', () => {
		const enabledState = buildDefaultUseEventsReturn();
		mockUseEvents.mockReturnValue(enabledState);

		const { getByText, rerender, queryByText } = render(<Events />);

		fireEvent.press(getByText('+'));
		expect(enabledState.handleAddEvent).toHaveBeenCalledTimes(1);

		mockUseHomeLogic.mockReturnValue({
			cadetPermissionsMap: new Map<string, boolean>([['Event Making', false]]),
		});
		mockUseEvents.mockReturnValue(buildDefaultUseEventsReturn());

		rerender(<Events />);
		expect(queryByText('+')).toBeNull();
	});

	it('supports RSVP modal actions and close request', () => {
		const rsvpEvent: EventLike = {
			id: 'e-rsvp-1',
			title: 'RSVP Wing Dinner',
			date: new Date('2026-04-20T00:00:00.000Z'),
			time: new Date('2026-04-20T18:00:00.000Z'),
			description: 'Wing social event',
			location: 'Mess Hall',
			type: 'RSVP',
		};

		const state = buildDefaultUseEventsReturn({
			selectedEvent: rsvpEvent,
			eventInfoModalVisible: true,
			rsvpStatus: {},
		});
		mockUseEvents.mockReturnValue(state);

		const { getByText, UNSAFE_getAllByType } = render(<Events />);

		fireEvent.press(getByText('Confirm'));
		expect(state.handleRSVP).toHaveBeenCalledWith('e-rsvp-1', true);

		fireEvent.press(getByText('Decline'));
		expect(state.handleRSVP).toHaveBeenCalledWith('e-rsvp-1', false);

		const modals = UNSAFE_getAllByType(Modal);
		modals[0].props.onRequestClose();
		expect(state.handleCloseEventInfoModal).toHaveBeenCalledTimes(1);
	});

	it('supports add-event form controls and buttons', () => {
		const initialNewEvent = {
			id: '',
			title: '',
			date: new Date('2026-04-20T00:00:00.000Z'),
			time: new Date('2026-04-20T13:00:00.000Z'),
			description: '',
			location: '',
			type: '' as '' | 'RSVP' | 'Mandatory',
		};

		const state = buildDefaultUseEventsReturn({
			addEventsModalVisible: true,
			newEvent: initialNewEvent,
		});
		mockUseEvents.mockReturnValue(state);

		const { getByPlaceholderText, getByText, getByTestId, getAllByText, UNSAFE_getAllByType } = render(<Events />);

		fireEvent.changeText(getByPlaceholderText('Enter Event Title'), 'Change of Command');
		expect(state.setNewEvent).toHaveBeenCalledWith({ ...initialNewEvent, title: 'Change of Command' });

		fireEvent.changeText(getByPlaceholderText('Enter Location'), 'Parade Field');
		expect(state.setNewEvent).toHaveBeenCalledWith({ ...initialNewEvent, location: 'Parade Field' });

		fireEvent.changeText(getByPlaceholderText('Enter Event Description'), 'Formal ceremony');
		expect(state.setNewEvent).toHaveBeenCalledWith({ ...initialNewEvent, description: 'Formal ceremony' });

		fireEvent.press(getByTestId('mock-date-picker'));
		expect(state.setNewEvent).toHaveBeenCalledWith(
			expect.objectContaining({ date: new Date('2026-05-01T00:00:00.000Z') })
		);

		fireEvent.press(getByTestId('mock-time-picker'));
		expect(state.setNewEvent).toHaveBeenCalledWith(
			expect.objectContaining({ time: new Date('2026-05-01T14:30:00.000Z') })
		);

		const rsvpLabels = getAllByText('RSVP');
		fireEvent.press(rsvpLabels[rsvpLabels.length - 1]);
		expect(state.setNewEvent).toHaveBeenCalledWith({ ...initialNewEvent, type: 'RSVP' });

		fireEvent.press(getByText('Mandatory'));
		expect(state.setNewEvent).toHaveBeenCalledWith({ ...initialNewEvent, type: 'Mandatory' });

		fireEvent.press(getByText('Cancel'));
		expect(state.handleCancelAddEvent).toHaveBeenCalledTimes(1);

		fireEvent.press(getByText('Confirm'));
		expect(state.handleConfirmAddEvent).toHaveBeenCalledTimes(1);

		const modals = UNSAFE_getAllByType(Modal);
		modals[1].props.onRequestClose();
		expect(state.handleCancelAddEvent).toHaveBeenCalledTimes(2);
	});
});

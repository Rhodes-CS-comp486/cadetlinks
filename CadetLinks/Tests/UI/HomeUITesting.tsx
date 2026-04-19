import React from 'react';
import { render } from '@testing-library/react-native';
import { HomePage } from '../../src/navigation/screens/HomePage/Home';

const mockUseHomeLogic = jest.fn();

jest.mock('../../src/navigation/screens/HomePage/HomeLogic', () => ({
	useHomeLogic: () => mockUseHomeLogic(),
}));

jest.mock('../../src/navigation/Components/ScreenLayout', () => ({
	HomeScreenLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('react-native-gesture-handler', () => {
	return {
		TextInput: 'TextInput',
	};
});

jest.mock('../../src/navigation/screens/EventsPage/Components/datePicker', () => {
	const React = require('react');
	return () => React.createElement(React.Fragment, null);
});

function buildHomeLogicState(overrides: Partial<any> = {}) {
	return {
		cadetPermissionsMap: new Map<string, boolean>(),
		hasPermission: jest.fn(() => false),
		announcements: [
			{ id: 'a1', title: 'LLAB Uniform', body: 'OCPs required this Thursday.' },
			{ id: 'a2', title: 'PT Location Change', body: 'Meet at gym instead of track.' },
		],
		newAnnouncement: {
			id: '',
			title: '',
			body: '',
			importance: 'Low',
			retirementDate: new Date('2026-04-20T00:00:00.000Z'),
		},
		setNewAnnouncement: jest.fn(),
		upcomingEvents: [],
		addAnnouncementModalVisible: false,
		handleAddAnnouncement: jest.fn(),
		handleConfirmAddAnnouncement: jest.fn(),
		handleCancelAddAnnouncement: jest.fn(),
		deleteAnnouncementModalVisible: false,
		handleDeleteAnnouncement: jest.fn(),
		handleConfirmDeleteAnnouncement: jest.fn(),
		handleCancelDeleteAnnouncement: jest.fn(),
		selectedAnnouncementId: '',
		navigation: { navigate: jest.fn() },
		...overrides,
	};
}

describe('HomePage UI', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders announcements section and all announcement cards', () => {
		mockUseHomeLogic.mockReturnValue(buildHomeLogicState());

		const { getByText } = render(<HomePage />);

		expect(getByText('Announcements')).toBeTruthy();
		expect(getByText('LLAB Uniform')).toBeTruthy();
		expect(getByText('OCPs required this Thursday.')).toBeTruthy();
		expect(getByText('PT Location Change')).toBeTruthy();
		expect(getByText('Meet at gym instead of track.')).toBeTruthy();
	});

	it('renders no-events message when upcoming events list is empty', () => {
		mockUseHomeLogic.mockReturnValue(
			buildHomeLogicState({
				upcomingEvents: [],
			})
		);

		const { getByText, queryByText } = render(<HomePage />);

		expect(getByText(' Upcoming Events ')).toBeTruthy();
		expect(getByText('No events in the next 3 days.')).toBeTruthy();
		expect(queryByText('Leadership Lab')).toBeNull();
	});

	it('renders upcoming events cards with title, date/time meta, and location', () => {
		const eventTime1 = new Date('2026-04-16T14:30:00.000Z');
		const eventTime2 = new Date('2026-04-17T09:15:00.000Z');

		mockUseHomeLogic.mockReturnValue(
			buildHomeLogicState({
				upcomingEvents: [
					{
						id: 'e1',
						title: 'Leadership Lab',
						time: eventTime1,
						location: 'Hangar A',
					},
					{
						id: 'e2',
						title: 'PT Session',
						time: eventTime2,
						location: 'Track Field',
					},
				],
			})
		);

		const { getByText, queryByText } = render(<HomePage />);

		expect(getByText('Leadership Lab')).toBeTruthy();
		expect(getByText('PT Session')).toBeTruthy();
		expect(getByText('Hangar A')).toBeTruthy();
		expect(getByText('Track Field')).toBeTruthy();

		// Verifies dynamic event metadata text is rendered for both events.
		const expectedMeta1 = `${eventTime1.toLocaleDateString()} at ${eventTime1.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		})}`;
		const expectedMeta2 = `${eventTime2.toLocaleDateString()} at ${eventTime2.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		})}`;
		expect(getByText(expectedMeta1)).toBeTruthy();
		expect(getByText(expectedMeta2)).toBeTruthy();

		expect(queryByText('No events in the next 3 days.')).toBeNull();
	});
});

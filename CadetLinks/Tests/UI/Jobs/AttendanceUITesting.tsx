import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Modal } from 'react-native';
import { AttendanceModal } from '../../../src/navigation/screens/ActionsPage/Components/AttendanceModal';

jest.mock('@expo/vector-icons', () => ({
	Ionicons: ({ name }: { name: string }) => {
		const React = require('react');
		const { Text } = require('react-native');
		return React.createElement(Text, null, `icon-${name}`);
	},
}));

function buildAttendanceModalProps(overrides: Partial<any> = {}) {
	return {
		visible: true,
		onRequestClose: jest.fn(),
		loadingAttendanceTools: false,
		selectedEvent: undefined,
		eventDropdownOpen: false,
		onToggleEventDropdown: jest.fn(),
		todayEvents: [],
		onSelectEvent: jest.fn(),
		markedAbsentCount: 2,
		markedLateCount: 1,
		onToggleFlightDropdown: jest.fn(),
		selectedFlight: undefined,
		flightDropdownOpen: false,
		onSelectFlight: jest.fn(),
		allCadets: [
			{ cadetKey: 'cadet-1', firstName: 'Alice', lastName: 'Smith', fullName: 'Alice Smith', attendanceKey: 'smith' },
			{ cadetKey: 'cadet-2', firstName: 'Bob', lastName: 'Jones', fullName: 'Bob Jones', attendanceKey: 'jones' },
		],
		getCadetStatus: jest.fn((cadetKey: string) => {
			if (cadetKey === 'cadet-1') return 'P';
			return 'A';
		}),
		setCadetStatus: jest.fn(),
		savingAttendance: false,
		clearingAttendance: false,
		onClearAttendance: jest.fn(),
		onSubmitAttendance: jest.fn(),
		...overrides,
	};
}

describe('AttendanceModal UI', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders loading block and modal close actions when attendance tools are loading', () => {
		const props = buildAttendanceModalProps({
			loadingAttendanceTools: true,
		});

		const { getByText, queryByText, UNSAFE_getByType } = render(
			<AttendanceModal {...props} />
		);

		expect(getByText('Take Attendance')).toBeTruthy();
		expect(getByText("Loading today's events and cadets…")).toBeTruthy();
		expect(queryByText('Select Event')).toBeNull();

		fireEvent.press(getByText('icon-close'));
		expect(props.onRequestClose).toHaveBeenCalledTimes(1);

		const modal = UNSAFE_getByType(Modal);
		modal.props.onRequestClose();
		expect(props.onRequestClose).toHaveBeenCalledTimes(2);
	});

	it('renders default event prompt and closed dropdown branch', () => {
		const props = buildAttendanceModalProps({
			selectedEvent: undefined,
			eventDropdownOpen: false,
		});

		const { getByText, queryByText } = render(<AttendanceModal {...props} />);

		expect(getByText('Select Event')).toBeTruthy();
		expect(getByText("Choose today's event")).toBeTruthy();
		expect(queryByText('No events found for today.')).toBeNull();

		fireEvent.press(getByText("Choose today's event"));
		expect(props.onToggleEventDropdown).toHaveBeenCalledTimes(1);
	});

	it('renders selected event with No time fallback and empty dropdown state', () => {
		const props = buildAttendanceModalProps({
			selectedEvent: {
				id: 'event-1',
				eventName: 'PT Session',
				time: undefined,
				locationId: 'Track',
				date: new Date('2026-04-15T00:00:00.000Z'),
			},
			eventDropdownOpen: true,
			todayEvents: [],
		});

		const { getByText } = render(<AttendanceModal {...props} />);

		expect(getByText('PT Session (No time)')).toBeTruthy();
		expect(getByText('No events found for today.')).toBeTruthy();
	});

	it('renders dropdown events and supports selecting an event option', () => {
		const props = buildAttendanceModalProps({
			eventDropdownOpen: true,
			todayEvents: [
				{
					id: 'event-1',
					eventName: 'LLAB Brief',
					time: '14:00',
					locationId: 'Room 201',
					date: new Date('2026-04-15T00:00:00.000Z'),
				},
				{
					id: 'event-2',
					eventName: 'PT Session',
					time: undefined,
					locationId: undefined,
					date: new Date('2026-04-15T00:00:00.000Z'),
				},
			],
		});

		const { getByText } = render(<AttendanceModal {...props} />);

		expect(getByText('LLAB Brief')).toBeTruthy();
		expect(getByText('14:00 • Room 201')).toBeTruthy();
		expect(getByText('PT Session')).toBeTruthy();
		expect(getByText('No time • No location')).toBeTruthy();

		fireEvent.press(getByText('LLAB Brief'));
		expect(props.onSelectEvent).toHaveBeenCalledWith('event-1');
	});

	it('renders summary, cadet list statuses, and supports status button handlers', () => {
		const props = buildAttendanceModalProps({
			allCadets: [
				{ cadetKey: 'cadet-p', firstName: 'Present', lastName: 'Cadet', fullName: 'Present Cadet', attendanceKey: 'presentcadet' },
				{ cadetKey: 'cadet-a', firstName: 'Absent', lastName: 'Cadet', fullName: 'Absent Cadet', attendanceKey: 'absentcadet' },
				{ cadetKey: 'cadet-l', firstName: 'Late', lastName: 'Cadet', fullName: 'Late Cadet', attendanceKey: 'latecadet' },
			],
			getCadetStatus: jest.fn((cadetKey: string) => {
				if (cadetKey === 'cadet-p') return 'P';
				if (cadetKey === 'cadet-a') return 'A';
				return 'L';
			}),
		});

		const { getByText, getAllByText } = render(<AttendanceModal {...props} />);

		expect(getByText('Quick Summary')).toBeTruthy();
		expect(getByText('Everyone is Present by default.')).toBeTruthy();
		expect(getByText('Absent marked: 2')).toBeTruthy();
		expect(getByText('Late marked: 1')).toBeTruthy();

		expect(getByText('Present Cadet')).toBeTruthy();
		expect(getByText('Absent Cadet')).toBeTruthy();
		expect(getByText('Late Cadet')).toBeTruthy();

		const presentButtons = getAllByText('Present');
		const absentButtons = getAllByText('Absent');
		const lateButtons = getAllByText('Late');

		fireEvent.press(presentButtons[0]);
		expect(props.setCadetStatus).toHaveBeenCalledWith('cadet-p', 'P');

		fireEvent.press(absentButtons[1]);
		expect(props.setCadetStatus).toHaveBeenCalledWith('cadet-a', 'A');

		fireEvent.press(lateButtons[2]);
		expect(props.setCadetStatus).toHaveBeenCalledWith('cadet-l', 'L');
	});

	it('supports footer actions when not saving or clearing', () => {
		const props = buildAttendanceModalProps({
			savingAttendance: false,
			clearingAttendance: false,
		});

		const { getByText } = render(<AttendanceModal {...props} />);

		fireEvent.press(getByText('Cancel'));
		expect(props.onRequestClose).toHaveBeenCalledTimes(1);

		fireEvent.press(getByText('Clear Attendance'));
		expect(props.onClearAttendance).toHaveBeenCalledTimes(1);

		fireEvent.press(getByText('Save Attendance'));
		expect(props.onSubmitAttendance).toHaveBeenCalledTimes(1);
	});

	it('disables footer actions and shows spinner for clear branch while clearing', () => {
		const props = buildAttendanceModalProps({
			clearingAttendance: true,
			savingAttendance: false,
		});

		const { getByText, queryByText } = render(<AttendanceModal {...props} />);

		fireEvent.press(getByText('Cancel'));
		fireEvent.press(getByText('Save Attendance'));

		expect(props.onRequestClose).not.toHaveBeenCalled();
		expect(props.onSubmitAttendance).not.toHaveBeenCalled();
		expect(queryByText('Clear Attendance')).toBeNull();
	});

	it('disables footer actions and shows spinner for save branch while saving', () => {
		const props = buildAttendanceModalProps({
			savingAttendance: true,
			clearingAttendance: false,
		});

		const { getByText, queryByText } = render(<AttendanceModal {...props} />);

		fireEvent.press(getByText('Cancel'));
		fireEvent.press(getByText('Clear Attendance'));

		expect(props.onRequestClose).not.toHaveBeenCalled();
		expect(props.onClearAttendance).not.toHaveBeenCalled();
		expect(queryByText('Save Attendance')).toBeNull();
	});
});

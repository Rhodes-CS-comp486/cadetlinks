import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Profile } from '../../src/navigation/screens/ProfilePage/Profile';

const mockUseProfileLogic = jest.fn();

jest.mock('../../src/navigation/screens/ProfilePage/ProfileLogic', () => ({
	useProfileLogic: () => mockUseProfileLogic(),
}));

jest.mock('../../src/navigation/Components/ScreenLayout', () => ({
	ScreenLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@expo/vector-icons', () => ({
	Ionicons: ({ name }: { name: string }) => {
		const React = require('react');
		const { Text } = require('react-native');
		return React.createElement(Text, null, `icon-${name}`);
	},
}));

function buildProfileState(overrides: Partial<any> = {}) {
	return {
		cadetKey: 'john_doe_memphis_edu',

		profile: {
			firstName: 'John',
			lastName: 'Doe',
			flight: 'A',
			cadetRank: 'C/1st Lt',
			job: 'Flight Commander',
			classYear: 2026,
			contact: { schoolEmail: 'john.doe@memphis.edu' },
			directSupervisor: 'Capt Smith',
			lastPTScore: '95',
		},
		loadingProfile: false,
		profileError: null,

		loadingAttendance: false,
		attendanceError: null,

		ptAttended: 9,
		ptMissed: 1,
		ptExcused: 0,
		ptLate: 0,
		ptAttendancePercent: 90,
		ptInGoodStanding: true,

		llabAttended: 8,
		llabMissed: 2,
		llabExcused: 0,
		llabLate: 0,
		llabAttendancePercent: 80,
		llabInGoodStanding: false,
		...overrides,
	};
}

describe('Profile UI', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders private tab by default with full profile details and attendance cards', () => {
		mockUseProfileLogic.mockReturnValue(buildProfileState());

		const { getByText, getAllByText, queryByText } = render(<Profile />);

		expect(getByText('Private')).toBeTruthy();
		expect(getByText('Public')).toBeTruthy();

		expect(getByText('John Doe')).toBeTruthy();
		expect(getByText(/Flight:\s*A/)).toBeTruthy();
		expect(getByText(/Rank:\s*C\/1st Lt/)).toBeTruthy();
		expect(getByText(/Job:\s*Flight Commander/)).toBeTruthy();
		expect(getByText(/Class Year:\s*2026/)).toBeTruthy();
		expect(getByText(/School Email:\s*john\.doe@memphis\.edu/)).toBeTruthy();
		expect(getByText(/Last PT Score:\s*95/)).toBeTruthy();

		expect(getByText('PT Attendance')).toBeTruthy();
		expect(getByText('LLAB Attendance')).toBeTruthy();

		expect(getByText('Attended (9)')).toBeTruthy();
		expect(getByText('Missed (1)')).toBeTruthy();
		expect(getAllByText('Excused (0)')).toHaveLength(2);
		expect(getAllByText('Late (0)')).toHaveLength(2);
		expect(getByText('Attended (8)')).toBeTruthy();
		expect(getByText('Missed (2)')).toBeTruthy();

		expect(getByText('Good Standing')).toBeTruthy();
		expect(getByText('Warning')).toBeTruthy();

		expect(queryByText('Bio')).toBeNull();
	});

	it('renders loading states in private tab', () => {
		mockUseProfileLogic.mockReturnValue(
			buildProfileState({
				profile: null,
				loadingProfile: true,
				loadingAttendance: true,
			})
		);

		const { getByText } = render(<Profile />);

		expect(getByText('Loading profile…')).toBeTruthy();
		expect(getByText('Loading attendance…')).toBeTruthy();
	});

	it('renders profile and attendance errors with cadet key in private tab', () => {
		mockUseProfileLogic.mockReturnValue(
			buildProfileState({
				profile: null,
				profileError: 'Could not load profile.',
				attendanceError: 'Could not load attendance.',
			})
		);

		const { getByText } = render(<Profile />);

		expect(getByText('Could not load profile.')).toBeTruthy();
		expect(getByText('Could not load attendance.')).toBeTruthy();
		expect(getByText(/Key:/)).toBeTruthy();
		expect(getByText(/Key:\s*john_doe_memphis_edu/)).toBeTruthy();
	});

	it('renders private profile error without cadet key', () => {
		mockUseProfileLogic.mockReturnValue(
			buildProfileState({
				cadetKey: null,
				profile: null,
				profileError: 'No user is logged in.',
			})
		);

		const { getByText, queryByText } = render(<Profile />);
		expect(getByText('No user is logged in.')).toBeTruthy();
		expect(queryByText(/Key:/)).toBeNull();
	});

	it('renders no-profile state in private tab', () => {
		mockUseProfileLogic.mockReturnValue(
			buildProfileState({
				profile: null,
			})
		);

		const { getByText } = render(<Profile />);

		expect(getByText('No profile found.')).toBeTruthy();
	});

	it('renders bad standing branch for attendance colors/labels', () => {
		mockUseProfileLogic.mockReturnValue(
			buildProfileState({
				ptAttendancePercent: 70,
				llabAttendancePercent: 50,
			})
		);

		const { getAllByText, getByText } = render(<Profile />);

		expect(getByText('70%')).toBeTruthy();
		expect(getByText('50%')).toBeTruthy();
		expect(getAllByText('Bad Standing')).toHaveLength(2);
	});

	it('renders PT warning and LLAB good standing branches', () => {
		mockUseProfileLogic.mockReturnValue(
			buildProfileState({
				ptAttendancePercent: 85,
				llabAttendancePercent: 95,
			})
		);

		const { getByText, getAllByText } = render(<Profile />);

		expect(getByText('85%')).toBeTruthy();
		expect(getByText('95%')).toBeTruthy();
		expect(getByText('Warning')).toBeTruthy();
		expect(getAllByText('Good Standing')).toHaveLength(1);
	});

	it('switches to public tab and renders public profile with bio and placeholder', () => {
		mockUseProfileLogic.mockReturnValue(buildProfileState());

		const { getByText, queryByText } = render(<Profile />);

		fireEvent.press(getByText('Public'));

		expect(getByText('John Doe')).toBeTruthy();
		expect(getByText(/Rank:\s*C\/1st Lt/)).toBeTruthy();
		expect(getByText(/Class Year:\s*2026/)).toBeTruthy();
		expect(getByText(/Job:\s*Flight Commander/)).toBeTruthy();
		expect(getByText(/Email:\s*john\.doe@memphis\.edu/)).toBeTruthy();
		expect(getByText('Photo')).toBeTruthy();
		expect(getByText('Bio')).toBeTruthy();
		expect(getByText('This is where the cadet bio will go!')).toBeTruthy();

		expect(queryByText('PT Attendance')).toBeNull();
	});

	it('renders loading and profile-error states in public tab with and without cadet key', () => {
		mockUseProfileLogic.mockReturnValue(
			buildProfileState({
				profile: null,
				loadingProfile: true,
			})
		);

		const { getByText, rerender, queryByText } = render(<Profile />);

		rerender(<Profile />);
		fireEvent.press(getByText('Public'));
		expect(getByText('Loading profile…')).toBeTruthy();

		mockUseProfileLogic.mockReturnValue(
			buildProfileState({
				profile: null,
				loadingProfile: false,
				profileError: 'No profile found for this user.',
				cadetKey: null,
			})
		);
		rerender(<Profile />);
		fireEvent.press(getByText('Public'));
		expect(getByText('No profile found for this user.')).toBeTruthy();
		expect(queryByText(/Key:/)).toBeNull();
	});

	it('renders public profile error with cadet key shown', () => {
		mockUseProfileLogic.mockReturnValue(
			buildProfileState({
				profile: null,
				loadingProfile: false,
				profileError: 'Could not load profile.',
				cadetKey: 'john_doe_memphis_edu',
			})
		);

		const { getByText } = render(<Profile />);
		fireEvent.press(getByText('Public'));
		expect(getByText('Could not load profile.')).toBeTruthy();
		expect(getByText(/Key:\s*john_doe_memphis_edu/)).toBeTruthy();
	});

	it('renders no-profile state in public tab and can toggle back to private', () => {
		mockUseProfileLogic.mockReturnValue(
			buildProfileState({
				profile: null,
			})
		);

		const { getByText } = render(<Profile />);

		fireEvent.press(getByText('Public'));
		expect(getByText('No profile found.')).toBeTruthy();

		fireEvent.press(getByText('Private'));
		expect(getByText('PT Attendance')).toBeTruthy();
	});

	it('renders fallback placeholder values for missing profile fields in private and public tabs', () => {
		mockUseProfileLogic.mockReturnValue(
			buildProfileState({
				profile: {},
			})
		);

		const { getByText } = render(<Profile />);

		expect(getByText('First Last')).toBeTruthy();
		expect(getByText(/Flight:\s*—/)).toBeTruthy();
		expect(getByText(/Rank:\s*—/)).toBeTruthy();
		expect(getByText(/Job:\s*—/)).toBeTruthy();
		expect(getByText(/Class Year:\s*—/)).toBeTruthy();
		expect(getByText(/School Email:\s*—/)).toBeTruthy();
		expect(getByText(/Last PT Score:\s*—/)).toBeTruthy();

		fireEvent.press(getByText('Public'));

		expect(getByText(/Rank:\s*—/)).toBeTruthy();
		expect(getByText(/Class Year:\s*—/)).toBeTruthy();
		expect(getByText(/Job:\s*—/)).toBeTruthy();
		expect(getByText(/Email:\s*—/)).toBeTruthy();
	});
});

import React from 'react';
import { render } from '@testing-library/react-native';
import { PublicProfile } from '../../src/navigation/screens/SearchPage/PublicProfiles';

const mockUseRoute = jest.fn();
const mockUsePublicProfileLogic = jest.fn();

jest.mock('@react-navigation/native', () => ({
	useRoute: () => mockUseRoute(),
}));

jest.mock('../../src/navigation/screens/SearchPage/PublicProfileLogic', () => ({
	usePublicProfileLogic: (cadetKey: string) => mockUsePublicProfileLogic(cadetKey),
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

function buildPublicProfileState(overrides: Partial<any> = {}) {
	return {
		profile: {
			firstName: 'Jane',
			lastName: 'Doe',
			cadetRank: 'C/Capt',
			job: 'Operations Officer',
			classYear: 2026,
			bio: 'Dedicated cadet leader.',
			photoUrl: undefined,
			contact: {
				schoolEmail: 'jane.doe@memphis.edu',
			},
		},
		loadingProfile: false,
		profileError: null,
		...overrides,
	};
}

describe('PublicProfile UI', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUseRoute.mockReturnValue({ params: { cadetKey: 'cadet_123' } });
	});

	it('passes cadetKey from route into logic hook', () => {
		mockUsePublicProfileLogic.mockReturnValue(buildPublicProfileState());
		render(<PublicProfile />);
		expect(mockUsePublicProfileLogic).toHaveBeenCalledWith('cadet_123');
	});

	it('renders loading state with placeholder image and default bio text', () => {
		mockUsePublicProfileLogic.mockReturnValue(
			buildPublicProfileState({
				profile: null,
				loadingProfile: true,
			})
		);

		const { getByText, queryByText } = render(<PublicProfile />);

		expect(getByText('Public Profile')).toBeTruthy();
		expect(getByText('Loading profile…')).toBeTruthy();
		expect(getByText('Photo')).toBeTruthy();
		expect(getByText('icon-image-outline')).toBeTruthy();
		expect(getByText('Bio')).toBeTruthy();
		expect(getByText('This cadet has not added a bio yet.')).toBeTruthy();
		expect(queryByText('Jane Doe')).toBeNull();
	});

	it('renders profile error branch and keeps fallback bio text', () => {
		mockUsePublicProfileLogic.mockReturnValue(
			buildPublicProfileState({
				profile: null,
				profileError: 'Could not load public profile.',
			})
		);

		const { getByText } = render(<PublicProfile />);
		expect(getByText('Could not load public profile.')).toBeTruthy();
		expect(getByText('This cadet has not added a bio yet.')).toBeTruthy();
	});

	it('renders no-profile branch', () => {
		mockUsePublicProfileLogic.mockReturnValue(
			buildPublicProfileState({
				profile: null,
			})
		);

		const { getByText } = render(<PublicProfile />);
		expect(getByText('No profile found.')).toBeTruthy();
		expect(getByText('Photo')).toBeTruthy();
	});

	it('renders full profile details, bio text, and image photo branch', () => {
		mockUsePublicProfileLogic.mockReturnValue(
			buildPublicProfileState({
				profile: {
					firstName: 'John',
					lastName: 'Smith',
					cadetRank: 'C/Maj',
					job: 'Wing Commander',
					classYear: 2025,
					bio: 'Leads the wing with focus and integrity.',
					photoUrl: 'https://example.com/john-smith.png',
					contact: { schoolEmail: 'john.smith@memphis.edu' },
				},
			})
		);

		const { getByText, queryByText } = render(<PublicProfile />);

		expect(getByText('John Smith')).toBeTruthy();
		expect(getByText(/Rank:\s*C\/Maj/)).toBeTruthy();
		expect(getByText(/Class Year:\s*2025/)).toBeTruthy();
		expect(getByText(/Job:\s*Wing Commander/)).toBeTruthy();
		expect(getByText(/Email:\s*john\.smith@memphis\.edu/)).toBeTruthy();
		expect(getByText('Leads the wing with focus and integrity.')).toBeTruthy();

		expect(queryByText('Photo')).toBeNull();
		expect(queryByText('icon-image-outline')).toBeNull();
	});

	it('renders fallback values for missing profile fields and trims blank bio to fallback', () => {
		mockUsePublicProfileLogic.mockReturnValue(
			buildPublicProfileState({
				profile: {
					bio: '   ',
				},
			})
		);

		const { getByText } = render(<PublicProfile />);

		expect(getByText('First Last')).toBeTruthy();
		expect(getByText(/Rank:\s*—/)).toBeTruthy();
		expect(getByText(/Class Year:\s*—/)).toBeTruthy();
		expect(getByText(/Job:\s*—/)).toBeTruthy();
		expect(getByText(/Email:\s*—/)).toBeTruthy();
		expect(getByText('This cadet has not added a bio yet.')).toBeTruthy();
	});
});

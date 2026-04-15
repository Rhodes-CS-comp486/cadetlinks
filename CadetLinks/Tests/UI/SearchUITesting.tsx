import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Search } from '../../src/navigation/screens/SearchPage/Search';

const mockUseSearchLogic = jest.fn();
const mockUseNavigation = jest.fn();

jest.mock('@react-navigation/native', () => ({
	useNavigation: () => mockUseNavigation(),
}));

jest.mock('../../src/navigation/screens/SearchPage/SearchLogic', () => ({
	useSearchLogic: () => mockUseSearchLogic(),
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

function buildSearchState(overrides: Partial<any> = {}) {
	return {
		query: '',
		setQuery: jest.fn(),
		filteredCadets: [
			{
				cadetKey: 'cadet_1',
				firstName: 'Sadie',
				lastName: 'Gray',
				cadetRank: 'C/Lt Col',
				job: 'Vice Wing Commander',
				flight: 'POC',
				classYear: 400,
			},
		],
		loadingCadets: false,
		searchError: null,
		...overrides,
	};
}

describe('Search UI', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUseNavigation.mockReturnValue({ navigate: jest.fn() });
	});

	it('renders loading state branch', () => {
		mockUseSearchLogic.mockReturnValue(
			buildSearchState({
				loadingCadets: true,
				filteredCadets: [],
			})
		);

		const { getByText, getAllByText, queryByText } = render(<Search />);

		expect(getByText('Search Cadets')).toBeTruthy();
		expect(getByText('icon-search')).toBeTruthy();
		expect(getByText('Loading cadets…')).toBeTruthy();
		expect(queryByText('No cadets found.')).toBeNull();
	});

	it('renders error branch', () => {
		mockUseSearchLogic.mockReturnValue(
			buildSearchState({
				searchError: 'Could not load cadets.',
				filteredCadets: [],
			})
		);

		const { getByText } = render(<Search />);
		expect(getByText('Could not load cadets.')).toBeTruthy();
	});

	it('renders no-results branch when filtered list is empty', () => {
		mockUseSearchLogic.mockReturnValue(
			buildSearchState({
				filteredCadets: [],
			})
		);

		const { getByText } = render(<Search />);
		expect(getByText('No cadets found.')).toBeTruthy();
	});

	it('renders search results and navigates to public profile on press', () => {
		const state = buildSearchState({
			filteredCadets: [
				{
					cadetKey: 'cadet_1',
					firstName: 'Sadie',
					lastName: 'Gray',
					cadetRank: 'C/Lt Col',
					job: 'Vice Wing Commander',
					flight: 'POC',
					classYear: 400,
				},
			],
		});
		mockUseSearchLogic.mockReturnValue(state);
		const navigation = { navigate: jest.fn() };
		mockUseNavigation.mockReturnValue(navigation);

		const { getByText } = render(<Search />);

		expect(getByText('Sadie Gray')).toBeTruthy();
		expect(getByText('C/Lt Col • Vice Wing Commander')).toBeTruthy();
		expect(getByText('POC • 400')).toBeTruthy();
		expect(getByText('icon-person')).toBeTruthy();
		expect(getByText('icon-chevron-forward')).toBeTruthy();

		fireEvent.press(getByText('Sadie Gray'));
		expect(navigation.navigate).toHaveBeenCalledWith('PublicProfile', {
			cadetKey: 'cadet_1',
		});
	});

	it('updates query via text input and clears query with close-circle control', () => {
		const state = buildSearchState({
			query: 'sad',
		});
		mockUseSearchLogic.mockReturnValue(state);

		const { getByPlaceholderText, getByText } = render(<Search />);
		const input = getByPlaceholderText('Search by name, rank, job, flight...');

		fireEvent.changeText(input, 'gray');
		expect(state.setQuery).toHaveBeenCalledWith('gray');

		fireEvent.press(getByText('icon-close-circle'));
		expect(state.setQuery).toHaveBeenCalledWith('');
	});

	it('renders fallback fields for missing cadet data and no clear icon for empty query', () => {
		mockUseSearchLogic.mockReturnValue(
			buildSearchState({
				query: '',
				filteredCadets: [
					{
						cadetKey: 'cadet_2',
					},
				],
			})
		);

		const { getByText, getAllByText, queryByText } = render(<Search />);

		expect(getByText('First Last')).toBeTruthy();
		expect(getAllByText('— • —')).toHaveLength(2);
		expect(queryByText('icon-close-circle')).toBeNull();
	});
});

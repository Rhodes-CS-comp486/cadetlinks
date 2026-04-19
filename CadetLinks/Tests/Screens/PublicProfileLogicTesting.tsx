import { act, renderHook, waitFor } from '@testing-library/react-native';
import { usePublicProfileLogic, PublicCadetProfile } from '../../src/navigation/screens/SearchPage/PublicProfileLogic';


const mockInitializeGlobals = jest.fn(() => Promise.resolve());
const mockGetProfileByCadetKey = jest.fn();
const mockGlobalState = {
	isInitialized: true,
	isInitializing: false,
	cadetsByKey: {} as Record<string, PublicCadetProfile>,
};

jest.mock('../../src/firebase/globals', () => ({
	globals: () => mockGlobalState,
	initializeGlobals: () => mockInitializeGlobals(),
	getProfileByCadetKey: (cadetKey: string) => mockGetProfileByCadetKey(cadetKey),
}));

describe('usePublicProfileLogic', () => {
	beforeEach(() => {
		mockGlobalState.isInitialized = true;
		mockGlobalState.isInitializing = false;
		mockGlobalState.cadetsByKey = {};
		mockGetProfileByCadetKey.mockReset();
		mockInitializeGlobals.mockClear();
		jest.clearAllMocks();
		jest.spyOn(console, 'error').mockImplementation(jest.fn());
	});

	afterEach(() => {
		(console.error as jest.Mock).mockRestore?.();
	});

	it('initializes with loading state', () => {
		const { result } = renderHook(() => usePublicProfileLogic('cadet123'));

		expect(result.current.loadingProfile).toBe(true);
		expect(result.current.profile).toBe(null);
		expect(result.current.profileError).toBe(null);
	});

	it('successfully loads public profile when profile exists', async () => {
		const cadetKey = 'john_doe_123';
		const mockProfile: PublicCadetProfile = {
			firstName: 'John',
			lastName: 'Doe',
			cadetRank: 'Captain',
			job: 'Flight Lead',
			classYear: 2026,
			bio: 'Dedicated cadet',
			photoUrl: 'https://example.com/photo.jpg',
			contact: {
				schoolEmail: 'john.doe@memphis.edu',
			},
		};

		mockGetProfileByCadetKey.mockResolvedValueOnce(mockProfile);

		const { result } = renderHook(() => usePublicProfileLogic(cadetKey));

		// Initially loading
		expect(result.current.loadingProfile).toBe(true);
		expect(result.current.profileError).toBe(null);

		// Wait for profile to load
		await waitFor(() => {
			expect(result.current.loadingProfile).toBe(false);
		});

		expect(result.current.profile).toEqual(mockProfile);
		expect(result.current.profileError).toBe(null);
		expect(mockGetProfileByCadetKey).toHaveBeenCalledWith(cadetKey);
	});

	it('handles profile not found case', async () => {
		const cadetKey = 'nonexistent_cadet';
		mockGetProfileByCadetKey.mockResolvedValueOnce(null);

		const { result } = renderHook(() => usePublicProfileLogic(cadetKey));

		expect(result.current.loadingProfile).toBe(true);

		await waitFor(() => {
			expect(result.current.loadingProfile).toBe(false);
		});

		expect(result.current.profile).toBe(null);
		expect(result.current.profileError).toBe('No profile found for this cadet.');
	});

	it('handles error when loading profile fails', async () => {
		const cadetKey = 'error_cadet';
		mockGetProfileByCadetKey.mockRejectedValueOnce(new Error('Firebase connection error'));

		const { result } = renderHook(() => usePublicProfileLogic(cadetKey));

		expect(result.current.loadingProfile).toBe(true);

		await waitFor(() => {
			expect(result.current.loadingProfile).toBe(false);
		});

		expect(result.current.profile).toBe(null);
		expect(result.current.profileError).toBe('Could not load public profile.');
		expect(console.error).toHaveBeenCalledWith(
			'❌ Error loading public profile:',
			expect.any(Error)
		);
	});

	it('clears previous error when profile loads successfully after error', async () => {
		const cadetKey1 = 'error_cadet';
		const cadetKey2 = 'success_cadet';
		const mockProfile: PublicCadetProfile = {
			firstName: 'Charlie',
			lastName: 'Brown',
		};

		// First call fails
		mockGetProfileByCadetKey.mockRejectedValueOnce(new Error('Network error'));

		const { result, rerender } = renderHook(
			({ cadetKey }: { cadetKey: string }) => usePublicProfileLogic(cadetKey),
			{
				initialProps: { cadetKey: cadetKey1 },
			}
		);

		await waitFor(() => {
			expect(result.current.loadingProfile).toBe(false);
		});

		expect(result.current.profileError).toBe('Could not load public profile.');

		// Setup success response for second cadet
		mockGetProfileByCadetKey.mockResolvedValueOnce(mockProfile);

		// Change to cadet with successful profile
		await act(async () => {
			rerender({ cadetKey: cadetKey2 });
		});

		await waitFor(() => {
			expect(result.current.loadingProfile).toBe(false);
		});

		expect(result.current.profile).toEqual(mockProfile);
		expect(result.current.profileError).toBe(null);
	});

	it('handles partial profile data', async () => {
		const cadetKey = 'partial_cadet';
		const partialProfile: PublicCadetProfile = {
			firstName: 'Dave',
			// Only firstName, other fields are undefined
		};

		mockGetProfileByCadetKey.mockResolvedValueOnce(partialProfile);

		const { result } = renderHook(() => usePublicProfileLogic(cadetKey));

		await waitFor(() => {
			expect(result.current.loadingProfile).toBe(false);
		});

		expect(result.current.profile).toEqual(partialProfile);
		expect(result.current.profile?.firstName).toBe('Dave');
		expect(result.current.profile?.lastName).toBeUndefined();
		expect(result.current.profileError).toBe(null);
	});

	it('uses cached profile from globals without calling fallback fetch', async () => {
		const cadetKey = 'cached_cadet';
		const cachedProfile: PublicCadetProfile = {
			firstName: 'Cached',
			lastName: 'User',
		};

		mockGlobalState.cadetsByKey = {
			[cadetKey]: cachedProfile,
		};

		const { result } = renderHook(() => usePublicProfileLogic(cadetKey));

		await waitFor(() => {
			expect(result.current.loadingProfile).toBe(false);
		});

		expect(result.current.profile).toEqual(cachedProfile);
		expect(mockGetProfileByCadetKey).not.toHaveBeenCalled();
	});

	// it('maintains stable return object with useMemo', async () => {
	// 	const cadetKey = 'stable_cadet';
	// 	const mockProfile: PublicCadetProfile = {
	// 		firstName: 'Eve',
	// 	};

	// 	getResponses[`cadets/${cadetKey}`] = {
	// 		exists: true,
	// 		value: mockProfile,
	// 	};

	// 	const { result, rerender } = renderHook(() => usePublicProfileLogic(cadetKey));

	// 	const initialResult = result.current;

	// 	await waitFor(() => {
	// 		expect(result.current.loadingProfile).toBe(false);
	// 	});

	// 	// Rerender with same cadetKey
	// 	rerender({ cadetKey });

	// 	// The object reference should be the same when values haven't changed

    //     expect(result.current).toBe(initialResult);
		
	// });
});
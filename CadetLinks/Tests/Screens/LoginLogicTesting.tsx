import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebaseAuth from 'firebase/auth';
import * as firebaseDatabase from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import { useLoginLogic } from '../../src/navigation/screens/LoginPage/LoginLogic';

type Snapshot = {
	exists: () => boolean;
	val: () => unknown;
};

const mockReplace = jest.fn();
const getResponses: Record<string, { exists: boolean; value?: unknown }> = {};

jest.mock('../../src/firebase/config', () => ({
	auth: { mockedAuth: true },
	db: { mockedDb: true },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
	setItem: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
	useNavigation: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
	signInWithEmailAndPassword: jest.fn(),
}));

jest.mock('firebase/database', () => ({
	ref: jest.fn((_db: unknown, path: string) => ({ path })),
	get: jest.fn((refObj: { path: string }) => {
		const response = getResponses[refObj.path] || { exists: false, value: undefined };
		return Promise.resolve({
			exists: () => response.exists,
			val: () => response.value,
		} as Snapshot);
	}),
}));

jest.mock('../../src/firebase/globals', () => ({
	initializeGlobals: jest.fn(() => Promise.resolve()),
	deriveCadetKeyFromEmail: (email: string) =>
		email.trim().toLowerCase().replace(/@/g, '_').replace(/\./g, '_').replace(/-/g, '_'),
}));

describe('useLoginLogic', () => {
	beforeEach(() => {
		Object.keys(getResponses).forEach((key) => delete getResponses[key]);
		jest.clearAllMocks();

		(useNavigation as jest.Mock).mockReturnValue({
			replace: mockReplace,
		});

		(firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
			user: { uid: 'mock-user' },
		});

		(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
		jest.spyOn(console, 'log').mockImplementation(jest.fn());
		jest.spyOn(console, 'error').mockImplementation(jest.fn());
	});

	afterEach(() => {
		(console.log as jest.Mock).mockRestore?.();
		(console.error as jest.Mock).mockRestore?.();
	});

	it('returns validation error when email or password is missing', async () => {
		const { result } = renderHook(() => useLoginLogic());

		await act(async () => {
			result.current.setEmail('');
			result.current.setPassword('');
		});

		await act(async () => {
			await result.current.handleLogin();
		});

		expect(result.current.error).toBe('Please enter both email and password.');
		expect(result.current.loading).toBe(false);
		expect(firebaseAuth.signInWithEmailAndPassword).not.toHaveBeenCalled();
	});

	it('logs in successfully, stores cadet key, and navigates to HomeTabs', async () => {
		const { result } = renderHook(() => useLoginLogic());

		const rawEmail = '  rjwhtfld@memphis.edu  ';
		const rawPassword = '  cadetlinks  ';
		const expectedCadetKey = 'rjwhtfld_memphis_edu';
		getResponses[`cadets/${expectedCadetKey}`] = {
			exists: true,
			value: { firstName: 'Ryan', lastName: 'Whitfield' },
		};

		await act(async () => {
			result.current.setEmail(rawEmail);
			result.current.setPassword(rawPassword);
		});

		await act(async () => {
			await result.current.handleLogin();
		});

		expect(firebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
			expect.any(Object),
			'rjwhtfld@memphis.edu',
			'cadetlinks'
		);
		expect(firebaseDatabase.get).toHaveBeenCalledWith({
			path: `cadets/${expectedCadetKey}`,
		});
		expect(AsyncStorage.setItem).toHaveBeenCalledWith('currentCadetKey', expectedCadetKey);
		expect(mockReplace).toHaveBeenCalledWith('HomeTabs');
		expect(result.current.error).toBe('');
		expect(result.current.loading).toBe(false);
		expect(console.log).toHaveBeenCalledWith('✅ Logged in, cadet key:', expectedCadetKey);
	});

	it('shows profile-not-found error when auth succeeds but cadet profile is missing', async () => {
		const { result } = renderHook(() => useLoginLogic());
		const email = 'cadet.one@memphis.edu';
		const cadetKey = 'cadet_one_memphis_edu';

		getResponses[`cadets/${cadetKey}`] = { exists: false };

		await act(async () => {
			result.current.setEmail(email);
			result.current.setPassword('pw12345');
		});

		await act(async () => {
			await result.current.handleLogin();
		});

		expect(result.current.error).toBe('No cadet profile found for this account.');
		expect(AsyncStorage.setItem).not.toHaveBeenCalled();
		expect(mockReplace).not.toHaveBeenCalled();
		expect(result.current.loading).toBe(false);
	});

	it('maps wrong-password family auth errors to incorrect-credentials message', async () => {
		const { result } = renderHook(() => useLoginLogic());
		const errorCodes = [
			'auth/wrong-password',
			'auth/user-not-found',
			'auth/invalid-credential',
		];

		for (const code of errorCodes) {
			(firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
				code,
				message: `error for ${code}`,
			});

			await act(async () => {
				result.current.setEmail('test@memphis.edu');
				result.current.setPassword('abc12345');
			});

			await act(async () => {
				await result.current.handleLogin();
			});

			expect(result.current.error).toBe('Incorrect email or password.');
			expect(result.current.loading).toBe(false);
		}

		expect(console.error).toHaveBeenCalled();
	});

	it('maps too-many-requests auth error to throttle message', async () => {
		const { result } = renderHook(() => useLoginLogic());

		(firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
			code: 'auth/too-many-requests',
			message: 'Too many attempts',
		});

		await act(async () => {
			result.current.setEmail('test@memphis.edu');
			result.current.setPassword('abc12345');
		});

		await act(async () => {
			await result.current.handleLogin();
		});

		expect(result.current.error).toBe('Too many failed attempts. Try again later.');
		expect(result.current.loading).toBe(false);
	});

	it('maps invalid-email auth error to validation message', async () => {
		const { result } = renderHook(() => useLoginLogic());

		(firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
			code: 'auth/invalid-email',
			message: 'Invalid email',
		});

		await act(async () => {
			result.current.setEmail('bad-email-format');
			result.current.setPassword('abc12345');
		});

		await act(async () => {
			await result.current.handleLogin();
		});

		expect(result.current.error).toBe('Please enter a valid email address.');
		expect(result.current.loading).toBe(false);
	});

	it('maps unknown auth errors to generic message', async () => {
		const { result } = renderHook(() => useLoginLogic());

		(firebaseAuth.signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce({
			code: 'auth/internal-error',
			message: 'Internal issue',
		});

		await act(async () => {
			result.current.setEmail('test@memphis.edu');
			result.current.setPassword('abc12345');
		});

		await act(async () => {
			await result.current.handleLogin();
		});

		await waitFor(() => {
			expect(result.current.error).toBe('Could not log in. Please try again.');
		});
		expect(result.current.loading).toBe(false);
	});
});

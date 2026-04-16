import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { Login } from '../../src/navigation/screens/LoginPage/Login';

const mockUseLoginLogic = jest.fn();

jest.mock('../../src/navigation/screens/LoginPage/LoginLogic', () => ({
	useLoginLogic: () => mockUseLoginLogic(),
}));

function buildLoginState(overrides: Partial<any> = {}) {
	return {
		email: '',
		setEmail: jest.fn(),
		password: '',
		setPassword: jest.fn(),
		error: '',
		setError: jest.fn(),
		loading: false,
		setLoading: jest.fn(),
		handleLogin: jest.fn(),
		navigation: { navigate: jest.fn(), replace: jest.fn() },
		...overrides,
	};
}

describe('Login UI', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders all static elements with empty fields, no error, and not loading', () => {
		mockUseLoginLogic.mockReturnValue(buildLoginState());

		const { getByText, getByPlaceholderText, queryByText } = render(<Login />);

		expect(getByText('Cadet')).toBeTruthy();
		expect(getByText('Links')).toBeTruthy();
		expect(getByText('AFROTC Cadet Portal')).toBeTruthy();
		expect(getByText('Email')).toBeTruthy();
		expect(getByText('Password')).toBeTruthy();
		expect(getByPlaceholderText(' Cadet Email')).toBeTruthy();
		expect(getByPlaceholderText(' ••••••••')).toBeTruthy();
		expect(getByText('Log in')).toBeTruthy();
		expect(getByText('Forgot password?')).toBeTruthy();

		expect(queryByText('Logging in…')).toBeNull();
	});

	it('renders filled email and password inputs covering non-empty style branches', () => {
		mockUseLoginLogic.mockReturnValue(
			buildLoginState({
				email: 'jane.doe@memphis.edu',
				password: 'secret123',
			})
		);

		const { getByDisplayValue } = render(<Login />);

		expect(getByDisplayValue('jane.doe@memphis.edu')).toBeTruthy();
		expect(getByDisplayValue('secret123')).toBeTruthy();
	});

	it('fires setEmail and setPassword callbacks when text is changed', () => {
		const state = buildLoginState();
		mockUseLoginLogic.mockReturnValue(state);

		const { getByPlaceholderText } = render(<Login />);

		fireEvent.changeText(getByPlaceholderText(' Cadet Email'), 'cadet@memphis.edu');
		expect(state.setEmail).toHaveBeenCalledWith('cadet@memphis.edu');

		fireEvent.changeText(getByPlaceholderText(' ••••••••'), 'mypassword');
		expect(state.setPassword).toHaveBeenCalledWith('mypassword');
	});

	it('displays error message when error is non-empty', () => {
		mockUseLoginLogic.mockReturnValue(
			buildLoginState({
				error: 'Incorrect email or password.',
			})
		);

		const { getByText } = render(<Login />);
		expect(getByText('Incorrect email or password.')).toBeTruthy();
	});

	it('displays loading spinner and hides Log in text while loading', () => {
		mockUseLoginLogic.mockReturnValue(
			buildLoginState({
				loading: true,
			})
		);

		const { getByText, queryByText } = render(<Login />);

		expect(getByText('Logging in…')).toBeTruthy();
		expect(queryByText('Log in')).toBeNull();
	});

	it('calls handleLogin when Log in button is pressed', () => {
		const state = buildLoginState();
		mockUseLoginLogic.mockReturnValue(state);

		const { getByText } = render(<Login />);

		fireEvent.press(getByText('Log in'));
		expect(state.handleLogin).toHaveBeenCalledTimes(1);
	});

	it('navigates to ChangePassword when Forgot password? is pressed', () => {
		const state = buildLoginState();
		mockUseLoginLogic.mockReturnValue(state);

		const { getByText } = render(<Login />);

		fireEvent.press(getByText('Forgot password?'));
		expect(state.navigation.navigate).toHaveBeenCalledWith('ChangePassword');
	});

	it('covers iOS Platform branch for KeyboardAvoidingView behavior', () => {
		const originalOS = Platform.OS;
		Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'ios' });

		try {
			mockUseLoginLogic.mockReturnValue(buildLoginState());
			const { getByText } = render(<Login />);
			expect(getByText('Log in')).toBeTruthy();
		} finally {
			Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
		}
	});

	it('covers non-iOS Platform branch for KeyboardAvoidingView behavior', () => {
		const originalOS = Platform.OS;
		Object.defineProperty(Platform, 'OS', { configurable: true, get: () => 'android' });

		try {
			mockUseLoginLogic.mockReturnValue(buildLoginState());
			const { getByText } = render(<Login />);
			expect(getByText('Log in')).toBeTruthy();
		} finally {
			Object.defineProperty(Platform, 'OS', { configurable: true, get: () => originalOS });
		}
	});
});

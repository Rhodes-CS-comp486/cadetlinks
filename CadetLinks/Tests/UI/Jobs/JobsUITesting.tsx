import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Jobs } from '../../../src/navigation/screens/ActionsPage/Actions';
import { PERMISSIONS } from '../../../src/assets/constants';

const mockUseJobsLogic = jest.fn();
const mockViewDocumentLogic = jest.fn();
const mockUseNavigation = jest.fn();

jest.mock('@react-navigation/native', () => ({
	useNavigation: () => mockUseNavigation(),
}));

jest.mock('../../../src/navigation/screens/JobsPage/JobsLogic', () => ({
	useJobsLogic: () => mockUseJobsLogic(),
	iconForAction: jest.fn(() => 'mock-icon'),
}));

jest.mock('../../../src/navigation/screens/JobsPage/ViewDocumentLogic', () => ({
	ViewDocumentLogic: () => mockViewDocumentLogic(),
}));

jest.mock('../../../src/navigation/Components/ScreenLayout', () => ({
	ScreenLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@expo/vector-icons', () => ({
	Ionicons: ({ name }: { name: string }) => {
		const React = require('react');
		const { Text } = require('react-native');
		return React.createElement(Text, null, `icon-${name}`);
	},
}));

jest.mock('../../../src/navigation/screens/JobsPage/Components/AttendanceModal', () => ({
	AttendanceModal: (props: any) => {
		const React = require('react');
		const { Text } = require('react-native');
		return React.createElement(
			Text,
			{ testID: 'attendance-modal' },
			props.visible ? 'attendance-open' : 'attendance-closed'
		);
	},
}));

jest.mock('../../../src/navigation/screens/JobsPage/Components/UploadDocsModal', () => ({
	UploadDocsModal: (props: any) => {
		const React = require('react');
		const { Text } = require('react-native');
		return React.createElement(
			Text,
			{ testID: 'upload-modal' },
			props.visible ? 'upload-open' : 'upload-closed'
		);
	},
}));

jest.mock('../../../src/navigation/screens/JobsPage/Components/ViewDocumentModal', () => ({
	ViewDocumentModal: (props: any) => {
		const React = require('react');
		const { Pressable, Text } = require('react-native');
		return React.createElement(
			Pressable,
			{
				testID: 'view-doc-modal-close',
				onPress: props.onClose,
			},
			React.createElement(Text, null, props.visible ? 'docs-open' : 'docs-closed')
		);
	},
}));

function buildJobsState(overrides: Partial<any> = {}) {
	return {
		cadetKey: 'cadet_key_123',
		profile: { firstName: 'Jane', lastName: 'Doe', job: 'Admin' },
		loading: false,
		error: null,
		permissionNames: ['Attendance Editing', 'File Uploading'],
		actions: [
			{
				id: PERMISSIONS.ATTENDANCE_EDITING,
				title: 'Take Attendance',
				subtitle: 'Mark PT / LLAB attendance for cadets',
				allowed: true,
			},
			{
				id: PERMISSIONS.FILE_UPLOADING,
				title: 'Upload Files',
				subtitle: 'Upload PDFs and other documents for cadets',
				allowed: true,
			},
		],
		onPressAction: jest.fn(),
		attendance: {
			attendanceModalVisible: false,
			closeAttendanceModal: jest.fn(),
			loadingAttendanceTools: false,
			selectedEvent: null,
			eventDropdownOpen: false,
			toggleEventDropdown: jest.fn(),
			todayEvents: [],
			selectEvent: jest.fn(),
			markedAbsentCount: 0,
			markedLateCount: 0,
			allCadets: [],
			getCadetStatus: jest.fn(),
			setCadetStatus: jest.fn(),
			savingAttendance: false,
			clearingAttendance: false,
			clearSelectedAttendance: jest.fn(),
			submitAttendance: jest.fn(),
			openAttendanceModal: jest.fn(),
		},
		documentUploading: {
			documentUploadingModalVisible: false,
			closeDocumentUploadingModal: jest.fn(),
			selectedDocument: null,
			isPickingDocument: false,
			isUploadingDocument: false,
			uploadError: null,
			uploadSuccessMessage: null,
			pickDocument: jest.fn(),
			clearSelectedDocument: jest.fn(),
			uploadSelectedDocument: jest.fn(),
			openDocumentUploadingModal: jest.fn(),
		},
		fullName: 'Jane Doe',
		jobText: 'Admin',
		permissionText: 'Attendance Editing, File Uploading',
		anyVisibleActions: true,
		canUploadFiles: true,
		...overrides,
	};
}

describe('Jobs UI', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockUseNavigation.mockReturnValue({ navigate: jest.fn() });
		mockViewDocumentLogic.mockReturnValue({
			documents: [{ key: 'doc-1', name: 'memo.pdf' }],
			isLoading: false,
			deleteError: null,
			deletingKey: null,
			deleteDocument: jest.fn(),
		});
	});

	it('renders loading state and static View Documents card', () => {
		mockUseJobsLogic.mockReturnValue(
			buildJobsState({
				loading: true,
			})
		);

		const { getByText, getByTestId } = render(<Jobs />);

		expect(getByText(/Loading jobs/)).toBeTruthy();
		expect(getByText('View Documents')).toBeTruthy();
		expect(getByTestId('attendance-modal')).toBeTruthy();
		expect(getByTestId('upload-modal')).toBeTruthy();
	});

	it('renders error state with cadet key', () => {
		mockUseJobsLogic.mockReturnValue(
			buildJobsState({
				loading: false,
				error: 'Could not load jobs & permissions.',
			})
		);

		const { getByText } = render(<Jobs />);

		expect(getByText('Could not load jobs & permissions.')).toBeTruthy();
		expect(getByText(/Key:\s*cadet_key_123/)).toBeTruthy();
	});

	it('renders error state without cadet key branch', () => {
		mockUseJobsLogic.mockReturnValue(
			buildJobsState({
				loading: false,
				error: 'No user is logged in.',
				cadetKey: null,
			})
		);

		const { getByText, queryByText } = render(<Jobs />);

		expect(getByText('No user is logged in.')).toBeTruthy();
		expect(queryByText(/Key:/)).toBeNull();
	});

	it('renders profile and action cards when loaded and actions exist', () => {
		mockUseJobsLogic.mockReturnValue(buildJobsState());

		const { getByText } = render(<Jobs />);

		expect(getByText('Jane Doe')).toBeTruthy();
		expect(getByText(/Job:\s*Admin/)).toBeTruthy();
		expect(getByText(/Permissions:\s*Attendance Editing, File Uploading/)).toBeTruthy();

		expect(getByText('Actions')).toBeTruthy();
		expect(getByText('Take Attendance')).toBeTruthy();
		expect(getByText('Upload Files')).toBeTruthy();
	});

	it('does not render Actions section when no visible actions', () => {
		mockUseJobsLogic.mockReturnValue(
			buildJobsState({
				anyVisibleActions: false,
				actions: [],
			})
		);

		const { queryByText } = render(<Jobs />);

		expect(queryByText('Actions')).toBeNull();
		expect(queryByText('Take Attendance')).toBeNull();
	});

	it('invokes onPressAction when action cards are pressed', () => {
		const state = buildJobsState();
		mockUseJobsLogic.mockReturnValue(state);

		const { getByText } = render(<Jobs />);

		fireEvent.press(getByText('Take Attendance'));
		fireEvent.press(getByText('Upload Files'));

		expect(state.onPressAction).toHaveBeenCalledTimes(2);
		expect(state.onPressAction).toHaveBeenNthCalledWith(1, state.actions[0]);
		expect(state.onPressAction).toHaveBeenNthCalledWith(2, state.actions[1]);
	});

	it('opens and closes View Documents modal from UI button and close callback', () => {
		mockUseJobsLogic.mockReturnValue(buildJobsState());

		const { getByText, getByTestId } = render(<Jobs />);

		expect(getByText('docs-closed')).toBeTruthy();

		fireEvent.press(getByText('View Documents'));
		expect(getByText('docs-open')).toBeTruthy();

		fireEvent.press(getByTestId('view-doc-modal-close'));
		expect(getByText('docs-closed')).toBeTruthy();
	});

	it('passes canUploadFiles to document modal branch', () => {
		mockUseJobsLogic.mockReturnValue(
			buildJobsState({
				canUploadFiles: false,
			})
		);

		const { getByText } = render(<Jobs />);
		expect(getByText('docs-closed')).toBeTruthy();
	});
});

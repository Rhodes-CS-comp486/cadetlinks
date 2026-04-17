import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebaseDatabase from 'firebase/database';
import { useNavigation } from '@react-navigation/core';
import { PERMISSIONS } from '../../src/assets/constants';
import { iconForAction, useJobsLogic } from '../../src/navigation/screens/JobsPage/ActionsLogic';
import { useHomeLogic } from '../../src/navigation/screens/HomePage/HomeLogic';
import { useAttendanceLogic } from '../../src/navigation/screens/ActionsPage/AttendanceLogic';
import { useDocumentUploadingLogic } from '../../src/navigation/screens/ActionsPage/UploadDocsLogic';

type Snapshot = {
	val: () => unknown;
	exists: () => boolean;
};

const getResponses: Record<string, { exists: boolean; value?: unknown }> = {};

const STEVENSON_KEY = 'stecj_26_rhodes_edu';
const GRAY_KEY = 'grasv_26_rhodes_edu';
const WHITFIELD_KEY = 'rjwhtfld_memphis_edu';

const mockNavigate = jest.fn();
const mockOpenAttendanceModal = jest.fn();
const mockOpenDocumentUploadingModal = jest.fn(async () => {});

jest.mock('../../src/firebase/config', () => ({
	db: { mockedDb: true },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn(),
}));

jest.mock('firebase/database', () => ({
	ref: jest.fn((_db: unknown, path: string) => ({ path })),
	get: jest.fn((refObj: { path: string }) => {
		const response = getResponses[refObj.path] || { exists: false, value: undefined };
		return Promise.resolve({
			val: () => response.value,
			exists: () => response.exists,
		} as Snapshot);
	}),
}));

jest.mock('@react-navigation/core', () => ({
	useNavigation: jest.fn(),
}));

jest.mock('../../src/navigation/screens/HomePage/HomeLogic', () => ({
	useHomeLogic: jest.fn(),
}));

jest.mock('../../src/navigation/screens/JobsPage/AttendanceLogic', () => ({
	useAttendanceLogic: jest.fn(),
}));

jest.mock('../../src/navigation/screens/JobsPage/UploadDocsLogic', () => ({
	useDocumentUploadingLogic: jest.fn(),
}));

describe('useJobsLogic', () => {
	beforeEach(() => {
		Object.keys(getResponses).forEach((k) => delete getResponses[k]);
		jest.clearAllMocks();

		(useNavigation as jest.Mock).mockReturnValue({
			navigate: mockNavigate,
		});

		(useAttendanceLogic as jest.Mock).mockReturnValue({
			attendanceModalVisible: false,
			openAttendanceModal: mockOpenAttendanceModal,
		});

		(useDocumentUploadingLogic as jest.Mock).mockReturnValue({
			openDocumentUploadingModal: mockOpenDocumentUploadingModal,
		});
	});

	it('Stevenson job view matches Upload Documents only permission', async () => {
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(STEVENSON_KEY);
		(useHomeLogic as jest.Mock).mockReturnValue({
			cadetPermissionsMap: new Map<string, boolean>([
				[PERMISSIONS.EVENT_MAKING, false],
				[PERMISSIONS.FILE_UPLOADING, true],
				[PERMISSIONS.ATTENDANCE_EDITING, false],
			]),
		});

		getResponses[`cadets/${STEVENSON_KEY}`] = {
			exists: true,
			value: {
				firstName: 'Camren',
				lastName: 'Stevenson',
				cadetRank: 'C/Maj',
				classYear: 400,
				flight: 'POC',
				job: 'A1 Director',
			},
		};

		const { result } = renderHook(() => useJobsLogic());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
			expect(result.current.profile?.job).toBe('A1 Director');
		});

		expect(result.current.fullName).toBe('Camren Stevenson');
		expect(result.current.jobText).toBe('A1 Director');
		expect(result.current.canUploadFiles).toBe(true);
		expect(result.current.canTakeAttendance).toBe(false);
		expect(result.current.canMakeEvents).toBe(false);
		expect(result.current.isAll).toBe(false);
		expect(result.current.permissionText).toBe(PERMISSIONS.FILE_UPLOADING);
		expect(result.current.actions.map((a) => a.id)).toEqual([PERMISSIONS.FILE_UPLOADING]);

		await act(async () => {
			await result.current.onPressAction(result.current.actions[0]);
		});
		expect(mockOpenDocumentUploadingModal).toHaveBeenCalledTimes(1);
	});

	it('Gray job view matches event/upload/attendance permissions and includes Create Accounts', async () => {
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(GRAY_KEY);
		(useHomeLogic as jest.Mock).mockReturnValue({
			cadetPermissionsMap: new Map<string, boolean>([
				[PERMISSIONS.EVENT_MAKING, true],
				[PERMISSIONS.FILE_UPLOADING, true],
				[PERMISSIONS.ATTENDANCE_EDITING, true],
			]),
		});

		getResponses[`cadets/${GRAY_KEY}`] = {
			exists: true,
			value: {
				firstName: 'Sadie',
				lastName: 'Gray',
				cadetRank: 'C/Lt Col',
				classYear: 400,
				flight: 'POC',
				job: 'Cadet Vice Wing Commander',
			},
		};

		const { result } = renderHook(() => useJobsLogic());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.fullName).toBe('Sadie Gray');
		expect(result.current.jobText).toBe('Cadet Vice Wing Commander');
		expect(result.current.canUploadFiles).toBe(true);
		expect(result.current.canTakeAttendance).toBe(true);
		expect(result.current.canMakeEvents).toBe(true);
		expect(result.current.isAll).toBe(true);
		expect(result.current.anyVisibleActions).toBe(true);
		expect(result.current.actions.map((a) => a.id)).toEqual([
			PERMISSIONS.ATTENDANCE_EDITING,
			PERMISSIONS.FILE_UPLOADING,
			PERMISSIONS.EVENT_MAKING,
			PERMISSIONS.ADMIN,
		]);

		const attendanceAction = result.current.actions.find(
			(a) => a.id === PERMISSIONS.ATTENDANCE_EDITING
		);
		expect(attendanceAction).toBeDefined();

		act(() => {
			void result.current.onPressAction(attendanceAction!);
		});
		expect(mockOpenAttendanceModal).toHaveBeenCalledTimes(1);

		const eventAction = result.current.actions.find((a) => a.id === PERMISSIONS.EVENT_MAKING);
		expect(eventAction?.routeHint).toBe('Events');

		await act(async () => {
			await result.current.onPressAction(eventAction!);
		});
		expect(mockNavigate).toHaveBeenCalledWith('Events');
	});

	it('Whitfield job view shows no granted permissions and no actions', async () => {
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(WHITFIELD_KEY);
		(useHomeLogic as jest.Mock).mockReturnValue({
			cadetPermissionsMap: new Map<string, boolean>([
				[PERMISSIONS.EVENT_MAKING, false],
				[PERMISSIONS.FILE_UPLOADING, false],
				[PERMISSIONS.ATTENDANCE_EDITING, false],
			]),
		});

		getResponses[`cadets/${WHITFIELD_KEY}`] = {
			exists: true,
			value: {
				firstName: 'Ryan',
				lastName: 'Whitfield',
				cadetRank: 'C/4C',
				classYear: 150,
				flight: 'Alpha',
				job: 'N/A',
			},
		};

		const { result } = renderHook(() => useJobsLogic());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.fullName).toBe('Ryan Whitfield');
		expect(result.current.jobText).toBe('N/A');
		expect(result.current.permissionText).toBe('None');
		expect(result.current.canUploadFiles).toBe(false);
		expect(result.current.canTakeAttendance).toBe(false);
		expect(result.current.canMakeEvents).toBe(false);
		expect(result.current.isAll).toBe(false);
		expect(result.current.anyVisibleActions).toBe(false);
		expect(result.current.actions).toHaveLength(0);
	});

	it('handles error when no user is logged in', async () => {
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
		(useHomeLogic as jest.Mock).mockReturnValue({
			cadetPermissionsMap: new Map<string, boolean>([
				[PERMISSIONS.EVENT_MAKING, false],
				[PERMISSIONS.FILE_UPLOADING, false],
				[PERMISSIONS.ATTENDANCE_EDITING, false],
			]),
		});

		const { result } = renderHook(() => useJobsLogic());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.profile).toBeNull();
		expect(result.current.error).toBe('No user is logged in.');
		expect(result.current.permissionText).toBe('None');
		expect(result.current.actions).toHaveLength(0);
	});

	it('handles error when profile does not exist in database', async () => {
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(STEVENSON_KEY);
		(useHomeLogic as jest.Mock).mockReturnValue({
			cadetPermissionsMap: new Map<string, boolean>([
				[PERMISSIONS.EVENT_MAKING, false],
				[PERMISSIONS.FILE_UPLOADING, true],
				[PERMISSIONS.ATTENDANCE_EDITING, false],
			]),
		});

		getResponses[`cadets/${STEVENSON_KEY}`] = {
			exists: false,
		};

		const { result } = renderHook(() => useJobsLogic());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.profile).toBeNull();
		expect(result.current.error).toBe('No profile found for this user.');
		expect(result.current.fullName).toBe('Cadet');
		expect(result.current.jobText).toBe('—');
		// Actions are still populated based on permissions even if profile load failed
		expect(result.current.actions.map((a) => a.id)).toEqual([PERMISSIONS.FILE_UPLOADING]);
	});

	it('handles error when database read fails', async () => {
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue(GRAY_KEY);
		(useHomeLogic as jest.Mock).mockReturnValue({
			cadetPermissionsMap: new Map<string, boolean>([
				[PERMISSIONS.EVENT_MAKING, true],
				[PERMISSIONS.FILE_UPLOADING, true],
				[PERMISSIONS.ATTENDANCE_EDITING, true],
			]),
		});

		jest.mocked(firebaseDatabase.get).mockRejectedValueOnce(new Error('Firebase connection failed'));

		const { result } = renderHook(() => useJobsLogic());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.profile).toBeNull();
		expect(result.current.error).toBe('Could not load jobs & permissions.');
		// Actions are still populated based on permissions even if profile load failed
		expect(result.current.actions.map((a) => a.id)).toEqual([
			PERMISSIONS.ATTENDANCE_EDITING,
			PERMISSIONS.FILE_UPLOADING,
			PERMISSIONS.EVENT_MAKING,
			PERMISSIONS.ADMIN,
		]);
	});
});

describe('iconForAction', () => {
	it('maps action ids to expected icon names', () => {
		expect(iconForAction(PERMISSIONS.ATTENDANCE_EDITING)).toBe('checkbox-outline');
		expect(iconForAction(PERMISSIONS.FILE_UPLOADING)).toBe('cloud-upload-outline');
		expect(iconForAction(PERMISSIONS.ADMIN)).toBe('person-add-outline');
		expect(iconForAction(PERMISSIONS.EVENT_MAKING)).toBe('calendar-outline');
	});
});

import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as firebaseDatabase from 'firebase/database';
import * as firebaseStorage from 'firebase/storage';
import { useDocumentUploadingLogic } from '../../src/navigation/screens/ActionsPage/UploadDocsLogic';

type PickerAsset = {
	name?: string;
	uri: string;
	mimeType?: string;
	size?: number;
	file?: unknown;
};

jest.mock('../../src/firebase/config', () => ({
	db: { mockedDb: true },
	storage: { mockedStorage: true },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
	getItem: jest.fn(),
}));

jest.mock('expo-document-picker', () => ({
	getDocumentAsync: jest.fn(),
}));

jest.mock('firebase/database', () => ({
	ref: jest.fn((_db: unknown, path: string) => ({ path })),
	push: jest.fn(() => ({ key: 'generated-upload-key' })),
	set: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/storage', () => ({
	ref: jest.fn((_storage: unknown, path: string) => ({ path })),
	uploadBytes: jest.fn(() => Promise.resolve()),
	getDownloadURL: jest.fn(() => Promise.resolve('https://download.test/file.pdf')),
}));

describe('useDocumentUploadingLogic - unit', () => {
	const setPlatform = (os: 'ios' | 'android' | 'web') => {
		(Platform as any).OS = os;
	};

	const mockPickResult = (asset?: PickerAsset, canceled = false) => {
		(DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
			canceled,
			assets: asset ? [asset] : undefined,
		});
	};

	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, 'error').mockImplementation(jest.fn());
		jest.spyOn(Date, 'now').mockReturnValue(1713085200000);
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2026-04-14T09:00:00.000Z'));
		setPlatform('ios');
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue('stecj_26_rhodes_edu');
		(global as any).fetch = jest.fn();
	});

	afterEach(() => {
		jest.useRealTimers();
		(console.error as jest.Mock).mockRestore?.();
		(Date.now as jest.Mock).mockRestore?.();
	});

	it('opens and closes modal while resetting temporary messages', async () => {
		const { result } = renderHook(() => useDocumentUploadingLogic());

		await act(async () => {
			await result.current.uploadSelectedDocument();
		});

		expect(result.current.uploadError).toBe('Please choose a document first.');

		act(() => {
			result.current.openDocumentUploadingModal();
		});

		expect(result.current.documentUploadingModalVisible).toBe(true);
		expect(result.current.uploadError).toBeNull();
		expect(result.current.uploadSuccessMessage).toBeNull();

		act(() => {
			result.current.closeDocumentUploadingModal();
		});

		expect(result.current.documentUploadingModalVisible).toBe(false);
		expect(result.current.uploadError).toBeNull();
		expect(result.current.uploadSuccessMessage).toBeNull();
	});

	it('pickDocument handles canceled selection', async () => {
		const { result } = renderHook(() => useDocumentUploadingLogic());
		mockPickResult(undefined, true);

		await act(async () => {
			await result.current.pickDocument();
		});

		expect(result.current.selectedDocument).toBeNull();
		expect(result.current.uploadError).toBeNull();
		expect(result.current.isPickingDocument).toBe(false);
	});

	it('pickDocument handles missing selected asset', async () => {
		const { result } = renderHook(() => useDocumentUploadingLogic());
		mockPickResult(undefined, false);

		await act(async () => {
			await result.current.pickDocument();
		});

		expect(result.current.uploadError).toBe('No file was selected.');
		expect(result.current.selectedDocument).toBeNull();
		expect(result.current.isPickingDocument).toBe(false);
	});

	it('pickDocument rejects unsupported MIME type', async () => {
		const { result } = renderHook(() => useDocumentUploadingLogic());
		mockPickResult({
			name: 'image.png',
			uri: 'file:///tmp/image.png',
			mimeType: 'image/png',
			size: 1000,
		});

		await act(async () => {
			await result.current.pickDocument();
		});

		expect(result.current.uploadError).toBe('Only PDF and DOCX files are allowed.');
		expect(result.current.selectedDocument).toBeNull();
	});

	it('pickDocument rejects files larger than 5MB', async () => {
		const { result } = renderHook(() => useDocumentUploadingLogic());
		mockPickResult({
			name: 'oversized.pdf',
			uri: 'file:///tmp/oversized.pdf',
			mimeType: 'application/pdf',
			size: 6 * 1024 * 1024,
		});

		await act(async () => {
			await result.current.pickDocument();
		});

		expect(result.current.uploadError).toBe('File is too large. Please select a file under 5 MB.');
		expect(result.current.selectedDocument).toBeNull();
	});

	it('pickDocument handles picker exceptions', async () => {
		const { result } = renderHook(() => useDocumentUploadingLogic());
		(DocumentPicker.getDocumentAsync as jest.Mock).mockRejectedValueOnce(new Error('picker failed'));

		await act(async () => {
			await result.current.pickDocument();
		});

		expect(result.current.uploadError).toBe('Could not open local files. Please try again.');
		expect(result.current.isPickingDocument).toBe(false);
		expect(console.error).toHaveBeenCalled();
	});

	it('clearSelectedDocument resets selected file data', async () => {
		const { result } = renderHook(() => useDocumentUploadingLogic());
		mockPickResult({
			name: 'briefing.pdf',
			uri: 'file:///tmp/briefing.pdf',
			mimeType: 'application/pdf',
			size: 1000,
		});

		await act(async () => {
			await result.current.pickDocument();
		});

		expect(result.current.selectedDocument?.name).toBe('briefing.pdf');

		act(() => {
			result.current.clearSelectedDocument();
		});

		expect(result.current.selectedDocument).toBeNull();
	});

	it('pickDocument applies default document name and size when missing in picker asset', async () => {
		const { result } = renderHook(() => useDocumentUploadingLogic());
		mockPickResult({
			uri: 'file:///tmp/unnamed.pdf',
			mimeType: 'application/pdf',
		});

		await act(async () => {
			await result.current.pickDocument();
		});

		expect(result.current.selectedDocument).toEqual({
			name: 'document',
			uri: 'file:///tmp/unnamed.pdf',
			mimeType: 'application/pdf',
			size: 0,
			file: undefined,
		});
	});

    
	it('pickDocument can hit mime fallback path when mimeType is absent', async () => {
		const { result } = renderHook(() => useDocumentUploadingLogic());
		const originalIncludes = Array.prototype.includes;
		const includesSpy = jest.spyOn(Array.prototype, 'includes').mockImplementation(function (
			this: unknown[],
			searchElement: unknown,
			...args: unknown[]
		) {
			const maybeAllowedMimeArray =
				this.length === 2 &&
				this[0] === 'application/pdf' &&
				this[1] ===
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

			if (maybeAllowedMimeArray && searchElement === '') {
				return true;
			}

			return (originalIncludes as any).call(this, searchElement, ...args);
		});

		mockPickResult({
			name: 'mystery',
			uri: 'file:///tmp/mystery',
			size: 10,
		});

		await act(async () => {
			await result.current.pickDocument();
		});

		includesSpy.mockRestore();

		expect(result.current.selectedDocument).toEqual({
			name: 'mystery',
			uri: 'file:///tmp/mystery',
			mimeType: 'application/octet-stream',
			size: 10,
			file: undefined,
		});
	});

	it('uploadSelectedDocument requires a document before upload', async () => {
		const { result } = renderHook(() => useDocumentUploadingLogic());

		await act(async () => {
			await result.current.uploadSelectedDocument();
		});

		expect(result.current.uploadError).toBe('Please choose a document first.');
		expect(result.current.isUploadingDocument).toBe(false);
	});

	it('uploadSelectedDocument requires a non-empty document name', async () => {
		const { result } = renderHook(() => useDocumentUploadingLogic());
		mockPickResult({
			name: '.pdf',
			uri: 'file:///tmp/.pdf',
			mimeType: 'application/pdf',
			size: 1000,
		});

		await act(async () => {
			await result.current.pickDocument();
		});

		await waitFor(() => {
			expect(result.current.selectedDocument).not.toBeNull();
		});

		await act(async () => {
			await result.current.uploadSelectedDocument();
		});

		expect(result.current.uploadError).toBe('Please enter a name for the document.');
		expect(result.current.isUploadingDocument).toBe(false);
	});

	it('uploadSelectedDocument handles upload failure and keeps modal state consistent', async () => {
		const { result } = renderHook(() => useDocumentUploadingLogic());
		(global as any).fetch = jest.fn().mockResolvedValue({
			blob: jest.fn().mockResolvedValue({ mockedBlob: true }),
		});

		mockPickResult({
			name: 'ops-brief.pdf',
			uri: 'file:///tmp/ops-brief.pdf',
			mimeType: 'application/pdf',
			size: 2048,
		});

		jest
			.mocked(firebaseStorage.uploadBytes)
			.mockRejectedValueOnce(new Error('storage failure'));

		await act(async () => {
			await result.current.pickDocument();
		});

		await waitFor(() => {
			expect(result.current.selectedDocument).not.toBeNull();
		});

		await act(async () => {
			await result.current.uploadSelectedDocument();
		});

		expect(result.current.uploadError).toBe('Upload failed. Please try again.');
		expect(result.current.uploadSuccessMessage).toBeNull();
		expect(result.current.isUploadingDocument).toBe(false);
		expect(console.error).toHaveBeenCalled();
	});
});

describe('useDocumentUploadingLogic - integration', () => {
	const setPlatform = (os: 'ios' | 'android' | 'web') => {
		(Platform as any).OS = os;
	};

	const mockPickResult = (asset: PickerAsset) => {
		(DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
			canceled: false,
			assets: [asset],
		});
	};

	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(Date, 'now').mockReturnValue(1713085200000);
		jest.useFakeTimers();
		jest.setSystemTime(new Date('2026-04-14T09:00:00.000Z'));
		(global as any).fetch = jest.fn();
		setPlatform('web');
		(AsyncStorage.getItem as jest.Mock).mockResolvedValue('stecj_26_rhodes_edu');
	});

	afterEach(() => {
		jest.useRealTimers();
		(Date.now as jest.Mock).mockRestore?.();
	});

	it('web upload uses browser File directly when picker provides file', async () => {
		const { result } = renderHook(() => useDocumentUploadingLogic());
		const mockFile = { browserFile: true };
		mockPickResult({
			name: 'policy.docx',
			uri: 'blob://policy.docx',
			mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			size: 4000,
			file: mockFile,
		});

		await act(async () => {
			await result.current.pickDocument();
		});

		await waitFor(() => {
			expect(result.current.selectedDocument).not.toBeNull();
		});

		await act(async () => {
			await result.current.uploadSelectedDocument();
		});

		expect(global.fetch).not.toHaveBeenCalled();
		expect(firebaseStorage.ref).toHaveBeenCalledWith(
			expect.any(Object),
			expect.stringMatching(/^uploadedDocuments\/\d+_policy\.docx$/)
		);
		expect(firebaseStorage.uploadBytes).toHaveBeenCalledWith(
			expect.objectContaining({ path: expect.stringMatching(/^uploadedDocuments\/\d+_policy\.docx$/) }),
			mockFile
		);
		expect(firebaseDatabase.ref).toHaveBeenCalledWith(expect.any(Object), 'uploadedDocuments');
		expect(firebaseDatabase.push).toHaveBeenCalledWith({ path: 'uploadedDocuments' });
		expect(firebaseDatabase.set).toHaveBeenCalledWith(
			{ key: 'generated-upload-key' },
			expect.objectContaining({
				uploadedBy: 'stecj_26_rhodes_edu',
				displayName: 'policy',
				fileName: 'policy.docx',
				storagePath: expect.stringMatching(/^uploadedDocuments\/\d+_policy\.docx$/),
			})
		);
		expect(result.current.uploadSuccessMessage).toBe('"policy" uploaded successfully.');
		expect(result.current.selectedDocument).toBeNull();
	});

	it('web upload falls back to fetch blob when file object is missing and supports unknown uploader', async () => {
		const { result } = renderHook(() => useDocumentUploadingLogic());
		const fetchedBlob = { fetchedBlob: true };
		(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
		(global as any).fetch = jest.fn().mockResolvedValue({
			blob: jest.fn().mockResolvedValue(fetchedBlob),
		});

		mockPickResult({
			name: 'readme',
			uri: 'blob://readme',
			mimeType: 'application/pdf',
			size: 1500,
		});

		await act(async () => {
			await result.current.pickDocument();
		});

		await waitFor(() => {
			expect(result.current.selectedDocument).not.toBeNull();
		});

		await act(async () => {
			await result.current.uploadSelectedDocument();
		});

		expect(global.fetch).toHaveBeenCalledWith('blob://readme');
		expect(firebaseStorage.ref).toHaveBeenCalledWith(
			expect.any(Object),
			expect.stringMatching(/^uploadedDocuments\/\d+_readme$/)
		);
		expect(firebaseStorage.uploadBytes).toHaveBeenCalledWith(
			expect.objectContaining({ path: expect.stringMatching(/^uploadedDocuments\/\d+_readme$/) }),
			fetchedBlob
		);
		expect(firebaseDatabase.set).toHaveBeenCalledWith(
			{ key: 'generated-upload-key' },
			expect.objectContaining({
				uploadedBy: 'unknown',
				displayName: 'readme',
				fileName: 'readme',
				storagePath: expect.stringMatching(/^uploadedDocuments\/\d+_readme$/),
			})
		);
	});

	it('native upload path fetches local URI before upload', async () => {
		const { result } = renderHook(() => useDocumentUploadingLogic());
		const nativeBlob = { nativeBlob: true };
		setPlatform('ios');
		(global as any).fetch = jest.fn().mockResolvedValue({
			blob: jest.fn().mockResolvedValue(nativeBlob),
		});

		mockPickResult({
			name: 'training.pdf',
			uri: 'file:///tmp/training.pdf',
			mimeType: 'application/pdf',
			size: 1024,
		});

		await act(async () => {
			await result.current.pickDocument();
		});

		await waitFor(() => {
			expect(result.current.selectedDocument).not.toBeNull();
		});

		await act(async () => {
			await result.current.uploadSelectedDocument();
		});

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith('file:///tmp/training.pdf');
		});
		expect(firebaseStorage.uploadBytes).toHaveBeenCalledWith(
			expect.objectContaining({ path: expect.stringMatching(/^uploadedDocuments\/\d+_training\.pdf$/) }),
			nativeBlob
		);
		expect(result.current.isUploadingDocument).toBe(false);
	});
});

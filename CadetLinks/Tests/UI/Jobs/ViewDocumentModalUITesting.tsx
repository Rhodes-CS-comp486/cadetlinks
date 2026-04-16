import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Linking, Modal, Platform } from 'react-native';
import { ViewDocumentModal } from '../../../src/navigation/screens/JobsPage/Components/ViewDocumentModal';

jest.mock('@expo/vector-icons', () => ({
	Ionicons: ({ name }: { name: string }) => {
		const React = require('react');
		const { Text } = require('react-native');
		return React.createElement(Text, null, `icon-${name}`);
	},
}));

jest.mock('react-native-webview', () => ({
	WebView: ({ source }: { source: { uri: string } }) => {
		const React = require('react');
		const { Text } = require('react-native');
		return React.createElement(Text, null, `webview:${source.uri}`);
	},
}));

function buildDocumentModalProps(overrides: Partial<any> = {}) {
	return {
		visible: true,
		onClose: jest.fn(),
		documents: [],
		isLoading: false,
		deleteError: null,
		deletingKey: null,
		onDelete: jest.fn(),
		canEditFiles: true,
		...overrides,
	};
}

const IMAGE_DOC = {
	dbKey: 'doc-image-1',
	displayName: 'flight_photo.png',
	mimeType: 'image/png',
	downloadURL: 'https://example.com/flight_photo.png',
	sizeBytes: 512,
	uploadedAt: '2026-04-14T00:00:00.000Z',
	storagePath: 'docs/flight_photo.png',
};

const PDF_DOC = {
	dbKey: 'doc-pdf-1',
	displayName: 'operations_brief.pdf',
	mimeType: 'application/pdf',
	downloadURL: 'https://example.com/operations_brief.pdf',
	sizeBytes: 2048,
	uploadedAt: '2026-04-14T00:00:00.000Z',
	storagePath: 'docs/operations_brief.pdf',
};

const GENERIC_DOC = {
	dbKey: 'doc-generic-1',
	displayName: 'attendance.csv',
	mimeType: 'text/csv',
	downloadURL: 'https://example.com/attendance.csv',
	sizeBytes: 5 * 1024 * 1024,
	uploadedAt: '2026-04-14T00:00:00.000Z',
	storagePath: 'docs/attendance.csv',
};

describe('ViewDocumentModal UI', () => {
	let openURLSpy: jest.SpyInstance;

	beforeEach(() => {
		jest.clearAllMocks();
		openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
	});

	afterEach(() => {
		openURLSpy.mockRestore();
	});

	it('renders loading state and closes from icon and modal request close', () => {
		const props = buildDocumentModalProps({ isLoading: true });
		const { getByText, UNSAFE_getByType } = render(<ViewDocumentModal {...props} />);

		expect(getByText('Uploaded Documents')).toBeTruthy();
		fireEvent.press(getByText('icon-close'));
		expect(props.onClose).toHaveBeenCalledTimes(1);

		const modal = UNSAFE_getByType(Modal);
		modal.props.onRequestClose();
		expect(props.onClose).toHaveBeenCalledTimes(2);
	});

	it('renders empty documents branch', () => {
		const props = buildDocumentModalProps({ documents: [] });
		const { getByText } = render(<ViewDocumentModal {...props} />);
		expect(getByText('No documents uploaded yet.')).toBeTruthy();
	});

	it('renders document rows with bytes/KB/MB formatting and date text', () => {
		const props = buildDocumentModalProps({
			documents: [IMAGE_DOC, PDF_DOC, GENERIC_DOC],
		});
		const { getByText, getAllByText } = render(<ViewDocumentModal {...props} />);

		expect(getByText('flight_photo.png')).toBeTruthy();
		expect(getByText('operations_brief.pdf')).toBeTruthy();
		expect(getByText('attendance.csv')).toBeTruthy();

		expect(getByText(new RegExp(`512 B`))).toBeTruthy();
		expect(getByText(new RegExp(`2.0 KB`))).toBeTruthy();
		expect(getByText(new RegExp(`5.00 MB`))).toBeTruthy();

		const dateText = new Date('2026-04-14T00:00:00.000Z').toLocaleDateString();
		expect(getAllByText(new RegExp(dateText))).toHaveLength(3);
	});

	it('supports row download action and delete action when file editing is allowed', () => {
		const props = buildDocumentModalProps({
			documents: [IMAGE_DOC],
			canEditFiles: true,
		});
		const { getAllByText } = render(<ViewDocumentModal {...props} />);

		const downloadIcons = getAllByText('icon-download-outline');
		fireEvent.press(downloadIcons[0]);
		expect(openURLSpy).toHaveBeenCalledWith(IMAGE_DOC.downloadURL);

		const deleteIcons = getAllByText('icon-trash-outline');
		fireEvent.press(deleteIcons[0]);
		expect(props.onDelete).toHaveBeenCalledWith(IMAGE_DOC.dbKey, IMAGE_DOC.storagePath);
	});

	it('hides delete controls when file editing is not allowed', () => {
		const props = buildDocumentModalProps({
			documents: [IMAGE_DOC],
			canEditFiles: false,
		});
		const { queryByText } = render(<ViewDocumentModal {...props} />);
		expect(queryByText('icon-trash-outline')).toBeNull();
	});

	it('shows delete spinner branch while a document is being deleted', () => {
		const props = buildDocumentModalProps({
			documents: [IMAGE_DOC],
			deletingKey: IMAGE_DOC.dbKey,
			canEditFiles: true,
		});
		const { queryByText } = render(<ViewDocumentModal {...props} />);
		expect(queryByText('icon-trash-outline')).toBeNull();
	});

	it('renders delete error when provided', () => {
		const props = buildDocumentModalProps({
			documents: [IMAGE_DOC],
			deleteError: 'Delete failed.',
		});
		const { getByText } = render(<ViewDocumentModal {...props} />);
		expect(getByText('Delete failed.')).toBeTruthy();
	});

	it('opens and closes image preview on mobile and supports preview download', () => {
		const props = buildDocumentModalProps({
			documents: [IMAGE_DOC],
		});
		const { getByText, getAllByText } = render(<ViewDocumentModal {...props} />);

		fireEvent.press(getByText('icon-eye-outline'));
		expect(getAllByText('Download')).toHaveLength(1);

		fireEvent.press(getByText('Download'));
		expect(openURLSpy).toHaveBeenCalledWith(IMAGE_DOC.downloadURL);

		const closeIcons = getAllByText('icon-close');
		fireEvent.press(closeIcons[closeIcons.length - 1]);
	});

	it('opens PDF preview on mobile and renders the webview branch', () => {
		const props = buildDocumentModalProps({ documents: [PDF_DOC] });
		const { getByText } = render(<ViewDocumentModal {...props} />);

		fireEvent.press(getByText('icon-eye-outline'));

		const encodedURL = encodeURIComponent(PDF_DOC.downloadURL);
		expect(getByText(`webview:https://docs.google.com/gview?embedded=true&url=${encodedURL}`)).toBeTruthy();
	});

	it('opens web preview branch when running with web platform', () => {
		const originalOS = Platform.OS;
		Object.defineProperty(Platform, 'OS', {
			configurable: true,
			get: () => 'web',
		});

		try {
			const props = buildDocumentModalProps({ documents: [IMAGE_DOC] });
			const { getByText, getAllByText } = render(<ViewDocumentModal {...props} />);

			fireEvent.press(getByText('icon-eye-outline'));
			expect(getAllByText('Download').length).toBeGreaterThan(0);

			fireEvent.press(getAllByText('Download')[0]);
			expect(openURLSpy).toHaveBeenCalledWith(IMAGE_DOC.downloadURL);
		} finally {
			Object.defineProperty(Platform, 'OS', {
				configurable: true,
				get: () => originalOS,
			});
		}
	});
});

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Modal } from 'react-native';
import { UploadDocsModal } from '../../../src/navigation/screens/ActionsPage/Components/UploadDocsModal';

jest.mock('@expo/vector-icons', () => ({
	Ionicons: ({ name }: { name: string }) => {
		const React = require('react');
		const { Text } = require('react-native');
		return React.createElement(Text, null, `icon-${name}`);
	},
}));

function buildUploadModalProps(overrides: Partial<any> = {}) {
	return {
		visible: true,
		onClose: jest.fn(),
		selectedDocument: null,
		isPickingDocument: false,
		isUploadingDocument: false,
		uploadError: null,
		uploadSuccessMessage: null,
		onPickDocument: jest.fn(async () => {}),
		onClearDocument: jest.fn(),
		onUploadDocument: jest.fn(async () => {}),
		...overrides,
	};
}

describe('UploadDocsModal UI', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders base layout and closes from icon and modal request close', () => {
		const props = buildUploadModalProps();
		const { getByText, UNSAFE_getByType } = render(<UploadDocsModal {...props} />);

		expect(getByText('Upload Documents')).toBeTruthy();
		expect(getByText('Choose Local File')).toBeTruthy();
		expect(getByText('Upload')).toBeTruthy();

		fireEvent.press(getByText('icon-close'));
		expect(props.onClose).toHaveBeenCalledTimes(1);

		const modal = UNSAFE_getByType(Modal);
		modal.props.onRequestClose();
		expect(props.onClose).toHaveBeenCalledTimes(2);
	});

	it('supports choose-file and upload button handlers when enabled', () => {
		const props = buildUploadModalProps();
		const { getByText } = render(<UploadDocsModal {...props} />);

		fireEvent.press(getByText('Choose Local File'));
		expect(props.onPickDocument).toHaveBeenCalledTimes(1);

		fireEvent.press(getByText('Upload'));
		expect(props.onUploadDocument).toHaveBeenCalledTimes(1);
	});

	it('renders selected file details and clear action with 0 B formatting', () => {
		const props = buildUploadModalProps({
			selectedDocument: {
				name: 'empty.txt',
				mimeType: 'text/plain',
				size: 0,
			},
		});

		const { getByText, getByPlaceholderText } = render(<UploadDocsModal {...props} />);

		expect(getByText('Selected File')).toBeTruthy();
		expect(getByText('File Name: empty.txt')).toBeTruthy();
		expect(getByText('Type: text/plain')).toBeTruthy();
		expect(getByText('Size: 0 B')).toBeTruthy();
		expect(getByPlaceholderText('Enter document name')).toBeTruthy();

		fireEvent.press(getByText('Clear Selection'));
		expect(props.onClearDocument).toHaveBeenCalledTimes(1);
	});

	it('renders byte formatting branches for bytes, KB, and MB', () => {
		const { getByText, rerender } = render(
			<UploadDocsModal
				{...buildUploadModalProps({
					selectedDocument: {
						name: 'tiny.bin',
						mimeType: 'application/octet-stream',
						size: 512,
					},
				})}
			/>
		);

		expect(getByText('Size: 512 B')).toBeTruthy();

		rerender(
			<UploadDocsModal
				{...buildUploadModalProps({
					selectedDocument: {
						name: 'notes.pdf',
						mimeType: 'application/pdf',
						size: 2048,
					},
				})}
			/>
		);
		expect(getByText('Size: 2.0 KB')).toBeTruthy();

		rerender(
			<UploadDocsModal
				{...buildUploadModalProps({
					selectedDocument: {
						name: 'briefing.pptx',
						mimeType: 'application/vnd.ms-powerpoint',
						size: 5 * 1024 * 1024,
					},
				})}
			/>
		);
		expect(getByText('Size: 5.00 MB')).toBeTruthy();
	});

	it('shows upload error and success message when present', () => {
		const props = buildUploadModalProps({
			uploadError: 'Upload failed.',
			uploadSuccessMessage: 'Upload successful.',
		});
		const { getByText } = render(<UploadDocsModal {...props} />);

		expect(getByText('Upload failed.')).toBeTruthy();
		expect(getByText('Upload successful.')).toBeTruthy();
	});

	it('disables interaction and shows picker spinner while choosing document', () => {
		const props = buildUploadModalProps({
			isPickingDocument: true,
			isUploadingDocument: false,
		});

		const { queryByText, getByText } = render(<UploadDocsModal {...props} />);

		expect(queryByText('Choose Local File')).toBeNull();
		fireEvent.press(getByText('Upload'));
		expect(props.onUploadDocument).not.toHaveBeenCalled();
	});

	it('disables interaction and shows uploader spinner while uploading', () => {
		const props = buildUploadModalProps({
			selectedDocument: {
				name: 'memo.pdf',
				mimeType: 'application/pdf',
				size: 1024,
			},
			isUploadingDocument: true,
			isPickingDocument: false,
		});

		const { getByText, queryByText } = render(<UploadDocsModal {...props} />);

		expect(queryByText('Upload')).toBeNull();
		fireEvent.press(getByText('Choose Local File'));
		expect(props.onPickDocument).not.toHaveBeenCalled();

		fireEvent.press(getByText('Clear Selection'));
		expect(props.onClearDocument).not.toHaveBeenCalled();
	});
});

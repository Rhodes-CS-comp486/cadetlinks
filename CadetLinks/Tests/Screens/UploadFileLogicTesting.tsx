import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useDocumentUploadingLogic } from '../../src/navigation/screens/ActionsPage/UploadDocsLogic';

const mockUploadDocumentFromUri = jest.fn(() => Promise.resolve({ uploadKey: 'upload-1' }));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('../../src/firebase/globals', () => ({
  uploadDocumentFromUri: (input: any) => (mockUploadDocumentFromUri as any)(input),
}));

describe('useDocumentUploadingLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as any).OS = 'ios';
    (global as any).fetch = jest.fn().mockResolvedValue({
      blob: jest.fn().mockResolvedValue({ mocked: true }),
    });
  });

  it('rejects unsupported mime types', async () => {
    const { result } = renderHook(() => useDocumentUploadingLogic());

    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [
        {
          name: 'image.png',
          uri: 'file:///tmp/image.png',
          mimeType: 'image/png',
          size: 1024,
        },
      ],
    });

    await act(async () => {
      await result.current.pickDocument();
    });

    expect(result.current.uploadError).toBe('Only PDF and DOCX files are allowed.');
  });

  it('requires selecting a document before upload', async () => {
    const { result } = renderHook(() => useDocumentUploadingLogic());

    await act(async () => {
      await result.current.uploadSelectedDocument();
    });

    expect(result.current.uploadError).toBe('Please choose a document first.');
  });

  it('uploads selected document through globals action', async () => {
    const { result } = renderHook(() => useDocumentUploadingLogic());

    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
      canceled: false,
      assets: [
        {
          name: 'briefing.pdf',
          uri: 'file:///tmp/briefing.pdf',
          mimeType: 'application/pdf',
          size: 2048,
        },
      ],
    });

    await act(async () => {
      await result.current.pickDocument();
    });

    await act(async () => {
      await result.current.uploadSelectedDocument();
    });

    expect(mockUploadDocumentFromUri).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: 'briefing',
        mimeType: 'application/pdf',
      })
    );

    await waitFor(() => {
      expect(result.current.uploadSuccessMessage).toContain('uploaded successfully');
    });
  });
});

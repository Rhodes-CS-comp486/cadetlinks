import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useAttendanceLogic } from '../../src/navigation/screens/ActionsPage/AttendanceLogic';

const mockLoadAttendanceToolsData = jest.fn();
const mockSaveAttendanceForEvent = jest.fn(() => Promise.resolve());
const mockClearAttendanceForEvent = jest.fn(() => Promise.resolve());

jest.mock('../../src/firebase/globals', () => ({
  loadAttendanceToolsData: () => mockLoadAttendanceToolsData(),
  saveAttendanceForEvent: (eventId: string, absentCadetKeys: string[], excusedCadetKeys: string[], statusByCadetKey: Record<string, string>) =>
    (mockSaveAttendanceForEvent as any)(eventId, absentCadetKeys, excusedCadetKeys, statusByCadetKey),
  clearAttendanceForEvent: (eventId: string) => (mockClearAttendanceForEvent as any)(eventId),
}));

describe('useAttendanceLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

    mockLoadAttendanceToolsData.mockResolvedValue({
      todayEvents: [
        { id: 'e1', eventName: 'PT Session', date: '2026-04-20', time: '14:00:00' },
      ],
      cadets: [
        { cadetKey: 'c1', firstName: 'Jane', lastName: 'Doe', fullName: 'Jane Doe', attendanceKey: 'doe' },
        { cadetKey: 'c2', firstName: 'John', lastName: 'Smith', fullName: 'John Smith', attendanceKey: 'smith' },
      ],
    });
  });

  afterEach(() => {
    (Alert.alert as jest.Mock).mockRestore?.();
  });

  it('loads attendance data and opens modal', async () => {
    const { result } = renderHook(() => useAttendanceLogic());

    await act(async () => {
      await result.current.openAttendanceModal();
    });

    expect(result.current.attendanceModalVisible).toBe(true);
    expect(result.current.todayEvents).toHaveLength(1);
    expect(result.current.allCadets).toHaveLength(2);
    expect(result.current.markedAbsentCount).toBe(2);
  });

  it('tracks status overrides and counts', async () => {
    const { result } = renderHook(() => useAttendanceLogic());

    await act(async () => {
      await result.current.openAttendanceModal();
    });

    act(() => {
      result.current.setCadetStatus('c1', 'L');
    });

    expect(result.current.getCadetStatus('c1')).toBe('L');
    expect(result.current.markedLateCount).toBe(1);
    expect(result.current.markedAbsentCount).toBe(1);
  });

  it('submitAttendance requires selecting an event', async () => {
    const { result } = renderHook(() => useAttendanceLogic());

    await act(async () => {
      await result.current.openAttendanceModal();
    });

    await act(async () => {
      await result.current.submitAttendance();
    });

    expect(Alert.alert).toHaveBeenCalledWith('Select an event', "Please choose today's event first.");
    expect(mockSaveAttendanceForEvent).not.toHaveBeenCalled();
  });

  it('submitAttendance saves selected event attendance', async () => {
    const { result } = renderHook(() => useAttendanceLogic());

    await act(async () => {
      await result.current.openAttendanceModal();
    });

    act(() => {
      result.current.selectEvent('e1');
      result.current.setCadetStatus('c1', 'L');
    });

    await act(async () => {
      await result.current.submitAttendance();
    });

    expect(mockSaveAttendanceForEvent).toHaveBeenCalledWith(
      'e1',
      expect.any(Array),
      expect.any(Array),
      expect.objectContaining({ c1: 'L' })
    );
    expect(result.current.attendanceModalVisible).toBe(false);
  });
});

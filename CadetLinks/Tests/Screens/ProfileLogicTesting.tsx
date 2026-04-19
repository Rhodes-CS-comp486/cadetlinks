import { renderHook, waitFor } from '@testing-library/react-native';
import { useProfileLogic } from '../../src/navigation/screens/ProfilePage/ProfileLogic';

const mockInitializeGlobals = jest.fn(() => Promise.resolve());
let mockGlobalState: any = {};

jest.mock('../../src/firebase/globals', () => ({
  globals: () => mockGlobalState,
  initializeGlobals: () => mockInitializeGlobals(),
}));

function buildGlobalState(overrides: Partial<any> = {}) {
  return {
    isInitialized: true,
    isInitializing: false,
    cadetKey: 'john_doe_memphis_edu',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      cadetRank: 'C/1st Lt',
      classYear: 2026,
      flight: 'A',
      job: 'Flight Commander',
      contact: { schoolEmail: 'john.doe@memphis.edu', cellPhone: '555-0100' },
      lastPTScore: '95',
    },
    attendancePT: {
      '2026-04-01': { doe: { status: 'P' } },
      '2026-04-08': { doe: { status: 'A' } },
      '2026-04-15': { doe: { status: 'L' } },
    },
    attendanceLLAB: {
      '2026-04-01': { doe: { status: 'P' } },
      '2026-04-08': { doe: { status: 'P' } },
    },
    errors: {},
    lastUpdated: { attendance: Date.now() },
    ...overrides,
  };
}

describe('useProfileLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGlobalState = buildGlobalState();
  });

  it('returns profile and computed attendance metrics from globals state', async () => {
    const { result } = renderHook(() => useProfileLogic());

    await waitFor(() => {
      expect(result.current.loadingProfile).toBe(false);
    });

    expect(result.current.cadetKey).toBe('john_doe_memphis_edu');
    expect(result.current.profile?.lastName).toBe('Doe');

    expect(result.current.ptAttended).toBe(1);
    expect(result.current.ptMissed).toBe(1);
    expect(result.current.ptLate).toBe(1);
    expect(result.current.ptAttendancePercent).toBe(50);

    expect(result.current.llabAttended).toBe(2);
    expect(result.current.llabMissed).toBe(0);
    expect(result.current.llabAttendancePercent).toBe(100);
  });

  it('shows no-user errors when cadet key is absent', async () => {
    mockGlobalState = buildGlobalState({
      cadetKey: null,
      profile: null,
    });

    const { result } = renderHook(() => useProfileLogic());

    await waitFor(() => {
      expect(result.current.loadingProfile).toBe(false);
    });

    expect(result.current.profileError).toBe('No user is logged in.');
    expect(result.current.attendanceError).toBe('No user is logged in.');
  });

  it('surfaces attendance error from globals', async () => {
    mockGlobalState = buildGlobalState({
      errors: { attendance: 'Could not load attendance.' },
    });

    const { result } = renderHook(() => useProfileLogic());

    await waitFor(() => {
      expect(result.current.loadingProfile).toBe(false);
    });

    expect(result.current.attendanceError).toBe('Could not load attendance.');
  });
});

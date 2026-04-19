import { act, renderHook } from '@testing-library/react-native';
import { useSearchLogic } from '../../src/navigation/screens/SearchPage/SearchLogic';

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
    cadetKey: 'self_cadet',
    cadetsByKey: {
      self_cadet: { firstName: 'Self', lastName: 'Cadet', flight: 'POC' },
      cadet_a: { firstName: 'Sadie', lastName: 'Gray', job: 'Vice Wing Commander', flight: 'POC', classYear: 400 },
      cadet_b: { firstName: 'Ryan', lastName: 'Whitfield', job: 'N/A', flight: 'Alpha', classYear: 150 },
      cadet_c: { firstName: 'Aaron', lastName: 'Gray', job: 'A1', flight: 'Bravo', classYear: 300 },
    },
    errors: {},
    ...overrides,
  };
}

describe('useSearchLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGlobalState = buildGlobalState();
  });

  it('excludes current cadet and sorts by last then first name', () => {
    const { result } = renderHook(() => useSearchLogic());

    expect(result.current.filteredCadets.map((c: any) => c.cadetKey)).toEqual([
      'cadet_c',
      'cadet_a',
      'cadet_b',
    ]);
  });

  it('filters by text query across name and job', () => {
    const { result } = renderHook(() => useSearchLogic());

    act(() => {
      result.current.setQuery('wing commander');
    });

    expect(result.current.filteredCadets.map((c: any) => c.cadetKey)).toEqual(['cadet_a']);

    act(() => {
      result.current.setQuery('whitfield');
    });

    expect(result.current.filteredCadets.map((c: any) => c.cadetKey)).toEqual(['cadet_b']);
  });

  it('exposes flight options and filters by selected flight', () => {
    const { result } = renderHook(() => useSearchLogic());

    expect(result.current.flightOptions).toEqual(['Alpha', 'Bravo', 'POC']);

    act(() => {
      result.current.setSelectedFlight('POC');
    });

    expect(result.current.filteredCadets.map((c: any) => c.cadetKey)).toEqual(['cadet_a']);
  });

  it('surfaces cadets error from globals', () => {
    mockGlobalState = buildGlobalState({
      errors: { cadets: 'Could not load cadets.' },
    });

    const { result } = renderHook(() => useSearchLogic());

    expect(result.current.searchError).toBe('Could not load cadets.');
  });
});

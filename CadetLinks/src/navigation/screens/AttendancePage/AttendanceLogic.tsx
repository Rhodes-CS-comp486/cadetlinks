import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { getAttendanceSnapshot, globals, initializeGlobals, PERMISSIONS, updateAttendanceCell, type AttendanceRecordStatus, type AttendanceSnapshot } from "../../../firebase/dbController";

export type AttendanceBucket = keyof AttendanceSnapshot;

export type AttendanceMatrixRow = {
	cadetKey: string;
	firstName: string;
	lastName: string;
	displayName: string;
	recordKey: string;
	classYear: number;
	statusesByDate: Record<string, AttendanceRecordStatus>;
};

const normalizeAttendanceKey = (input: string) => (input ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

const getEditableStatuses = (bucket: AttendanceBucket): AttendanceRecordStatus[] =>
	bucket === "RMP" ? ["MP", "ML", "MA", "P", "E", "L", "A"] : [".", "P", "E", "L", "A"];

const getNextAttendanceStatus = (bucket: AttendanceBucket, currentStatus: AttendanceRecordStatus): AttendanceRecordStatus => {
	const options = getEditableStatuses(bucket);
	const currentIndex = options.indexOf(currentStatus);
	return options[(currentIndex + 1) % options.length];
};

const getStatusFromNode = (node: unknown): AttendanceRecordStatus => {
	if (!node || typeof node !== "object") {
		return ".";
	}

	const raw = (node as { status?: string; Status?: string }).status ?? (node as { status?: string; Status?: string }).Status ?? ".";
	const normalized = String(raw).toUpperCase();
	const allowed = new Set<AttendanceRecordStatus>(["P", "A", "E", "L", ".", "MP", "ML", "MA"]);
	return allowed.has(normalized as AttendanceRecordStatus) ? (normalized as AttendanceRecordStatus) : ".";
};

const sortDatesAscending = (dates: string[]) => [...dates].sort((a, b) => a.localeCompare(b));

export function useAttendancePageLogic() {
	const globalState = globals();
	const [selectedBucket, setSelectedBucket] = useState<AttendanceBucket>("PT");
	const [attendanceSnapshot, setAttendanceSnapshot] = useState<AttendanceSnapshot>({ PT: {}, LLAB: {}, RMP: {} });
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [savingCellKeys, setSavingCellKeys] = useState<Record<string, boolean>>({});

	const loadAttendance = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			await initializeGlobals();
			const snapshot = await getAttendanceSnapshot();
			setAttendanceSnapshot(snapshot);
		} catch (loadError: any) {
			console.error("Failed to load attendance snapshot:", loadError);
			setError(loadError?.message ?? "Could not load attendance.");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadAttendance();
	}, [loadAttendance]);

	const bucketDates = useMemo(
		() => sortDatesAscending(Object.keys(attendanceSnapshot[selectedBucket] ?? {})),
		[attendanceSnapshot, selectedBucket]
	);

	const matrixRows = useMemo(() => {
		const bucketData = attendanceSnapshot[selectedBucket] ?? {};
		const rowsByCadet = new Map<string, AttendanceMatrixRow>();

		Object.entries(globalState.cadetsByKey).forEach(([cadetKey, profile]) => {
			const firstName = profile.firstName ?? "";
			const lastName = profile.lastName ?? "";
			const classYear = profile.classYear ?? 0;
			rowsByCadet.set(cadetKey, {
				cadetKey,
				firstName,
				lastName,
				displayName: `${lastName}, ${firstName}`.replace(/^,\s*/, "").trim() || cadetKey,
				recordKey: normalizeAttendanceKey(lastName || cadetKey),
				classYear,
				statusesByDate: {},
			});
		});

		Object.entries(bucketData).forEach(([date, records]) => {
			Object.entries(records ?? {}).forEach(([recordKey, node]) => {
				const matchingCadet = Object.entries(globalState.cadetsByKey).find(([cadetKey, profile]) => {
					const normalizedLastName = normalizeAttendanceKey(profile.lastName ?? "");
					return cadetKey === recordKey || normalizedLastName === recordKey;
				});

				const cadetKey = matchingCadet?.[0] ?? recordKey;
				const existing = rowsByCadet.get(cadetKey);

				if (existing) {
					existing.statusesByDate[date] = getStatusFromNode(node);
					return;
				}

				rowsByCadet.set(cadetKey, {
					cadetKey,
					firstName: "",
					lastName: recordKey,
					displayName: recordKey,
					recordKey,
					classYear: 0,
					statusesByDate: { [date]: getStatusFromNode(node) },
				});
			});
		});

		return [...rowsByCadet.values()].sort((a, b) => {
			if (a.classYear !== b.classYear) {
				return b.classYear - a.classYear;
			}
			const lastNameCmp = a.lastName.localeCompare(b.lastName);
			if (lastNameCmp !== 0) return lastNameCmp;
			const firstNameCmp = a.firstName.localeCompare(b.firstName);
			if (firstNameCmp !== 0) return firstNameCmp;
			return a.cadetKey.localeCompare(b.cadetKey);
		});
	}, [attendanceSnapshot, globalState.cadetsByKey, selectedBucket]);

	const canEditAttendance = globalState.permissionsMap.get(PERMISSIONS.ADMIN) ?? false;

	const updateAttendanceStatus = useCallback(
		async (row: AttendanceMatrixRow, date: string) => {
			if (!canEditAttendance) {
				return;
			}

			const currentStatus = row.statusesByDate[date] ?? ".";
			const nextStatus = getNextAttendanceStatus(selectedBucket, currentStatus);
			const cellKey = `${selectedBucket}:${date}:${row.recordKey}`;

			setSavingCellKeys((prev) => ({ ...prev, [cellKey]: true }));

			try {
				await updateAttendanceCell(selectedBucket, date, row.recordKey, nextStatus);

				setAttendanceSnapshot((prev) => ({
					...prev,
					[selectedBucket]: {
						...prev[selectedBucket],
						[date]: {
							...(prev[selectedBucket]?.[date] ?? {}),
							[row.recordKey]: { status: nextStatus },
						},
					},
				}));
			} catch (saveError: any) {
				console.error("Failed to update attendance cell:", saveError);
				Alert.alert("Update failed", saveError?.message ?? "Could not update attendance.");
			} finally {
				setSavingCellKeys((prev) => {
					const next = { ...prev };
					delete next[cellKey];
					return next;
				});
			}
		},
		[canEditAttendance, selectedBucket]
	);

	return {
		selectedBucket,
		setSelectedBucket,
		attendanceSnapshot,
		bucketDates,
		matrixRows,
		isLoading,
		error,
		canEditAttendance,
		savingCellKeys,
		updateAttendanceStatus,
		refreshAttendance: loadAttendance,
	};
}

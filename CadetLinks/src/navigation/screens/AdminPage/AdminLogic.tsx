import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { globals, initializeGlobals, updateAttendanceCell, updateCadetField, updateCadetJobAssignment } from "../../../firebase/dbController";
import type { AttendanceRecordStatus, CadetProfile } from "../../../assets/types";

export type AdminTab = "attendance" | "cadets" | "jobs";
export type AttendanceType = "PT" | "LLAB" | "RMP";

export type CadetProfileRow = {
	cadetKey: string;
	profile: CadetProfile;
};

export type AttendanceRow = {
	recordKey: string;
	cadetKey: string;
	firstName: string;
	lastName: string;
	status: AttendanceRecordStatus;
};

export const CADET_FIELDS: Array<{
	key: string;
	label: string;
	path?: Parameters<typeof updateCadetField>[1];
	getValue: (profile: CadetProfile) => string;
}> = [
    { key: "lastName", label: "Last Name", path: "lastName", getValue: (profile) => profile.lastName ?? "" },
	{ key: "firstName", label: "First Name", path: "firstName", getValue: (profile) => profile.firstName ?? "" },
	{ key: "cadetRank", label: "Rank", path: "cadetRank", getValue: (profile) => profile.cadetRank ?? "" },
	{ key: "classYear", label: "Year", path: "classYear", getValue: (profile) => profile.classYear == null ? "" : String(profile.classYear) },
	{ key: "flight", label: "Flight", path: "flight", getValue: (profile) => profile.flight ?? "" },
	{ key: "schoolEmail", label: "School Email", path: "contact/schoolEmail", getValue: (profile) => profile.contact?.schoolEmail ?? "" },
	{ key: "personalEmail", label: "Personal Email", path: "contact/personalEmail", getValue: (profile) => profile.contact?.personalEmail ?? "" },
	{ key: "cellPhone", label: "Cell Phone", path: "contact/cellPhone", getValue: (profile) => profile.contact?.cellPhone ?? "" },
];

export const JOB_SHEET_FIELDS: Array<{ key: string; label: string; getValue: (profile: CadetProfile) => string }> = [
    { key: "lastName", label: "Last Name", getValue: (profile) => profile.lastName ?? "" },
	{ key: "firstName", label: "First Name", getValue: (profile) => profile.firstName ?? "" },
	{ key: "job", label: "Job Title", getValue: (profile) => profile.job ?? "" },
];

const normalizeAttendanceKey = (input: string) => (input ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

const getAllowedStatusOptions = (type: AttendanceType): AttendanceRecordStatus[] =>
	type === "RMP"
		? ["MP", "MA", "ME", "ML", "P", "E", "A", "L"]
		: ["P", "E", "A", "L"];

const getStatusFromNode = (node: any, type: AttendanceType): AttendanceRecordStatus => {
	const raw = node?.status ?? node?.Status ?? ".";
	const normalized = String(raw).toUpperCase() as AttendanceRecordStatus;
	const allowed = new Set<AttendanceRecordStatus>(getAllowedStatusOptions(type));
	if (allowed.has(normalized)) {
		return normalized;
	}
	return type === "RMP" ? "MA" : "A";
};

export function useAdminLogic() {
	const globalState = globals();
	const [activeTab, setActiveTab] = useState<AdminTab>("attendance");
	const [selectedAttendanceType, setSelectedAttendanceType] = useState<AttendanceType>("PT");
	const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>("");
	const [drafts, setDrafts] = useState<Record<string, string>>({});

	useEffect(() => {
		void initializeGlobals();
	}, []);

	const cadetRows = useMemo(
		() =>
			Object.entries(globalState.cadetsByKey)
				.map(([cadetKey, profile]) => ({ cadetKey, profile }))
				.sort(
					(a, b) =>
						(a.profile.lastName ?? "").localeCompare(b.profile.lastName ?? "") ||
						(a.profile.firstName ?? "").localeCompare(b.profile.firstName ?? "")
				),
		[globalState.cadetsByKey]
	);

	const attendanceByType = useMemo(
		() => ({
			PT: globalState.attendancePT,
			LLAB: globalState.attendanceLLAB,
			RMP: globalState.attendanceRMP,
		}),
		[globalState.attendancePT, globalState.attendanceLLAB, globalState.attendanceRMP]
	);

	const attendanceDates = useMemo(() => {
		const dates = Object.keys(attendanceByType[selectedAttendanceType] ?? {});
		return dates.sort((a, b) => b.localeCompare(a));
	}, [attendanceByType, selectedAttendanceType]);

	useEffect(() => {
		if (attendanceDates.length === 0) {
			if (selectedAttendanceDate !== "") setSelectedAttendanceDate("");
			return;
		}
		if (!selectedAttendanceDate) {
			setSelectedAttendanceDate(attendanceDates[0]);
		}
	}, [attendanceDates, selectedAttendanceDate]);

	const attendanceRows = useMemo(() => {
		const perDate = attendanceByType[selectedAttendanceType] ?? {};
		const perCadet = selectedAttendanceDate ? perDate[selectedAttendanceDate] ?? {} : {};

		return Object.entries(perCadet)
			.map(([recordKey, node]) => {
				const byCadetKey = cadetRows.find((row) => row.cadetKey === recordKey);
				const byLastNameKey = cadetRows.find(
					(row) => normalizeAttendanceKey(row.profile.lastName ?? "") === recordKey
				);
				const match = byCadetKey ?? byLastNameKey;

				return {
					recordKey,
					cadetKey: match?.cadetKey ?? recordKey,
					firstName: match?.profile.firstName ?? "",
					lastName: match?.profile.lastName ?? recordKey,
					status: getStatusFromNode(node, selectedAttendanceType),
				};
			})
			.sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));
	}, [attendanceByType, cadetRows, selectedAttendanceDate, selectedAttendanceType]);

	const getDraftKey = (...parts: string[]) => parts.join("::");

	const getDraftValue = (key: string, fallback: string) => {
		const next = drafts[key];
		return typeof next === "string" ? next : fallback;
	};

	const setDraftValue = (key: string, value: string) => {
		setDrafts((prev) => ({ ...prev, [key]: value }));
	};

	const clearDraft = (key: string) => {
		setDrafts((prev) => {
			if (!(key in prev)) return prev;
			const next = { ...prev };
			delete next[key];
			return next;
		});
	};

	const saveCadetField = async (
		cadetKey: string,
		fieldPath: Parameters<typeof updateCadetField>[1],
		value: string,
		draftKey: string
	) => {
		try {
			await updateCadetField(cadetKey, fieldPath, value);
			clearDraft(draftKey);
		} catch (e: any) {
			Alert.alert("Save failed", e?.message ?? "Could not update cadet field.");
		}
	};

	const saveCadetJob = async (cadetKey: string, value: string, draftKey: string) => {
		try {
			await updateCadetJobAssignment(cadetKey, value);
			clearDraft(draftKey);
		} catch (e: any) {
			Alert.alert("Save failed", e?.message ?? "Could not update cadet job.");
		}
	};

	const saveAttendanceStatus = async (row: AttendanceRow, value: string, draftKey: string) => {
		if (!selectedAttendanceDate) {
			Alert.alert("Select date", "Please select an attendance date first.");
			return;
		}

		try {
			await updateAttendanceCell(selectedAttendanceType, selectedAttendanceDate, row.recordKey, (value || ".") as AttendanceRecordStatus);
			clearDraft(draftKey);
		} catch (e: any) {
			Alert.alert("Save failed", e?.message ?? "Could not update attendance.");
		}
	};

	return {
		activeTab,
		setActiveTab,
		selectedAttendanceType,
		setSelectedAttendanceType,
		selectedAttendanceDate,
		setSelectedAttendanceDate,
		attendanceDates,
		cadetRows,
		attendanceRows,
		getAllowedStatusOptions,
		getDraftKey,
		getDraftValue,
		setDraftValue,
		saveCadetField,
		saveCadetJob,
		saveAttendanceStatus,
	};
}

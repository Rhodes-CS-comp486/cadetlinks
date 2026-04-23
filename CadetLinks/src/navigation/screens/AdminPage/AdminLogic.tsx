import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { globals, initializeGlobals, updateCadetField, updateCadetJobAssignment } from "../../../firebase/dbController";
import type { CadetProfile } from "../../../assets/types";

export type AdminTab = "cadets" | "jobs";

export type CadetProfileRow = {
	cadetKey: string;
	profile: CadetProfile;
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

export function useAdminLogic() {
	const globalState = globals();
	const [activeTab, setActiveTab] = useState<AdminTab>("cadets");
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

	return {
		activeTab,
		setActiveTab,
		cadetRows,
		getDraftKey,
		getDraftValue,
		setDraftValue,
		saveCadetField,
		saveCadetJob,
	};
}

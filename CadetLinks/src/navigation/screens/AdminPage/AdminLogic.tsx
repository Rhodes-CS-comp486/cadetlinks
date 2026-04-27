import { useEffect, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import { deleteCadetUser, globals, initializeGlobals, updateCadetField, updateCadetJobAssignment } from "../../../firebase/dbController";
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

export const JOB_POSITIONS = [
	"Cadet Wing Commander",
	"Cadet Vice Wing Commander",
	"Inspector General",
	"A1 Director",
	"A3 Director",
	"A4, A5 Director",
	"PA/Projos",
	"A8, A9 Commander",
	"Alpha Flight Commander",
	"Bravo Flight Commander",
	"LLAB Commander",
	"Physical Fitness Officer",
	"PFOA",
	"RMP Commander",
	"Honor Guard Officer",
	"Morale Officer",
	"Supply Officer",
	"MX Officer",
	"A9 Director",
	"Safety Officer",
	"Recruiting Officer",
	"Community Service Officer",
] as const;

const isValidEmail = (value: string) => {
	const trimmed = value.trim();
	if (!trimmed) return true;
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
};

const isValidPhoneNumber = (value: string) => {
	const trimmed = value.trim();
	if (!trimmed) return true;

	const digitsOnly = trimmed.replace(/\D/g, "");
	if (digitsOnly.length === 10) return true;
	if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) return true;
	return false;
};

const showPopupAlert = (title: string, message: string) => {
	if (Platform.OS === "web" && typeof window !== "undefined") {
		window.alert(`${title}\n\n${message}`);
		return;
	}
	Alert.alert(title, message);
};

const getPromotedYear = (classYear: string): string | null => {
	if (classYear === "100" || classYear === "150") return "200";
	if (classYear === "200" || classYear === "250") return "300";
	if (classYear === "300") return "400";
	return null;
};

const getPromotedRank = (rank: string): string | null => {
	if (rank === "C/4C") return "C/3C";
	if (rank === "C/3C") return "C/2C";
	return null;
};

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

	const allCadetNames = useMemo(
		() =>
			cadetRows
				.map(({ profile }) =>
					[profile.firstName, profile.lastName].filter(Boolean).join(" ")
				)
				.filter(Boolean),
		[cadetRows]
	);

	const cadetNameToKey = useMemo(() => {
		const map = new Map<string, string>();
		for (const { cadetKey, profile } of cadetRows) {
			const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
			if (name) map.set(name, cadetKey);
		}
		return map;
	}, [cadetRows]);

	const cadetForJob = useMemo(() => {
		const map: Record<string, { cadetKey: string; name: string }> = {};
		for (const { cadetKey, profile } of cadetRows) {
			if (profile.job) {
				const name = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
				map[profile.job] = { cadetKey, name };
			}
		}
		return map;
	}, [cadetRows]);

	const getJobCadet = (jobTitle: string) => cadetForJob[jobTitle]?.name ?? "";

	const handleJobSelect = async (jobTitle: string, fullName: string) => {
		const newCadetKey = cadetNameToKey.get(fullName);
		if (!newCadetKey) return;

		const oldHolder = cadetForJob[jobTitle];
		if (oldHolder && oldHolder.cadetKey !== newCadetKey) {
			try {
				await updateCadetField(oldHolder.cadetKey, "job", "");
			} catch (e: any) {
				Alert.alert("Save failed", e?.message ?? "Could not clear old job assignment.");
				return;
			}
		}

		try {
			await updateCadetJobAssignment(newCadetKey, jobTitle);
		} catch (e: any) {
			Alert.alert("Save failed", e?.message ?? "Could not update job assignment.");
		}
	};

	const handleJobClear = async (jobTitle: string) => {
		const oldHolder = cadetForJob[jobTitle];
		if (!oldHolder) return;
		try {
			await updateCadetField(oldHolder.cadetKey, "job", "");
		} catch (e: any) {
			Alert.alert("Save failed", e?.message ?? "Could not clear job assignment.");
		}
	};

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
		if (fieldPath === "contact/schoolEmail" || fieldPath === "contact/personalEmail") {
			if (!isValidEmail(value)) {
				showPopupAlert("Invalid email", "Please enter a valid email address.");
				clearDraft(draftKey);
				return false;
			}
		}

		if (fieldPath === "contact/cellPhone") {
			if (!isValidPhoneNumber(value)) {
				showPopupAlert("Invalid phone number", "Please enter a valid 10-digit phone number.");
				clearDraft(draftKey);
				return false;
			}
		}

		try {
			await updateCadetField(cadetKey, fieldPath, value);
			clearDraft(draftKey);
			return true;
		} catch (e: any) {
			Alert.alert("Save failed", e?.message ?? "Could not update cadet field.");
			return false;
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

	const confirmDeleteCadet = (cadetKey: string, fullName: string) => {
		const displayName = fullName.trim() || cadetKey;
		const title = "Delete User";
		const message = `Are you sure you want to delete ${displayName}? This cannot be undone.`;

		const runDelete = async () => {
			try {
				await deleteCadetUser(cadetKey);
				showPopupAlert("Deleted", `${displayName} was removed.`);
			} catch (e: any) {
				showPopupAlert("Delete failed", e?.message ?? "Could not delete this user.");
			}
		};

		if (Platform.OS === "web" && typeof window !== "undefined") {
			const confirmed = window.confirm(`${title}\n\n${message}`);
			if (confirmed) {
				void runDelete();
			}
			return;
		}

		Alert.alert(title, message, [
			{ text: "Cancel", style: "cancel" },
			{ text: "Delete", style: "destructive", onPress: () => void runDelete() },
		]);
	};

	const runBatchPromotion = async (deleteFourHundredCadetKeys: string[]) => {
		const deleteSet = new Set(deleteFourHundredCadetKeys);
		let deletedCount = 0;
		let yearPromotedCount = 0;
		let rankPromotedCount = 0;
		let forcedPocFlightCount = 0;
		let failureCount = 0;

		for (const { cadetKey, profile } of cadetRows) {
			const currentYear = String(profile.classYear ?? "").trim();
			const currentRank = String(profile.cadetRank ?? "").trim();
			const currentFlight = String(profile.flight ?? "").trim();

			try {
				if (currentYear === "400" && deleteSet.has(cadetKey)) {
					await deleteCadetUser(cadetKey);
					deletedCount += 1;
					continue;
				}

				const nextYear = getPromotedYear(currentYear);
				if (nextYear && nextYear !== currentYear) {
					await updateCadetField(cadetKey, "classYear", nextYear);
					yearPromotedCount += 1;
				}

				const nextRank = getPromotedRank(currentRank);
				if (nextRank && nextRank !== currentRank) {
					await updateCadetField(cadetKey, "cadetRank", nextRank);
					rankPromotedCount += 1;
				}

				if (currentRank === "C/3C" && currentFlight !== "POC") {
					await updateCadetField(cadetKey, "flight", "POC");
					forcedPocFlightCount += 1;
				}
			} catch {
				failureCount += 1;
			}
		}

		showPopupAlert(
			"Batch promotion complete",
			[
				`Years promoted: ${yearPromotedCount}`,
				`Ranks promoted: ${rankPromotedCount}`,
				`Flights set to POC: ${forcedPocFlightCount}`,
				`Deleted 400-level cadets: ${deletedCount}`,
				`Failed updates: ${failureCount}`,
			].join("\n")
		);
	};

	const confirmBatchPromotion = (deleteFourHundredCadetKeys: string[]) => {
		const title = "Run Batch Promotions";
		const message = "Confirm batch promotions and 400-level deletions?";

		if (Platform.OS === "web" && typeof window !== "undefined") {
			const confirmed = window.confirm(`${title}\n\n${message}`);
			if (confirmed) {
				void runBatchPromotion(deleteFourHundredCadetKeys);
			}
			return;
		}

		Alert.alert(title, message, [
			{ text: "Cancel", style: "cancel" },
			{ text: "Run", onPress: () => void runBatchPromotion(deleteFourHundredCadetKeys) },
		]);
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
		confirmBatchPromotion,
		confirmDeleteCadet,
		allCadetNames,
		getJobCadet,
		handleJobSelect,
		handleJobClear,
	};
}

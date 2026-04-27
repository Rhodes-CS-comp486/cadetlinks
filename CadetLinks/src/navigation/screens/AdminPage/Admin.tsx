import React, { useMemo, useState } from "react";
import {
	Modal,
  Pressable,
  ScrollView,
	Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenLayout } from "../../Components/ScreenLayout";
import { CADET_FIELDS, JOB_POSITIONS, useAdminLogic, type AdminTab } from "./AdminLogic";
import { adminStyles as styles } from "../../../styles/AdminStyles";
import { CadetAutocomplete } from "./CadetAutocomplete";
import { DropdownPicker } from "../ActionsPage/Components/DropdownPicker";
import { FLIGHTS, RANKS, YEARS } from "../../../assets/constants";

const isContactField = (fieldPath?: (typeof CADET_FIELDS)[number]["path"]) =>
	fieldPath === "contact/schoolEmail" ||
	fieldPath === "contact/personalEmail" ||
	fieldPath === "contact/cellPhone";

const isEmailField = (fieldPath?: (typeof CADET_FIELDS)[number]["path"]) =>
	fieldPath === "contact/schoolEmail" || fieldPath === "contact/personalEmail";

export function AdminPage() {
	const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);
	const [contactEditMode, setContactEditMode] = useState<Record<string, boolean>>({});
	const [promotionModalVisible, setPromotionModalVisible] = useState(false);
	const [deleteFourHundreds, setDeleteFourHundreds] = useState<Record<string, boolean>>({});
	const {
		activeTab,
		setActiveTab,
		cadetRows,
		getDraftKey,
		getDraftValue,
		setDraftValue,
		saveCadetField,
		confirmBatchPromotion,
		confirmDeleteCadet,
		allCadetNames,
		getJobCadet,
		handleJobSelect,
		handleJobClear,
	} = useAdminLogic();

	const fourHundredCadets = useMemo(
		() =>
			cadetRows.filter(
				(row) => String(row.profile.classYear ?? "").trim() === "400"
			),
		[cadetRows]
	);

	const selectedDeleteFourHundredKeys = useMemo(
		() =>
			Object.entries(deleteFourHundreds)
				.filter(([, shouldDelete]) => shouldDelete)
				.map(([cadetKey]) => cadetKey),
		[deleteFourHundreds]
	);

	const openPromotionModal = () => {
		const initialSelections: Record<string, boolean> = {};
		for (const row of fourHundredCadets) {
			initialSelections[row.cadetKey] = deleteFourHundreds[row.cadetKey] ?? false;
		}
		setDeleteFourHundreds(initialSelections);
		setPromotionModalVisible(true);
	};

	const runPromotionsFromModal = () => {
		setPromotionModalVisible(false);
		confirmBatchPromotion(selectedDeleteFourHundredKeys);
	};

	const setContactEditing = (key: string, isEditing: boolean) => {
		setContactEditMode((prev) => ({ ...prev, [key]: isEditing }));
	};

	const toggleContactEdit = async (
		cadetKey: string,
		fieldPath: NonNullable<(typeof CADET_FIELDS)[number]["path"]>,
		draftKey: string,
		value: string
	) => {
		const isEditing = contactEditMode[draftKey] === true;
		if (!isEditing) {
			setContactEditing(draftKey, true);
			return;
		}

		const saved = await saveCadetField(cadetKey, fieldPath, value, draftKey);
		if (saved) {
			setContactEditing(draftKey, false);
		}
	};

	const renderTabButton = (tab: AdminTab, label: string) => (
		<Pressable
			key={tab}
			onPress={() => setActiveTab(tab)}
			style={[styles.adminTabButton, activeTab === tab && styles.adminTabButtonActive]}
		>
			<Text style={[styles.adminTabButtonText, activeTab === tab && styles.adminTabButtonTextActive]}>{label}</Text>
		</Pressable>
	);

	const renderCadetInfoSheet = () => (
		<ScrollView horizontal>
			<View>
				<View style={styles.adminSheetHeaderRow}>
					{CADET_FIELDS.map((field) => {
						const isWideEmailColumn = isEmailField(field.path);
						return (
							<Text
								key={field.key}
								style={[styles.adminHeaderCell, isWideEmailColumn && styles.adminHeaderCellWide]}
							>
								{field.label}
							</Text>
						);
					})}
					<Text style={styles.adminRowActionHeader}>Delete</Text>
				</View>
				{cadetRows.map((row) => {
					const rowPrefix = getDraftKey("cadet", row.cadetKey);
					const rowHasOpenDropdown =
						typeof openDropdownKey === "string" && openDropdownKey.startsWith(`${rowPrefix}::`);
					const displayName = [row.profile.firstName, row.profile.lastName].filter(Boolean).join(" ");

					return (
					<View
						key={row.cadetKey}
						style={[
							styles.adminSheetRow,
							rowHasOpenDropdown && styles.adminSheetRowOpen,
						]}
					>
						{CADET_FIELDS.map((field) => {
							const key = getDraftKey("cadet", row.cadetKey, String(field.key));
							const value = getDraftValue(key, field.getValue(row.profile));
							const fieldPath = field.path;
							const isContactInfoCell = isContactField(fieldPath);
							const isWideEmailColumn = isEmailField(fieldPath);
							const isContactCellEditing = isContactInfoCell && contactEditMode[key] === true;
							const options =
								fieldPath === "cadetRank"
									? RANKS
									: fieldPath === "classYear"
										? YEARS
										: fieldPath === "flight"
											? FLIGHTS
											: null;

							if (options && fieldPath) {
								return (
									<View key={field.key} style={styles.adminEditCell}>
										<DropdownPicker
											label=""
											options={options}
											value={value}
											onOpenChange={(isOpen) => {
												setOpenDropdownKey((previous) => {
													if (isOpen) return key;
													return previous === key ? null : previous;
												});
											}}
											onSelect={(selected) => {
												setDraftValue(key, selected);
												void saveCadetField(row.cadetKey, fieldPath, selected, key);
											}}
										/>
									</View>
								);
							}

							if (isContactInfoCell && fieldPath) {
								return (
									<View
										key={field.key}
										style={[
											styles.adminContactCell,
											isWideEmailColumn && styles.adminContactCellWide,
											isContactCellEditing ? styles.adminContactCellEditMode : styles.adminContactCellReadMode,
										]}
									>
										<Pressable
											style={[
												styles.adminCellActionButton,
												isContactCellEditing && styles.adminCellActionButtonEditMode,
											]}
											onPress={() => void toggleContactEdit(row.cadetKey, fieldPath, key, value)}
										>
											<Ionicons
												name={isContactCellEditing ? "checkmark" : "create-outline"}
												size={16}
												color={isContactCellEditing ? "#0B1220" : "#9AA3B2"}
											/>
										</Pressable>

										{isContactCellEditing ? (
											<TextInput
												value={value}
												onChangeText={(text) => setDraftValue(key, text)}
												style={styles.adminContactCellInput}
												placeholderTextColor="#7C8699"
											/>
										) : (
											<Text numberOfLines={1} style={styles.adminContactCellText}>
												{value || "-"}
											</Text>
										)}
									</View>
								);
							}

							return (
								<TextInput
									key={field.key}
									value={value}
									onChangeText={(text) => setDraftValue(key, text)}
									onEndEditing={() => field.path && saveCadetField(row.cadetKey, field.path, value, key)}
									onBlur={() => field.path && saveCadetField(row.cadetKey, field.path, value, key)}
									onSubmitEditing={() => field.path && saveCadetField(row.cadetKey, field.path, value, key)}
									style={styles.adminEditCell}
									placeholderTextColor="#7C8699"
								/>
							);
						})}
						<View style={styles.adminRowActionCell}>
							<Pressable
								style={styles.adminDeleteButton}
								onPress={() => confirmDeleteCadet(row.cadetKey, displayName)}
							>
								<Ionicons name="trash-outline" size={16} color="#FF6B6B" />
							</Pressable>
						</View>
					</View>
					);
				})}
			</View>
		</ScrollView>
	);

	const renderJobSheet = () => (
		<View>
			<View style={styles.adminSheetHeaderRow}>
				<Text style={styles.adminJobTitleCell}>Job Title</Text>
				<Text style={styles.adminHeaderCell}>Assigned Cadet</Text>
			</View>
			{JOB_POSITIONS.map((jobTitle) => (
				<View key={jobTitle} style={styles.adminSheetRow}>
					<Text style={styles.adminJobTitleCell}>{jobTitle}</Text>
					<View style={styles.adminCadetCellWrapper}>
						<CadetAutocomplete
							value={getJobCadet(jobTitle)}
							cadetNames={allCadetNames}
							onSelect={(name) => void handleJobSelect(jobTitle, name)}
							onClear={() => void handleJobClear(jobTitle)}
						/>
					</View>
				</View>
			))}
		</View>
	);

	return (
		<ScreenLayout>
			<View style={styles.body_container}>
				<Text style={styles.sectionTitle}>Admin Data Sheets</Text>

				<View style={styles.adminTabRow}>
					{renderTabButton("cadets", "Cadet Information")}
					{renderTabButton("jobs", "Job Assignments")}
					<View style={styles.adminTabRowSpacer} />
					<Pressable
						style={styles.adminPromotionButton}
						onPress={openPromotionModal}
					>
						<Text style={styles.adminPromotionButtonText}>Run Promotions</Text>
					</Pressable>
				</View>

				<Modal
					visible={promotionModalVisible}
					animationType="fade"
					transparent
					onRequestClose={() => setPromotionModalVisible(false)}
				>
					<View style={styles.modalOverlay}>
						<View style={styles.modalContent}>
							<Text style={styles.modalTitle}>Batch Promotions</Text>
							<Text style={styles.adminSubtitle}>Select which 400-level cadets to delete. Unselected 400 cadets will be kept.</Text>

							<ScrollView style={styles.adminPromotionModalList} contentContainerStyle={styles.adminPromotionModalListContent}>
								{fourHundredCadets.length === 0 ? (
									<Text style={styles.adminPromotionToggleText}>No 400-level cadets found.</Text>
								) : (
									fourHundredCadets.map((row) => {
										const fullName = [row.profile.firstName, row.profile.lastName].filter(Boolean).join(" ") || row.cadetKey;
										const shouldDelete = deleteFourHundreds[row.cadetKey] === true;
										return (
											<View key={row.cadetKey} style={styles.adminPromotionModalItem}>
												<Text style={styles.adminPromotionModalItemText}>{fullName}</Text>
												<View style={styles.adminPromotionToggleGroup}>
													<Text style={styles.adminPromotionToggleText}>{shouldDelete ? "Delete" : "Keep"}</Text>
													<Switch
														value={shouldDelete}
														onValueChange={(next) =>
															setDeleteFourHundreds((prev) => ({ ...prev, [row.cadetKey]: next }))
														}
													/>
												</View>
											</View>
										);
									})
								)}
							</ScrollView>

							<View style={styles.adminPromotionModalActions}>
								<Pressable style={styles.adminPromotionModalCancelButton} onPress={() => setPromotionModalVisible(false)}>
									<Text style={styles.adminPromotionModalCancelText}>Cancel</Text>
								</Pressable>
								<Pressable style={styles.adminPromotionButton} onPress={runPromotionsFromModal}>
									<Text style={styles.adminPromotionButtonText}>Confirm and Run</Text>
								</Pressable>
							</View>
						</View>
					</View>
				</Modal>

				<View style={styles.adminSheetContainer}>
					<ScrollView
						nestedScrollEnabled
						keyboardShouldPersistTaps="handled"
						contentContainerStyle={styles.adminSheetContentContainer}
					>
						{activeTab === "cadets" && renderCadetInfoSheet()}
						{activeTab === "jobs" && renderJobSheet()}
					</ScrollView>
				</View>
			</View>
		</ScreenLayout>
	);
}

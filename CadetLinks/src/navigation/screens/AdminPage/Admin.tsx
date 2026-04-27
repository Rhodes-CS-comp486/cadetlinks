import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenLayout } from "../../Components/ScreenLayout";
import { CADET_FIELDS, JOB_POSITIONS, useAdminLogic, type AdminTab } from "./AdminLogic";
import { generalStyles as styles } from "../../../styles/GeneralStyles";
import { CadetAutocomplete } from "./CadetAutocomplete";
import { DropdownPicker } from "../ActionsPage/Components/DropdownPicker";
import { FLIGHTS, RANKS, YEARS } from "../../../assets/constants";

export function AdminPage() {
	const {
		activeTab,
		setActiveTab,
		cadetRows,
		getDraftKey,
		getDraftValue,
		setDraftValue,
		saveCadetField,
		allCadetNames,
		getJobCadet,
		handleJobSelect,
		handleJobClear,
	} = useAdminLogic();

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
					{CADET_FIELDS.map((field) => (
						<Text key={field.key} style={styles.adminHeaderCell}>{field.label}</Text>
					))}
				</View>
				{cadetRows.map((row) => (
					<View key={row.cadetKey} style={styles.adminSheetRow}>
						{CADET_FIELDS.map((field) => {
							const key = getDraftKey("cadet", row.cadetKey, String(field.key));
							const value = getDraftValue(key, field.getValue(row.profile));
							const fieldPath = field.path;
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
											onSelect={(selected) => {
												setDraftValue(key, selected);
												void saveCadetField(row.cadetKey, fieldPath, selected, key);
											}}
										/>
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
					</View>
				))}
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
				<Text style={styles.adminSubtitle}>Edit any cell and click out of it to save changes to Firebase.</Text>

				<View style={styles.adminTabRow}>
					{renderTabButton("cadets", "Cadet Information")}
					{renderTabButton("jobs", "Job Assignments")}
				</View>

				<View style={styles.adminSheetContainer}>
					<ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 12 }}>
						{activeTab === "cadets" && renderCadetInfoSheet()}
						{activeTab === "jobs" && renderJobSheet()}
					</ScrollView>
				</View>
			</View>
		</ScreenLayout>
	);
}

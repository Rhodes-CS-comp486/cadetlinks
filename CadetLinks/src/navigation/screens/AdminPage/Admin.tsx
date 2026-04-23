import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenLayout } from "../../Components/ScreenLayout";
import { CADET_FIELDS, JOB_SHEET_FIELDS, useAdminLogic, type AdminTab } from "./AdminLogic";
import { generalStyles as styles } from "../../../styles/GeneralStyles";
import { DropdownPicker } from "../ActionsPage/Components/DropdownPicker";
import { JOBS } from "../../../assets/constants";

export function AdminPage() {
	const {
		activeTab,
		setActiveTab,
		cadetRows,
		getDraftKey,
		getDraftValue,
		setDraftValue,
		saveCadetField,
		saveCadetJob,
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
		<ScrollView horizontal>
			<View>
				<View style={styles.adminSheetHeaderRow}>
					{JOB_SHEET_FIELDS.map((field) => (
						<Text key={field.key} style={styles.adminHeaderCell}>{field.label}</Text>
					))}
				</View>
				{cadetRows.map((row) => {
					const jobKey = getDraftKey("job", row.cadetKey, "job");
					const jobValue = getDraftValue(jobKey, row.profile.job ?? "");
					return (
						<View key={row.cadetKey} style={styles.adminSheetRow}>
                            <Text style={styles.adminReadCell}>{row.profile.lastName ?? ""}</Text>
							<Text style={styles.adminReadCell}>{row.profile.firstName ?? ""}</Text>
							<View style={styles.adminEditCellWide}>
								<DropdownPicker
									label=""
									options={JOBS}
									value={jobValue}
									onSelect={(nextJob) => {
										setDraftValue(jobKey, nextJob);
										void saveCadetJob(row.cadetKey, nextJob, jobKey);
									}}
								/>
							</View>
						</View>
					);
				})}
			</View>
		</ScrollView>
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

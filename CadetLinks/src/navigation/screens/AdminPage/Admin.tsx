import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenLayout } from "../../Components/ScreenLayout";
import { CADET_FIELDS, JOB_SHEET_FIELDS, useAdminLogic, type AdminTab, type AttendanceType } from "./AdminLogic";
import { generalStyles } from "../../../styles/GeneralStyles";
import DatePicker from "../EventsPage/Components/datePicker";
import { DropdownPicker } from "../ActionsPage/Components/DropdownPicker";
import { JOBS } from "../../../assets/constants";

export function AdminPage() {
	const {
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
	} = useAdminLogic();

	const attendanceStatusOptions = getAllowedStatusOptions(selectedAttendanceType);

	const toDateString = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	};

	const parseDateString = (dateStr: string): Date | null => {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
			return null;
		}
		const [year, month, day] = dateStr.split("-").map(Number);
		const parsed = new Date(year, (month ?? 1) - 1, day ?? 1);
		if (isNaN(parsed.getTime())) {
			return null;
		}
		parsed.setHours(0, 0, 0, 0);
		return parsed;
	};

	const renderTabButton = (tab: AdminTab, label: string) => (
		<Pressable
			key={tab}
			onPress={() => setActiveTab(tab)}
			style={[generalStyles.adminTabButton, activeTab === tab && generalStyles.adminTabButtonActive]}
		>
			<Text style={[generalStyles.adminTabButtonText, activeTab === tab && generalStyles.adminTabButtonTextActive]}>{label}</Text>
		</Pressable>
	);

	const renderCadetInfoSheet = () => (
		<ScrollView horizontal>
			<View>
				<View style={generalStyles.adminSheetHeaderRow}>
					{CADET_FIELDS.map((field) => (
						<Text key={field.key} style={generalStyles.adminHeaderCell}>{field.label}</Text>
					))}
				</View>
				{cadetRows.map((row) => (
					<View key={row.cadetKey} style={generalStyles.adminSheetRow}>
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
									style={generalStyles.adminEditCell}
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
				<View style={generalStyles.adminSheetHeaderRow}>
					{JOB_SHEET_FIELDS.map((field) => (
						<Text key={field.key} style={generalStyles.adminHeaderCell}>{field.label}</Text>
					))}
				</View>
				{cadetRows.map((row) => {
					const jobKey = getDraftKey("job", row.cadetKey, "job");
					const jobValue = getDraftValue(jobKey, row.profile.job ?? "");
					return (
						<View key={row.cadetKey} style={generalStyles.adminSheetRow}>
                            <Text style={generalStyles.adminReadCell}>{row.profile.lastName ?? ""}</Text>
							<Text style={generalStyles.adminReadCell}>{row.profile.firstName ?? ""}</Text>
							<View style={generalStyles.adminEditCellWide}>
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

	const renderAttendanceSheet = () => (
		<>
			<Text style={generalStyles.text}>Event Type</Text>
			<View style={generalStyles.adminTabRow}>
				{(["PT", "LLAB", "RMP"] as AttendanceType[]).map((type) => (
					<Pressable
						key={type}
						onPress={() => setSelectedAttendanceType(type)}
						style={[
							generalStyles.adminTabButton,
							selectedAttendanceType === type && generalStyles.adminTabButtonActive,
						]}
					>
						<Text
							style={[
								generalStyles.adminTabButtonText,
								selectedAttendanceType === type && generalStyles.adminTabButtonTextActive,
							]}
						>
							{type}
						</Text>
					</Pressable>
				))}
			</View>

			<Text style={generalStyles.text}>Date</Text>
			<DatePicker
				value={parseDateString(selectedAttendanceDate)}
				onChange={(date) => setSelectedAttendanceDate(toDateString(date))}
				placeholder="Select date"
			/>
			{attendanceDates.length === 0 && (
				<Text style={generalStyles.text}>No attendance dates found for {selectedAttendanceType}.</Text>
			)}

			<ScrollView horizontal>
				<View>
				<View style={generalStyles.adminSheetHeaderRow}>
					<Text style={generalStyles.adminHeaderCell}>First Name</Text>
					<Text style={generalStyles.adminHeaderCell}>Last Name</Text>
					<Text style={generalStyles.adminHeaderCell}>Status</Text>
				</View>
				{attendanceRows.map((row) => {
					const statusKey = getDraftKey("attendance", selectedAttendanceType, selectedAttendanceDate || "none", row.recordKey);
					const fallbackStatus = attendanceStatusOptions.includes(row.status) ? row.status : attendanceStatusOptions[0];
					const statusValue = getDraftValue(statusKey, fallbackStatus);
					return (
						<View key={`${selectedAttendanceType}-${selectedAttendanceDate || "none"}-${row.recordKey}`} style={generalStyles.adminSheetRow}>
							<Text style={generalStyles.adminReadCell}>{row.firstName}</Text>
							<Text style={generalStyles.adminReadCell}>{row.lastName}</Text>
							<View style={generalStyles.adminEditCellStatus}>
								<DropdownPicker
									label=""
									options={attendanceStatusOptions}
									value={statusValue}
									onSelect={(nextStatus) => {
										setDraftValue(statusKey, nextStatus);
										void saveAttendanceStatus(row, nextStatus, statusKey);
									}}
								/>
							</View>
						</View>
					);
				})}
			</View>
		</ScrollView>
		</>
	);

	return (
		<ScreenLayout>
			<View style={generalStyles.body_container}>
				<Text style={generalStyles.sectionTitle}>Admin Data Sheets</Text>
				<Text style={generalStyles.adminSubtitle}>Edit any cell and click out of it to save changes to Firebase.</Text>

				<View style={generalStyles.adminTabRow}>
					{renderTabButton("attendance", "Attendance")}
					{renderTabButton("cadets", "Cadet Information")}
					{renderTabButton("jobs", "Job Assignments")}
				</View>

				<View style={generalStyles.adminSheetContainer}>
					<ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 12 }}>
						{activeTab === "attendance" && renderAttendanceSheet()}
						{activeTab === "cadets" && renderCadetInfoSheet()}
						{activeTab === "jobs" && renderJobSheet()}
					</ScrollView>
				</View>
			</View>
		</ScreenLayout>
	);
}

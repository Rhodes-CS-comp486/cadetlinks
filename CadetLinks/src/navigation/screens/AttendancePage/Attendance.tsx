import { useRef } from "react";
import { ScreenLayout } from "../../Components/ScreenLayout";
import { generalStyles as styles } from "../../../styles/GeneralStyles";
import { NativeSyntheticEvent, NativeScrollEvent, Pressable, ScrollView, Text, View } from "react-native";
import { useAttendancePageLogic, type AttendanceBucket } from "./AttendanceLogic";
import type { AttendanceRecordStatus } from "../../../firebase/dbController";

const getAttendanceCellColors = (status: AttendanceRecordStatus | ".") => {
    switch (status) {
        case "P":
        case "MP":
            return { backgroundColor: "#2E7D32", color: "#FFFFFF" };
        case "E":
        case "ME":
            return { backgroundColor: "#C8E6C9", color: "#1B5E20" };
        case "L":
        case "ML":
            return { backgroundColor: "#FDD835", color: "#5D4037" };
        case "A":
        case "MA":
            return { backgroundColor: "#D32F2F", color: "#FFFFFF" };
        default:
            return null;
    }
};

export function AttendancePage() {
    const frozenColumnScrollRef = useRef<ScrollView | null>(null);
    const gridScrollRef = useRef<ScrollView | null>(null);
    const activeScrollSourceRef = useRef<"frozen" | "grid" | null>(null);

    const {
        selectedBucket,
        setSelectedBucket,
        bucketDates,
        matrixRows,
        isLoading,
        error,
        canEditAttendance,
        savingCellKeys,
        updateAttendanceStatus,
        refreshAttendance,
    } = useAttendancePageLogic();

    const syncVerticalScroll = (
        source: "frozen" | "grid",
        targetRef: React.RefObject<ScrollView | null>,
        event: NativeSyntheticEvent<NativeScrollEvent>
    ) => {
        if (activeScrollSourceRef.current && activeScrollSourceRef.current !== source) {
            return;
        }

        activeScrollSourceRef.current = source;
        targetRef.current?.scrollTo({ y: event.nativeEvent.contentOffset.y, animated: false });

        requestAnimationFrame(() => {
            if (activeScrollSourceRef.current === source) {
                activeScrollSourceRef.current = null;
            }
        });
    };

    const renderTabButton = (bucket: AttendanceBucket) => (
        <Pressable
            key={bucket}
            onPress={() => setSelectedBucket(bucket)}
            style={[styles.adminTabButton, selectedBucket === bucket && styles.adminTabButtonActive]}
        >
            <Text style={[styles.adminTabButtonText, selectedBucket === bucket && styles.adminTabButtonTextActive]}>{bucket}</Text>
        </Pressable>
    );

    return (
        <ScreenLayout>
            <View style={styles.body_container}>
                <Text style={styles.sectionTitle}>Attendance</Text>
                <Text style={styles.adminSubtitle}>Spreadsheet view by cadet and date. Pulls a Firebase attendance snapshot and separates it into PT, LLAB, and RMP.</Text>
                {!canEditAttendance && (
                    <Text style={styles.adminSubtitle}>View only. Only admins can edit attendance from this screen.</Text>
                )}

                <View style={styles.attendanceToolbarRow}>
                    <View style={styles.adminTabRow}>
                        {(["PT", "LLAB", "RMP"] as AttendanceBucket[]).map(renderTabButton)}
                    </View>
                    <Pressable onPress={() => void refreshAttendance()} style={styles.attendanceRefreshButton}>
                        <Text style={styles.attendanceRefreshButtonText}>Refresh</Text>
                    </Pressable>
                </View>

                {isLoading && <Text style={styles.text}>Loading attendance...</Text>}
                {!isLoading && error && <Text style={styles.errorText}>{error}</Text>}
                {!isLoading && !error && bucketDates.length === 0 && (
                    <Text style={styles.text}>No attendance records found for {selectedBucket}.</Text>
                )}

                {!isLoading && !error && bucketDates.length > 0 && (
                    <View style={styles.adminSheetContainer}>
                        <View style={styles.attendanceSheetRow}>
                            <View style={styles.attendanceFrozenColumn}>
                                <View style={styles.adminSheetHeaderRow}>
                                    <Text style={[styles.adminHeaderCell, styles.attendanceNameCell]}>Cadet</Text>
                                </View>

                                <ScrollView
                                    ref={frozenColumnScrollRef}
                                    scrollEventThrottle={16}
                                    onScroll={(event) => syncVerticalScroll("frozen", gridScrollRef, event)}
                                >
                                    {matrixRows.map((row) => (
                                        <View key={row.cadetKey} style={styles.adminSheetRow}>
                                            <Text style={[styles.adminReadCell, styles.attendanceNameCell]}>{row.displayName}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </View>

                            <ScrollView horizontal>
                                <View>
                                    <View style={styles.adminSheetHeaderRow}>
                                        {bucketDates.map((date) => (
                                            <Text key={date} style={[styles.adminHeaderCell, styles.attendanceDateCell]}>{date}</Text>
                                        ))}
                                    </View>

                                    <ScrollView
                                        ref={gridScrollRef}
                                        scrollEventThrottle={16}
                                        onScroll={(event) => syncVerticalScroll("grid", frozenColumnScrollRef, event)}
                                    >
                                        {matrixRows.map((row) => (
                                            <View key={row.cadetKey} style={styles.adminSheetRow}>
                                                {bucketDates.map((date) => {
                                                    const status = row.statusesByDate[date] ?? ".";
                                                    const colors = getAttendanceCellColors(status);
                                                    const cellKey = `${selectedBucket}:${date}:${row.recordKey}`;
                                                    const isSaving = savingCellKeys[cellKey] === true;

                                                    return (
                                                        <Pressable
                                                            key={`${row.cadetKey}-${date}`}
                                                            onPress={() => void updateAttendanceStatus(row, date)}
                                                            disabled={!canEditAttendance || isSaving}
                                                            style={[
                                                                styles.attendanceCellButton,
                                                                styles.adminReadCell,
                                                                styles.attendanceDateCell,
                                                                styles.attendanceStatusCell,
                                                                !canEditAttendance && styles.attendanceCellReadOnly,
                                                                isSaving && styles.attendanceCellSaving,
                                                                colors ?? undefined,
                                                            ]}
                                                        >
                                                            <Text style={[styles.attendanceStatusValue, colors ? { color: colors.color } : undefined]}>
                                                                {status}
                                                            </Text>
                                                        </Pressable>
                                                    );
                                                })}
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                )}
            </View>
        </ScreenLayout>
    );
}
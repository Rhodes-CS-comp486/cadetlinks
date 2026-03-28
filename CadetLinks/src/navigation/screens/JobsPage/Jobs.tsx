import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { jobStyles as styles } from "../../../styles/JobStyles";
import { ScreenLayout } from "../../Components/ScreenLayout";
import { AttendanceModal } from "./Components/AttendanceModal";
import { UploadDocsModal } from "./Components/UploadDocsModal";
import { useAttendanceLogic } from "./AttendanceLogic";
import { useDocumentUploadingLogic } from "./UploadDocsLogic";
import { PERMISSIONS } from "../../../assets/constants";
import {useJobsLogic, iconForAction} from "./JobsLogic";
import{ CadetProfile, JobsAction, NavAny} from "../../../assets/types";

// type NavAny = ReturnType<typeof useNavigation<any>>;



export function Jobs(): React.ReactElement {
  const navigation: NavAny = useNavigation();

  const {
    cadetKey,
    profile,
    loading,
    error,
    permissionNames,
    actions,
    onPressAction,
    attendance,
    documentUploading,
    fullName,
    jobText,
    permissionText,
    anyVisibleActions,
  } = useJobsLogic();

  // const attendance = useAttendanceLogic();
  // const documentUploading = useDocumentUploadingLogic();

  // const fullName =
  //   profile?.firstName || profile?.lastName
  //     ? `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()
  //     : "Cadet"; // grabs cadet name from profile (cadet if no name)

  // const jobText = profile?.job ?? "—"; // grabs job from profile (dash if no job)

  // const permissionText =
  //   permissionNames.length > 0 ? permissionNames.join(", ") : "None"; // gets permission names or "none"

  // when you press an action, navigate to where it should go
  // const onPressAction = async (a: JobsAction) => {
  //   if (!a.allowed) return;

  //   if (a.id === PERMISSIONS.ATTENDANCE_EDITING) {
  //     console.log("Opening attendance modal and type:", attendance.attendanceModalVisible, typeof attendance.openAttendanceModal);
  //     attendance.openAttendanceModal();
  //     return;
  //   }

  //   if (a.id === PERMISSIONS.FILE_UPLOADING) {
  //     await documentUploading.openDocumentUploadingModal();
  //     return;
  //   }

  //   if (!a.routeHint) return; 
  //   navigation.navigate(a.routeHint);
  // };

  //console.log("Opening attendance modal and type:", attendance.attendanceModalVisible, typeof attendance.openAttendanceModal);

  // const anyVisibleActions = actions.length > 0;

  return (
    <ScreenLayout>
      <View style={styles.body_container}>
        <ScrollView
          style={styles.body_container}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {/* USER INFO CARD */}
          <View style={styles.userinfo_card}>
            <View style={styles.avatar_container}>
              <Ionicons name="briefcase" size={26} color="white" />
            </View>

            <View style={styles.userinfo_text_container}>
              {loading ? (
                <View style={styles.loadingBlock}>
                  <ActivityIndicator />
                  <Text style={styles.userinfo_sub}>Loading jobs…</Text>
                </View>
              ) : error ? ( 
                <>
                  <Text style={styles.userinfo_sub}>{error}</Text>
                  {cadetKey ? (
                    <Text style={styles.userinfo_sub}>
                      <Text style={styles.label_bold}>Key: </Text>
                      {cadetKey}
                    </Text>
                  ) : null}
                </>
              ) : (
                <>
                  <Text style={styles.userinfo_name}>{fullName}</Text>

                  <Text style={styles.userinfo_sub}>
                    <Text style={styles.label_bold}>Job: </Text>
                    {jobText}
                  </Text>

                  <Text style={styles.userinfo_sub}>
                    <Text style={styles.label_bold}>Permissions: </Text>
                    {permissionText}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* ACTION CARDS */}
          {!loading && !error && anyVisibleActions ? (
            <>
              <Text style={styles.sectionTitle}>Actions</Text>

              {actions.map((a) => (
                <Pressable
                  key={a.id}
                  onPress={() => onPressAction(a)}
                  style={styles.action_card}
                >
                  <View style={styles.action_left}>
                    <View style={styles.action_icon_circle}>
                      <Ionicons
                        name={iconForAction(a.id) as any}
                        size={22}
                        color="white"
                      />
                    </View>

                    <View style={styles.flexOne}>
                      <Text style={styles.action_title}>{a.title}</Text>
                      <Text style={styles.action_subtitle}>{a.subtitle}</Text>
                    </View>
                  </View>

                  <View style={styles.action_right}>
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color="white"
                    />
                  </View>
                </Pressable>
              ))}
            </>
          ) : null}
        </ScrollView>
      </View>

      {/* ATTENDANCE MODAL */}
      <AttendanceModal
        visible={attendance.attendanceModalVisible}
        onRequestClose={attendance.closeAttendanceModal}
        loadingAttendanceTools={attendance.loadingAttendanceTools}
        selectedEvent={attendance.selectedEvent}
        eventDropdownOpen={attendance.eventDropdownOpen}
        onToggleEventDropdown={attendance.toggleEventDropdown}
        todayEvents={attendance.todayEvents}
        onSelectEvent={attendance.selectEvent}
        markedAbsentCount={attendance.markedAbsentCount}
        markedLateCount={attendance.markedLateCount}
        allCadets={attendance.allCadets}
        getCadetStatus={attendance.getCadetStatus}
        setCadetStatus={attendance.setCadetStatus}
        savingAttendance={attendance.savingAttendance}
        clearingAttendance={attendance.clearingAttendance}
        onClearAttendance={attendance.clearSelectedAttendance}
        onSubmitAttendance={attendance.submitAttendance}
      />
      {/* DOCUMENT UPLOADING MODAL */}
      <UploadDocsModal
        visible={documentUploading.documentUploadingModalVisible}
        onClose={documentUploading.closeDocumentUploadingModal}
        selectedDocument={documentUploading.selectedDocument}
        isPickingDocument={documentUploading.isPickingDocument}
        isUploadingDocument={documentUploading.isUploadingDocument}
        uploadError={documentUploading.uploadError}
        uploadSuccessMessage={documentUploading.uploadSuccessMessage}
        onPickDocument={documentUploading.pickDocument}
        onClearDocument={documentUploading.clearSelectedDocument}
        onUploadDocument={documentUploading.uploadSelectedDocument}
        
       // documentName={documentUploading.documentName}
        //onChangeDocumentName={documentUploading.setDocumentName}
      />
    </ScreenLayout>
  );
}
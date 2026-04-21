import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { actionStyles as styles } from "../../../styles/ActionStyles";
import { ScreenLayout } from "../../Components/ScreenLayout";
import { AttendanceModal } from "./Components/AttendanceModal";
import { UploadDocsModal } from "./Components/UploadDocsModal";
import { useAttendanceLogic } from "./AttendanceLogic";
import { useDocumentUploadingLogic } from "./UploadDocsLogic";
import { ViewDocumentLogic } from "./ViewDocumentLogic";
import { PERMISSIONS } from "../../../assets/constants";
import { useActionsLogic, iconForAction } from "../ActionsPage/ActionsLogic";
import { CadetProfile, Action, NavAny } from "../../../assets/types";
import { ViewDocumentModal } from "./Components/ViewDocumentModal";
import { CreateAccountModal } from "./Components/CreateAccountModal";

export function Actions(): React.ReactElement {
  const navigation: NavAny = useNavigation();

  const [docListVisible, setDocListVisible] = React.useState(false);
  const documentList = ViewDocumentLogic();

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
    createAccount,
    canUploadFiles,
  } = useActionsLogic();

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
                  <Text style={styles.userinfo_sub}>Loading actions...</Text>
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
                    <Ionicons name="chevron-forward" size={22} color="white" />
                  </View>
                </Pressable>
              ))}
            </>
          ) : null}

          {/* VIEW DOCUMENTS BUTTON */}
          <Pressable
            style={styles.action_card}
            onPress={() => setDocListVisible(true)}
          >
            <View style={styles.action_left}>
              <View style={styles.action_icon_circle}>
                <Ionicons name="document-text-outline" size={22} color="white" />
              </View>
              <View style={styles.flexOne}>
                <Text style={styles.action_title}>View Documents</Text>
                <Text style={styles.action_subtitle}>Browse and manage uploaded files</Text>
              </View>
            </View>
            <View style={styles.action_right}>
              <Ionicons name="chevron-forward" size={22} color="white" />
            </View>
          </Pressable>

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
        onToggleFlightDropdown={attendance.toggleFlightDropdown}
        selectedFlight={attendance.selectedFlight}
        flightDropdownOpen={attendance.flightDropdownOpen}
        onSelectFlight={attendance.selectFlight}
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
  
      />
      

      <CreateAccountModal
        visible={createAccount.modalVisible}
        onClose={createAccount.closeModal}
        form={createAccount.form}
        updateField={createAccount.updateField}
        updatePhone={createAccount.updatePhone}
        //togglePermission={createAccount.togglePermission}
        saving={createAccount.saving}
        onSubmit={createAccount.submit}
      />

      

      {/* VIEW DOCUMENTS MODAL */}
      <ViewDocumentModal
        visible={docListVisible}
        onClose={() => setDocListVisible(false)}
        documents={documentList.documents}
        isLoading={documentList.isLoading}
        deleteError={documentList.deleteError}
        deletingKey={documentList.deletingKey}
        onDelete={documentList.deleteDocument}
        canEditFiles={canUploadFiles}
      />

      

    </ScreenLayout>
  );
}

export const Jobs = Actions;
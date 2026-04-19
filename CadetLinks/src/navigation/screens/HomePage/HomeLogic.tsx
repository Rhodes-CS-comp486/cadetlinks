import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Event } from "../../../assets/types";
import { globals, initializeGlobals, PERMISSIONS, upsertAnnouncement, deleteAnnouncement, type Announcement } from "../../../firebase/globals";

export let cadetObject: any = null;

export type { Announcement };

export function useHomeLogic() {
  const navigation = useNavigation();
  const globalState = globals();

  const [addAnnouncementModalVisible, setAddAnnouncementModalVisible] = useState(false);
  const [deleteAnnouncementModalVisible, setDeleteAnnouncementModalVisible] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string>("");
  const [newAnnouncement, setNewAnnouncement] = useState<Announcement>({
    id: "",
    title: "",
    body: "",
    importance: "Low",
    retirementDate: new Date(),
  });

  useEffect(() => {
    void initializeGlobals();
  }, []);

  const cadetPermissionsMap = globalState.permissionsMap;
  const announcements = globalState.announcements;
  const allEvents = globalState.events;
  const userRsvpEventIds = globalState.userRsvpEventIds;

  cadetObject = globalState.profile;

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const dayAfterTomorrowEndExclusive = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 0, 0, 0, 0);

    return allEvents
      .filter((event: Event) => event.time >= todayStart && event.time < dayAfterTomorrowEndExclusive)
      .filter((event: Event) => event.type === "Mandatory" || userRsvpEventIds.has(event.id))
      .sort((a: Event, b: Event) => a.time.getTime() - b.time.getTime());
  }, [allEvents, userRsvpEventIds]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Search" as never)}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleAddAnnouncement = () => {
    setNewAnnouncement({
      id: "",
      title: "",
      body: "",
      importance: "Low",
      retirementDate: new Date(),
    });
    setAddAnnouncementModalVisible(true);
  };

  const handleCancelAddAnnouncement = () => {
    setAddAnnouncementModalVisible(false);
  };

  const handleConfirmAddAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.body || !newAnnouncement.importance || !newAnnouncement.retirementDate) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      await upsertAnnouncement({
        title: newAnnouncement.title,
        body: newAnnouncement.body,
        importance: newAnnouncement.importance,
        retirementDate: newAnnouncement.retirementDate,
      });
      setAddAnnouncementModalVisible(false);
    } catch (error) {
      console.error("Error writing announcement to DB:", error);
      Alert.alert("Error", "Could not save announcement.");
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    setSelectedAnnouncementId(announcementId);
    setDeleteAnnouncementModalVisible(true);
  };

  const handleCancelDeleteAnnouncement = () => {
    setSelectedAnnouncementId("");
    setDeleteAnnouncementModalVisible(false);
  };

  const handleConfirmDeleteAnnouncement = async () => {
    if (!selectedAnnouncementId) {
      return;
    }

    try {
      await deleteAnnouncement(selectedAnnouncementId);
      setSelectedAnnouncementId("");
      setDeleteAnnouncementModalVisible(false);
    } catch (error) {
      console.error("Error deleting announcement from DB:", error);
      Alert.alert("Error", "Could not delete announcement.");
    }
  };

  const hasPermission = (permission: string): boolean => cadetPermissionsMap.get(permission) || false;

  return {
    navigation,
    cadetPermissionsMap,
    hasPermission,
    announcements,
    newAnnouncement,
    setNewAnnouncement,
    upcomingEvents,
    addAnnouncementModalVisible,
    handleAddAnnouncement,
    handleConfirmAddAnnouncement,
    handleCancelAddAnnouncement,
    deleteAnnouncementModalVisible,
    handleDeleteAnnouncement,
    handleConfirmDeleteAnnouncement,
    handleCancelDeleteAnnouncement,
    selectedAnnouncementId,
  };
}
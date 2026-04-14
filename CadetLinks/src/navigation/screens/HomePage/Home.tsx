//import { Button } from '@react-navigation/elements';
//import React, { use, useEffect, useMemo} from 'react';
//import { Calendar } from 'react-native-calendars';
//import { Ionicons } from '@expo/vector-icons';
//import { onValue, ref, get, onChildRemoved } from 'firebase/database';
//import { db } from '../../../firebase/config';
//import { PERMISSIONS } from '../../../assets/constants';
//import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView, Text, View, TouchableOpacity, Modal, Keyboard, KeyboardAvoidingView, Platform, Touchable } from 'react-native';
import { homeStyles as styles } from '../../../styles/HomeStyles';
import { HomeScreenLayout } from '../../Components/ScreenLayout';
import { useHomeLogic, Announcement } from './HomeLogic';
import { PERMISSIONS } from '../../../assets/constants';
import { TextInput } from 'react-native-gesture-handler';
import DatePicker from '../EventsPage/Components/datePicker';


export function HomePage() {
  //const navigation = useNavigation();
  const{
    cadetPermissionsMap,
    hasPermission,
    announcements,
    newAnnouncement,
    setNewAnnouncement,
    upcomingEvents,
    navigation,
    addAnnouncementModalVisible,
    handleAddAnnouncement,
    handleCancelAddAnnouncement,
  } = useHomeLogic();

  return (
    <HomeScreenLayout>
      <View style={styles.body_container}>
        
        <View style={styles.announcementContainer}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.sectionTitle}>Announcements</Text>
            {/**cadetPermissionsMap.get(PERMISSIONS.ADMIN) && */(
              <TouchableOpacity
                style={styles.addAnnouncementButton}
                onPress={handleAddAnnouncement}
              >
                <Text style={styles.addAnnouncementButtonText}>Add Announcement</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView 
          style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 10 }}
          persistentScrollbar={true}
          >
            {announcements.map(item => (
              <View key={item.id} style={styles.announcementCard}>
                <Text style={styles.announcementTitle}>{item.title}</Text>
                <Text style={styles.announcementBody}>{item.body}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.eventsContainer}>
          <Text style={styles.sectionTitle}> Upcoming Events </Text>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 10 }}
            persistentScrollbar={true}
          >
            {upcomingEvents.length === 0 && (
              <Text style={styles.noEventsText}>No events in the next 3 days.</Text>
            )}

            {upcomingEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventMeta}>
                  {event.time.toLocaleDateString()} at {event.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.eventMeta}>{event.location}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={addAnnouncementModalVisible}
          onRequestClose={handleCancelAddAnnouncement}
        >
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { flex: 1 }]}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCancelAddAnnouncement}
                  >
                  <Text style={styles.closeButtonText}>X</Text>
                  </TouchableOpacity>
                <Text style={styles.modalTitle}>Add Announcement</Text>

                {/* Title */}
                <TextInput
                  value = {newAnnouncement.title}
                  onChangeText={(text) => setNewAnnouncement({ ...newAnnouncement, title: text })}
                  placeholder="Title"
                  placeholderTextColor={styles.inputPlaceholder.color}
                  style={styles.inputBox}
                />

                <TextInput
                  value = {newAnnouncement.body}
                  onChangeText={(text) => setNewAnnouncement({ ...newAnnouncement, body: text })}
                  placeholder="Announcement details"
                  placeholderTextColor={styles.inputPlaceholder.color}
                  style={[styles.inputBox, { height: 80 }]}
                  multiline
                />

                <Text style={styles.modalLabel}> Expiration Date: </Text>

                <DatePicker
                  value={newAnnouncement.retirementDate}
                  onChange={(date) => setNewAnnouncement({ ...newAnnouncement, retirementDate: date })}
                />

                /* Importance selector */
                <Text style={styles.modalLabel}> Importance: </Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  {['Low', 'Medium', 'High'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      onPress={() => setNewAnnouncement({ ...newAnnouncement, importance: level as Announcement['importance'] })}
                      style={[
                        styles.importanceButton,
                        newAnnouncement.importance === level && styles.importanceButtonSelected,
                      ]}
                    >
                      <Text style={styles.importanceButtonText}>{level}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={handleAddAnnouncement}
                  style={styles.confirmButton}
                >
                  <Text style={styles.addAnnouncementButtonText}>Submit</Text>
                </TouchableOpacity>

              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </HomeScreenLayout>
  );

}
import { StyleSheet } from 'react-native';
import { generalStyles } from './GeneralStyles';
import {DarkColors as colors } from './colors';

export const calendarTheme = {
  calendarBackground: colors.overlay,
  textSectionTitleColor: colors.text,
  dayTextColor: colors.text,
  textDisabledColor: colors.muted,
  monthTextColor: colors.text,
}

export const eventsStyles = StyleSheet.create({
  ...generalStyles, //inherit general styles for container and others

  calendar: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
  },
  
  eventsContainer: {
    maxHeight: 300,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  eventRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 12,
    color: colors.muted,
  },
  eventTypeContainer: {
    marginLeft: 12,
  },
  eventTypeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  rsvpLabel: {
    color: colors.text,
    backgroundColor: colors.primary,
  },
  mandatoryLabel: {
    color: colors.text,
    backgroundColor: colors.accent,
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  noEventsText: {
    fontSize: 14,
    color: colors.muted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  modalText: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 20,
  },
  rsvpButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonPressed: {
    backgroundColor: colors.muted,
    borderColor: colors.border,
  },
  mandatoryButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  mandatoryButtonPressed: {
    backgroundColor: colors.muted,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: colors.success,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  declineButton: {
    backgroundColor: colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  rsvpButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  mandatoryContainer: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  mandatoryText: {
    color: colors.muted,
    fontWeight: 'bold',
    fontSize: 14,
  },
  addEventButtonDisabled:{
    

  },
  addEventButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addEventButtonText: {
    fontSize: 40,
    color: colors.text,
    fontWeight: 'bold'
  },
  scrollWheelIOS: {
    color: '#000000',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  scrollWheelWeb: {
    color: '#000000',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    // fontFamily: 'System',
  },
});
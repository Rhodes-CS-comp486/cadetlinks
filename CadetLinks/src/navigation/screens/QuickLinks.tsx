import React from "react";
import { View, Text, Linking, TouchableOpacity } from "react-native";
import { ScreenLayout } from "../Components/ScreenLayout";
import { generalStyles as styles } from "../../styles/GeneralStyles";

export function QuickLinks(): React.ReactElement {
  const igLine = "https://docs.google.com/forms/d/e/1FAIpQLSfqCXa_WwRYLOh-ZGhagspqgfq-AyndQdePQJGSePmXVj3fTA/viewform?usp=publish-editor";
  const gmcLine = "https://docs.google.com/forms/d/e/1FAIpQLSchjpi3SaojZwDUoSczbSsgpYOoEdT2g4WJBAxjmS9Gx_SxOQ/viewform?usp=header";
  const cwccLine = "https://docs.google.com/forms/d/e/1FAIpQLSf8YPgcDjFfxdnJ79i5ciCN3YwVLdE2wNQC6j5LxCB8EjeNBQ/viewform?usp=header";
  const det785Line = "https://docs.google.com/forms/d/e/1FAIpQLScuY5Np3InQHSVzOv13PpxTls4PSusW7Se68mFxG2m3a5KqsQ/viewform";
  const memROTC = "https://www.memphis.edu/afrotc/";
  const photoDrive = "https://photos.google.com/share/AF1QipMNGVuXuIwtor3ZspxYoEzxcdt-sCG3DQa4fbbfPABgTOykiruQVUBQJ0-nXEPK9g?pli=1&key=djRCcFpXZ0lCOUZSdHZPN2JZNDB1bHBmZUlGeURB";
  const quizlet = "https://quizlet.com/1131326429/spring-2026-warrior-knowledge-flash-cards/?i=3049mf&x=1jqt";

  return (
    <ScreenLayout>
      <View style={styles.body_container}>
          <TouchableOpacity onPress={() => Linking.openURL(igLine)}>
            <Text style={[styles.sectionTitle, {textDecorationLine: "underline"}]}>IG Action Line</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(gmcLine)}>
            <Text style={[styles.sectionTitle, {textDecorationLine: "underline"}]}>GMC Liasion Action Line</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(cwccLine)}>
            <Text style={[styles.sectionTitle, {textDecorationLine: "underline"}]}>CW/CC Action Line</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(det785Line)}>
            <Text style={[styles.sectionTitle, {textDecorationLine: "underline"}]}>Det 785 CC Action Line</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(memROTC)}>
            <Text style={[styles.sectionTitle, {textDecorationLine: "underline"}]}>Memphis AFROTC Website</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(photoDrive)}>
            <Text style={[styles.sectionTitle, {textDecorationLine: "underline"}]}>Det 785 Photos</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(quizlet)}>
            <Text style={[styles.sectionTitle, {textDecorationLine: "underline"}]}>Quizlet</Text>
          </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
}
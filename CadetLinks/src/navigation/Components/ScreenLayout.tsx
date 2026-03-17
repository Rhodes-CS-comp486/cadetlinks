import React from "react";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { generalStyles as styles } from "../../styles/GeneralStyles";

export function ScreenLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={[styles.header_container, { paddingTop: insets.top + 10 }]}>
        <View style={styles.header_row}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back_button}>
            <Ionicons name="chevron-back" size={26} color="white" />
          </Pressable>
          <Text style={styles.header_text}>{title}</Text>
          <View style={styles.right_space} />
        </View>
      </View>

      {children}
    </View>
  );
}
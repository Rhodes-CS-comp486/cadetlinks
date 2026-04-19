import React, { useState } from "react";
import { View, Text, Pressable, Modal, TouchableOpacity, Touchable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { generalStyles as styles } from "../../styles/GeneralStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { teardownGlobals } from "../../firebase/globals";

export function BaseScreenLayout({
  children, 
  showBack = true, 
  left, 
}: {
  children: React.ReactNode;
  showBack?: boolean;
  left?: React.ReactNode; 
}) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem("currentCadetKey");
    teardownGlobals();
    await signOut(auth);

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

  const menuItems = [
  { label: "Profile Search", onPress: () => navigation.navigate("Search") },
  { label: "Logout", onPress: () => handleLogout() },
  ];

  const leftNode = left ?? (
    showBack ? (
      <Pressable onPress={() => navigation.goBack()} style={styles.header_button}>
        <Ionicons name="chevron-back" size={26} color="white" />
      </Pressable>
    ) : (
      <View style={styles.header_space} />
    )
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header_container, { paddingTop: insets.top + 10 }]}>
        <View style={styles.header_row}>
          {leftNode}
          <Text>
            <Text style={[styles.header_text, styles.titleCadet]}>Cadet</Text>
            <Text style={[styles.header_text, styles.titleLinks]}>Links</Text>
          </Text>
          <Pressable onPress={() => setMenuOpen(!menuOpen)} style={styles.header_button}>
            <Ionicons name="menu-outline" size={26} color="white" />
          </Pressable>

          {/* Dropdown menu modal */}
          <Modal
            visible={menuOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setMenuOpen(false)}
          >
            {/* Close menu when tapping outside */}
            <Pressable style={{ flex: 1 }} onPress={() => setMenuOpen(false)}>

              {/* Dropdown menu content */}
              <View style={styles.dropdownMenu}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setMenuOpen(false);
                      item.onPress();
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

            </Pressable>
          </Modal>
        </View>
      </View>

      {children}
    </View>
  );
}

export function ScreenLayout({ children }: { children: React.ReactNode }) {
  return <BaseScreenLayout children={children} showBack />;
}

export function HomeScreenLayout({ children }: { children: React.ReactNode }) {
  return <BaseScreenLayout children={children} showBack={false} />;
}
import React from "react";
import { View, Text } from "react-native";
import { ScreenLayout } from "../Components/ScreenLayout";
import { generalStyles as styles } from "../../styles/GeneralStyles";

export function QuickLinks(): React.ReactElement {
  return (
    <ScreenLayout>
      <View>
        <Text style={styles.title}>Quick Links</Text>
      </View>
    </ScreenLayout>
  );
}
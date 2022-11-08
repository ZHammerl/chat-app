import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Chat(props) {
  {
    /* Receive props name and color from the Start Screen*/
  }
  const { color } = props.route.params;
  return (
    <View
      style={[
        { backgroundColor: color },
        styles.container,
      ]}>
      <Text style={styles.text}>Let's have a chat!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    textAlign: "center",
    marginTop: 40,
    color: "#fff",
    fontWeight: "600",
    fontSize: 20,
  },
});

import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Pressable,
} from "react-native";

// Color for buttons to choose the background color
const colors = {
  lightblue: "#3A86FF",
  orange: "#FB5607",
  pink: "#FF006E",
  violet: "#8338EC",
};

import backgroundImage from "../assets/background-image.png";

export default function Start(props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  return (
    <View style={styles.container}>
      <ImageBackground
        style={styles.backgroundImage}
        source={backgroundImage}
        resizeMode="cover">
        <Text style={styles.title}>Chat App</Text>
        <View style={styles.inputWrapper}>
          {/*User can enter their name*/}
          <TextInput
            style={styles.input}
            onChangeText={(newName) => setName(newName)}
            value={name}
            placeholder="Your Name"
          />
          {/*User can choose background color for chat screen*/}
          <Text style={styles.text}>
            Choose Background Color:
          </Text>
          <View
            style={styles.colorWrapper}
            accessibilityRole="radio">
            <TouchableOpacity
              style={[
                { backgroundColor: colors.lightblue },
                styles.colorButton,
              ]}
              onPress={() => setColor(colors.lightblue)}
              accessibilityLabel="Tap me to select background color lightblue"
              accessibilityHint="By tapping you you choose the background color of the chat screen to be lightblue"
            />
            <TouchableOpacity
              style={[
                { backgroundColor: colors.orange },
                styles.colorButton,
              ]}
              onPress={() => setColor(colors.orange)}
              accessibilityLabel="Tap me to select background color orange"
              accessibilityHint="By tapping you you choose the background color of the chat screen to be orange"
            />
            <TouchableOpacity
              style={[
                { backgroundColor: colors.pink },
                styles.colorButton,
              ]}
              onPress={() => setColor(colors.pink)}
              accessibilityLabel="Tap me to select background color pink"
              accessibilityHint="By tapping you you choose the background color of the chat screen to be pink"
            />
            <TouchableOpacity
              style={[
                { backgroundColor: colors.violet },
                styles.colorButton,
              ]}
              onPress={() => setColor(colors.violet)}
              accessibilityLabel="Tap me to select background color violet"
              accessibilityHint="By tapping you you choose the background color of the chat screen to be violet"
            />
          </View>
          <Pressable
            style={styles.button}
            title="Start Chatting"
            onPress={() =>
              props.navigation.navigate("Chat", {
                name: name,
                color: color,
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Press me to go to chat screen"
            accessibilityHint="By pressing the button you are redirected to the chat screen">
            <Text style={styles.buttonText}>
              Start Chatting
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    height: "56%",
    width: "88%",
    fontSize: 45,
    fontWeight: "600",
    fontColor: "#FFFFFF",
    textAlign: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  inputWrapper: {
    width: "88%",
    height: "44%",
    justifyContent: "space-around",
    padding: "2%",
    marginBottom: "6%",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  input: {
    height: 40,
    width: "88%",
    borderWidth: 1,
    borderColor: "grey",
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    opacity: 50,
    padding: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "300",
    fontColor: "#757083",
  },
  button: {
    width: "88%",
    height: 60,
    backgroundColor: "#757083",
    borderColor: "rgba(117, 112, 131, 0.5)",
    borderWidth: 1,
    borderStyle: "solid",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },

  colorWrapper: {
    width: "88%",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
});

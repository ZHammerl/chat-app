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
  black: "#090C08",
  purple: "#474056",
  grey: "#8A95A5",
  green: "#B9C6AE",
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
          <View style={styles.colorWrapper}>
            <TouchableOpacity
              style={[
                { backgroundColor: colors.black },
                styles.colorButton,
              ]}
              onPress={() => setColor(colors.black)}
            />
            <TouchableOpacity
              style={[
                { backgroundColor: colors.purple },
                styles.colorButton,
              ]}
              onPress={() => setColor(colors.purple)}
            />
            <TouchableOpacity
              style={[
                { backgroundColor: colors.grey },
                styles.colorButton,
              ]}
              onPress={() => setColor(colors.grey)}
            />
            <TouchableOpacity
              style={[
                { backgroundColor: colors.green },
                styles.colorButton,
              ]}
              onPress={() => setColor(colors.green)}
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
            }>
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
    justifyContent: "space-evenly",
    alignItems: "center",
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
    backgroundColor: "white",
    marginBottom: "6%",
    alignItems: "center",
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

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  KeyboardAvoidingView,
} from "react-native";

import {
  GiftedChat,
  Bubble,
} from "react-native-gifted-chat";

export default function Chat(props) {
  const [messages, setMessages] = useState([]);

  /* Receive props name and color from the Start Screen*/
  const { color } = props.route.params;
  const { name } = props.route.params;

  useEffect(() => {
    setMessages([
      {
        _id: 2,
        text: "Hello developer",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "React Native",
          avatar: "https://placeimg.com/140/140/any",
        },
      },
      {
        _id: 1,
        text: "You, have entered the chat",
        createdAt: new Date(),
        system: true,
      },
    ]);
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
  }, []);

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        // change background color of bubbles
        wrapperStyle={{
          right: { backgroundColor: "#D6CCC2" },
          left: { backgroundColor: "#FFBE0B" },
        }}
      />
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: color },
      ]}>
      <GiftedChat
        renderBubble={renderBubble}
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{ _id: 1 }}
      />

      {/*Ternary solves issue on older Android phones, that message field hides, when user types on keyboard */}
      {Platform.OS === "android" ? (
        <KeyboardAvoidingView behavior="height" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  text: {
    textAlign: "center",
    marginTop: 40,
    color: "#fff",
    fontWeight: "600",
    fontSize: 20,
  },
});

import {
  onAuthStateChanged,
  signInAnonymously,
} from "firebase/auth";
import {
  collection,
  onSnapshot,
  addDoc,
  where,
  query,
} from "firebase/firestore";
import "firebase/firestore";
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

import { db, auth } from "../config/firebase";

const referenceChatmessages = collection(db, "messages");

export default function Chat(props) {
  const [messages, setMessages] = useState([]);
  const [uid, setUid] = useState("");
  const [loggedinText, setLoggedinText] = useState(
    "Please wait. You're being authenticated"
  );

  /* Receive props name and color from the Start Screen*/
  const { color, name } = props.route.params;

  // Get messages from the firestore collection (onSnapshot) and update state
  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          await signInAnonymously(auth);
        }
        setUid(user.uid);
        setLoggedinText(`${name} is logged in`);
      }
    );

    const q = query(
      referenceChatmessages,
      where("uid", "==", uid)
    );

    const unsubscribeMessage = onSnapshot(
      q,
      (querySnapshot) => {
        setMessages(
          querySnapshot.docs.map((doc) => ({
            _id: doc.data()._id,
            text: doc.data().text,
            createdAt: doc.data().createdAt.toDate(),
            user: doc.data().user,
          }))
        );
      }
    );

    return () => {
      authUnsubscribe();
      unsubscribeMessage();
    };
  }, []);

  useEffect((props) => {
    setMessages([
      {
        text: `${name} entered the chat`,
        createdAt: new Date(),
        system: true,
        _id: name,
      },
    ]);
  }, []);

  // add and append new messages to the firestore
  const onSend = useCallback((messages = []) => {
    setMessages((prevMessages) =>
      GiftedChat.append(prevMessages, messages)
    );
    const { _id, createdAt, text, user } = messages[0];
    addDoc(referenceChatmessages, {
      _id,
      createdAt,
      text,
      user,
    });
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
        showAvatarForEveryMessage={true}
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: name,
          avatar: "https://placeimg.com/140/140/any",
        }}
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

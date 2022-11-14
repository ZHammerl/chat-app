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
  orderBy,
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

import AsyncStorage from "@react-native-async-storage/async-storage";

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

  const getMessages = async () => {
    let messages = "";
    try {
      messages =
        (await AsyncStorage.getItem("messages")) || [];
      setMessages({ messages: JSON.parse(messages) });
    } catch (error) {
      console.log(error.message);
    }
  };

  // Get messages from the firestore collection (onSnapshot) and update state
  useEffect(() => {
    getMessages();
    const authUnsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          await signInAnonymously(auth);
        }
        setUid(user.uid);
        console.log(user.uid);
        setLoggedinText(`${name} is logged in`);
      }
    );

    const q = query(
      referenceChatmessages,
      orderBy("createdAt", "desc")
    );
    console.log(q);

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

  // add last message sent to the Firestore collection "messages"
  const addMessage = (message) => {
    const { text } = message;

    if (!text) {
      return;
    }

    console.log(message);
    try {
      addDoc(referenceChatmessages, message);
    } catch (e) {
      console.error("Invalid message object", message);
      console.error(e);
    }
  };

  // save messages to AsyncStorage
  const saveMessages = async () => {
    try {
      await AsyncStorage.setItem(
        "messages",
        JSON.stringify(messages)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  const deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem("messages");
      setMessages({
        messages: [],
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  //Append new messages to the State and add to firestore collection (addMessage) and asyncStorage (saveMessages)
  const onSend = useCallback((messages = []) => {
    setMessages((prevMessages) =>
      GiftedChat.append(prevMessages, messages)
    );
    // save messages to AsyncStorage
    saveMessages();
    //Last message appended to collection
    addMessage(messages[0]);
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
          _id: uid,
          name: name,
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

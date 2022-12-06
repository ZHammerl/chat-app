import {
  onAuthStateChanged,
  signInAnonymously,
} from "firebase/auth";
import {
  collection,
  onSnapshot,
  addDoc,
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
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  MessageText,
} from "react-native-gifted-chat";

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

import { db, auth } from "../config/firebase";

import CustomActions from "./CustomActions";

const referenceChatmessages = collection(db, "messages");

export default function Chat(props) {
  const [messages, setMessages] = useState([]); // state holding messages
  const [uid, setUid] = useState(""); // state holding uid
  const [isOnline, setIsOnline] = useState(false); // state holding online status

  const [loggedinText, setLoggedinText] = useState(
    "Please wait. You're being authenticated"
  );

  /* Receive props name and color from the Start Screen*/
  const { color, name } = props.route.params;

  // Get messages from the firestore collection (onSnapshot) and update state
  useEffect(() => {
    // Get the network state once, at the first initialization
    NetInfo.fetch().then((connection) => {
      setIsOnline(connection.isConnected);
      console.log("NatInfo: ", isOnline);

      // if (!connection.isConnected) {
      if (!isOnline) {
        console.log("offline!");
        // Messages loaded from AsyncStorage
        getMessagesFromStorage().then((messageArray) =>
          setMessages(messageArray)
        );
      } else {
        console.log("online");

        const authUnsubscribe = onAuthStateChanged(
          auth,
          async (user) => {
            if (!user) {
              await signInAnonymously(auth);
            }
            setLoggedinText(`${name} is logged in`);
            // update user state with user data
            setUid(user.uid);
            console.log("authUnsubscribe", user.uid);
          }
        );

        const q = query(
          referenceChatmessages,
          orderBy("createdAt", "desc")
        );
        const unsubscribeMessage = onSnapshot(
          q,
          (querySnapshot) => {
            console.log(
              "Collection loaded from Firebase",
              querySnapshot.docs.length
            );
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
          // NetInfoUnsubscribe();
          unsubscribeMessage();
          authUnsubscribe();
        };
      }
    });
  }, [isOnline]);

  useEffect((props) => {
    setMessages([
      {
        _id: uuidv4(),
        text: `${name} entered the chat.`,
        createdAt: new Date(),
        system: true,
      },
    ]);
  }, []);

  //add last message sent to the Firestore collection "messages"
  const addMessage = (message) => {
    const { text } = message;

    if (!text) {
      return;
    }

    console.log("Message", message);
    try {
      addDoc(referenceChatmessages, message);
    } catch (e) {
      console.error("Invalid message object", message);
      console.error("addMessage error", e);
    }
  };

  // ASYNCSTORAGE

  // save messages in AsyncStorage
  const saveMessagesInStorage = async () => {
    try {
      await AsyncStorage.setItem(
        "messages",
        JSON.stringify(messages)
      );
      console.log("Add to Local storage", messages);
    } catch (error) {
      console.error(
        "save messages to Storage error",
        error.message
      );
    }
  };

  // fetch messages from AsyncStorage
  const getMessagesFromStorage = async () => {
    console.log(
      "AsyncStorage | Load messages from Storage"
    );
    try {
      const messageString =
        (await AsyncStorage.getItem("messages")) || [];
      const messageArray = JSON.parse(messageString) || [];

      console.log(
        `AsyncStorage | ${messageArray.length} messages restored`
      );

      return messageArray;
    } catch (error) {
      console.error(error.message);
    }
  };

  // delete Messages from AsyncStorage
  const deleteMessagesFromStorage = async () => {
    try {
      await AsyncStorage.removeItem("messages");
    } catch (error) {
      console.error(
        "delete messages form storage error",
        error.message
      );
    }
  };

  //Append new messages to the State and add to firestore collection (addMessage) and asyncStorage (saveMessages)
  const onSend = useCallback((messages = []) => {
    setMessages((prevMessages) =>
      GiftedChat.append(prevMessages, messages)
    );
    // save messages to AsyncStorage
    saveMessagesInStorage();
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
        // Change fontcolor of text in bubbles
        renderMessageText={(props) => {
          return (
            <MessageText
              {...props}
              textStyle={{
                right: {
                  color: "#000",
                },
              }}
            />
          );
        }}
      />
    );
  };

  const renderInputToolbar = (props) => {
    if (!isOnline) {
      return null;
    } else {
      return <InputToolbar {...props} />;
    }
  };

  const renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <Mapview
          style={styles.map}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: color },
      ]}>
      <GiftedChat
        renderCustomView={renderCustomView}
        renderActions={renderCustomActions}
        renderInputToolbar={renderInputToolbar}
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
  map: {
    width: 150,
    heigth: 100,
    borderRadius: 13,
    margin: 3,
  },
});

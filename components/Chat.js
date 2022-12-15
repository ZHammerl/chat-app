import {
  onAuthStateChanged,
  signInAnonymously,
} from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
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
import MapView from "react-native-maps";
import NetInfo from "@react-native-community/netinfo";

import { db, auth } from "../config/firebase";

import CustomActions from "./CustomActions";
import {
  saveMessagesInStorage,
  getMessagesFromStorage,
  deleteMessagesFromStorage,
} from "../asyncStorage";
import PropTypes from "prop-types";

export default function Chat(props) {
  const [messages, setMessages] = useState([]); // state holding messages
  const [uid, setUid] = useState(""); // state holding uid
  const [user, setUser] = useState({
    _id: "",
    name: "",
    avatar: "",
  });
  const [isOnline, setIsOnline] = useState(false); // state holding online status
  const [loginText, setLoginText] = useState(""); // state holding logintext

  /* Receive props name and color from the Start Screen*/
  const { color, name } = props.route.params;
  // reference to read all the documents in the "messages" collection
  const referenceChatmessages = collection(db, "messages");
  const referenceUserMessages = query(
    referenceChatmessages,
    where("uid", "==", uid)
  );

  //Get the network state once, at the first initialization
  useEffect(() => {
    NetInfo.fetch().then((connectionStatus) => {
      setIsOnline(connectionStatus.isConnected);
    });

    // Subscribe to network changes
    const unsubscribeNetInfo = NetInfo.addEventListener(
      (connectionStatus) => {
        setIsOnline(connectionStatus.isConnected);
      }
    );
    // Cleanup on onmount
    return () => {
      unsubscribeNetInfo();
    };
  }, []);

  //IF USER IS ONLINE, get messages from firestore, if user offline get messages from cache using async storage
  useEffect(() => {
    if (isOnline) {
      // console.log("online");

      // Authenticate user anonymously using Firebase
      // listens to authentication changes
      const authUnsubscribe = onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            await signInAnonymously(auth);
          }

          // update user state with user data
          setUid(user?.uid);
          setUser({
            _id: user.uid,
            name: name,
            avatar: "https://placeimg.com/140/140/any",
          });
        }
      );

      // once the user is authenticated the onSnapshot() creates an updated snapshot of the collection
      // the onCollectionUpdate writes the chat messages to state messages
      const q = query(
        referenceChatmessages,
        orderBy("createdAt", "desc")
      );
      const unsubscribeMessage = onSnapshot(
        q,
        onCollectionUpdate
      );
      return () => {
        unsubscribeMessage();
        authUnsubscribe();
      };
    }
    // if user is offline get messages from storage (AsyncStorage)
    else {
      setLoginText("You are currently offline");
      // console.log("Offline");
      getMessagesFromStorage().then((messageArray) =>
        setMessages(messageArray)
      );
    }
  }, [isOnline]);

  // save Messages in Storage when messages [state] is updated
  useEffect(() => {
    saveMessagesInStorage(messages);
  }, [messages]);

  // the onCollectionUpdate writes the chat messages to state messages
  // Whenever something changes in the messages collection (and, thus, when onSnapshot() is fired), this function needs to be called, like this onCollectionUpdate() function.
  // This function needs to retrieve the current data in the messages collection and store it in the state lists, allowing that data to be rendered in the view
  const onCollectionUpdate = (querySnapshot) => {
    console.log(
      "Collection loaded from Firebase",
      querySnapshot.docs.length
    );
    setMessages(
      querySnapshot.docs.map((doc) => {
        let data = doc.data();
        return {
          _id: data._id,
          text: data.text,
          createdAt: data.createdAt.toDate(),
          user: {
            _id: data.user._id,
            name: data.user.name,
          },
          image: data.image || null,
          location: data.location || null,
        };
      })
    );
  };

  //add last message sent to the Firestore collection "messages"
  const addMessage = (message) => {
    try {
      addDoc(referenceChatmessages, {
        uid: uid,
        _id: message._id,
        createdAt: message.createdAt,
        text: message.text || "",
        user: message.user,
        image: message.image || "",
        location: message.location || null,
      });
    } catch (e) {
      console.error("addMessage error", e);
    }
  };

  //Append new messages to the State and add to firestore collection (addMessage) and asyncStorage (saveMessages)
  const onSend = useCallback((newMessage = []) => {
    setMessages((prevMessages) =>
      GiftedChat.append(prevMessages, newMessage)
    );
    //Last message appended to collection
    addMessage(newMessage[0]);
    console.log("onSend User", user);
  }, []);

  //customize the render bubble
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

  // renders the chat input field toolbar only when user is online
  const renderInputToolbar = (props) => {
    if (!isOnline) {
      return null;
    } else {
      return <InputToolbar {...props} />;
    }
  };

  // action button to access communication features via an action sheet
  const renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  // renders a mapview when user adds a location to current message
  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{
            width: 150,
            height: 100,
            borderRadius: 13,
            margin: 3,
          }}
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
      {!isOnline && (
        <Text style={styles.login}>{loginText}</Text>
      )}
      <GiftedChat
        renderCustomView={renderCustomView}
        renderActions={renderCustomActions}
        renderInputToolbar={renderInputToolbar}
        renderBubble={renderBubble}
        showAvatarForEveryMessage={true}
        messages={messages}
        onSend={(message) => onSend(message)}
        user={user}
      />

      {/*Ternary solves issue on older Android phones, that message field hides, when user types on keyboard */}
      {Platform.OS === "android" ? (
        <KeyboardAvoidingView behavior="height" />
      ) : null}
    </View>
  );
}

Chat.propTypes = {
  messages: PropTypes.array,
  onSend: PropTypes.func,
  user: PropTypes.object,
  renderBubble: PropTypes.func,
  renderInputToolbar: PropTypes.func,
  renderActions: PropTypes.func,
  renderCustomView: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  map: {
    width: 150,
    height: 100,
    borderRadius: 13,
    margin: 3,
  },
  login: {
    textAlign: "center",
    paddingTop: 10,
  },
});

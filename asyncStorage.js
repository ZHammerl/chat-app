import AsyncStorage from "@react-native-async-storage/async-storage";

// save messages in AsyncStorage
export const saveMessagesInStorage = async (messages) => {
  try {
    await AsyncStorage.setItem(
      "messages",
      JSON.stringify(messages)
    );
    console.log("saveInStorage", messages);
  } catch (error) {
    console.error("saveMessagesInStorage", error.message);
  }
};

// fetch messages from AsyncStorage
export const getMessagesFromStorage = async () => {
  console.log("AsyncStorage | Load messages from Storage");
  try {
    const messageString =
      (await AsyncStorage.getItem("messages")) || [];
    const messageArray = JSON.parse(messageString) || [];

    console.log(
      `AsyncStorage | ${messageArray.length} messages restored`
    );
    console.log("Asyncstorage", messageArray);
    return messageArray;
  } catch (error) {
    console.error(error.message);
  }
};

// delete Messages from AsyncStorage
export const deleteMessagesFromStorage = async () => {
  try {
    await AsyncStorage.removeItem("messages");
  } catch (error) {
    console.error(
      "delete messages form storage error",
      error.message
    );
  }
};

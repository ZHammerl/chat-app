import React from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import { useActionSheet } from "@expo/react-native-action-sheet";

export default function CustomActions(props) {
  const { showActionSheetWithOptions } = useActionSheet();

  // upload image to firebase storage
  const uploadImage = async (uri) => {
    const img = await fetch(uri);
    const imgBlob = await img.blob();

    const imageNameBefore = uri.split("/");
    const imageName =
      imageNameBefore[imageNameBefore.length - 1];

    const ref = firebase
      .storage()
      .ref()
      .child(`images/${imageName}`);
    const snapshot = await ref.put(imgBlob);

    blob.close();

    return await snapshot.ref.getDownloadURL();
  };

  // pick image from library
  const pickImage = async () => {
    const { status } =
      await ImagePicker.requestCameraPermissionsAsync();
    try {
      if (status === "granted") {
        // permission to select image from library
        let result =
          await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          }).catch((error) =>
            console.log("pickImage, result", error)
          );
        console.log(result);

        // if not cancelled, upload and send image
        if (!result.canceled) {
          const imgUrl = await uploadImage(result.uri);
          props.onSend({ image: imgUrl });
        }
      }
    } catch (error) {
      console.error("pickImage", error);
    }
  };

  const onActionPress = () => {
    const options = [
      "Choose From Library",
      "Take Picture",
      "Send Location",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      { options, cancelButtonIndex },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            console.log("user wants to pick an image");
            return;
          case 1:
            console.log("user wants to take a photo");
            return;
          case 2:
            console.log("user wants to get their location");
          default:
        }
      }
    );
  };

  return (
    <TouchableOpacity
      accessible={true}
      accessibilityLabel="More options"
      accessibilityHint="Let's you choose to send an image or your geolocation."
      style={styles.container}
      onPress={onActionPress}>
      <View style={styles.wrapper}>
        <Text style={styles.iconText}>+</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginRight: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "transparent",
    textAlign: "center",
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};

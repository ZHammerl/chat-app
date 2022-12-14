import React from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import "firebase/firestore";
import { storage } from "../config/firebase";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useActionSheet } from "@expo/react-native-action-sheet";

export default function CustomActions(props) {
  const { showActionSheetWithOptions } = useActionSheet();

  // upload image to firebase storage
  // upload images to firebase storage
  async function uploadImage(uri) {
    const img = await fetch(uri);
    const imgBlob = await img.blob();

    const imageNameBefore = uri.split("/");
    const imageName =
      imageNameBefore[imageNameBefore.length - 1];

    const storageRef = ref(storage, `images/${imageName}`);

    return uploadBytes(storageRef, imgBlob).then(
      async (snapshot) => {
        imgBlob.close();
        return getDownloadURL(snapshot.ref).then((url) => {
          return url;
        });
      }
    );
  }

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

  // take photo with smartphone camera
  const takePhoto = async () => {
    // permission to use camera?
    const { status } =
      await ImagePicker.requestCameraPermissionsAsync();
    try {
      // launch camera, if permission is granted
      if (status === "granted") {
        let result = await ImagePicker.launchCameraAsync({
          base64: true,
          quality: 1,
        }).catch((error) =>
          console.error("takePhoto permission", error)
        );
        // if action is not cancelled, upload and send image
        if (!result.canceled) {
          const imgUrl = await uploadImage(result.uri);
          props.onSend({ image: imgUrl });
        }
      }
    } catch (error) {
      console.log("takePhoto", error);
    }
  };

  // get location of user via GPS
  const getLoaction = async () => {
    //permission to access current location?
    const { status } =
      await Location.requestForegroundPermissionsAsync();
    try {
      // get location, if permission is granted
      if (status === "granted") {
        const result =
          await Location.getCurrentPositionAsync({}).catch(
            (error) =>
              console.error("getLocation permission", error)
          );
        // if location is found, send it
        if (result) {
          props.onSend({
            location: {
              longitude: result.coords.longitude,
              latitude: result.coords.latitude,
            },
          });
        }
      }
    } catch (error) {
      console.error("getLocation", error);
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
            return pickImage();
          case 1:
            console.log("user wants to take a photo");
            return takePhoto();
          case 2:
            console.log("user wants to get their location");
            return getLoaction();
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
    margin: 10,
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

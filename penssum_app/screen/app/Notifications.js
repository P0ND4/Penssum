import { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableNativeFeedback,
  TouchableOpacity,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";

import * as WebBrowser from "expo-web-browser";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

import TextStyle from "../../components/TextStyle";

import { getNotifications, markNotification, socket } from "../../api";

import { update } from "../../helpers/features/user/notificationsSlice";
import { changeDate } from "../../helpers/index";

import PDFIMAGE from "../../assets/pdf_image.png";
import WORDIMAGE from "../../assets/word_image.png";
import DOCUMENTIMAGE from "../../assets/document_image.png";

import theme from "../../theme";

const downloadFile = async ({ id, url }) => {
  try {
    const fileUri = FileSystem.documentDirectory + id + ".jpeg";

    const { uri } = await FileSystem.downloadAsync(url, fileUri);

    saveFile(uri);
  } catch (e) {
    console.log(e);
  }
};

const saveFile = async (fileUri) => {
  const { status } = await MediaLibrary.requestPermissionsAsync();

  if (status === "granted") {
    const asset = await MediaLibrary.createAssetAsync(fileUri);
    await MediaLibrary.createAlbumAsync("Download Penssum", asset, false);
  }
};

const Notifications = ({ setCountInNotification }) => {
  const user = useSelector((state) => state.user);
  const notifications = useSelector((state) => state.notifications);

  const dispatch = useDispatch();

  const socketRef = useRef(socket);

  useEffect(() => {
    setCountInNotification(0);
    const findNotifications = async () => {
      await markNotification(user._id);
      const notificationsObtained = await getNotifications(user._id);

      dispatch(update(notificationsObtained));
    };
    socketRef.current.on("received event", () => findNotifications());
    findNotifications();

    return () => {
      socketRef.current.off("received event");
    };
  }, []);

  const defineName = (item) => {
    const name =
      item.firstName === undefined ||
      item.firstName === "" ||
      item.firstName === null
        ? item.username === undefined || item.username === null
          ? "ELIMINADO"
          : item.username.slice(0, 14)
        : `${item.firstName.slice(0, 10)} .${
            item.lastName === undefined ? "" : item.lastName.slice(0, 1)
          }`;

    return name;
  };

  return (
    <View style={[theme.styles.container, { marginTop: 0 }]}>
      <FlatList
        data={notifications}
        overScrollMode="never"
        keyExtractor={(item, index) => item._id}
        initialNumToRender={10}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <TouchableOpacity>
                <TextStyle
                  left
                  subtitle
                  onPress={async () =>
                    await WebBrowser.openBrowserAsync(
                      `https://penssum.com/${item.username}`
                    )
                  }
                >
                  {defineName(item)}
                </TextStyle>
              </TouchableOpacity>
              <TextStyle left paragrahp color="main2">
                {item.title}
              </TextStyle>
              <TextStyle left paragrahp>
                {changeDate(item.creationDate, true)}
              </TextStyle>
            </View>
            <View stlye={styles.body}>
              <TextStyle justify small>
                {item.description}{" "}
                {item.productId && (
                  <TextStyle
                    small
                    color="main2"
                    onPress={async () =>
                      await WebBrowser.openBrowserAsync(
                        `https://penssum.com/post/information/${item.productId}`
                      )
                    }
                  >
                    Ir al producto
                  </TextStyle>
                )}
              </TextStyle>
              <View style={styles.imagesContainer}>
                {item.files.map((file) => (
                  <TouchableNativeFeedback
                    style={styles.imagesContainer}
                    key={file.uniqueId}
                    onPress={() =>
                      downloadFile({ id: file.uniqueId, url: file.url })
                    }
                    onLongPress={async () =>
                      await WebBrowser.openBrowserAsync(file.url)
                    }
                  >
                    <Image
                      style={styles.images}
                      source={
                        file.extname === ".pdf"
                          ? PDFIMAGE
                          : file.extname === ".doc" || file.extname === ".docx"
                          ? WORDIMAGE
                          : file.extname === ".epub" ||
                            file.extname === ".azw" ||
                            file.extname === ".ibook"
                          ? DOCUMENTIMAGE
                          : { uri: file.url }
                      }
                    />
                  </TouchableNativeFeedback>
                ))}
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginVertical: 5,
    padding: 20,
    borderRadius: 10,
  },
  header: {
    marginBottom: 15,
  },
  body: { width: "100%" },
  imagesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginTop: 20,
  },
  images: {
    margin: 8,
    width: 70,
    borderRadius: 10,
    height: 70,
    backgroundColor: "#EEE",
  },
});

export default Notifications;

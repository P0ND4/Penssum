import { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Image,
  StyleSheet,
  TouchableOpacity, 
  Vibration
} from "react-native";

import { useDispatch } from "react-redux";

import { StackActions } from "@react-navigation/native";

import axios from "axios";
//import Ionicons from "@expo/vector-icons/Ionicons";
import TextStyle from "../../components/TextStyle";
import InputStyle from "../../components/InputStyle";
import ButtonStyle from "../../components/ButtonStyle";
import Logo from "../../assets/icon.png";
import Background from "../../assets/resource/background_penssum.jpg";
import CustomNotification from "../../components/CustomNotification";

import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as AuthSession from "expo-auth-session";

import GoogleLogo from "../../assets/networks/google-light.png";
import FacebookLogo from "../../assets/networks/facebook-light.png";

import { loginUser, socket } from "../../api";

import { update } from "../../helpers/features/user/userSlice";

import theme from "../../theme";

const Login = ({ navigation }) => {
  const [sendingInformation, setSendingInformation] = useState(false);
  const [isNavigate, setNavigate] = useState(false);
  const [notificationActive, setNotificationActive] = useState(false);

  const [email, setEmail] = useState("");

  const socketRef = useRef(socket);

  const [accessTokenFacebook, setAccessTokenFacebook] = useState(null);
  const [, facebookResponse, facebookPromptAsync] = Facebook.useAuthRequest(
    {
      clientId: "409003811396260",
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    },
    { useProxy: true }
  );

  const [accessTokenGoogle, setAccessTokenGoogle] = useState(null);
  const [, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    expoClientId:
      "255546568896-4aeefjgnhjjmqhhria9svpk0d5al50o9.apps.googleusercontent.com",
    iosClientId:
      "255546568896-24kdnv8bvjlj0v2fdikqa6erenblv3gu.apps.googleusercontent.com",
    androidClientId:
      "255546568896-u38682mbrqg0uoic4g2lnutoqlrf06a8.apps.googleusercontent.com",
    webClientId:
      "255546568896-sklpldqvlpb1avvh48tjqo1o2n0s5781.apps.googleusercontent.com",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (facebookResponse?.type === "success") {
      setAccessTokenFacebook(facebookResponse.authentication.accessToken);
      accessTokenFacebook && facebookRegister();
    }
  }, [facebookResponse, accessTokenFacebook]);

  useEffect(() => {
    if (googleResponse?.type === "success") {
      setAccessTokenGoogle(googleResponse.authentication.accessToken);

      accessTokenGoogle && googleRegister();
    }
  }, [googleResponse, accessTokenGoogle]);

  const facebookRegister = async () => {
    const response = await axios.get(
      `https://graph.facebook.com/me?access_token=${accessTokenFacebook}&fields=id,name,email,picture.height(500)`
    );

    const data = {
      email: response.data.email,
      password: "facebook",
      isSocialNetwork: true,
    };

    const result = await loginUser(data);

    if (result.error) {
      navigation.push("SignUpFacebookAndGoogle", {
        data: {
          email: response.data.email,
          profilePicture: response.data.picture.data.url,
          registered: "facebook",
        },
      });
    } else {
      dispatch(update(result));
      socketRef.current.emit("connected", result._id);
      if (navigation.canGoBack()) navigation.dispatch(StackActions.popToTop());
      navigation.replace("App");
    }
  };

  const googleRegister = async () => {
    const response = await axios.get(
      "https://www.googleapis.com/userinfo/v2/me",
      {
        headers: {
          Authorization: `Bearer ${accessTokenGoogle}`,
        },
      }
    );

    const data = {
      email: response.data.email,
      password: "google",
      isSocialNetwork: true,
    };

    const result = await loginUser(data);

    if (result.error) {
      navigation.push("SignUpFacebookAndGoogle", {
        data: {
          firstName: response.data.given_name,
          lastName: response.data.family_name,
          email: response.data.email,
          profilePicture: response.data.picture,
          registered: "google",
        },
      });
    } else {
      dispatch(update(result));
      socketRef.current.emit("connected", result._id);
      if (navigation.canGoBack()) navigation.dispatch(StackActions.popToTop());
      navigation.replace("App");
    }
  };

  return (
    <SafeAreaView style={[theme.styles.container, styles.container]}>
      <View style={styles.header}>
        <Image style={styles.background} source={Background} />
        <Image style={styles.logo} source={Logo} />
        {/*<ButtonStyle
          customButtonStyle={styles.support}
          backgroundColor="white"
          color="main5"
        >
          <Ionicons
            name="chatbox-ellipses"
            color={theme.colors.main5}
            size={33}
          />
        </ButtonStyle>*/}
      </View>
      <View style={styles.body}>
        <TextStyle title customStyle={{ marginBottom: 15 }}>
          ¡BIENVENIDO!
        </TextStyle>
        <InputStyle
          placeholder="Correo o nombre de usuario"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <ButtonStyle
          customButtonStyle={{ opacity: email.length >= 3 && !sendingInformation ? 1 : 0.5 }}
          onPress={async () => {
            if (!isNavigate && email.length >= 3 && !sendingInformation) {
              const data = {
                email,
                password: "local",
                isSocialNetwork: true,
              };
          
              setSendingInformation(true);
              const result = await loginUser(data);
              setTimeout(() => setSendingInformation(false),1000);

              if (result.type === 'User not found') {
                setNotificationActive(true);
                Vibration.vibrate();
              } else {
                navigation.push("SignInPassword", { email });
                setNavigate(true);
                setTimeout(() => setNavigate(false), 500);
              }
            }
          }}
        >
          Siguiente
        </ButtonStyle>
        <TextStyle
          customStyle={{
            marginVertical: 10,
            borderTopWidth: 1,
            borderTopColor: theme.colors.colorTextLight,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.colorTextLight,
            paddingVertical: 10,
          }}
        >
          o continuar con
        </TextStyle>
        <View>
          <ButtonStyle
            backgroundColor="#FFFFFF"
            onPress={() => googlePromptAsync()}
            color={theme.colors.colorTextLight}
          >
            <Image source={GoogleLogo} style={{ width: 30, height: 20 }} />{" "}
            GOOGLE
          </ButtonStyle>
          <ButtonStyle
            backgroundColor="#FFFFFF"
            onPress={() => facebookPromptAsync()}
            color={theme.colors.colorTextLight}
          >
            <Image source={FacebookLogo} style={{ width: 24, height: 20 }} />
            ACEBOOK
          </ButtonStyle>
        </View>
        <View style={styles.signup}>
          <TextStyle>¿No tienes cuenta? | </TextStyle>
          <TouchableOpacity
            onPress={() =>
              !isNavigate &&
              (navigation.push("SignUp"),
              setNavigate(true),
              setTimeout(() => setNavigate(false), 500))
            }
          >
            <TextStyle
              color="main2"
              paragrahp
              customStyle={{ textDecorationLine: "underline" }}
            >
              REGÍSTRATE
            </TextStyle>
          </TouchableOpacity>
        </View>
      </View>
      <CustomNotification
        error
        activate={notificationActive}
        setActivate={setNotificationActive}
        title="El usuario no existe"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  background: {
    width: "100%",
    height: 200,
    borderRadius: 20,
  },
  logo: {
    width: 120,
    height: 120,
    position: "absolute",
    bottom: -40,
  },
  header: {
    width: "100%",
    position: "relative",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  body: {
    width: "100%",
    marginTop: 80,
  },
  checkBoxContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItem: "center",
    justifyContent: "center",
  },
  checkbox: {
    padding: 10,
    borderRadius: 6,
  },
  support: {
    position: "absolute",
    top: 10,
    left: 10,
    width: "auto",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  signup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
});

export default Login;

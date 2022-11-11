import { useState, useEffect } from "react";
import axios from "axios";

import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as AuthSession from "expo-auth-session";

import {
  SafeAreaView,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import background from "../../assets/resource/signup.png";

import ButtonStyle from "../../components/ButtonStyle";
import TextStyle from "../../components/TextStyle";

import Ionicons from "@expo/vector-icons/Ionicons";
import GoogleLogo from "../../assets/networks/google-light.png";
import FacebookLogo from "../../assets/networks/facebook-light.png";

import theme from "../../theme";

import { loginUser } from "../../api";

WebBrowser.maybeCompleteAuthSession();

const SignUp = ({ navigation }) => {
  const [isNavigate, setNavigate] = useState(false);
  const [exit, setExit] = useState(false);
  const [isWindow, setWindow] = useState(false);

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

  useEffect(() => {
    if (facebookResponse?.type === "success") {
      setAccessTokenFacebook(facebookResponse.authentication.accessToken);
      if (accessTokenFacebook && !isWindow) {
        facebookRegister();
        setWindow(true);
        setTimeout(() => setWindow(false), 1000);
      }
    }
  }, [facebookResponse, accessTokenFacebook]);

  useEffect(() => {
    if (googleResponse?.type === "success") {
      setAccessTokenGoogle(googleResponse.authentication.accessToken);

      if (accessTokenGoogle && !isWindow) {
        googleRegister();
        setWindow(true);
        setTimeout(() => setWindow(false), 1000);
      }
    }
  }, [googleResponse, accessTokenGoogle]);

  const facebookRegister = async () => {
    const response = await axios.get(
      `https://graph.facebook.com/me?access_token=${accessTokenFacebook}&fields=id,name,email,picture.height(500)`
    );

    const data = {
      email: response.data.email,
      profilePicture: response.data.picture.data.url,
      registered: "facebook",
    };

    const result = await loginUser({
      email: response.data.email,
      password: "||test = {{||test-test||}} = test||",
    });

    if (result.error && result.type === 'User not found') navigation.push("SignUpFacebookAndGoogle", { data })
    else Alert.alert('Opps','Cuenta ya registrada');
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
      firstName: response.data.given_name,
      lastName: response.data.family_name,
      email: response.data.email,
      profilePicture: response.data.picture,
      registered: "google",
    };

    const result = await loginUser({
      email: response.data.email,
      password: "||test = {{||test-test||}} = test||",
    });

    if (result.error && result.type === 'User not found') navigation.push("SignUpFacebookAndGoogle", { data })
    else Alert.alert('Opps','Cuenta ya registrada');
  };

  return (
    <SafeAreaView style={[theme.styles.container, styles.container]}>
      <View style={{ width: "100%" }}>
        <Ionicons
          name="arrow-back"
          size={34}
          color={theme.colors.colorTextDark}
          onPress={() => !exit && (navigation.pop(), setExit(true))}
        />
      </View>
      <View style={styles.content}>
        <Image source={background} style={styles.background} />
        <TextStyle subtitle>¡BIENVENIDO A PENSSUM!</TextStyle>
        <View style={styles.options}>
          <View>
            <ButtonStyle
              onPress={() =>
                !isNavigate &&
                (navigation.push("SignUpEmail"),
                setNavigate(true),
                setTimeout(() => setNavigate(false), 500))
              }
            >
              Regístrate con un correo electrónico
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
            <ButtonStyle
              backgroundColor="#FFFFFF"
              onPress={() => !exit && googlePromptAsync()}
              color={theme.colors.colorTextLight}
            >
              <Image source={GoogleLogo} style={{ width: 30, height: 20 }} />{" "}
              GOOGLE
            </ButtonStyle>
            <ButtonStyle
              backgroundColor="#FFFFFF"
              onPress={() => !exit && facebookPromptAsync()}
              color={theme.colors.colorTextLight}
            >
              <Image source={FacebookLogo} style={{ width: 24, height: 20 }} />
              ACEBOOK
            </ButtonStyle>
          </View>
          <View style={styles.login}>
            <TextStyle>¿Ya estás registrado? | </TextStyle>
            <TouchableOpacity
              onPress={() => !exit && (navigation.pop(), setExit(true))}
            >
              <TextStyle
                color="main2"
                customStyle={{ textDecorationLine: "underline" }}
              >
                Iniciar sesión
              </TextStyle>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
  },
  background: {
    width: "80%",
    height: 240,
    marginBottom: 40,
  },
  content: {
    alignItems: "center",
    width: "100%",
    marginVertical: 30,
  },
  options: {
    width: "100%",
    marginVertical: 30,
  },
  login: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SignUp;

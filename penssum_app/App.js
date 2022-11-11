import { LogBox } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import MainStack from "./navigation/MainStack";
import { store, persistor } from "./helpers/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";

export default function App() {
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
  ]);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <MainStack />
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

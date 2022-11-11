import { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import theme from "../theme";

const styles = StyleSheet.create({
  default: {
    width: "100%",
    borderRadius: 25,
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  defaultInput: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 20,
    color: theme.colors.colorTextLight,
  },
  button: { width: "12%" },
  splitInTwo: { width: '49%' }
});

const InputStyle = ({
  placeholder,
  keyboardType,
  secureTextEntry,
  value,
  customStyleInput,
  onChangeText,
  componentLeft,
  componentRight,
  split,
  multiline,
  numberOfLines,
  maxLength,
  editable = true,
  selectTextOnFocus = true,
  disabled
}) => {
  const [isShow, setShow] = useState(false);

  const containerOption = [
    styles.default,
    customStyleInput && customStyleInput,
    split === 2 && styles.splitInTwo,
    multiline && { maxHeight: 120 }
  ];

  const styleOption = [
    styles.defaultInput,
    secureTextEntry ? { width: "88%" } : { width: "100%" },
    componentRight && { width: '75%' },
  ];

  return (
    <View style={[containerOption, { backgroundColor: disabled ? '#CCCCCC' : '#FFFFFF' }]}>
      {componentLeft && componentLeft()}
      <TextInput
        cursorColor={theme.colors.colorTextLight}
        style={styleOption}
        value={value}
        onChangeText={text => onChangeText(text)}
        keyboardType={keyboardType}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry && !isShow}
        multiline={multiline}
        maxLength={maxLength}
        numberOfLines={numberOfLines}
        editable={editable} 
        selectTextOnFocus={selectTextOnFocus}
        selectionColor="#AAAAAA"
      />
      {componentRight && componentRight()}
      {secureTextEntry && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShow(!isShow)}
        >
          <Ionicons
            name={isShow ? "eye" : "eye-off"}
            size={25}
            color={theme.colors.colorTextLight}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default InputStyle;

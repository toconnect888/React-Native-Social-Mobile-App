///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///                   
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////
import { View } from 'react-native';
import 'react-native-url-polyfill/auto'
import { LoginProvider } from "../../../lib/sessionProvider";
import { Stack } from "expo-router";

export default function App() {

  return (
    <View className="flex-auto absolute top-0 bottom-0 right-0 left-0 bg-[#3f3f3f]">
      <LoginProvider>
        <Stack >
          <Stack.Screen
                name="index"
                options={{
                headerShown: false
                }}
            />
            <Stack.Screen
                name="lookingFor"
                options={{
                headerShown: false
                }}
            />
            <Stack.Screen
                name="location"
                options={{
                headerShown: false
                }}
            />
            <Stack.Screen
                name="bio"
                options={{
                headerShown: false
                }}
            />
        </Stack>
        
      </LoginProvider>
    </View>
  );
}
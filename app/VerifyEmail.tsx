import { View, Text, TouchableOpacity, Alert, Image, KeyboardAvoidingView } from "react-native";
import { supabase } from "../lib/supabase";
import { useState } from "react";
import { Input } from "react-native-elements";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";

export default function VerifyEmail() {
    const [token, setToken] = useState('')
    const navigation = useRouter();
    const params = useLocalSearchParams();
    
    const { email:emailParam } = params;
    const email = Array.isArray(emailParam) ? emailParam[0] : emailParam || '';

    async function verifyEmail() {
        try {
            const { data, error } = await supabase.auth.verifyOtp({
              email,
              token,
              type: 'email'
            });

            if (error) {
              Alert.alert(error.message);
              return;
            }
            else {
                navigation.push({pathname: '/'})
            }
          } catch (err) {
            console.error(err);
          }
    }

    async function resendEmail() {
        const { data, error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            
          })

          if (error) {
            Alert.alert(error.message);
          }
          else 
            Alert.alert('Email Sent!')
        
    }

    return (
        <View className="px-12 flex-auto justify-center bg-[#3f3f3f]">
            <KeyboardAvoidingView behavior="position" >
                <View className='flex justify-center items-center'>
                    <Image className=' w-60 h-60' source={require('../assets/mail.png')} />
                </View>
                <Text className="text-center text-white text-4xl mt-5">Verify your Email</Text>
                <Text className="text-center text-gray-500 text-md my-4">Enter the code sent to {email}</Text>
                <Input
                onChangeText={(text) => setToken(text)}
                value={token}
                autoCapitalize={'none'}
                inputContainerStyle={{borderBottomWidth: 0}}
                className="bg-white rounded-full text-center border py-2"
                placeholder="Enter Code Here"/>
                <View className="flex flex-row justify-center items-center my-4 text-[#ffba03]">
                    <TouchableOpacity onPress={resendEmail}>
                        <Text className="text-[#ffba03]">Resend Email</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity className="bg-[#ffba03] rounded-full mx-16" onPress={verifyEmail}>
                    <Text className="text-center font-medium text-white py-4 text-xl">Confirm</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    )
}
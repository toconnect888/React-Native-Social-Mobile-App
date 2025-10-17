///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///                   
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////
import { useContext, useEffect, useReducer } from 'react'
import { View, Text, Image, TouchableOpacity  } from 'react-native'
import { LoginContext } from "../../lib/sessionProvider";
import { Navigator, Stack, useRouter } from "expo-router";

export default function setupIndex() {
    const auth = useContext(LoginContext)
    const navigation = useRouter()
    
    useEffect(() => {
        if (auth.session) {
            //Alert.alert(auth.session?.user?.email + ' is logged in')
            //auth.setSession(auth.session)
        }
    }, [auth.session]); 

    

    return (
        <>
        
        <View className="h-screen" >
            <View className="flex justify-center items-center mb-0 mt-auto ">
                <Image className="w-96 h-96" source={require('../../assets/profile.png')}  />
            </View>
            <View className="flex justify-center items-center mb-5 ">
                <Text className="text-3xl text-white font-bold ">Create Your Profile!</Text>
                <View className="flex justify-center items-center mt-5">
                    <Text className="text-gray-400 text-md -mb-10 text-center">
                        Now it's time for you to create a profile in order to meet new people!
                    </Text>
                </View>
            </View>
            <TouchableOpacity className="bg-[#ffba03] rounded-full mx-8 py-2 mb-20 mt-auto"
            onPress={() => {
                navigation.push('/setup/name')
            }}>
                <View className="flex justify-center items-center">
                    <Text className="text-white text-lg">Start</Text>
                </View>
            </TouchableOpacity>


        </View>
        </>
    )
}
///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///                   
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////
import React, { useState } from 'react'
import { Alert, Text, View, AppState, TouchableOpacity } from 'react-native'
import { supabase } from '../lib/supabase'
import { useRouter, Link } from 'expo-router';
import { Image } from "react-native-elements";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener('change', (state) => {
    if (state === 'active') 
        supabase.auth.startAutoRefresh()
    else
        supabase.auth.stopAutoRefresh()
})

export default function Auth() {
    const navigation = useRouter();

    return (

    <View className='px-6 py-6 h-screen'>



            <View className='flex space-between'style={{width: '100%', height: '80%'}} >
                <Image style={{width: '60%', height: '30%'}}  source={require('../assets/LOGO_Tagline.png')} />
                <Image className="-mb-10  " style={{width: '100%', height:200}}  source={require('../assets/hangout.jpg')} />
                <Text  className='mt-10 text-white text-center text-lg'>The Hub for Stronger Toronto Social Connections</Text>
                <Text className='text-white text-center mt-6  text-md'>Meeting up for shaved activities anytime, anywhere in Toronto</Text>
            </View>
            <TouchableOpacity className='bg-[#ffba03] rounded-full mx-8' onPress={() => navigation.push('/signup')}>
                <Text className='text-center text-white py-4 text-4xl'>Sign Up</Text>
            </TouchableOpacity>
            <View className='flex flex-row justify-center items-center font-bold my-6 '>
                <Text className=" text-lg text-white"> 
                    Already have an account?
                </Text>
                <Link className='ml-2 text-lg font-medium text-[#ffba03] underline' 
                    href='/signin'>
                    Log In
                </Link>
            </View>

    </View>
    )
}
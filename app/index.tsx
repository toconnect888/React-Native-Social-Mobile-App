///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///                   
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////

import { View, Text, Alert } from 'react-native';
import 'react-native-url-polyfill/auto'
import Account from './setup/index';
import { useContext, useEffect, useState } from "react";
import { LoginContext,} from "../lib/sessionProvider";
import { supabase } from "../lib/supabase";
import Auth from "./auth";
import { Redirect, Stack } from "expo-router";

export default function Index() {
  const auth = useContext(LoginContext)
  const [isSetup, setIsSetup] = useState(false)
  const [loading, setLoading] = useState(true)

  async function isProfileSetup() {
    try {
        setLoading(true)
        if (!auth.session?.user) throw new Error('No user on the session!')

        const { data, error, status} = await supabase
            .from('profiles')
            .select('full_name, avatar_url, location, age_range, bio, interests, looking_for')
            .eq('id', auth.session?.user.id)
            .single()
        
            if (error && status !== 406) {
                throw error
            }
            if (data?.full_name !== null && data?.full_name !== '' && data?.avatar_url !== null && data?.avatar_url !== '' && data?.location !== null && data?.location !== '' && data?.age_range !== null && data?.age_range !== '' && data?.bio !== null && data?.bio !== '' && data?.interests !== null && data?.interests?.length != 0 && data?.looking_for !== null && data?.looking_for?.length != 0) {
                setIsSetup(true)
            }
            else {
                setIsSetup(false)
            }
           
        }
        catch (error) {
            if (error instanceof Error) {
              Alert.alert(error.message)
            }
        }
        finally {
            setLoading(false)
        }
  }

  useEffect(() => {
    if (auth.session) {
      isProfileSetup()
    }
    else
      setLoading(false)
  }, [auth.session]);

  return (
    <View className="flex-auto absolute top-0 bottom-0 right-0 left-0 bg-black">
      <Stack.Screen options={{headerShown: false, gestureEnabled:false}} />
      {loading &&
      <View >
        <View className=' flex justify-center items-center mt-96 '>
          <Text className="text-xl text-[#ffba03] font-bold ">Loading...</Text>
        </View>
      </View>} 

      {!loading &&
      <View >
        { auth.session && auth.session?.user 
          ? 
          isSetup
          ? <Redirect href='/(tabs)/Home' /> 
          : <Account />
          : <Auth />
        }
      </View>}
    </View>
  );
}


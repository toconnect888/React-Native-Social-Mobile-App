///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///                   
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////
import { useContext, useEffect, useReducer, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { View, Alert, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { LoginContext } from "../../lib/sessionProvider";
import Avatar from "../../components/Avatar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Dropdown } from "react-native-element-dropdown";
import { initialState, interests, lookingFor, reducer } from "../profile/_layout";
import { userPublic } from "../goingList/_layout";

export default function publicProfile() {
    const { ...user } = useLocalSearchParams<userPublic>();
    const [state, dispatch] = useReducer(reducer, initialState);
    const auth = useContext(LoginContext)
    const navigation = useRouter();
    //const params = useLocalSearchParams();

    useEffect(() => {
        if (auth.session) {
            getProfile()
            //auth.setSession(auth.session)
        }
        //Alert.alert(state.isNamePage)
    }, [auth.session]); 

    async function getProfile() {
        try {
            dispatch({type: 'setLoading', payload: true})
            if (!auth.session?.user) throw new Error('No user on the session!')

            const { data, error, status} = await supabase
                .from('profiles')
                .select('full_name, avatar_url, location, age_range, bio, interests, looking_for')
                .eq('id', user.id)
                .single()
            
                if (error && status !== 406) {
                    throw error
                }

                if (data) {
                    dispatch({ type: 'setName', payload: data.full_name })
                    dispatch({ type: 'setAvatarUrl', payload: data.avatar_url })
                    dispatch({ type: 'setLocation', payload: data.location })
                    dispatch({ type: 'setAgeRange', payload: data.age_range })
                    dispatch({ type: 'setBio', payload: data.bio })
                    dispatch({ type: 'setInterests', payload: data.interests })
                    dispatch({ type: 'setLookingFor', payload: data.looking_for })
                }
            }
            catch (error) {
                if (error instanceof Error)
                    Alert.alert(error.message)
            }
            finally {
                dispatch({ type: 'setLoading', payload: false })
            }
    }
 

    return (
        
        <KeyboardAwareScrollView keyboardDismissMode='on-drag' scrollEnabled={false} className="bg-[#151515]">
                <View className="mt-1 px-4 flex flex-col">
                    <View className="flex flex-row bg-[#594a25] px-4 -mx-6" >
                        <View className="py-4 self-stretch mt-10 ml-2 w-1/2">
                            <Text className="text-white text-4xl font-bold">{state.name}</Text>
                            <View className="py-2 flex flex-row gap-2">
                                <Ionicons name='location' size={20} color='white'/>
                                <Text className="text-white text-sm">{state.location}</Text>
                                <Text className="text-white text-sm">{state.ageRange}</Text>
                            </View>

                        </View>

                        <Avatar
                            size={125}
                            url={state.avatarUrl}
                            uploadVisible={false}

                            classNameParams="mr-0 ml-auto mt-2"
                        />
                    </View>
                    <KeyboardAwareScrollView className="py-4 h-full">
                        <Text className="text-white text-lg font-bold mb-2">About me</Text>
                        <View className="flex flex-row gap-2" style = {{width: '95%'}}>
                            <Text
                            className="text-white text-sm border-[#ffba03] border rounded-xl"

                            style={{
                                width: '97%',
                                maxHeight: 150,
                                minHeight: 100,
                                borderColor: '#ffba03',
                                borderWidth: 1,
                                borderRadius: 10,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderStyle: 'dotted',
                            }}
                            > {state.bio}</Text>
                        </View >
                        <Text className="text-white text-lg font-bold mb-2">Interests</Text>
                        <View className="flex flex-col " >
                            <ScrollView horizontal={true} style = {{}} className="flex flex-row gap-2 mb-2" >
                            {state.interests && state.interests.map((interest, index) => (
                            <View key={index} className=" border border-white w-content h-[32px] rounded-xl flex flex-row">
                                <Text className="text-white text-sm p-1">{interest}</Text>

                           </View>))
                           }
                           </ScrollView>
                        </View>



                        <Text className="text-white text-lg font-bold mb-2 mt-6">Looking To</Text>
                        <View className="flex flex-col" >
                        <ScrollView horizontal={true} className="flex flex-row gap-2 mb-2">
                            {state.lookingFor && state.lookingFor.map((lookingFor, index) => (
                            <View key={index} className=" border border-white w-content h-[32px] rounded-xl flex flex-row">
                                <Text className="text-white text-sm p-1">{lookingFor}</Text>

                           </View>))
                           }

                        </ScrollView>

                        </View>





                    </KeyboardAwareScrollView>

            </View>
        </KeyboardAwareScrollView>
    )
};


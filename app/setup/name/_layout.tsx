///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///                   
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////
import { useContext, useEffect, useReducer } from 'react'
import { supabase } from '../../../lib/supabase'
import { View, Alert, Text, TouchableOpacity } from 'react-native'
import {  Input } from 'react-native-elements'
import { LoginContext } from "../../../lib/sessionProvider";

import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { initialState, reducer } from "../../profile/_layout";

export default function Name() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const auth = useContext(LoginContext)
    const navigation = useRouter();
    const params = useLocalSearchParams();

    useEffect(() => {
        if (auth.session) {
            getProfile()
        
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
                .eq('id', auth.session?.user.id)
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

    async function updateName({
        full_name
    }: {
        full_name: string
    }) {
        try {
            dispatch({ type: 'setLoading', payload: true })
            if (!auth.session?.user) throw new Error('No user on the session!')

            const updates = {
                id: auth.session?.user.id,
                full_name,
                updated_at: new Date(),
            }

            const { error } = await supabase.from('profiles').upsert(updates)

            if (error) {
                throw error
            }
        }
        catch (error) {
            if (error instanceof Error) {
                Alert.alert(error.message)
            }
        }
        finally {
            dispatch({ type: 'setLoading', payload: false })
            }
    }


    return (
        
        <KeyboardAwareScrollView keyboardDismissMode='on-drag' scrollEnabled={false} className="bg-[#151515]">
        
            <View className="h-screen">
            <View className="py-4 mt-20 flex justify-center items-center">
                <Text className="text-4xl text-white font-bold ">What's your name?</Text>
            </View>
            
            <View className="py-4 self-stretch mx-10">
                <Input 
                placeholder="Name" 
                value={state.name || ''} 
                onChangeText={(text) => dispatch({type: 'setName', payload: text})} 
                autoCapitalize={'none'}
                inputContainerStyle={{borderBottomWidth: 0}}
                className=" border-[#ffba03] border rounded-xl pl-2 text-white"/>
                <Text className="text-red-400 text-md text-left ml-2">{state.error}</Text>
            </View>
            <TouchableOpacity className="bg-[#ffba03] rounded-full mx-8 py-4 mb-12 mt-auto"
                onPress={async () => {
                    if(state.name && state.name.length > 0) {
                        await updateName({full_name: state.name});
                        navigation.push({pathname: '/setup/image'});
                    }
                    else
                        dispatch({type: 'setError', payload: 'Name cannot be empty!'});
                                }}>
                <View className="flex justify-center items-center">
                    <Text className="text-white text-xl font-bold">Next</Text>
                </View>
            </TouchableOpacity> 
            </View>
            </KeyboardAwareScrollView>
    )};
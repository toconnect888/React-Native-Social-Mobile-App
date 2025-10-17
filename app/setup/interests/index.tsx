///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///                   
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////
import { useContext, useEffect, useReducer } from 'react'
import { supabase } from '../../../lib/supabase'
import { View, Alert, Text, TouchableOpacity, ScrollView } from 'react-native'
import {  Input } from 'react-native-elements'
import { LoginContext } from "../../../lib/sessionProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { initialState, interests, reducer } from "../../profile/_layout";
import { Dropdown } from "react-native-element-dropdown";

import Ionicons from '@expo/vector-icons/Ionicons';


export default function interets() {
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

    async function removeFromColumn(type: string, value: string) {
        try {
            dispatch({ type: 'setLoading', payload: true })
            if (!auth.session?.user) throw new Error('No user on the session!')

            if(type === 'interests') {
                const newInterests = state.interests.filter((interest) => interest !== value)
                dispatch({ type: 'setInterests', payload: newInterests })

                const { error } = await supabase
                    .from('profiles')
                    .update({ interests: newInterests })
                    .eq('id', auth.session?.user.id)

                if (error) {
                    throw error
                }

                await getProfile()

                }
                else if(type === 'lookingFor') {
                    const newLookingFor = state.lookingFor.filter((lookingFor) => lookingFor !== value)
                    dispatch({ type: 'setLookingFor', payload: newLookingFor })

                    const { error } = await supabase
                        .from('profiles')
                        .update({ looking_for: newLookingFor })
                        .eq('id', auth.session?.user.id)

                    if (error) {
                        throw error
                    }

                    await getProfile()
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

    async function AddToColumn(type: string, value: string) {
        try {
            dispatch({ type: 'setLoading', payload: true })
            if (!auth.session?.user) throw new Error('No user on the session!')

                if(type === 'interests') {
                const newInterests = [...state.interests, value]
                const { error } = await supabase
                    .from('profiles')
                    .update({ interests: newInterests })
                    .eq('id', auth.session?.user.id)

                if (error) {
                    throw error
                }

                await getProfile()
            }
            else if(type === 'lookingFor') {
                const newLookingFor = [...state.lookingFor, value]
                const { error } = await supabase
                    .from('profiles')
                    .update({ looking_for: newLookingFor })
                    .eq('id', auth.session?.user.id)

                if (error) {
                    throw error
                }

                await getProfile()
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
        
            <View className="h-screen mx-8">
            <View className="py-4 mt-20 flex justify-center items-center">
                <Text className="text-4xl text-white font-bold ">What are your interests?</Text>
                <Text className="text-md text-white font-bold mx-6 mt-10 ">Select at least one interest for future activities.</Text>

            </View>
            
            <View className="flex flex-col mt-6">
                            <ScrollView horizontal={true} className="flex flex-row gap-2 mb-2">
                            {state.interests && state.interests.map((interest, index) => (
                            <View key={index} className=" border border-white w-content h-[32px] rounded-xl flex flex-row">
                                <Text className="text-white text-sm p-1">{interest}</Text>
                                <TouchableOpacity className="py-2 px-1" onPress={() => removeFromColumn('interests', interest)}>
                                    <Ionicons name='close' size={13} color='white'/>
                                </TouchableOpacity>

                           </View>))
                           }
                           </ScrollView>
                                <Dropdown
                                    style={{
                                        borderColor: '#ffba03', // Similar to border-[#ffba03]
                                        borderWidth: 1, // Similar to border
                                        borderRadius: 10, // Similar to rounded-xl
                                        paddingHorizontal: 10, // Similar to px-2
                                        borderStyle: 'dotted',
                                        width: '100%'
                                    }}
                                    placeholderStyle={{
                                        color: 'white', // Similar to text-white
                                        fontSize: 14, // Similar to text-sm
                                        padding: 1, // Similar to p-1
                                    }}
                                    selectedTextStyle={{
                                        color: 'white', // Similar to text-white
                                        fontSize: 14, // Similar to text-sm
                                        fontWeight: 'bold', // Similar to font-bold
                                    }}
                                    inputSearchStyle={{
                                        color: 'white', // Similar to text-white
                                        fontSize: 14, // Similar to text-sm
                                        padding: 1, // Similar to p-1
                                    }}
                                    itemContainerStyle={{
                                        backgroundColor: '#151515', // Similar to bg-[#151515]
                                        borderColor: '#ffba03', // Similar to border-[#ffba03]
                                        borderRadius: 10, // Similar to rounded-xl
                                        paddingHorizontal: 10, // Similar to px-2
                                        paddingVertical: 5, // Similar to py-1
                                    }}
                                    itemTextStyle={{
                                        color: 'white', // Similar to text-white
                                        fontSize: 14, // Similar to text-sm
                                        padding: 1, // Similar to p-1
                                    }}
                                    containerStyle={{
                                        backgroundColor: '#151515', // Similar to bg-[#151515]
                                        borderColor: '#ffba03', // Similar to border-[#ffba03]
                                        borderRadius: 10, // Similar to rounded-xl
                                        paddingHorizontal: 10, // Similar to px-2
                                        paddingVertical: 5, // Similar to py-1
                                    }}
                                    
                                    data={interests.filter((item) => !state.interests.includes(item.label))}
                                    search
                                    maxHeight={400}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Add More"
                                    searchPlaceholder="Search..."
                                    onChange={async item => {
                                    await AddToColumn('interests', item.label)
                                    }}
                                    
                                />
                        

                <Text className="text-red-400 text-md text-left ml-2">{state.error}</Text>
            </View>
            <TouchableOpacity className="bg-[#ffba03] rounded-full mx-8 py-4 mb-12 mt-auto"
                onPress={() => {
                    if(state.interests?.length > 0) {
                        navigation.push({pathname: '/setup/interests/lookingFor'});
                    }
                    else
                        dispatch({type: 'setError', payload: 'Select atleast one interest!'});
                                }}>
                <View className="flex justify-center items-center">
                    <Text className="text-white text-xl font-bold">Next</Text>
                </View>
            </TouchableOpacity> 
            </View>
            </KeyboardAwareScrollView>
    )};
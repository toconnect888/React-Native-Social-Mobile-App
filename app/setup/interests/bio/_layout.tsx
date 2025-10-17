///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///                   
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////
import { useContext, useEffect, useReducer } from 'react'
import { supabase } from '../../../../lib/supabase'
import { View, Alert, Text, TouchableOpacity, TextInput } from 'react-native'
import {  Input } from 'react-native-elements'
import { LoginContext } from "../../../../lib/sessionProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { initialState, reducer } from "../../../profile/_layout";
import { Dropdown } from "react-native-element-dropdown";


export default function Bio() {
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

    async function updateBio() {
        try {
            dispatch({ type: 'setLoading', payload: true })
            if (!auth.session?.user) throw new Error('No user on the session!')

                const newBio = state.bio
                const { error } = await supabase
                    .from('profiles')
                    .update({ bio: newBio })
                    .eq('id', auth.session?.user.id)

                if (error) {
                    throw error
                }

                await getProfile()
           
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
                <Text className="text-4xl text-white font-bold mx-6 ">Add Bio</Text>
                <Text className="text-md text-white font-bold mx-6 mt-10 ">Introduce yourself to others on TOConnect, this can be short and simple.</Text>

                <View className="flex flex-row gap-2 mt-6">
                            <TextInput
                            placeholder="Introduce yourself to others"
                            className="text-white text-sm border-[#ffba03] border rounded-xl " 
                            value={state.bio || ''} 
                            onChangeText={(bio) => {dispatch({type: 'setBio', payload: bio})}} 
                            onEndEditing={async () => {
                                updateBio()
                            }}
                            style={{
                                width: '95%',
                                maxHeight: 150,
                                minHeight: 100,
                                borderColor: '#ffba03',
                                borderWidth: 1,
                                borderRadius: 10,
                                paddingHorizontal: 10,
                                borderStyle: 'dotted',
                                maxLength: 5
                            }}
                            
                            multiline
                            numberOfLines={4}
                            
                            maxLength={200}
                            
                            />
                        </View>
                          
                <Text className="text-red-400 text-md text-left ml-2">{state.error}</Text>
            </View>
            <TouchableOpacity className="bg-[#ffba03] rounded-full mx-8 py-4 mb-12 mt-auto"
                onPress={() => {
                    if(state.bio != '') {
                        navigation.push({pathname: '/'});
                    }
                    else
                        dispatch({type: 'setError', payload: 'Bio cannot be empty!'});
                                }}>
                <View className="flex justify-center items-center">
                    <Text className="text-white text-xl font-bold">Next</Text>
                </View>
            </TouchableOpacity> 
            </View>
            </KeyboardAwareScrollView>
    )};
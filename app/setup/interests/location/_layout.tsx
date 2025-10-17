///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///                   
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////
import { useContext, useEffect, useReducer } from 'react'
import { supabase } from '../../../../lib/supabase'
import { View, Alert, Text, TouchableOpacity } from 'react-native'
import {  Input } from 'react-native-elements'
import { LoginContext } from "../../../../lib/sessionProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { initialState, reducer } from "../../../profile/_layout";
import { Dropdown } from "react-native-element-dropdown";

const location = [
    { label: 'Toronto', value: '1' },
    { label: 'North York', value: '2' },
    { label: 'Markham', value: '3' },
    { label: 'Scarborough', value: '4' },
    { label: 'Mississauga', value: '5' },
    { label: 'Brampton', value: '6' },
    { label: 'Oakville', value: '7' },
  ];

export default function Location() {
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

    async function updateLocation({
        location
    }: {
        location: string
    }) {
        try {
            dispatch({ type: 'setLoading', payload: true })
            if (!auth.session?.user) throw new Error('No user on the session!')

            const updates = {
                id: auth.session?.user.id,
                location,
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
                <Text className="text-4xl text-white font-bold mx-6 ">Where are you located?</Text>
            </View>
            <Text className="text-white text-lg text-center mx-6">{state.location}</Text>
            
            <View className="py-4 self-stretch mx-10">
                <Dropdown
                style={{
                    borderColor: '#ffba03', // Similar to border-[#ffba03]
                    borderWidth: 1, // Similar to border
                    borderRadius: 10, // Similar to rounded-xl
                    paddingHorizontal: 10, // Similar to px-2
                    borderStyle: 'dotted',
                    width: '100%',
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
                
                data={location.filter((item) => !(state.location == item.label))}
                maxHeight={400}
                labelField="label"
                valueField="value"
                placeholder="Chose your location"
                searchPlaceholder="Search..."
                onChange={async item => {
                    dispatch({type: 'setLocation', payload: item.label})
                    await updateLocation({location: item.label})
                }}
                />                 
                <Text className="text-red-400 text-md text-left ml-2">{state.error}</Text>
            </View>
            <TouchableOpacity className="bg-[#ffba03] rounded-full mx-8 py-4 mb-12 mt-auto"
                onPress={() => {
                    if(state.location != '') {
                        navigation.push({pathname: '/setup/interests/bio'});
                    }
                    else
                        dispatch({type: 'setError', payload: 'Chose a location!'});
                                }}>
                <View className="flex justify-center items-center">
                    <Text className="text-white text-xl font-bold">Next</Text>
                </View>
            </TouchableOpacity> 
            </View>
            </KeyboardAwareScrollView>
    )};
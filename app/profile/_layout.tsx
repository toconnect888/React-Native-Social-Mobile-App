import { useContext, useEffect, useReducer } from 'react'
import { supabase } from '../../lib/supabase'
import { View, Alert, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { LoginContext } from "../../lib/sessionProvider";
import Avatar from "../../components/Avatar";
import { useRouter } from "expo-router";
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Ionicons from '@expo/vector-icons/Ionicons';
import { Dropdown } from "react-native-element-dropdown";

export type State = {
    loading: boolean;
    name: string;
    avatarUrl: string;
    interests: string[];
    lookingFor: string[];
    location: string;
    ageRange: string;
    bio: string;
    error: string;
};

export type Action =
    | { type: 'setLoading'; payload: boolean }
    | { type: 'setName'; payload: string }
    | { type: 'setAvatarUrl'; payload: string }
    | { type: 'setInterests'; payload: string[] }
    | { type: 'setLookingFor'; payload: string[] }
    | { type: 'setLocation'; payload: string }
    | { type: 'setAgeRange'; payload: string }
    | { type: 'setBio'; payload: string }
    | { type: 'setError'; payload: string }

export const initialState: State = {
    loading: true,
    name: '',
    avatarUrl: '',
    interests: [],
    lookingFor: [],
    location: '',
    ageRange: '',
    bio: '',
    error: ''
};

export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'setLoading':
            return { ...state, loading: action.payload };
        case 'setName':
            return { ...state, name: action.payload };
        case 'setAvatarUrl':
            return { ...state, avatarUrl: action.payload };
        case 'setInterests':
            return { ...state, interests: action.payload };
        case 'setLookingFor':
            return { ...state, lookingFor: action.payload };
        case 'setLocation':
            return { ...state, location: action.payload };
        case 'setAgeRange':
            return { ...state, ageRange: action.payload };
        case 'setBio':
            return { ...state, bio: action.payload };
        case 'setError':
            return { ...state, error: action.payload };
    
        default:
            return state;
    }
}

export const interests = [
    { label: 'Social networking', value: '1' },
    { label: 'Dancing Partners', value: '2' },
    { label: 'Art & culture activities', value: '3' },
    { label: 'Music activites', value: '4' },
    { label: 'Career & Business networking', value: '5' },
    { label: 'Sports & Gym buddies', value: '6' },
    { label: 'Food & Drink activities', value: '7' },
    { label: 'Travel buddies', value: '8' },
    { label: 'Recreation activities', value: '9' },
    { label: 'Meet friends', value: '10' },
    { label: 'Companionship', value: '11' },
  ];

export const lookingFor = [
    { label: 'Make new friends & Socialize', value: '1' },
    { label: 'Practice a hobby with others', value: '2' },
    { label: 'Build professional network', value: '3' },
  ];


export default function Name() {
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

    async function updateImage({
        avatar_url,
    }: {
        avatar_url: string
    }) {
        try {
            dispatch({ type: 'setLoading', payload: true })
            if (!auth.session?.user) throw new Error('No user on the session!')

            const updates = {
                id: auth.session?.user.id,
                avatar_url,
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
        
        <KeyboardAwareScrollView keyboardDismissMode='on-drag'  className="bg-[#151515]">
                <View className=" flex flex-col ">
                    <View className="flex flex-row bg-[#594a25] px-10 -mx-6 " style ={{alignItems:'center'}}>
                        <View className="py-4 self-stretch mt-10 ml-2 w-1/2">
                            <Text className="text-white text-4xl font-bold">{state.name}</Text>
                            <View className="py-2 self-stretch">
                                <Text className="text-white text-xs ">{auth.session?.user?.email}</Text>
                            </View>
                            <View className="py-2 flex flex-row gap-2">
                                <Ionicons name='location' size={20} color='white'/>
                                <Text className="text-white text-sm">{state.location}</Text>
                                <Text className="text-white text-sm">{state.ageRange}</Text>
                            </View>
                        
                        </View>
                       
                        <Avatar

                            size={125}
                            url={state.avatarUrl}
                            uploadVisible={true}
                            onUpload={(url: string) => {
                            dispatch({type: 'setAvatarUrl', payload: url})
                            updateImage({ avatar_url: url})
                            }}
                            classNameParams="mr-0 ml-auto mt-2"
                           
                            
                            
                        />
                       
                    </View>
                    <KeyboardAwareScrollView className="py-4 px-7 h-full ">
                        <Text className="text-white text-lg font-bold mb-2">About me</Text>
                        <View className="flex flex-row gap-2">
                            <TextInput
                            placeholder="Introduce yourself to others"
                            className="text-white text-sm border-[#ffba03] border rounded-xl " 
                            value={state.bio || ''} 
                            onChangeText={(bio) => {dispatch({type: 'setBio', payload: bio})}} 
                            onEndEditing={async () => {
                                updateBio()
                            }}
                            style={{
                                width:'97%',
                                maxHeight: 150,
                                minHeight: 100,
                                borderColor: '#ffba03',
                                borderWidth: 1,
                                borderRadius: 10,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderStyle: 'dotted',
                                maxLength: 5
                            }}
                            
                            multiline
                            numberOfLines={4}
                            
                            maxLength={200}
                            
                            />
                        </View>
                        <Text className="text-white text-lg mt-6 font-bold mb-2">Interests</Text>
                        <View className="flex flex-col">
                        <MaskedView
                            style={{ flexDirection: 'row'}}
                            maskElement={
                                <LinearGradient
                                    style={{ flex: 1,width:"150%" }}
                                    colors={['white', 'transparent']}
                                    start={{ x: 0, y: 0.2 }}
                                    end={{ x: 1, y: 0.2 }}

                                />
                            }
        >
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
                           </MaskedView>
                                <Dropdown
                                    style={{
                                        borderColor: '#ffba03', // Similar to border-[#ffba03]
                                        borderWidth: 1, // Similar to border
                                        borderRadius: 10, // Similar to rounded-xl
                                        paddingHorizontal: 10, // Similar to px-2
                                        borderStyle: 'dotted',
                                        width: '50%',
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
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Add More"
                                    searchPlaceholder="Search..."
                                    onChange={async item => {
                                    await AddToColumn('interests', item.label)
                                    }}
                                    
                                />
                        </View>


                        
                        <Text className="text-white text-lg font-bold mb-2 mt-6">Looking To</Text>
                        <View className="flex flex-col">
                        <MaskedView
                        style={{ flexDirection: 'row' }}
                        maskElement={
                            <LinearGradient
                                style={{ flex: 1 , width: "150%"}}
                                colors={['white', 'transparent']}
                                start={{ x: 0, y: 0.2 }}
                                end={{ x: 1, y: 0.2 }}
                            />
                        }>
                        <ScrollView horizontal={true} className="flex flex-row gap-2 mb-2">
                            {state.lookingFor && state.lookingFor.map((lookingFor, index) => (
                            <View key={index} className=" border border-white w-content h-[32px] rounded-xl flex flex-row">
                                <Text className="text-white text-sm p-1">{lookingFor}</Text>
                                <TouchableOpacity className="py-2 px-1" onPress={() => removeFromColumn('lookingFor', lookingFor)}>
                                    <Ionicons name='close' size={13} color='white'/>
                                </TouchableOpacity>

                           </View>))
                           }

                        </ScrollView>
                        </MaskedView>
                        <Dropdown
                                    style={{
                                        borderColor: '#ffba03', // Similar to border-[#ffba03]
                                        borderWidth: 1, // Similar to border
                                        borderRadius: 10, // Similar to rounded-xl
                                        paddingHorizontal: 10, // Similar to px-2
                                        borderStyle: 'dotted',
                                        width: '50%',
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
                                    
                                    data={lookingFor.filter((item) => !state.lookingFor.includes(item.label))}
                                    search
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Add More"
                                    searchPlaceholder="Search..."
                                    onChange={async item => {
                                    await AddToColumn('lookingFor', item.label)
                                    }}
                                    
                                />
                        </View> 
                       
                        
                    
                  
    
                    </KeyboardAwareScrollView>
                  
                
                <View className="absolute px-4 top-0 left-2 flex flex-row gap-2">
                    <View className='py-2 self-stretch'>
                        <TouchableOpacity 
                            className="bg-[#292929] rounded-xl px-2 "
                            onPress={() => {
                                supabase.auth.signOut();
                                navigation.navigate('/'); 
                            }} >
                            <Text className="text-center text-sm text-white py-1">
                            Sign Out
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {/*<View className="py-2 self-stretch">
                        <TouchableOpacity 
                            className="bg-[#ffba03] rounded-xl px-2 "
                            onPress={() => updateProfile({full_name: state.name, avatar_url: state.avatarUrl, page: -1})} >
                            <Text className="text-center font-medium text-white py-1 text-xl">
                                {state.loading ? 'Loading...' : 'Update'}
                            </Text>
                        </TouchableOpacity>
                        </View>*/}
                

                </View>
            </View>
        </KeyboardAwareScrollView>
    )
};
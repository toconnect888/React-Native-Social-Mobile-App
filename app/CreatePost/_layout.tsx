///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///                   
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////
import { useContext, useEffect, useReducer, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Input } from "react-native-elements";
import { LoginContext } from "../../lib/sessionProvider";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import DateTimePicker, { DateType } from "react-native-ui-datepicker";
import dayjs, {Dayjs} from 'dayjs';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type State = {
    loading: boolean;
    name: string;
    location: string;
    description: string;
    date: DateType | null;
};

type Action =
    | { type: 'setLoading'; payload: boolean }
    | { type: 'setName'; payload: string }
    | { type: 'setLocation'; payload: string }
    | { type: 'setDescription'; payload: string }
    | { type: 'setDate'; payload: DateType | null };

const initialState: State = {
    loading: true,
    name: '',
    location: '',
    description: '',
    date: dayjs(),

};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'setLoading':
            return { ...state, loading: action.payload };
        case 'setName':
            return { ...state, name: action.payload };
        case 'setLocation':
            return { ...state, location: action.payload };
        case 'setDescription':
            return { ...state, description: action.payload };    
        case 'setDate':
            return { ...state, date: action.payload };     
        default:
            return state;
    }
}

const GOOGLE_PLACES_API_KEY = 'AIzaSyDIUUi4YaXewTJH-4RO5SWli8ddpjGHezg'; // Need to secure this, though the only option would be a proxy API

export default function CreatePost() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const auth = useContext(LoginContext)
    const navigation = useRouter();
    //const [date, setDate] = useState<DateType | null>(dayjs());
    const [isPickerVisible, setPickerVisible] = useState(false);

    const showPicker = () => {
    setPickerVisible(true);
    };

    const hidePicker = () => {
    setPickerVisible(false);
    };

    async function getFullname() {
        if(auth.session) {
            const { data: user, error } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', auth.session?.user.id)
            .single()
            if (error) {
                Alert.alert(error.message)
                return null
            }
            return user
        }
    }

    async function createPost() {
        if(auth.session) {
            if (!state.name || !state.description || !state.location || !state.date) {
                // One or more fields are empty
                Alert.alert('Please fill out all fields.');
                return;
              }
            const name = await getFullname()
            const { error } = await supabase
            .from('posts')
            .insert({ id: auth.session?.user.id, title: state.name, location: state.location, description: state.description, date: state.date?.toLocaleString(), organizer: name?.full_name, avatar_url: name?.avatar_url })
            Alert.alert('Activity created!')
            if (error) {
                Alert.alert(error.message)
                navigation.back()
            }
            
            const posts = await getPosts()
            posts?.map(async (post) => {
                await createGoing(post.post_id);
            });
            navigation.back()
            
        }
        
    }

    async function getPosts() {
        if(auth.session) {
            const { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', auth.session?.user.id);
  
            if (error) {
                Alert.alert(error.message)
                return null
            }
            return posts
          }
      }
  

    async function createGoing(post_id: string) {
      
        if(auth.session) {
            const {data: getGoing, error: getError } = await supabase
            .from('going')
            .select('post_id')
            .eq('post_id', post_id)
            .single();
  
            if (!getGoing?.post_id) {
                const { error} = await supabase
                .from('going')
                .insert({ post_id: post_id})
  
                if (error) {
                    Alert.alert(error.message)
                }
            }
  
           
            return 
        }
  
    }

    return (
        <KeyboardAwareScrollView className="h-screen bg-[#151515] flex-1" keyboardDismissMode='on-drag' keyboardShouldPersistTaps='always'>
            <KeyboardAvoidingView behavior='position' className="flex flex-col mt-6 mx-4">
                <Text className="text-white text-xl font-bold my-6">Please enter the following details:</Text>
                <Input 
                    placeholder="Activity name" 
                    value={state.name || ''} 
                    onChangeText={(text) => dispatch({type: 'setName', payload: text})} 
                    autoCapitalize={'none'}
                    inputContainerStyle={{borderBottomWidth: 0}}
                    className=" border-[#ffba03] border rounded-xl p-3 text-white"
                    maxLength={65}/>
                    
                    <Modal transparent={true} visible={isPickerVisible}>
                        <View className="flex-1 justify-center items-center">
                            <View className="bg-white justify-center items-center rounded-xl">
                                <DateTimePicker
                                    date={state.date}
                                    timePicker={true}
                                    mode="single"
                                    minDate={new Date(Date.now())}
                                    onChange={(params) => {dispatch({type: 'setDate', payload: params.date})}}
                                />
                                <TouchableOpacity 
                                className="bg-[#ffba03] rounded-2xl p-4 mb-4" 
                                onPress={() => {hidePicker()}}>
                                    <Text className="text-white text-xl font-bold">Close</Text>
                                </TouchableOpacity>
                            </View>
                            
                        </View>
                    </Modal>
                
                <Input 
                    placeholder="Description" 
                    value={state.description || ''} 
                    onChangeText={(text) => dispatch({type: 'setDescription', payload: text})} 
                    autoCapitalize={'none'}
                    inputContainerStyle={{borderBottomWidth: 0, marginBottom: 16}}
                    className=" border-[#ffba03] border rounded-xl p-3 text-white"
                    multiline={true}
                    numberOfLines={4}/>
                

                <TouchableOpacity className="bg-transparent border-[#ffba03] border rounded-xl p-3 mx-3 -mt-5" onPress={showPicker}>
                    <Text className=" text-gray-400 text-lg">{state.date?.toLocaleString()}</Text>
                </TouchableOpacity>

                <Text className="text-white text-lg m-4">Location</Text>
                    <GooglePlacesAutocomplete
                    placeholder=""
                    query={{
                    key: GOOGLE_PLACES_API_KEY,
                    language: 'en', // language of the results
                    components: 'country:ca',

                    }}
                    onPress={(data, details = null) => dispatch({type: 'setLocation', payload: data.description})}
                    onFail={(error) => Alert.alert(error)}
                    disableScroll={true}
                    requestUrl={{
                    url:
                        'https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api',
                    useOnPlatform: 'web'
                    }} // this in only required for use on the web. See https://git.io/JflFv more for details.
                    styles={{
                        textInput: {
                          marginTop: -10,
                          marginBottom: 12,
                          borderWidth: 1,
                          borderColor: '#ffba03',
                          borderRadius: 10,
                          color: 'white',
                          fontSize: 16,
                          marginHorizontal: 10,
                          backgroundColor: 'transparent'},
                          listView: {
                            backgroundColor: '#ffba03',
                            borderRadius: 10,
                            marginHorizontal: 10,
                            marginVertical: 10,
                          },
                          
                       
                      }
                     }
                />
                
            </KeyboardAvoidingView>
            <TouchableOpacity 
            className="bg-[#ffba03] rounded-xl mt-5 mx-12 py-4 mb-10"
                onPress={() => {createPost()} }>
                <View className="flex justify-center items-center">
                <Text className="text-white text-2xl font-bold">Create an Activity</Text>
                </View>
            </TouchableOpacity>
        </KeyboardAwareScrollView>
    );
}
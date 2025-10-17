///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///                   
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////
import { View, Text, Alert, TouchableOpacity} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GetGeocode, Post, convertTo12Hour, coordinates, formatDate } from "../../lib/helper";
import { useContext, useEffect, useState } from "react";
import Ionicons from '@expo/vector-icons/Ionicons';
import Avatar from "../../components/Avatar";
import { Image } from "react-native";
import { supabase } from "../../lib/supabase";
import { LoginContext } from "../../lib/sessionProvider";
import { Dimensions } from "react-native";
import CommentSection from "../../components/CommentSection";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import MapView, { Marker } from 'react-native-maps';
type Coordinates = {latitude: number, longitude: number};
export default function PostDetails() {
    const { ...post } = useLocalSearchParams<Post>();
    const auth = useContext(LoginContext)
    const navigation = useRouter();
    const [userAvatars, setUserAvatars] = useState<string[]>([]);
    const [cooridinates, setCoordinates] = useState<Coordinates | null>(null);



    const screenWidth = Dimensions.get('window').width;
    const maxAvatars = Math.floor(screenWidth / 35);

    async function fetchAvatars() {
        if (auth.session) {
            // Fetch all users going to the post
            const { data: usersGoing, error } = await supabase
            .from('going')
            .select('id')
            .eq('post_id', post.post_id)
            .single();

            if (error) {
            Alert.alert(error.message)
            return null
            }

            // Fetch avatar_url for each user
            await Promise.all(usersGoing.id.map(async (id: string) => {
                if (id != "") {
                    const { data: userAvatar, error: userError } = await supabase
                      .from('profiles')
                      .select('avatar_url')
                      .eq('id', id)
                      .single();

                    if (userError) {
                      Alert.alert("USER: " + userError.message)
                      return null
                    }

                    if (userAvatar && userAvatar.avatar_url) {
                      setUserAvatars(prevAvatars => [...prevAvatars, userAvatar.avatar_url]);
                    }
                  }
            }));

        }

      };

      async function addUserToGoing(post_id: string | undefined) {

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


            const { error } = await supabase.rpc('add_user_as_going', {p_post_id: post_id, user_id: auth.session?.user?.id})

            if (error) {
                Alert.alert(error.message)
                return null
            }
            fetchAvatars();
            Alert.alert("You're going!")

            return
        }

        }





      async function UseGeo(location: string) {/*
        try{
        const coordinates = await GetGeocode(location);
        setCoordinates({latitude: coordinates.lat, longitude: coordinates.lng});
        }
        catch(error){
          console.log(error);
        }

      */}


    useEffect(() => {
        if (userAvatars.length == 0)
            fetchAvatars();
        /*if (post.location)
            UseGeo(post.location)
            */
      }, []);

    return (
        <KeyboardAwareScrollView className="flex-1 bg-[#151515]">
        <View className="flex flex-row mt-2">
            <Text className="text-[#ffba03] text-3xl font-bold mx-2">{post?.title}</Text>

        </View>
        <View className="flex flex-row mx-4 mt-2 border-b border-gray-600">
            <Ionicons name="calendar" size={24} color="white" />
            <View className="flex flex-col">
                <Text className="text-white text-lg font-bold ml-2 ">
                    {post.date ?
                    formatDate(post.date.toLocaleString().split('T')[0]) :
                    Date.now()}
                </Text>
                <Text className="text-[#ffba03] text-lg ml-2 mb-1">
                    {post.date ?
                    convertTo12Hour(post.date.toLocaleString().split('T')[1].split(':')[0]+':'+post?.date.toLocaleString().split('T')[1].split(':')[1]) +' EST' :
                    Date.now() +' EST'
                    }
                </Text>
            </View>
        </View>
        <View className="flex flex-row mx-4 mt-2 border-b border-gray-600">
            <Ionicons name="location" size={24} color="white" />
            <View className="flex flex-col over">
                <Text className="text-white text-lg font-bold ml-2 mb-1">
                    {post.location}
                </Text>
                 {/*cooridinates && cooridinates.latitude && cooridinates.longitude && (
                    <MapView
                        provider="google"
                        style={{ width: screenWidth / 1.25, height: 200 }}
                        region={{
                            ...cooridinates,
                            latitudeDelta: 0.0015,
                            longitudeDelta: 0.0015
                        }}
                        showsBuildings={true}
                        showsUserLocation={true}
                        showsMyLocationButton={true}
                        loadingEnabled={true}
                    >
                        {'latitude' in cooridinates && 'longitude' in cooridinates ? (
                            <Marker coordinate={cooridinates} />
                        ) : null}
                    </MapView>
                )*/}




            </View>
        </View>
        <View className="flex flex-col ">

            <View className="flex flex-row mx-4 mt-6">
                <View className="flex flex-col gap-1">
                    <View className="w-5/6">
                    <Text className="text-[#ffba03] text-xl font-bold ml-2 mb-1 w-full ">
                    About
                    </Text>

                    <View className="flex flex-row mx-2">
                        <Text className="text-white text-lg m-1">
                            {post.description}
                        </Text>
                    </View>
                </View>


                </View>
                <View className="my-6 mr-0 ml-auto">
                    <TouchableOpacity
                            className="bg-[#ffba03] rounded-xl shadow-2xl w-[75px] py-2"
                            onPress={() => {addUserToGoing(post.post_id)}}

                          >
                            <View className="flex justify-center items-center -my-3">
                            <Text className="text-black text-bold text-2xl w-content py-6 ">Join</Text>
                            </View>
                    </TouchableOpacity>
                </View>
            </View>


            <View className="flex flex-row mb-2 justify-between items-center">
                    <View className="flex flex-col ml-4">
                        <Text className="text-white text-lg font-bold m-1 mt-4">
                            Host:
                        </Text>

                        {post.avatar_url ?
                            <TouchableOpacity className="flex flex-row m-2 mb-3 border w-[35px] h-[35px] border-white rounded-full" onPress={() => navigation.push({pathname: '/publicProfile',
                            params: {avatar_url: post.avatar_url,
                                    full_name: post.organizer,
                                    id: post.id}})}>
                                <Avatar
                                    size={35}
                                    url={post.avatar_url}
                                    uploadVisible={false}
                                    onUpload={(url: string) => {

                                    }}

                                />
                            </TouchableOpacity> :
                            <View className="flex flex-row m-2">
                                <Image source={require('../../assets/profile.png')} style={{ width: 50, height: 50 }} />
                            </View>}
                    </View>

                    <View className="flex flex-col mr-20">
                        {userAvatars.length !== 0 ? (
                            <Text className='text-white text-lg font-bold m-1 mb-3'> Going: </Text>
                        ) : (
                            <View />
                        )}
                        <TouchableOpacity className="flex flex-row ml-2" onPress={() => {navigation.push({pathname: '/goingList', params: post}) }}>
                            {[...new Set(userAvatars.slice(0, 5))].map((avatarUrl, index) => (
                                <View key={index} style={{ marginLeft: index > 0 ? -20 : 0 }} className=" border border-white rounded-full">
                                    <Avatar

                                        size={35}
                                        url={avatarUrl}
                                        uploadVisible={false}
                                        onUpload={(url: string) => {

                                        }}
                                    />
                                    {index === 4 && userAvatars.length > 5 && (
                                        <View
                                            style={{
                                                backgroundColor: 'rgba(50, 50, 50, 0.75)' // Gray color with 75% opacity
                                            }}
                                            className='flex justify-center items-center absolute w-[35px] h-[35px] right-0 top-0  rounded-full' >
                                            <Text className="text-white font-bold">+{userAvatars.length - 4}</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </TouchableOpacity>
                    </View>
                </View>
          </View>
          <View className="mb-6 mt-auto">
          <CommentSection post_id={post?.post_id} />
          </View>
        </KeyboardAwareScrollView>

    );
}

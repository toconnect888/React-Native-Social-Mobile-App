///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///                   
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////
import { View, Text, Alert, TouchableOpacity} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GetGeocode, Post, convertTo12Hour, formatDate } from "../../lib/helper";
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

export type userPublic = {
    avatar_url: string;
    full_name: string;
    id: string;
}

export default function GoingList() {
    const { ...post } = useLocalSearchParams<Post>();
    const auth = useContext(LoginContext)
    const navigation = useRouter();
    const [userData, setUserData] = useState<userPublic[]>([]);


    async function fetchUsers() {
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
                    const { data: userData, error: userError } = await supabase
                      .from('profiles')
                      .select('avatar_url, full_name, id')
                      .eq('id', id)
                      .single();

                    if (userError) {
                      Alert.alert("USER: " + userError.message)
                      return null
                    }

                    if (userData && userData.avatar_url) {
                      setUserData(prevAvatars => [...prevAvatars, {avatar_url: userData.avatar_url, full_name: userData.full_name, id: userData.id}]);
                    }
                  }
            }));

        }

      };


      useEffect(() => {
        if (userData.length == 0)
            fetchUsers();
      }, []);


    return (
        <KeyboardAwareScrollView className=" bg-[#151515]">
                        <View className="flex flex-col gap-4 mt-2 mx-2 w-full">
                            {userData.map((user, index) => (
                                <TouchableOpacity key={index} className="rounded-full flex flex-row" onPress={() => {navigation.push({pathname: '/publicProfile', params: user})}}>
                                    <Avatar
                                        size={75}
                                        url={user.avatar_url}
                                        uploadVisible={false}
                                    />
                                    <Text className="text-white text-xl mx-1 my-6 px-2">{user.full_name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
        </KeyboardAwareScrollView>

    );
}
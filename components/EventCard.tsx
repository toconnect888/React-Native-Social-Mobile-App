import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Post, convertTo12Hour, formatDate } from "../lib/helper";
import Avatar from "./Avatar";
import { useContext, useEffect, useRef, useState } from "react";
import { LoginContext } from "../lib/sessionProvider";
import { supabase } from "../lib/supabase";


export default function EventCard({ ...post }: Post) {
    const auth = useContext(LoginContext);



    return (
        <View className="flex flex-col pt-2 pb-5">
            <View className="flex flex-row">
                <Text className="text-[#ffba03] text-lg font-bold ml-2 ">{formatDate(post.date.toLocaleString().split('T')[0])}</Text>
                <Text className="text-[#ffba03] text-lg  mr-2"> at {
                    convertTo12Hour(
                        post.date.toLocaleString().split('T')[1].split(':')[0] + ':' + post.date.toLocaleString().split('T')[1].split(':')[1]
                    )}
                </Text>
            </View>
            <View className="flex flex-row gap-0 ml-2">
                <View className="flex flex-col gap-0 " style={{ width: "80%" }}>
                    <Text className="text-white text-xl" ellipsizeMode='tail' numberOfLines={2} >
                        <Text>{post.organizer}'s </Text>
                        <Text className="text-white text-xl font-bold ml-2 ">
                            {post.title}
                        </Text>
                    </Text>
                    <Text className="text-white text-lg ml-2  mt-4 py-0" ><Text className=" font-medium">Joined: </Text> {post.going}</Text>
                </View>
                <View className="mr-4 mb-4 -mt-4 ml-auto">
                    <Avatar
                        size={50}
                        url={post.avatar_url}
                        uploadVisible={false}
                        onUpload={(url: string) => { }}
                    />
                </View>
            </View>
            <View className="flex flex-col mt-0 mb-1">
                <Text className="text-white text-lg ml-2 "><Text className=" font-medium">Location: </Text> {post.location}</Text>
            </View>
        </View>
    );
}

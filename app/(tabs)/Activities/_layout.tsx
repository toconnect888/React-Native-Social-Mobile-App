///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////
import {  Alert, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../../components/Header';
import { Redirect, useRootNavigationState, useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { LoginContext } from '../../../lib/sessionProvider';
import { supabase } from '../../../lib/supabase';
import { Post } from '../../../lib/helper';
import EventCard from '../../../components/EventCard';



export default function Events() {
    const rootNavigation = useRootNavigationState();
    const navigation = useRouter();
    const auth = useContext(LoginContext)
    const [posts, setPosts] = useState<Post[]>([])
    const [refreshing, setRefreshing] = useState(false);

    async function getPosts() {
      if (auth.session) {
        try {
          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select('*')
            .eq('id', auth.session?.user.id);

          if (postsError) {
            Alert.alert(postsError.message);
            return null;
          }

          const updatedPosts = await Promise.all(postsData.map(async (post) => {
            const { data: goingData, error: goingError } = await supabase
              .from('going')
              .select('id')
              .eq('post_id', post.post_id)
              .single();

            if (goingError) {
              Alert.alert("Error fetching 'going' data: " + goingError.message);
            }
            //update this posts' going data by fetching from going table
            const goingCount = goingData ? goingData.id.length : 0;


            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('avatar_url')
              .eq('id', post.id)
              .single();

            if (profileError) {
              Alert.alert("Error fetching 'avatar_url' data: " + profileError.message);
            }
            //update this posts' avatar_url by fetching from profiles table
            const avatarUrl = profileData ? profileData.avatar_url : '';

            return { ...post, going: goingCount, avatar_url: avatarUrl };
          }));

          setPosts(updatedPosts);
        } catch (error) {
          Alert.alert("Error fetching data: " + error.message);
        }
      }
    }


    async function Delete(post_id: string) {
      const { error } = await supabase
      .from('posts')
      .delete()
      .eq('post_id', post_id);

      if (error) {
          Alert.alert(error.message)
          return null
      }
      Alert.alert("Deleted")
      getPosts();
      return
    }

    useEffect(() => {
      getPosts();6
    }, []);

    const onRefresh = useCallback(() => {
      setRefreshing(true);

      getPosts();
      setTimeout(() => {
        setRefreshing(false);
      }, 2000);
    }, []);



    if (!rootNavigation?.key) return (<Redirect href="/" />);

    return (
      <View className="flex-1 bg-[#151515] ">
        <Header />
        <View className="flex-1 mt-6 mx-3">
          <Text className="text-white text-2xl">Created Activities</Text>

          { posts.length == 0 ?
           <ScrollView className='ml-2 my-3'
           refreshControl={ <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff" titleColor="#fff"/>}>

            <Text className="text-white text-sm">You have not created any activities yet. Create some activities and watch them appear in this section.</Text>
          </ScrollView> :
          <ScrollView className="flex flex-col"
          refreshControl={<RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff" titleColor="#fff"/>}>

          {posts.map((post, index) => (
            <TouchableOpacity
                    key={index}
                    onPress={() => navigation.push({pathname: '/PostDetails', params: post})}>
              <EventCard
                {...post}/>
                <TouchableOpacity className=" bg-[#ffba03] rounded-xl mx-2  shadow-2xl w-[75px] absolute right-0 top-20 mt-3"
                    onPress={() => {Delete(post.post_id)}}>
                    <View className="flex justify-center items-center">
                        <Text className="text-black text-sm ">Delete</Text>
                    </View>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            </ScrollView>}
            </View>

          <View className=" mb-4">
            <TouchableOpacity
            className="bg-[#ffba03] rounded-xl mt-5 mx-12 py-4"
              onPress={() => {navigation.push('/CreatePost')}}>
              <View className="flex justify-center items-center">
                <Text className="text-white text-2xl font-bold">Create an Activity</Text>
              </View>
            </TouchableOpacity>

          </View>




      </View>

    );
}
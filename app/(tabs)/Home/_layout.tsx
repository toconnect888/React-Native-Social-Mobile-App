///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///                   
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////
import {  Alert, RefreshControl, ScrollView, Text, Touchable, TouchableOpacity, View } from 'react-native';
import Header from '../../../components/Header';
import { Redirect, useRootNavigationState, useRouter } from 'expo-router';
import { supabase } from '../../../lib/supabase';
import { useCallback, useContext, useEffect, useState } from 'react';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { LoginContext } from '../../../lib/sessionProvider';
import { Post } from '../../../lib/helper';
import EventCard from '../../../components/EventCard';


export default function Home() {
  const rootNavigation = useRootNavigationState();
  const navigation = useRouter();
  const auth = useContext(LoginContext)
  const [posts, setPosts] = useState<Post[]>([])
  const [refreshing, setRefreshing] = useState(false);

  async function RemoveUserToGoing(post_id: string) {
      
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
        
        const { error } = await supabase.rpc('remove_user_as_going', {p_post_id: post_id, user_id: auth.session?.user?.id})

        if (error) {
            Alert.alert(error.message)
            return null
        }
        Alert.alert("Removed")
        onRefresh()

        return 
    }

}



  async function getPosts() {
      if (auth.session) {
          try {
              // Get all post_ids from the 'going' table where the 'id' array contains the current user's id
              const { data: goingData, error: goingError } = await supabase
                  .from('going')
                  .select('post_id')
                  .contains('id', [auth.session.user.id]);

              if (goingError) {
                  Alert.alert(goingError.message);
                  return null;
              }

              // Extract the post_ids from the returned data
              const post_ids = goingData.map(item => item.post_id);

              // Get all posts with those post_ids from the 'posts' table
              const { data: postsData, error: postsError } = await supabase
                  .from('posts')
                  .select('*')
                  .in('post_id', post_ids);

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
                      Alert.alert(goingError.message);
                      return null;
                    }
                  //update this posts' going data by fetching from going table
                  const goingCount = goingData ? goingData.id.length : 0;

                  const { data: profileData, error: profileError } = await supabase
                      .from('profiles')
                      .select('avatar_url')
                      .eq('id', post.id)
                      .single();

                  if (profileError) {
                      Alert.alert(profileError.message);
                      return null;
                  }
                  //update this posts' avatar_url by fetching from profile table
                  const avatarUrl = profileData ? profileData.avatar_url : '';

                  return { ...post, going: goingCount, avatar_url: avatarUrl };
              }));

              setPosts(updatedPosts);
          } catch (error) {
              Alert.alert("Error fetching data: " + error.message);
          }
      }
  }

  useEffect(() => {
    getPosts();
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
    <View className="h-full bg-[#151515] ">
        <Header />
        <View className="flex-1 mt-6 mx-5">
          <Text className="text-white text-2xl">Activities attending</Text>
          <Text className="text-white text-sm m-1">Activities you're attending will appear here!</Text>
          { posts.length == 0 ? 
           <ScrollView className='ml-2 my-3 '
           refreshControl={<RefreshControl
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#fff" titleColor="#fff"/>} />
             :
             <MaskedView
          style={{ height:"43%" }}
          maskElement={<LinearGradient style={{ height:"160%" }} colors={['white', 'transparent']} />}>
             <View className="flex-1 mb-5" >
          <ScrollView className="flex flex-col"
          refreshControl={<RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#fff" titleColor="#fff"/>}>
            
          {posts.filter(post => new Date(post.date) > new Date()).map((post, index) => (
            <TouchableOpacity 
                    key={index} 
                    onPress={() => navigation.push({pathname: '/PostDetails', params: post})}>
              <EventCard 
                {...post}
              />
              <TouchableOpacity className=" bg-[#ffba03] rounded-xl mx-2 shadow-2xl w-[75px] absolute  bottom-0" 
                    onPress={() => {RemoveUserToGoing(post.post_id)}}>
                    <View className="flex justify-center items-center">
                        <Text className="text-black text-sm">Remove</Text>
                    </View>
                </TouchableOpacity>
              </TouchableOpacity>
          ))}
            </ScrollView></View></MaskedView>}
          
          <View className="flex-1 bg-gray-800 rounded-xl border border-[#ffba03]">
          <Text className="text-white text-2xl mx-2 mt-1">Past Activities</Text>
          <Text className="text-white text-sm m-1 mx-3">Old activities.</Text>
          <MaskedView style={{ flex: 1 }}
          
          maskElement={<LinearGradient style={{ flex: 1 }} colors={['white', 'transparent']} />}
        >
          <View>
          <ScrollView  className="flex flex-col "
          refreshControl={<RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#fff" titleColor="#fff"/>}>
            
          {posts.filter(post => new Date(post.date) < new Date()).map((post, index) => (
            <TouchableOpacity 
                    key={index} 
                    onPress={() => navigation.push({pathname: '/PostDetails', params: post})}>
              <EventCard 
                {...post}
              />
              <TouchableOpacity className=" bg-[#ffba03] rounded-xl mx-2  shadow-2xl w-[75px] absolute bottom-0"
                    onPress={() => {RemoveUserToGoing(post.post_id)}}>
                    <View className="flex justify-center items-center">
                        <Text className="text-black text-sm">Remove</Text>
                    </View>
                </TouchableOpacity>
              </TouchableOpacity>
          ))}
            </ScrollView>
            </View>
            </MaskedView>
            </View>
      </View>
    </View>
    
    
  );
}
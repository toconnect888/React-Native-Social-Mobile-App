///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///                   
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////
import {  Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../../components/Header';
import { Redirect, useRootNavigationState, useRouter } from 'expo-router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Post } from '../../../lib/helper';
import { supabase } from '../../../lib/supabase';
import { LoginContext } from '../../../lib/sessionProvider';
import EventCard from '../../../components/EventCard';
import { Input } from 'react-native-elements';

export default function Explore() {
    const rootNavigation = useRootNavigationState();
    const navigation = useRouter();
    const auth = useContext(LoginContext)
    const [posts, setPosts] = useState<Post[]>([])

    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');

    async function getPosts() {
        if (auth.session) {
            try {
                const { data: postsData, error: postsError } = await supabase
                    .from('posts')
                    .select('*')
                    .neq('id', auth.session?.user.id);

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
                    const avatarUrl = profileData ? profileData.avatar_url : '';

                    return { ...post, going: goingCount, avatar_url: avatarUrl };
                }));

                setPosts(updatedPosts);
            } catch (error) {
                Alert.alert("Error fetching data: " + error.message);
            }
        }
    }
async function getPosts() {
    if (auth.session) {
        try {
            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select('*')
                .neq('id', auth.session?.user.id);

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
        <View className="flex-1 mt-6 mx-3">
          <Text className="text-white text-2xl">All Activities</Text>
          
          { posts.length == 0 ? 
          <ScrollView className='ml-2 my-3'
          refreshControl={<RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#fff" titleColor="#fff"/>}>
            
            <Text className="text-white text-sm">There aren't any activities yet.</Text>
          </ScrollView> :
          <ScrollView className="flex flex-col "
          refreshControl={<RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor="#fff" titleColor="#fff"/>}
            keyboardDismissMode='on-drag'>
            
          <Input
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search by post name"
            style={{color: 'white', marginTop: 10}}
          />
          {posts.filter(post => post.title.toLowerCase().includes(searchText.toLowerCase()) && new Date(post.date) > new Date() ).map((post, index) => (
            <TouchableOpacity
                  className='mb-6 -mt-2' 
                  key={index} 
                  onPress={() => navigation.push({pathname: '/PostDetails', params: post})}>
              <EventCard
                {...post}
              />
              
            </TouchableOpacity>
          ))}
        </ScrollView>}
            </View>
    
      </View>
  
    );
}
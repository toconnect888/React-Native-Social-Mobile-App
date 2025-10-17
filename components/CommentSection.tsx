import { SetStateAction, useContext, useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Input } from "react-native-elements";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { LoginContext } from "../lib/sessionProvider";
import { supabase } from "../lib/supabase";
import { Comment } from "./Comment";
export type CommentType = {
    user_id: string;
    post_id: string;
    content: string;
    created_at: Date;
    name: string;
    avatar_url: string;
}

export default function CommentSection({post_id}: {post_id: string | undefined}) {
    const [comment, setComment] = useState('')
    const [comments, setComments] = useState<CommentType[]>([])
    const auth = useContext(LoginContext)
    const scrollViewRef = useRef<ScrollView>(null);
    const [sendingComment, setSendingComment] = useState(false)

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

    async function createComment() {
        if(auth.session) {
            if (comment == '') {
                // One or more fields are empty
                return;
              }
            setSendingComment(true)
            const name = await getFullname()

            const { error } = await supabase
            .from('comments')
            .insert({ user_id: auth.session?.user.id, post_id: post_id, content: comment, name: name?.full_name, avatar_url: name?.avatar_url})
            
            if (error) {
                Alert.alert(error.message)
            }
            setSendingComment(false)
            setComment('')            
            
        }
        
    }

    const getComments = async () => {
        console.log('getting comments')
        if(auth.session) {
            const { data: comments, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', post_id)
  
            if (error) {
                Alert.alert(error.message)
                return null
            }
            setComments(comments)
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd();
             }, 100);
          }
      }
    useEffect(() => {
        supabase
        .channel('comments')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, getComments)
        ?.subscribe()
        getComments()
    }, []);


    return (
        <KeyboardAvoidingView nestedScrollEnabled = {true} behavior='position' className="mx-2 bg-[#323030] rounded-xl">

            <Text className="text-white text-xl font-bold mb-2 mt-2 mx-2">Comments:</Text>
            <ScrollView nestedScrollEnabled = {true} ref={scrollViewRef} className=" max-h-[185px] mx-2" keyboardDismissMode='on-drag'>
                {comments.map((comment, index) => (

                        <View key={index} >
                            <Comment comment={comment}/>
                        </View>

                ))}
            </ScrollView>
            <View className="mx-2" >
                    <TextInput
                        text-white
                        placeholder="Comment"
                        value={comment}
                        onChangeText={(text) => setComment(text)}
                        autoCapitalize={'none'}
                        //inputContainerStyle={{borderBottomWidth: 0, marginBottom: 16}}
                        className=" border-[#ffba03] border rounded-xl p-3 text-white ml-auto mr-2 w-full"/>
                        <View className="mb-0 z-50">
                            <TouchableOpacity disabled={sendingComment} className="bg-transparent border-[#ffba03] border rounded-xl py-3 px-3 mr-0 ml-auto mt-1" onPress={() => {createComment()}}>
                                <Text className="text-[#ffba03] text-md text-center">{sendingComment ? 'Sending' : 'Post'}</Text>
                            </TouchableOpacity>
                        </View>

            </View>
            </KeyboardAvoidingView>

    )}
import { Image, Text, View } from "react-native";
import { CommentType } from "./CommentSection";
import Avatar from "./Avatar";

export function Comment({comment}: {comment: CommentType}) {
  return (
    <View className="bg-gray-800 rounded-3xl my-1">
        <View className="flex flex-row">
            <Avatar
                size={35}
                url={comment.avatar_url}
                uploadVisible={false}
                onUpload={(url: string) => {

                }}

            />
            <View className="p-2">
                <Text className="text-white">{comment.name}</Text>
            </View>
        </View>
        <View className="p-4">
            <Text className="text-white">{comment.content}</Text>
        </View>
      
    </View>
  );
}
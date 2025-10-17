import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert, Image, Button, TouchableOpacity, Text } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import Ionicons from '@expo/vector-icons/Ionicons';
import { on } from 'events';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

interface Props {
  size: number
  url: string | null
  onUpload?: (filePath: string) => void
  uploadVisible: boolean
  classNameParams?: string
}

export default function Avatar({ url, size = 150, onUpload, uploadVisible, classNameParams }: Props) {
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const avatarSize = { height: size, width: size }

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)

      if (error) {
        throw error
      }

      const fr = new FileReader()
      fr.readAsDataURL(data)
      fr.onload = () => {
        setAvatarUrl(fr.result as string)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error downloading image: ', error.message)
      }
    }
  }

  async function uploadAvatar() {
    try {
      setUploading(true)

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Restrict to only images
        allowsMultipleSelection: false, // Can only select one image
        allowsEditing: true, // Allows the user to crop / rotate their photo before uploading it
        quality: 1,
        exif: false, // We don't want nor need that data.
      })

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled image picker.')
        return
      }

      const image = result.assets[0]
      console.log('Got image', image)

      if (!image.uri) {
        throw new Error('No image uri!') // Realistically, this should never happen, but just in case...
      }

      // Validate file size
          const response = await fetch(image.uri);
          const blob = await response.blob();
          if (blob.size > 5 * 1024 * 1024) { // 5 MB limit
            throw new Error('File size exceeds 5 MB');
          }

      // Resize and compress image
          const manipulatedImage = await manipulateAsync(
            image.uri,
            [{ resize: { width: 800 } }], // Resize to width 800px
            { compress: 0.7, format: SaveFormat.JPEG } // Compress and convert to JPEG
          );

      const arraybuffer = await fetch(manipulatedImage.uri).then((res) => res.arrayBuffer())

      const fileExt = manipulatedImage.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg'
      const path = `${Date.now()}.${fileExt}`
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
        })

      if (uploadError) {
        throw uploadError
      }
      if(onUpload)
        onUpload(data.path)
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      } else {
        throw error
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <View className={classNameParams}>
    <View className='flex justify-center items-center'>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          accessibilityLabel="Avatar"
          style={[avatarSize, styles.avatar, styles.image]}
          className='rounded-full'
        />
      ) : (
        <View
            style={[avatarSize, styles.avatar, styles.noImage]}
            className='rounded-full '/>
      )}
      </View>
      { uploadVisible && <View className='self-stretch pt-2 flex flex-row gap-1' style ={{justifyItems:'center'}}>
          <Ionicons name='camera' size={size/5 } color='white' />
          <TouchableOpacity
            onPress={uploadAvatar}
            disabled={uploading}
            className='bg-[#453d28] rounded-xl'
          >
          <View className='flex flex-row gap-2 py-1 px-2'>
            <Text className='text-center text-white text-xs'>{uploading ? '        Changing ...         ' : 'Change profile picture'}</Text>
          </View>
        </TouchableOpacity>
      </View>}
    </View>
  )
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 5,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  image: {
    objectFit: 'cover',
    paddingTop: 0,
  },
  noImage: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgb(200, 200, 200)',
    borderRadius: 5,
  },
})
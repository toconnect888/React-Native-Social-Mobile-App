import { Stack, useRouter } from 'expo-router';
import { Alert, Image, TouchableOpacity, View } from 'react-native';
import LogoTitle from './LogoTitle';
import Avatar from './Avatar';
import { useContext, useEffect, useState } from 'react';
import { LoginContext } from '../lib/sessionProvider';
import { supabase } from '../lib/supabase';

export default function Header() {
    const navigation = useRouter();
    const auth = useContext(LoginContext)
    const [avatar_url, setAvatarUrl] = useState<string | null>(null)

    async function getProfilePicture() {
        if (auth.session) {
            const { data, error } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', auth.session.user.id)
                .single()

            if (error) {
                Alert.alert(error.message)
                return null
            }
            setAvatarUrl(data?.avatar_url)
        }
    }

    useEffect(() => {
        getProfilePicture()
    }, [auth.session])

    return (
        <View>
        <Stack.Screen
              options={{
                headerBackVisible: false,
                headerBackTitleVisible: false,
                headerBackButtonMenuEnabled: false,
                headerShown: true,
                gestureEnabled: false,
                headerStyle: {
                  backgroundColor: '#3f3f3f',
                },
                headerShadowVisible: false,
                headerTintColor: '#ffba03',
                headerTitle: () => <LogoTitle />,
                headerRight: () => (
                  <TouchableOpacity
                  className="z-100 mr-2 mb-4"
                  onPress={() => navigation.push({pathname: '/profile', params: {isSetup: true}})}>
                    <Avatar
                        size={45}
                        url={avatar_url}
                        uploadVisible={false}
                        onUpload={(url: string) => {

                        }}
                    />
                  </TouchableOpacity>),
              }}
            />
        </View>

    );
}
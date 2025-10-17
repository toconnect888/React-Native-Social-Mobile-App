import { Tabs, useRootNavigationState, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useContext, useEffect } from 'react';
import { LoginContext } from '../../lib/sessionProvider';


export default () => {
    const auth = useContext(LoginContext)
    const navigation = useRouter();
    const rootNavigation = useRootNavigationState();
    
    useEffect(() => {
    if (!auth.session) {
        navigation.push('/')

        //auth.setSession(auth.session)
    }
    //Alert.alert(state.isNamePage)
    }, [auth.session]); 

    if (!rootNavigation?.key) return null;

    return (
        <Tabs 
            initialRouteName='/Home'
            screenOptions={{
                tabBarActiveTintColor: '#ffba03',
                tabBarStyle: {
                borderWidth: 1,
                borderColor: '#3f3f3f',
                borderTopColor: '#3f3f3f',
                backgroundColor: '#3f3f3f',
                },
                display: "flex",
                        position: 'absolute',
                tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "bold",
                },
                }}>
            <Tabs.Screen
            name="Home"
            options={{
                tabBarIcon: ({color, size}) => (
                    <Ionicons name='home' size={size} color={color}/>
                    )
            }}
            />
            <Tabs.Screen
            name="Activities"
            options={{
                tabBarIcon: ({color, size}) => (
                    <Ionicons name='calendar' size={size} color={color}/>
                    )
            }}
            />
            <Tabs.Screen
            name="Explore"
            options={{
                tabBarIcon: ({color, size}) => (
                    <Ionicons name='search' size={size} color={color}/>
                    )
            }}
            />
            
        </Tabs>
        );
}

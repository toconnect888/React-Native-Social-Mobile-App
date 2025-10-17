///////////////For web only//////////////////////////////
/**/import { NativeWindStyleSheet } from "nativewind";///
/**/                                                  ///                   
/**/NativeWindStyleSheet.setOutput({                  ///
/**/  default: "native",                              ///
/**/});                                               ///
/////////////////////////////////////////////////////////
import React, { useState } from 'react'
import { Alert, View, Text, KeyboardAvoidingView, TouchableOpacity, ScrollView } from 'react-native'
import { supabase } from '../../lib/supabase'
import { Button, Input  } from 'react-native-elements'
import { useRouter, Link } from 'expo-router';

export default function SignIn() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const navigation = useRouter();



    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          })
          if (error) 
            setError(error.message)
          else 
            navigation.push({pathname: '/'})
          if (error?.message === 'Email not confirmed') {
            /*const { data, error } = await supabase.auth.resend({
              type: 'signup',
              email: email,
              
            })

            if (error) {
              setError(error.message)
            } 
            else */
            navigation.push({pathname: '/VerifyEmail', params: {email}})
          
          }
          setLoading(false)
          
        }


    return (
        <View className='px-12 flex-auto absolute top-0 bottom-0 right-0 left-0 bg-[#3f3f3f] '>
          <View style=
            {{shadowColor: 'black',
              shadowOpacity: 2,
              elevation: 3,
            }} 
            className="absolute right-0 top-0 -mr-10 -mt-40 w-60 h-60 rounded-full bg-[#ffba03] z-5 " />
          <View style=
            {{shadowColor: 'black',
              shadowOpacity: 2,
              elevation: 3}} 
              className="absolute right-0 top-0 -mr-32 -mt-20 w-60 h-60 rounded-full bg-[#ffba03] z-0" />
          <View style=
            {{shadowColor: 'black',
              shadowOpacity: 2,
              elevation: 3}} 
              className="absolute left-0 bottom-0 -ml-20 -mb-40 w-60 h-60 rounded-full bg-[#ffba03] z-10 shadow-none" />
          <View style=
            {{shadowColor: 'black',
              shadowOpacity: 2,
              elevation: 3,
            }} 
            className="absolute left-0 bottom-0 -ml-40 -mb-20 w-60 h-60 rounded-full bg-[#ffba03] z-0 shadow-none" />
            {/*<TouchableOpacity className='absolute top-0 left-0 ml-24 -mt-20 bg-white' onPress={() => navigation.back()} >
              <View style=
              {{shadowColor: 'black',
                shadowOpacity: 2,
                elevation: 3}} 
                className="absolute left-0 bottom-0 -ml-20 -mb-40 w-9 h-9 rounded-full bg-[#ffba03] z-10 shadow-none" >
                  <Text className='text-3xl text-white font-bold text-center'>&lt;</Text>
                  </View>
            </TouchableOpacity>*/}
          <ScrollView keyboardDismissMode='on-drag' scrollEnabled={false}>
            <KeyboardAvoidingView behavior="position" >
              <View className='self-stretch mt-32'>
                <Text className='text-4xl mb-12 mt-20 text-white font-bold text-center'>Sign In</Text>
                <Input
                  className="bg-white px-2 rounded-xl text-center border"
                  //leftIcon={{ type: 'font-awesome', name: 'envelope' }}
                  onChangeText={(text) => setEmail(text)}
                  value={email}
                  placeholder="Email@address.com"
                  autoCapitalize={'none'}
                  inputContainerStyle={{borderBottomWidth: 0}}
                />
              </View>
              <View className='pt-1 self-stretch '>
                <Input
                  className="bg-white px-2 rounded-xl text-center"
                  //leftIcon={{ type: 'font-awesome', name: 'lock' }}
                  onChangeText={(text) => setPassword(text)}
                  value={password}
                  secureTextEntry={true}
                  placeholder="Password"
                  autoCapitalize={'none'}
                  inputContainerStyle={{borderBottomWidth: 0}}
      
                />
              
              </View>
                <View className='pb-2 self-stretch flex justify-center items-center'>
                    <Text className="text-lg text-red-500">{error}</Text>
                </View>
                <View className='flex flex-row justify-center items-center font-bold mb-6 '>
                      <Text className=" text-md text-gray-500"> 
                          Click here to 
                      </Text>
                      <Link className='ml-2 text-md font-medium text-[#ffba03] underline' 
                          href='/signup'>
                          Register
                      </Link>
                  </View>
              <View className='self-stretch'>
                <TouchableOpacity className="bg-[#ffba03] rounded-full mx-16" disabled={loading} onPress={() => {signInWithEmail()}} >
                  <Text className='text-center font-medium text-white py-4 text-xl'>Log In</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </ScrollView>
          
        </View>
    )
}
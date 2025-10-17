import { createContext, useState, ReactNode, useEffect } from 'react';
import 'react-native-url-polyfill/auto'
import { supabase } from './supabase'
import { Session } from '@supabase/supabase-js'

interface LoginContextType {
    session: Session | null;
    setSession: React.Dispatch<React.SetStateAction<Session | null>>;
}

export const LoginContext = createContext<LoginContextType>({
    session : null,
    setSession: () => {}, // Provide a no-op function as default
});

interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider = ({ children }: LoginProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <LoginContext.Provider value={{ session, setSession }}>
      {children}
    </LoginContext.Provider>
  );
};
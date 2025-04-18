import React, { createContext, useState, useEffect } from 'react';
import { supabaseCompanies } from '../helpers/supabaseClient'; // Ensure this import path is correct

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Fetch the session when the component mounts
    supabaseCompanies.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabaseCompanies.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup on unmount
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };

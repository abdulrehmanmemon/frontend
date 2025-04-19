import { useState, useEffect } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabaseSegments } from './helpers/supabaseClient';
import { LayoutContextProvider } from './contexts/layout';
import Layout from './components/layout';
import { FormProvider } from './contexts/forms/ColdLeadActivationContext';
import { HelmetProvider } from 'react-helmet-async';
import { Theme } from '@/components/daisyui';
import { GlobalContextProvider } from '@/contexts/global';
import { Toaster } from "react-hot-toast";

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // On mount, check session and store token if available
    supabaseSegments.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.access_token) {
        localStorage.setItem('sb-access-token', session.access_token);
      }
    });

    // Subscribe to all auth state changes
    const { data: { subscription } } = supabaseSegments.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);

        if (session?.access_token) {
          // Store access token on login, refresh
          localStorage.setItem('sb-access-token', session.access_token);
        } else {
          // Remove token on logout or invalid session
          localStorage.removeItem('sb-access-token');
        }

        if (event === 'TOKEN_REFRESHED') {
          console.log('Token was refreshed.');
        }
      }
    );

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!session) {
    return (
      <div className='max-w-sm mb-4 mt-4 mx-auto bg-white rounded-lg p-8'>
        <Auth
          supabaseClient={supabaseSegments}
          providers={['google']}
          appearance={{ theme: ThemeSupa }}
          theme="light"
        />
      </div>
    );
  }

  return (
    <HelmetProvider>
      <Theme>
        <GlobalContextProvider>
          <FormProvider>
            <LayoutContextProvider>
              <Toaster position="top-right" />
              <Layout />
            </LayoutContextProvider>
          </FormProvider>
        </GlobalContextProvider>
      </Theme>
    </HelmetProvider>
  );
}

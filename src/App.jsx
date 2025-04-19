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

import {
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import ResetPassword from './components/auth/ResetPassword';

export default function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Supabase session
  useEffect(() => {
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Redirect to main app after login
  useEffect(() => {
    // Only redirect if user is on a public/auth route
    const publicRoutes = ["/display", "/login", "/signup", "/"];
    if (
      session &&
      publicRoutes.includes(location.pathname) &&
      !location.pathname.startsWith("/reset-password")
    ) {
      navigate("/actions", { replace: true });
    }
  }, [session, navigate, location.pathname]);

  // Handle password recovery redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      // Just redirect to /reset-password, let the page handle the rest
      navigate(`/reset-password${window.location.hash}`, { replace: true });
    }
  }, [navigate]);

  return (
    <HelmetProvider>
      <Theme>
        <GlobalContextProvider>
          <FormProvider>
            <LayoutContextProvider>
              <Toaster position="top-right" />
              <Routes>
                <Route path="/reset-password" element={
                  <div className='mx-auto rounded-lg p-8 min-h-screen max-w-sm'>
                  <ResetPassword />
                </div>}/>
                <Route path="/display" element={
                  <div className="mx-auto rounded-lg p-8 min-h-screen max-w-sm">
                    <Auth
                      supabaseClient={supabaseSegments}
                      providers={['google']}
                      appearance={{ theme: ThemeSupa }}
                      theme="light"
                    />
                  </div>
                } />
                <Route path="*" element={
                  session ? (
                    <Layout />
                  ) : (
                    <div className="mx-auto rounded-lg p-8 min-h-screen max-w-sm">
                      <Auth
                        supabaseClient={supabaseSegments}
                        providers={['google']}
                        appearance={{ theme: ThemeSupa }}
                        theme="light"
                      />
                    </div>
                  )
                } />
              </Routes>
            </LayoutContextProvider>
          </FormProvider>
        </GlobalContextProvider>
      </Theme>
    </HelmetProvider>
  );
}
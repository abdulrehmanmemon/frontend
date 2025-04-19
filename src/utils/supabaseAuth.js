import { supabaseSegments } from "../helpers/supabaseClient";


export async function signOutUser() {
  const { error } = await supabaseSegments.auth.signOut();

  if (error && error.message !== 'Auth session missing!') {
    // Only throw/log unexpected errors
    throw error;
  }
  // Otherwise, treat as successful sign out
  console.log("Signed out successfully.");
}

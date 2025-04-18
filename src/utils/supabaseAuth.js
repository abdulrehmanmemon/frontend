import { supabaseSegments } from "../helpers/supabaseClient";


export async function signOutUser() {
  const { error } = await supabaseSegments.auth.signOut();

  if (error) {
    throw error; 
  }

  console.log("Signed out successfully.");
}

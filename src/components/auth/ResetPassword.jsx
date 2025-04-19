import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseSegments } from "@/helpers/supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Extract tokens from hash
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    console.log("Hash:", hash);
    console.log("access_token:", access_token);
    console.log("refresh_token:", refresh_token);

    if (access_token && refresh_token) {
      supabaseSegments.auth.setSession({
        access_token,
        refresh_token,
      }).then((result) => {
        console.log("setSession result:", result);
        setLoading(false);
      }).catch((err) => {
        console.error("setSession error:", err);
        setLoading(false);
      });
    } else {
      setLoading(false); // No tokens, allow form (will fail, but user sees error)
    }
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const { data, error } = await supabaseSegments.auth.updateUser({ password });
    if (error) {
      setError("Error updating password: " + error.message);
    } else {
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      setTimeout(async () => {
        await supabaseSegments.auth.signOut();
        navigate('/display');
      }, 2000); // 2 second delay for user to read message
    }
  };


  if (loading) {
    return <div>Loading...</div>;
  }



  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-lg border border-[#e4e4e7] font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h2 className="text-2xl mb-6 text-center text-gray-500 tracking-tight">Reset your password</h2>
      {success ? (
        <div className="text-green-600 font-semibold text-center text-base">
          Password updated successfully! Redirecting to login...
        </div>
      ) : (
        <form onSubmit={handleReset}>
          <label className="block text-sm font-medium text-gray-500 mb-2" htmlFor="new-password">New Password</label>
          <input
            id="new-password"
            type="password"
            className="block w-full px-4 py-2 mb-4 bg-white border border-[#e4e4e7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ecf8e] text-base text-[#18181b] placeholder-[#a1a1aa] transition"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <label className="block text-sm font-medium text-gray-500 mb-2" htmlFor="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            type="password"
            className="block w-full px-4 py-2 mb-4 bg-white border border-[#e4e4e7] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3ecf8e] text-base text-[#18181b] placeholder-[#a1a1aa] transition"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          {error && (
            <div className="mb-4 text-red-600 text-sm font-medium text-center">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-[#3ecf8e] hover:bg-[#10b981] text-white font-semibold py-2 rounded-lg transition text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]"
          >
            Update Password
          </button>
        </form>
      )}
    </div>
  );
}

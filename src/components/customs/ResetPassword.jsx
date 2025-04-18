import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const accessToken = searchParams.get('access_token'); 

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!accessToken) {
      setMessage('Invalid or missing access token.');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage('Password reset successful! You can now log in with your new password.');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2>Reset Password</h2>
      <form onSubmit={handlePasswordReset}>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResetPassword;

import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // This lets Supabase read the token from the URL
    supabase.auth.getSession();
  }, []);

  const handleUpdate = async () => {
    if (!password) {
      setMessage("Enter a password");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ Password updated successfully");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Reset Password</h2>

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "10px", marginBottom: "10px", width: "250px" }}
      />

      <br />

      <button onClick={handleUpdate}>
        Update Password
      </button>

      <p>{message}</p>
    </div>
  );
}

export default ResetPassword;

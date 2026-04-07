import React, { useState } from "react";
import { supabase } from "./supabaseClient";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResetRequest = async () => {
    if (!email) {
      setMessage("Enter your email");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://nachinurseform.netlify.app/reset-password",
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("✅ Check your email for the reset link!");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Forgot Password</h2>

      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "10px", marginBottom: "10px", width: "250px" }}
      />
      <br />

      <button onClick={handleResetRequest}>Send Reset Email</button>

      <p>{message}</p>
    </div>
  );
}

export default ForgotPassword;

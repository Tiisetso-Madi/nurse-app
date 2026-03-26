// NurseFormPage.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function NurseFormPage() {
  const { token } = useParams();

  const [currentForm, setCurrentForm] = useState(null);
  const [response, setResponse] = useState({ completed: "", notes: "", temp: "", bp: "" });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false); // NEW: track submission

  const styles = {
    container: {
      maxWidth: 600,
      margin: "40px auto",
      padding: 25,
      fontFamily: "Arial, sans-serif",
      background: "#f9fafb",
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      textAlign: "center",
    },
    header: { textAlign: "center", marginBottom: 25, color: "#333" },
    formInput: { width: "100%", padding: 12, marginBottom: 16, borderRadius: 8, border: "1px solid #ccc", fontSize: 14 },
    textarea: { width: "100%", padding: 12, marginBottom: 16, borderRadius: 8, border: "1px solid #ccc", minHeight: 100, fontSize: 14 },
    primaryBtn: { padding: "12px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: "#007bff", color: "white", fontWeight: "bold", fontSize: 15, width: "100%", transition: "0.2s" },
    error: { color: "red", marginBottom: 12, fontWeight: "bold" },
    label: { fontWeight: "bold", marginBottom: 5, display: "block" },
    info: { marginBottom: 12, color: "#555" },
    tick: { fontSize: 60, color: "green", marginBottom: 20 },
  };

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const { data, error } = await supabase
          .from("forms")
          .select("*")
          .eq("share_link", token)
          .eq("link_active", true)
          .single();

        if (error || !data) {
          setErrorMsg("Link expired or invalid.");
          setLoading(false);
          return;
        }

        setCurrentForm(data);
      } catch (err) {
        console.error("Error fetching form:", err);
        setErrorMsg("Failed to fetch form.");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [token]);

  const handleSubmitResponse = async () => {
    if (!currentForm?.id) {
      setErrorMsg("Form not found. Cannot submit response.");
      return;
    }
    if (!response.completed) {
      setErrorMsg("Please select visit completion status.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase
        .from("forms")
        .update({
          completed: response.completed,
          response_notes: response.notes,
          temp: response.temp,
          bp: response.bp,
          status: "Submitted",
          link_active: false,
        })
        .eq("id", currentForm.id);

      if (error) throw error;

      // NEW: show submission screen instead of alert
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting response:", err);
      setErrorMsg("Failed to submit response. Check network or Supabase.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- RENDER -------------------
  if (loading)
    return <div style={styles.container}><p>Loading...</p></div>;

  if (errorMsg)
    return <div style={styles.container}><p style={styles.error}>{errorMsg}</p></div>;

  if (!currentForm) return null;

  // ------------------- SUBMITTED SCREEN -------------------
  if (submitted)
    return (
      <div style={styles.container}>
        <div style={styles.tick}>✅</div>
        <h2>Response Submitted Successfully!</h2>
        <p>Thank you for submitting your response. This form is now closed.</p>
      </div>
    );

  // ------------------- FORM SCREEN -------------------
  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Patient Visit Form</h2>

      <p style={styles.info}><strong>Patient:</strong> {currentForm.patient_name}</p>
      <p style={styles.info}><strong>Address:</strong> {currentForm.address}</p>
      <p style={styles.info}><strong>Notes:</strong> {currentForm.notes || "None"}</p>

      <label style={styles.label}>Visit Completed</label>
      <select
        style={styles.formInput}
        value={response.completed}
        onChange={(e) => setResponse({ ...response, completed: e.target.value })}
      >
        <option value="">Select</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>

      <label style={styles.label}>Notes</label>
      <textarea
        style={styles.textarea}
        placeholder="Additional notes"
        value={response.notes}
        onChange={(e) => setResponse({ ...response, notes: e.target.value })}
      />

      <label style={styles.label}>Temperature</label>
      <input
        style={styles.formInput}
        placeholder="e.g., 36.6°C"
        value={response.temp}
        onChange={(e) => setResponse({ ...response, temp: e.target.value })}
      />

      <label style={styles.label}>Blood Pressure</label>
      <input
        style={styles.formInput}
        placeholder="e.g., 120/80"
        value={response.bp}
        onChange={(e) => setResponse({ ...response, bp: e.target.value })}
      />

      <button
        style={styles.primaryBtn}
        onClick={handleSubmitResponse}
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Response"}
      </button>
    </div>
  );
}
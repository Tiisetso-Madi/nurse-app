import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { v4 as uuidv4 } from "uuid"; // npm install uuid
import { useParams } from "react-router-dom"; // for nurse link route

export default function App() {
  // ------------------- HOOKS -------------------
  const [screen, setScreen] = useState("dashboard");
  const [forms, setForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
  const [user, setUser] = useState(null); // null = not logged in
const [loginData, setLoginData] = useState({ username: "", password: "" });
const [loginError, setLoginError] = useState("");

  const [formData, setFormData] = useState({
    patientName: "",
    address: "",
    date: "",
    notes: "",
    nurse: { name: "", contact: "" },
  });

  const [response, setResponse] = useState({ completed: "", notes: "", temp: "", bp: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ------------------- STYLES -------------------
  const styles = {
    container: { maxWidth: 600, margin: "20px auto", padding: 20, fontFamily: "Arial, sans-serif", background: "#f4f6f8", borderRadius: 10 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    primaryBtn: { padding: "10px 15px", borderRadius: 8, border: "none", cursor: "pointer", background: "#007bff", color: "white" },
    table: { width: "100%", borderCollapse: "collapse", background: "white", marginTop: 20 },
    thtd: { padding: 10, borderBottom: "1px solid #ddd", textAlign: "left" },
    formInput: { width: "100%", padding: 10, marginBottom: 12, borderRadius: 8, border: "1px solid #ccc" },
    textarea: { width: "100%", padding: 10, marginBottom: 12, borderRadius: 8, border: "1px solid #ccc", minHeight: 80 },
    card: { background: "white", padding: 15, borderRadius: 10, marginBottom: 10 },
    row: { display: "flex", gap: 10, marginBottom: 10 },
    actions: { display: "flex", gap: 10 },
    center: { textAlign: "center" },
    muted: { color: "#666" },
    error: { color: "red", marginBottom: 10 }
  };

  // ------------------- ACTIONS -------------------
  
 const handleLogin = () => {
  setLoginError("");
  const { username, password } = loginData;

  if (username === "admin" && password === "password123") {
    const loggedInUser = { username };
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser)); // SAVE
    setScreen("dashboard");
    setLoginData({ username: "", password: "" });
  } else {
    setLoginError("Invalid username or password");
  }
};

const handleLogout = () => {
  setUser(null);
  localStorage.removeItem("user"); // REMOVE
  setScreen("login");
};

useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    setUser(JSON.parse(storedUser));
    setScreen("dashboard");
  } else {
    setScreen("login");
  }
}, []);


  const fetchForms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forms")
        .select("*")
        .neq("deleted", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setForms(data || []);
    } catch (err) {
      console.error("Error fetching forms:", err);
      setErrorMsg("Failed to fetch forms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  // ------------------- FORM CREATION -------------------
  const handleSendForm = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const linkToken = uuidv4();
      const { data, error } = await supabase
        .from("forms")
        .insert([
          {
            patient_name: formData.patientName,
            address: formData.address,
            date: formData.date,
            notes: formData.notes,
            nurse_name: formData.nurse.name,
            nurse_contact: formData.nurse.contact,
            status: "Pending",
            share_link: linkToken,
            link_active: true
          },
        ])
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No data returned");

      setForms([data[0], ...forms]);
      setCurrentForm(data[0]);
      setScreen("confirmation");

      // reset form
      setFormData({ patientName: "", address: "", date: "", notes: "", nurse: { name: "", contact: "" } });
      setResponse({ completed: "", notes: "", temp: "", bp: "" });

      // display the nurse link
      console.log(`Send this link to nurse: https://your-app.com/nurse-form/${linkToken}`);
    } catch (err) {
      console.error("Error sending form:", err);
      setErrorMsg("Failed to send form. Check Supabase policies or network.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- NURSE SUBMISSION -------------------
  const handleSubmitResponse = async () => {
    setErrorMsg("");
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forms")
        .update({
          response_completed: response.completed,
          response_notes: response.notes,
          response_temp: response.temp,
          response_bp: response.bp,
          status: "Submitted",
          link_active: false, // expire link
        })
        .eq("id", currentForm.id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("No data returned");

      const updatedForms = forms.map(f => (f.id === currentForm.id ? data[0] : f));
      setForms(updatedForms);
      setScreen("success");
    } catch (err) {
      console.error("Error submitting response:", err);
      setErrorMsg("Failed to submit response. Check Supabase policies or network.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- SOFT DELETE -------------------
  const handleDeleteForm = async (id) => {
    if (!window.confirm("Are you sure you want to delete this form?")) return;
    try {
      const { error } = await supabase
        .from("forms")
        .update({ status: "Deleted" })
        .eq("id", id);

      if (error) throw error;
      setForms(forms.map(f => (f.id === id ? { ...f, status: "Deleted" } : f)));
      setScreen("dashboard");
    } catch (err) {
      console.error("Error deleting form:", err);
      setErrorMsg("Failed to delete form.");
    }
  };

  // ------------------- ROUTING -------------------
  const NurseForm = () => {
    const { token } = useParams();
    const [form, setForm] = useState(null);

    useEffect(() => {
      const fetchForm = async () => {
        const { data, error } = await supabase
          .from("forms")
          .select("*")
          .eq("share_link", token)
          .eq("link_active", true)
          .single();

        if (error || !data) {
          alert("Link expired or invalid");
          return;
        }
        setForm(data);
        setCurrentForm(data);
        setScreen("nurseForm");
      };
      fetchForm();
    }, [token]);

    return null; // rendering handled in nurseForm screen
  };

  // ------------------- SCREENS -------------------
  if (loading) return <div style={{ ...styles.container, ...styles.center }}>Loading...</div>;
  
  if (!user || screen === "login") {
  return (
    <div style={{ ...styles.container, textAlign: "center" }}>
      <h2>Admin Login</h2>
      {loginError && <p style={{ color: "red" }}>{loginError}</p>}
      <input
        placeholder="Username"
        style={styles.formInput}
        value={loginData.username}
        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
      />
      <input
        placeholder="Password"
        type="password"
        style={styles.formInput}
        value={loginData.password}
        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
      />
      <button style={styles.primaryBtn} onClick={handleLogin}>Login</button>
    </div>
  );
}

  if (screen === "dashboard") {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2>Nurse Form Management</h2>
          <button style={styles.primaryBtn} onClick={() => setScreen("create")}>+ New Form</button>
		   <button style={{ ...styles.primaryBtn, background: "#dc3545" }} onClick={handleLogout}>Logout</button>
        </div>
        {errorMsg && <div style={styles.error}>{errorMsg}</div>}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.thtd}>Patient</th>
              <th style={styles.thtd}>Date</th>
              <th style={styles.thtd}>Nurse</th>
              <th style={styles.thtd}>Status</th>
            </tr>
          </thead>
          <tbody>
            {forms.map(f => (
              <tr key={f.id} style={{ cursor: "pointer" }} onClick={() => { setCurrentForm(f); setScreen("view"); }}>
                <td style={styles.thtd}>{f.patient_name}</td>
                <td style={styles.thtd}>{f.date}</td>
                <td style={styles.thtd}>{f.nurse_name}</td>
                <td style={styles.thtd}>{f.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (screen === "create") {
    return (
      <div style={styles.container}>
        <h2>Create Form</h2>
        {errorMsg && <div style={styles.error}>{errorMsg}</div>}
        <input placeholder="Patient Name" style={styles.formInput} value={formData.patientName} onChange={e => setFormData({ ...formData, patientName: e.target.value })} />
        <input placeholder="Address" style={styles.formInput} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
        <input type="datetime-local" style={styles.formInput} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
        <textarea placeholder="Notes" style={styles.textarea} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
        <h4>Assign Nurse</h4>
        <div style={styles.row}>
          <input placeholder="Name" style={styles.formInput} value={formData.nurse.name} onChange={e => setFormData({ ...formData, nurse: { ...formData.nurse, name: e.target.value } })} />
          <input placeholder="Contact" style={styles.formInput} value={formData.nurse.contact} onChange={e => setFormData({ ...formData, nurse: { ...formData.nurse, contact: e.target.value } })} />
        </div>
        <div style={styles.actions}>
          <button style={styles.primaryBtn} onClick={handleSendForm}>Send Form</button>
          <button onClick={() => setScreen("dashboard")}>Cancel</button>
        </div>
      </div>
    );
  }

  if (screen === "confirmation") {
    return (
      <div style={{ ...styles.container, ...styles.center }}>
        <h2>✅ Form Sent</h2>
        <button style={styles.primaryBtn} onClick={() => setScreen("dashboard")}>Back to Dashboard</button>
      </div>
    );
  }

  if (screen === "success") {
    return (
      <div style={{ ...styles.container, ...styles.center }}>
        <h2>✅ Submission Received</h2>
        <button style={styles.primaryBtn} onClick={() => setScreen("dashboard")}>Back to Dashboard</button>
      </div>
    );
  }
  
  

  // ------------------- VIEW SCREEN -------------------
if (screen === "view") {
  return (
    <div style={styles.container}>
      <h2>Patient Visit Details</h2>
      {errorMsg && <div style={styles.error}>{errorMsg}</div>}

      <div style={styles.card}>
        <strong>Patient Name:</strong> {currentForm.patient_name} <br />
        <strong>Address:</strong> {currentForm.address} <br />
        <strong>Visit Date:</strong> {currentForm.date} <br />
        <strong>Initial Notes:</strong> {currentForm.notes || "None"} <br />
        <strong>Nurse:</strong> {currentForm.nurse_name} ({currentForm.nurse_contact}) <br />
        <strong>Status:</strong> {currentForm.status} <br />

{currentForm.completed ? (
  <>
    <hr />
    <h4>Nurse Response</h4>
    <p><strong>Visit Completed:</strong> {currentForm.completed}</p>
    <p><strong>Notes:</strong> {currentForm.response_notes || "None"}</p>
    <p><strong>Temperature:</strong> {currentForm.temp || "N/A"}</p>
    <p><strong>Blood Pressure:</strong> {currentForm.bp || "N/A"}</p>
  </>
) : (
  <p style={styles.muted}>No nurse response submitted yet.</p>
)}

        {currentForm.share_link && currentForm.link_active && (
          <p>
            Link:{" "}
            <a
              href={`http://localhost:3000/nurse-form/${currentForm.share_link}`}
              target="_blank"
              rel="noreferrer"
            >
              Send to Nurse
            </a>
          </p>
        )}
      </div>

      <div style={styles.actions}>
        <button style={styles.primaryBtn} onClick={() => setScreen("dashboard")}>Back</button>
        <button
          style={{ ...styles.primaryBtn, background: "#dc3545" }}
          onClick={() => handleDeleteForm(currentForm.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}}
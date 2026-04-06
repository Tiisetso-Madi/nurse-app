import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { v4 as uuidv4 } from "uuid"; // npm install uuid
//import { useParams } from "react-router-dom"; // for nurse link route
import logo from "./logo.png";
import jsPDF from "jspdf";

import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";




export default function App() {
  // ------------------- HOOKS -------------------
  const [screen, setScreen] = useState("dashboard");
  const [forms, setForms] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);
const [response, setResponse] = useState({});
  // Add these hooks at the top
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

const navigate = useNavigate();

const downloadPDF = () => {
  const element = document.getElementById("pdf-content");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;

  const headerHeight = 30; // reserve space for header
  const footerHeight = 30; // reserve space for footer
  const contentHeight = pageHeight - headerHeight - footerHeight;

  
  html2canvas(element, { 
  scale: 2,
  backgroundColor: null // 🔥 allows transparency
}).then(async (canvas) => {
    const imgProps = pdf.getImageProperties(canvas.toDataURL("image/png"));
    const pdfWidth = pageWidth - margin * 2;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = pdfHeight;
    let offsetY = 0;

    while (heightLeft > 0) {
     // --- HEADER ---

// Logo (left side)
pdf.addImage(logo, "PNG", margin, 5, 30, 20); // slightly taller for balance

// Text next to logo
pdf.setFont("times", "italic", "bold"); // serif + italic
pdf.setFontSize(20);
pdf.setTextColor(11, 34, 66); // #0B2242
pdf.text("Nachi Medical Solutions (Pty) Ltd", margin + 40, 12);

pdf.setFontSize(11);
pdf.text("Practice number Registered Nurse ND Kutama 1274872", margin + 40, 18);

// Divider line under header
pdf.setDrawColor(0);
pdf.setLineWidth(0.5);
pdf.line(margin, 25, pageWidth - margin, 25);

// --- WATERMARK ---
//const wmWidth = pageWidth / 2;   // scale dynamically
//const wmHeight = wmWidth;        // keep square
// --- CREATE FADED WATERMARK ONCE ---
const watermarkCanvas = document.createElement("canvas");
const ctx = watermarkCanvas.getContext("2d");

const img = new Image();
img.src = logo;

await new Promise((resolve) => (img.onload = resolve));

watermarkCanvas.width = img.width;
watermarkCanvas.height = img.height;

// 🔥 control opacity here
ctx.globalAlpha = 0.15; 
ctx.drawImage(img, 0, 0);

const fadedLogo = watermarkCanvas.toDataURL("image/png");
pdf.addImage(fadedLogo, "PNG", pageWidth / 2 - 60, pageHeight / 2 - 60, 120, 120);

      // --- CONTENT SLICE ---
      const pageCanvas = document.createElement("canvas");
      const pageCtx = pageCanvas.getContext("2d");
      pageCanvas.width = canvas.width;
      pageCanvas.height = (contentHeight * canvas.width) / pdfWidth;

      pageCtx.drawImage(
        canvas,
        0, offsetY, canvas.width, pageCanvas.height, // source slice
        0, 0, canvas.width, pageCanvas.height        // destination
      );

      const imgData = pageCanvas.toDataURL("image/png");
      const sliceHeight = (pageCanvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", margin, headerHeight, pdfWidth, sliceHeight);


      // --- FOOTER ---
// --- FOOTER ---
pdf.setFont("helvetica", "normal"); // plain sans-serif
pdf.setFontSize(9);
pdf.setTextColor(0, 0, 0); // black

pdf.text(
  "Nachi Medical Solutions (Pty) Ltd | Reg No: 2018/399543/07",
  pageWidth / 2,
  pageHeight - 25,
  { align: "center" }
);
pdf.text(
  "3499 Arctotis Street, Irene, Pretoria, 0157",
  pageWidth / 2,
  pageHeight - 20,
  { align: "center" }
);
pdf.text(
  "Tel: 0120010105 | Cell: 0711659551 | Email: info@nachimedicalsolutions.co.za",
  pageWidth / 2,
  pageHeight - 15,
  { align: "center" }
);
pdf.text(
  "Web: www.nachimedicalsolutions.co.za | Director: Devlia Kutama",
  pageWidth / 2,
  pageHeight - 10,
  { align: "center" }
);


      heightLeft -= contentHeight;
      offsetY += pageCanvas.height;

      if (heightLeft > 0) pdf.addPage();
    }

    pdf.save(`Patient_Record_${currentForm.patient_name}.pdf`);
  });
};




  const [user, setUser] = useState(null); // null = not logged in
const [loginData, setLoginData] = useState({ username: "", password: "" });
const [loginError, setLoginError] = useState("");

 const [formData, setFormData] = useState({
  // Patient
  patientName: "",
  patientId: "",
  dob: "",
  contact: "",
  address: "",

  // Clinical
  date: "",
  time: "",
  bp: "",
  pulse: "",
  temp: "",
  spo2: "",
  condition: "",

  // History
  allergies: false,
  chronic: false,
  pregnancy: false,
  historyDetails: "",

  // Treatment
  medication: "",
  diagnosis: "",
  icd10: "",
  ivTherapy: "",

  // Admin
  ivSite: "",
  cannula: "",

  // Drug
  drugName: "",
  dose: "",
  batchNo: "",
  expiry: "",

  // Timing
  startTime: "",
  endTime: "",

  // Reaction
  reaction: "",
  reaction_desc: "",
  reaction_assessment: "",
  reaction_treatment: "",

  // Consent
  consent: false,
  patientSignature: "",

  // Nurse
  nurse: { name: "", contact: "" },
});


  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");


  // ------------------- STYLES -------------------
  const styles = {
    container: { maxWidth: 600, margin: "20px auto", padding: 20, fontFamily: "Arial, sans-serif", background: "#f4f6f8", borderRadius: 10 },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    primaryBtn: { padding: "10px 15px", borderRadius: 8, border: "none", cursor: "pointer", background: "#007bff", color: "white" },
    table: { width: "98%", borderCollapse: "collapse", background: "white", marginTop: 20, fontSize: 11 },
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
  
const handleLogin = async () => {
  setLoginError("");
  const { username, password } = loginData;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: username, // you're using username as email
    password: password,
  });

  if (error) {
    setLoginError(error.message);
    return;
  }

  const user = data.user;

  setUser(user);
  localStorage.setItem("user", JSON.stringify(user));
  setScreen("dashboard");
  setLoginData({ username: "", password: "" });
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
    // Validate required fields
    if (!formData.patientName || !formData.date) {
      setErrorMsg("Patient name and date are required.");
      setLoading(false);
      return;
    }

    const linkToken = uuidv4();
    const dateISO = new Date(formData.date).toISOString();

    const { data, error } = await supabase
      .from("forms")
      .insert([
        {
          patient_name: formData.patientName.trim(),
          patient_id: formData.patientId.trim() || null,
          contact: formData.contact?.trim() || null,
          date: formData.date ? dateISO : null ,
        dob: formData.dob?.trim() || null,
          nurse_name: formData.nurse?.name?.trim() || null,
          nurse_contact: formData.nurse?.contact?.trim() || null,
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
    setFormData({ patientName: "", address: "", date: "", notes: "", nurse: { name: "", contact: "" } });
    setResponse({ completed: "", notes: "", temp: "", bp: "" });

    const link = `https://nachinurseform.netlify.app/nurse-form/${linkToken}`;
    console.log(`Send this link to nurse via WhatsApp: ${link}`);

try {
  const response = await emailjs.send(
    "service_5y7yfvi",
    "template_2tuj162",
    {
      email: formData.nurse?.contact?.trim(),
      name: formData.patientName.trim(),
      form_link: link,
    },
    "aQSTcBp6a7DnSBIwU"
  );

  if (response.status === 200) {
    console.log("Email sent status:", response.status);
  }

} catch (err) {
  console.log("Email sent status:", response.status);
}
  } catch (err) {
    console.error("Error sending form:", err);
    setErrorMsg("Failed to send form. Check Supabase policies or network.");
  } finally {
    setLoading(false);
  }
};
  // ------------------- NURSE SUBMISSION -------------------

  // ------------------- SOFT DELETE -------------------
  //const handleDeleteForm = async (id) => {
    //if (!window.confirm("Are you sure you want to delete this form?")) return;
    //try {
      //const { error } = await supabase
        //.from("forms")
        //.update({ status: "Deleted" })
        //.eq("id", id);

      //if (error) throw error;
      //setForms(forms.map(f => (f.id === id ? { ...f, status: "Deleted" } : f)));
      //setScreen("dashboard");
    //} catch (err) {
      //console.error("Error deleting form:", err);
     // setErrorMsg("Failed to delete form.");
   // }
 // };

  // ------------------- ROUTING -------------------
 // const NurseForm = () => {
   // const { token } = useParams();
    //const [form, setForm] = useState(null);

    //useEffect(() => {
      //const fetchForm = async () => {
        //const { data, error } = await supabase
          //.from("forms")
          //.select("*")
          //.eq("share_link", token)
          //.eq("link_active", true)
          //.single();

        //if (error || !data) {
          //alert("Link expired or invalid");
          //return;
        //}
        //setForm(data);
        //setCurrentForm(data);
        //setScreen("nurseForm");
      //};
      //fetchForm();
    //}, [token]);

    //return null; // rendering handled in nurseForm screen
  //};

  // ------------------- SCREENS -------------------
  if (loading) return <div style={{ ...styles.container, ...styles.center }}>Loading...</div>;
  
if (!user || screen === "login") {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f8",
      }}
    >
      <div
        style={{
          width: 350,
          padding: 30,
          background: "white",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        {/* ✅ LOGO */}
        <img
          src={logo}
          alt="logo"
          style={{ height: 70, marginBottom: 15 }}
        />

        <h2 style={{ marginBottom: 20 }}>Admin Login</h2>

        {loginError && <p style={{ color: "red" }}>{loginError}</p>}

        <input
          placeholder="Username"
          style={styles.formInput}
          value={loginData.username}
          onChange={(e) =>
            setLoginData({ ...loginData, username: e.target.value })
          }
        />

        <input
          placeholder="Password"
          type="password"
          style={styles.formInput}
          value={loginData.password}
          onChange={(e) =>
            setLoginData({ ...loginData, password: e.target.value })
          }
        />

        <button style={{ ...styles.primaryBtn, width: "100%" }} onClick={handleLogin}>
          Login
        </button>
      </div>
    </div>
  );
}
  if (screen === "dashboard") {
    const filteredForms = forms.filter((f) => {
  const term = search.toLowerCase();

  return (
    f.patient_name?.toLowerCase().includes(term) ||
    f.nurse_name?.toLowerCase().includes(term) ||
    f.status?.toLowerCase().includes(term) ||
    f.date?.toLowerCase().includes(term)
  );
});
    return (
      
      <div style={styles.container}>
<div
  style={{
    display: "flex",
    flexDirection: "column",   // stack items vertically
    gap: 8,                     // space between title and buttons
    marginBottom: 20,
  }}
>
  <h2 style={{ margin: 0, width: "100%" }}>
    Nurse Form Management
  </h2>

  <div
    style={{
      display: "flex",
      flexWrap: "nowrap",
      gap: 6,
      overflowX: "auto",
    }}
  >
    <button
      style={{
        flex: "1 1 auto",
        minWidth: 60,
        maxWidth: 150,
        padding: "6px 8px",
        fontSize: "12px",
        borderRadius: 6,
        border: "none",
        background: "#007bff",
        color: "#fff",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
      onClick={() => setScreen("create")}
    >
      + New Form
    </button>

    <button
      style={{
        flex: "1 1 auto",
        minWidth: 60,
        maxWidth: 150,
        padding: "6px 8px",
        fontSize: "12px",
        borderRadius: 6,
        border: "none",
        background: "#dc3545",
        color: "#fff",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
      onClick={handleLogout}
    >
      Logout
    </button>
  </div>
</div>
       
       <div style={{ marginTop: 10 }}>
  <input
    placeholder="🔍 Search patient, nurse, status, date..."
    style={{
      width: "95%",
      padding: 10,
      borderRadius: 8,
      border: "1px solid #ccc",
      marginTop: 10
    }}
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
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
            {filteredForms.map(f => (
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
        <h4>Patient Details</h4>
        {errorMsg && <div style={styles.error}>{errorMsg}</div>}
       
<input placeholder="Name" style={styles.formInput} onChange={e => setFormData({...formData, patientName: e.target.value})} />
<input placeholder="ID Number" style={styles.formInput} onChange={e => setFormData({...formData, patientId: e.target.value})} />
<input type="date" style={styles.formInput} onChange={e => setFormData({...formData, date: e.target.value})} />
<input placeholder="Contact" style={styles.formInput} onChange={e => setFormData({...formData, contact: e.target.value})} />
<input placeholder="Date of Birth" style={styles.formInput} onChange={e => setFormData({...formData, dob: e.target.value})} />
       
        <h4>Assign Practitioner</h4>
        <div style={styles.row}>
          <input placeholder="Practitioner Name" style={styles.formInput} value={formData.nurse.name} onChange={e => setFormData({ ...formData, nurse: { ...formData.nurse, name: e.target.value } })} />
          <input placeholder="Email Address" style={styles.formInput} value={formData.nurse.contact} onChange={e => setFormData({ ...formData, nurse: { ...formData.nurse, contact: e.target.value } })} />
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
   

{/* HEADER (excluded from canvas) */}
  <div id="pdf-header" data-html2canvas-ignore>
<div
  style={{
    position: "fixed",
    top: 10,
    right: 10,
    display: "flex",
    gap: 6,
    zIndex: 1000,
    justifyContent: "flex-end",
    flexWrap: "nowrap", // keep everything on one line
    overflowX: "auto", // allows horizontal scroll if extremely narrow
    padding: "0 5px",
  }}
>
  {/** Back Button **/}
  <button
    style={{
      flex: "1 1 auto",
      minWidth: 50,
      maxWidth: 150,
      padding: "6px 8px",
      fontSize: "12px",
      borderRadius: 6,
      border: "none",
      background: "#6c757d",
      color: "#fff",
      cursor: "pointer",
      whiteSpace: "nowrap",
    }}
    onClick={() => setScreen("dashboard")}
  >
    Back
  </button>

  {/** Download PDF **/}
  <button
    style={{
      flex: "1 1 auto",
      minWidth: 50,
      maxWidth: 150,
      padding: "6px 8px",
      fontSize: "12px",
      borderRadius: 6,
      border: "none",
      background: "#007bff",
      color: "#fff",
      cursor: "pointer",
      whiteSpace: "nowrap",
    }}
    onClick={downloadPDF}
  >
    📄 Download
  </button>

  {/** Edit Form **/}
  <button
    style={{
      flex: "1 1 auto",
      minWidth: 50,
      maxWidth: 150,
      padding: "6px 8px",
      fontSize: "12px",
      borderRadius: 6,
      border: "none",
      background: "#28a745",
      color: "#fff",
      cursor: "pointer",
      whiteSpace: "nowrap",
    }}
    onClick={() => navigate(`/AdminEdit/${currentForm.id}`)}
  >
    ✏️ Edit
  </button>

  {/** Delete Form **/}
  <button
    style={{
      flex: "1 1 auto",
      minWidth: 50,
      maxWidth: 150,
      padding: "6px 8px",
      fontSize: "12px",
      borderRadius: 6,
      border: "none",
      background: "#dc3545",
      color: "#fff",
      cursor: "pointer",
      whiteSpace: "nowrap",
    }}
    onClick={() => setShowDeleteConfirm(true)}
  >
    🗑 Delete
  </button>
</div>


    <div style={{ display: "flex", alignItems: "center", borderBottom: "2px solid #000", paddingBottom: 10,paddingTop: 35, marginBottom: 20 }}>
      <div>
        <img src={logo} alt="logo" style={{ height: 60 }} />
      </div>
      <div style={{ flex: 1, textAlign: "center" }}>
        <h2 style={{ fontStyle: "italic", margin: 0, fontFamily: "serif", color: "#0B2242", lineHeight: 1.3,   fontSize: 18}}>
          Nachi Medical Solutions (Pty) Ltd
        </h2>
        <p style={{ fontSize: 11, fontStyle: "italic", margin: 0, fontFamily: "serif", color: "#0B2242" }}>
          Practice number Registered Nurse ND Kutama 1274872
        </p>
      </div>
    </div>
  </div>
      {/* PDF CONTENT START */}
      <div id="pdf-content" style={{ background: "transparent", padding: 0, lineHeight: 1.3,   fontSize: 8}}>


         {currentForm.share_link && currentForm.link_active && (
          <p>
            Link:{" "}
            <a
            href={`${window.location.origin}/nurse-form/${currentForm.share_link}`}
              target="_blank"
              rel="noreferrer"
            >
              Send to Nurse
            </a>
          </p>
        )}

        {/* PATIENT DETAILS */}
        <h4>Patient Details</h4>

        

        <p><strong>Name:</strong> {currentForm.patient_name}</p>
        <p><strong>ID:</strong> {currentForm.patient_id}</p>
        <p><strong>DOB:</strong> {currentForm.dob}</p>
        <p><strong>Contact:</strong> {currentForm.contact}</p>

        <hr />

        {/* CLINICAL ASSESSMENT */}
        <h4 style={{marginTop: 5}}>Clinical Assessment</h4>

         {/* DATE AND TIME */}
       <div style={{ display: "flex", gap: 20, marginBottom: 10, alignItems: "center" }}>
  <div>
    <strong>Date: </strong>
    <span>{currentForm.date || "___/___/___"}</span>
  </div>

  <div>
    <strong>Time: </strong>
    <span>{currentForm.visit_time || "___:___"}</span>
  </div>
</div>
 {/* chronics*/}
<div style={{ display: "flex", gap: 20, marginBottom: 10, alignItems: "center" }}>
  <div>
    <span>BP: </span>
    <span>{currentForm.bp || "__/__"} mmHg</span>
  </div>

  <div>
    <span>Pulse: </span>
    <span >{currentForm.pulse || "__"} bpm</span>
  </div>

  <div>
    <span>Temp: </span>
    <span>{currentForm.temp || "__"}°C</span>
  </div>

  <div>
    <span>SpO₂: </span>
    <span>{currentForm.spo2 || "__"}%</span>
  </div>
</div>


        
<p style={{ display: "flex", alignItems: "center", gap: 15 }}>
  Condition:

  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
    <span>{currentForm.condition === "Stable" ? "☑" : "☐"}</span>
    <span>Stable</span>
  </span>

  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
    <span>{currentForm.condition === "Unstable" ? "☑" : "☐"}</span>
    <span>Unstable</span>
  </span>
</p>

        

        <hr />

        {/* HISTORY */}
        <h4 style={{marginTop: 5}}>Medical History</h4>
<p style={{ display: "flex", alignItems: "center", gap: 10 }}>
  <span>{currentForm.allergies ? "☑" : "☐"}</span>
  <span>Allergies</span>

  <span>{currentForm.chronic ? "☑" : "☐"}</span>
  <span>Chronic Illness</span>

<span>{currentForm.pregnancy ? "☑" : "☐"}</span>
  <span>Pregnancy</span>

 

</p>
<p>  Details : {currentForm.history_details || "None"} </p>
<p>Medication : {currentForm.medication || "None"} </p>


        <hr />

        {/* DIAGNOSIS */}
        <h4 style={{marginTop: 5}}>Diagnosis / Indication</h4>
     
        <p>ICD-10: {currentForm.icd10}</p>

        <hr />

        {/* TREATMENT */}
        <h4 style={{marginTop: 5}}>Treatment</h4>

        <div style={{ display: "flex", gap: 30, marginBottom: 5, alignItems: "center" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
    IV Therapy:
    <span style={{  minWidth: 120 }}>
      {currentForm.iv_therapy || "________"}
    </span>
  </div>
</div>

        <hr />

{/* ADMINISTRATION RECORD */}
<h4 style={{marginTop: 5}}>Administration Record</h4>
<div style={{ display: "flex", gap: 30, marginBottom: 10, alignItems: "center" }}>
  <div style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", }}>
    IV Site:
    <span style={{  minWidth: 120 }}>
      {currentForm.iv_site || "____________"}
    </span>
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",}}>
    Cannula:
    <span style={{  minWidth: 120 }}>
      {currentForm.cannula || "____________"}
    </span>
  </div>
</div>
        <hr />

        {/* DRUG */}



      <h4 style={{marginTop: 20}}>Drug Details</h4>
        <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
        <strong>Drug Dose:</strong>
        <span>{currentForm.dose|| "_________________"}</span>
        <strong>Batch No:</strong>
        <span>{currentForm.batch_no|| "___________________"}</span> 
        <strong>Expiry Date:</strong>
        <span>{currentForm.expiry|| "___________________"}</span>
      </div>
      
    <div style={{ display: "flex", gap: 30, marginBottom: 10, alignItems: "center" }}>



  <div>
    <strong>Start: </strong>
    <span>{currentForm.start_time|| "___:___"}</span>
  </div>

  <div>
    <strong>End: </strong>
    <span>{currentForm.end_time|| "___:___"}</span>
  </div>
</div>
        

     {/* REACTION */}
<div style={{ marginTop: 10 }}>
  {/* Reaction Options */}
  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
    <span>Reaction:</span>

    <span>
      {currentForm.reaction === "None" ? "☑" : "☐"} None
    </span>

    <span>
      {currentForm.reaction === "Yes" ? "☑" : "☐"} Yes
    </span>
  </div>

  {/* Reaction Details (only if Yes) */}
  {currentForm.reaction === "Yes" && (
    <div style={{ marginTop: 10 }}>
      <div>
        Assessment:{" "}
        {currentForm.reaction_assessment || "______________________"}
      </div>

      <div>
        Diagnosis:{" "}
        {currentForm.reaction_desc || "______________________"}
      </div>

      <div>
        Treatment:{" "}
        {currentForm.reaction_treatment || "______________________"}
      </div>
    </div>
  )}
</div>

     

{/* CONSENT */}
<h4>Consent</h4>

<p>I confirm that:</p>
<ul style={{ margin: 5, paddingLeft: 20, gap: 5 }}>
  <li>Information provided is correct</li>
  <li>Procedure, risks, and alternatives explained</li>
  <li>Patient consented to IV therapy</li>
</ul>

{/* SIGNATURES */}


  <div style={{ marginTop: 15 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    Patient Signature:
    {currentForm.patient_signature ? (
      <img
        src={currentForm.patient_signature}
        alt="patient signature"
        style={{ height: 35, borderBottom: "1px solid #000" }}
      />
    ) : (
      <span style={{ display: "inline-block", borderBottom: "1px solid #000", minWidth: 200 }}>
        {/* empty underline when no signature */}
      </span>
    )}
  </div>



{/* Practitioner Signature */}
<p style={{ marginTop: 13 }}>
    <strong>Practitioner:</strong> {currentForm.nurse_name}
  </p>
<div style={{ marginTop: 0 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
    <strong>Practitioner Signature:</strong>
    {currentForm.practitioner_signature ? (
      <img
        src={currentForm.practitioner_signature}
        alt="practitioner signature"
        style={{ height: 35, borderBottom: "1px solid #000" }}
      />
    ) : (
      <span style={{ display: "inline-block", borderBottom: "1px solid #000", minWidth: 200 }}>
        {/* empty underline when no signature */}
      </span>
    )}
  </div>
  
</div>



</div>



      </div>
      {/* PDF CONTENT END */}

    {/* FOOTER (excluded from canvas) */}
{/* FOOTER (excluded from canvas) */}
<div id="pdf-footer" data-html2canvas-ignore>
  <div style={{
    borderTop: "1px solid #000",
    marginTop: 20,
    paddingTop: 8,
    fontSize: 8,
    textAlign: "center",
    lineHeight: 1.3
  }}>
    <p style={{ margin: 2 }}>
      <strong>Nachi Medical Solutions (Pty) Ltd</strong> | Reg No: 2018/399543/07
    </p>
    <p style={{ margin: 2 }}>3499 Arctotis Street, Irene, Pretoria, 0157</p>
    <p style={{ margin: 2 }}>Tel: 0120010105 | Cell: 0711659551</p>
    <p style={{ margin: 2 }}>Email: info@nachimedicalsolutions.co.za | Web: www.nachimedicalsolutions.co.za</p>
    <p style={{ margin: 2 }}>Director: Devlia Kutama</p>
  </div>
</div>

{/* MODERN DELETE CONFIRM MODAL */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 30,
              borderRadius: 12,
              maxWidth: 400,
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ marginBottom: 20 }}>Confirm Deletion</h3>
            <p>Are you sure you want to delete this form?</p>
            <div style={{ display: "flex", justifyContent: "space-around", marginTop: 20 }}>
               <button
          style={{ ...styles.primaryBtn, background: "#dc3545" }}
          onClick={async () => {
            try {
              // Soft delete in Supabase
              const { error } = await supabase
                .from("forms")
                .update({ deleted: true, status: "Deleted" })
                .eq("id", currentForm.id);

              if (error) throw error;

              // Update local state
              setForms(forms.map(f => f.id === currentForm.id ? { ...f, deleted: true, status: "Deleted" } : f));
              setScreen("dashboard");
            } catch (err) {
              console.error("Error deleting form:", err);
              setErrorMsg("Failed to delete form.");
            } finally {
              setShowDeleteConfirm(false);
            }
          }}
        >
          Delete
        </button>
              <button
                style={{ ...styles.primaryBtn, background: "#6c757d" }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

}

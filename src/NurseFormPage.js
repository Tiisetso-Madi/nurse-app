// NurseFormPage.js
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./supabaseClient";
import logo from "./logo.png";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import SignatureCanvas from 'react-signature-canvas';

export default function NurseFormPage() {
  const { token } = useParams();
  const formRef = useRef(); // for PDF

  const patientSigRef = useRef(null);
  const practitionerSigRef = useRef(null);
    const [nurseName, setNurseName] = useState("");

  const [currentForm, setCurrentForm] = useState(null);
  const [response, setResponse] = useState({
    completed: "",
    notes: "",
    temp: "",
    bp: "",

    visitDate: "",
    visitTime: "",
    pulse: "",
    spo2: "",
    condition: "",

    allergies: false,
    chronic: false,
    pregnancy: false,
    historyDetails: "",

    medication: "",
    diagnosis: "",
    icd10: "",

    ivTherapy: "",
    ivSite: "",
    cannula: "",

    drug: "",
    dose: "",
    batchNo: "",
    expiry: "",
    startTime: "",
    endTime: "",

    reaction: "",
    reactionDetails: "",

    consent: false,
    patientSignature: ""
  });

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false); // track submission

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
      fontSize: 11,
    },
    header: { textAlign: "center", marginBottom: 25, color: "#333" },
    formInput: { width: "100%", padding: 12, marginBottom: 16, borderRadius: 8, border: "1px solid #ccc", fontSize: 11 },
    textarea: { width: "100%", padding: 12, marginBottom: 16, borderRadius: 8, border: "1px solid #ccc", minHeight: 100, fontSize: 11 },
    primaryBtn: { padding: "12px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: "#007bff", color: "white", fontWeight: "bold", fontSize: 11, width: "100%", transition: "0.2s" },
    error: { color: "red", marginBottom: 12, fontWeight: "bold" },
    label: { fontWeight: "bold", marginBottom: 5, display: "block" },
    info: { marginBottom: 12, color: "#555" },
    tick: { fontSize: 60, color: "green", marginBottom: 20 },

    // Added missing style keys
    headerBar: { display: "flex", alignItems: "center", marginBottom: 20 },
    logo: { width: 80, marginRight: 15 },
    clinicInfo: { textAlign: "left" },
    section: { marginBottom: 25, textAlign: "left" },
    footer: { marginTop: 30, fontSize: 12, color: "#777" }
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
        setNurseName(data.nurse_name || "");
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
      setErrorMsg("Form not found.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
  try {
    // ------------------- GET SIGNATURE -------------------
    let signatureData = "";
    if (patientSigRef.current && !patientSigRef.current.isEmpty()) {
      const canvas = patientSigRef.current.getCanvas(); // always returns the canvas
      signatureData = canvas.toDataURL("image/png"); // base64 image
    }




      let psignatureData = "";
    if (practitionerSigRef.current && !practitionerSigRef.current.isEmpty()) {
      const canvas = practitionerSigRef.current.getCanvas(); // always returns the canvas
      psignatureData = canvas.toDataURL("image/png"); // base64 image
    }
    // ------------------- UPDATE FORM -------------------
    const { error } = await supabase
      .from("forms")
      .update({
        completed: response.completed,
        response_notes: response.notes,
        temp: response.temp,
        bp: response.bp,

        date: response.visitDate ? new Date(response.visitDate).toISOString() : null,
        visit_time: response.visitTime,
        pulse: response.pulse,
        spo2: response.spo2,
        condition: response.condition,

        allergies: response.allergies,
        chronic: response.chronic,
        pregnancy: response.pregnancy,
        history_details: response.historyDetails,

        medication: response.medication,
        diagnosis: response.diagnosis,
        icd10: response.icd10,

        iv_therapy: response.ivTherapy,
        iv_site: response.ivSite,
        cannula: response.cannula,

        drug_name: response.drug,
        dose: response.dose,
        batch_no: response.batchNo,
        expiry: response.expiry,
        start_time: response.startTime,
        end_time: response.endTime,

        reaction: response.reaction,
        reaction_desc: response.reactionDetails,

        consent_confirmed: true,
        patient_signature: signatureData, // <-- store signature here
        practitioner_signature: psignatureData, // <-- store practitioner signature here

        status: "Submitted",
        link_active: false,
      })
      .eq("id", currentForm.id);

    if (error) throw error;

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

  if (submitted)
    return (
      <div style={styles.container}>
        <div style={styles.tick}>✅</div>
        <h2>Response Submitted Successfully!</h2>
        <p>Thank you for submitting your response. This form is now closed.</p>
      </div>
    );

  return (
    <div style={styles.container}>
      <div style={styles.document}>
        {/* HEADER */}
           <div style={{ display: "flex", alignItems: "center", borderBottom: "2px solid #000", paddingBottom: 10, marginBottom: 20 }}>
      <div>
        <img src={logo} alt="logo" style={{ height: 60 }} />
      </div>
      <div style={{ flex: 1, textAlign: "center" }}>
        <h2 style={{ fontStyle: "italic", margin: 0, fontFamily: "serif", color: "#0B2242" }}>
          Nachi Medical Solutions (Pty) Ltd
        </h2>
        <p style={{ fontSize: 12, fontStyle: "italic", margin: 0, fontFamily: "serif", color: "#0B2242" }}>
          Practice number Registered Nurse ND Kutama 1274872
        </p>
      </div>
    </div>
        <h2 style={{ textAlign: "center" }}>Clinical Record Form</h2>

        {/* PATIENT DETAILS */}
        <div style={styles.section}>
          <h3>Patient Details</h3>
          <p><strong>Name:</strong> {currentForm.patient_name}</p>
          <p><strong>ID:</strong> {currentForm.patient_id}</p>
          <p><strong>DOB:</strong> {currentForm.dob || "None"}</p>
              <p><strong>Contact:</strong> {currentForm.contact || "None"}</p>
        </div>
<hr/>
        {/* CLINICAL ASSESSMENT */}
        <div style={styles.section}>
          <h3>Clinical Assessment</h3>
          <input type="date" style={styles.formInput}
            onChange={e => setResponse({ ...response, visitDate: e.target.value })}
          />
          <input type="time" style={styles.formInput}
            onChange={e => setResponse({ ...response, visitTime: e.target.value })}
          />
          <input placeholder="Blood Pressure" style={styles.formInput}
            onChange={e => setResponse({ ...response, bp: e.target.value })}
          />
          <input placeholder="Pulse" style={styles.formInput}
            onChange={e => setResponse({ ...response, pulse: e.target.value })}
          />
          <input placeholder="Temperature" style={styles.formInput}
            onChange={e => setResponse({ ...response, temp: e.target.value })}
          />
          <input placeholder="SpO2" style={styles.formInput}
            onChange={e => setResponse({ ...response, spo2: e.target.value })}
          />
          <label>Condition</label>
          <select style={styles.formInput}
            onChange={e => setResponse({ ...response, condition: e.target.value })}
          >
            <option value="">Select</option>
            <option value="Stable">Stable</option>
            <option value="Unstable">Unstable</option>
          </select>
        </div>

        {/* MEDICAL HISTORY */}
        <div style={styles.section}>
          <h3>Medical History</h3>
          <label><input type="checkbox"
            onChange={e => setResponse({ ...response, allergies: e.target.checked })}
          /> Allergies</label>
          <label><input type="checkbox"
            onChange={e => setResponse({ ...response, chronic: e.target.checked })}
          /> Chronic Illness</label>
          <label><input type="checkbox"
            onChange={e => setResponse({ ...response, pregnancy: e.target.checked })}
          /> Pregnancy</label>
          <textarea
            placeholder="Details"
            style={styles.textarea}
            onChange={e => setResponse({ ...response, historyDetails: e.target.value })}
          />

           <input placeholder="Medication"
            style={styles.formInput}
            onChange={e => setResponse({ ...response, medication: e.target.value })}
          />
        </div>

        {/* MEDICATION */}
        <div style={styles.section}>
          <h3>Medication & Diagnosis</h3>
 
          <input placeholder="ICD-10"
            style={styles.formInput}
            onChange={e => setResponse({ ...response, icd10: e.target.value })}
          />
        </div>

        {/* IV THERAPY */}
        <div style={styles.section}>
          <h3>Treatment</h3>
          <input placeholder="IV Therapy"
            style={styles.formInput}
            onChange={e => setResponse({ ...response, ivTherapy: e.target.value })}
          />

          <h3>Administration Record</h3>
          <input placeholder="IV Site"
            style={styles.formInput}
            onChange={e => setResponse({ ...response, ivSite: e.target.value })}
          />
          <input placeholder="Cannula"
            style={styles.formInput}
            onChange={e => setResponse({ ...response, cannula: e.target.value })}
          />
        </div>

        {/* DRUG ADMIN */}
        <div style={styles.section}>
          <h3>Drug Dose Batch No Expiry</h3>
         
          <input type="time" style={styles.formInput}
            onChange={e => setResponse({ ...response, startTime: e.target.value })}
          />
          <input type="time" style={styles.formInput}
            onChange={e => setResponse({ ...response, endTime: e.target.value })}
          />
        </div>

        {/* REACTION */}
        <div style={styles.section}>
          Reaction
          <select style={styles.formInput}
            onChange={e => setResponse({ ...response, reaction: e.target.value })}
          >
            <option value="">Select</option>
            <option value="None">None</option>
            <option value="Yes">Yes</option>
          </select>
          {response.reaction === "Yes" && (
            <textarea
              placeholder="Describe reaction"
              style={styles.textarea}
              onChange={e => setResponse({ ...response, reactionDetails: e.target.value })}
            />
          )}
        </div>

<hr />
<div style={styles.section}>
            <h3>Visit Completion</h3>
            <label>
              <input
                type="radio"
                name="completed"
                value="Yes"
                checked={response.completed === "Yes"}
                onChange={e => setResponse({ ...response, completed: e.target.value })}
              />
              Completed
            </label>
            <label style={{ marginLeft: 20 }}>
              <input
                type="radio"
                name="completed"
                value="No"
                checked={response.completed === "No"}
                onChange={e => setResponse({ ...response, completed: e.target.value })}
              />
              Not Completed
            </label>
          </div>

          <hr />
        {/* CONSENT */}
        <div style={styles.section}>
     {/* CONSENT */}
<h3>Consent</h3>
<div style={{
  border: "1px solid #000",
  borderRadius: 6,
  padding: 12,
  background: "#f9f9f9",
  fontSize: 14,
  lineHeight: 1.6
}}>
  <p>I confirm:</p>

   <ul style={{ margin: 0, paddingLeft: 20 }}>
    <li>Information provided is correct</li>
    <li>Procedure, risks, and alternatives explained</li>
    <li>Patient consented to IV therapy</li>
  </ul>
</div>

          

  {/* SIGNATURES (UNCHANGED UI) */}
        <div>
          <p><strong>Patient Signature:</strong></p>
          <SignatureCanvas ref={patientSigRef} penColor="black"
            canvasProps={{ width: 350, height: 100, style: { border: "1px solid #ccc", borderRadius: 8 } }}
          />

          <p>
          <button onClick={() => patientSigRef.current.clear()}>Clear Signature</button>
          </p>
        </div>

        <hr />

        <div>
          <p><strong>Practitioner:</strong> {nurseName}</p>
          <p><strong>Practitioner Signature:</strong></p>
          <SignatureCanvas ref={practitionerSigRef} penColor="black"
            canvasProps={{ width: 350, height: 100, style: { border: "1px solid #ccc", borderRadius: 8 } }}
          />
          <p>
          <button onClick={() => practitionerSigRef.current.clear()}>Clear Signature</button>
          </p>
        </div>

          
        </div>

        {/* SUBMIT */}
        <button
          style={styles.primaryBtn}
          onClick={handleSubmitResponse}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Form"}
        </button>

       {/* FOOTER (excluded from canvas) */}
<div id="pdf-footer" data-html2canvas-ignore>
  <div style={{
    borderTop: "1px solid #000",
    marginTop: 20,
    paddingTop: 8,
    fontSize: 11,
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


      </div>
    </div>
  );
}
// NurseFormPage.js
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./supabaseClient";
import logo from "./logo.png";
import SignatureCanvas from 'react-signature-canvas';
import react from "react";
//import SignatureCanvas from "react-signature-canvas";

export default function NurseFormPage() {
  const { id } = useParams(); // form ID passed via route
 // const formRef = useRef();
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
    reaction_desc: "",
    reaction_assessment: "",
    reaction_treatment: "",
    consent: false,
    patientSignature: ""
  });

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // ------------------- STYLES -------------------
  const styles = {
    container: { maxWidth: 600, margin: "40px auto", padding: 25, fontFamily: "Arial, sans-serif", background: "#f9fafb", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center" },
    formInput: { width: "100%", padding: 12, marginBottom: 16, borderRadius: 8, border: "1px solid #ccc", fontSize: 9 },
    textarea: { width: "100%", padding: 12, marginBottom: 16, borderRadius: 8, border: "1px solid #ccc", minHeight: 100, fontSize: 9 },
    primaryBtn: { padding: "12px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: "#007bff", color: "white", fontWeight: "bold", fontSize: 9, width: "100%", transition: "0.2s" },
    error: { color: "red", marginBottom: 12, fontWeight: "bold" },
    section: { marginBottom: 25, textAlign: "left", lineHeight: 1.3,   fontSize: 9 }
  };

  // ------------------- FETCH FORM -------------------
  // Prepopulate practitioner signature if it exists
useEffect(() => {
  if (currentForm?.practitioner_signature) {
    practitionerSigRef.current.fromDataURL(currentForm.practitioner_signature);
  }
}, [currentForm]);
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const { data, error } = await supabase
          .from("forms")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          setErrorMsg("Form not found.");
          setLoading(false);
          return;
        }

        setCurrentForm(data);
        setNurseName(data.nurse_name || "");
        // Preload response state
        setResponse({
          completed: data.completed || "",
          notes: data.response_notes || "",
          temp: data.temp || "",
          bp: data.bp || "",
          visitDate: data.date ? data.date.split("T")[0] : "",
          visitTime: data.visit_time || "",
          pulse: data.pulse || "",
          spo2: data.spo2 || "",
          condition: data.condition || "",
          allergies: data.allergies || false,
          chronic: data.chronic || false,
          pregnancy: data.pregnancy || false,
          historyDetails: data.history_details || "",
          medication: data.medication || "",
          diagnosis: data.diagnosis || "",
          icd10: data.icd10 || "",
          ivTherapy: data.iv_therapy || "",
          ivSite: data.iv_site || "",
          cannula: data.cannula || "",
          drug: data.drug_name || "",
          dose: data.dose || "",
          batchNo: data.batch_no || "",
          expiry: data.expiry || "",
          startTime: data.start_time || "",
          endTime: data.end_time || "",
          reaction: data.reaction || "",
          reaction_Desc: data.reaction_desc || "",
          reaction_assessment: data.reaction_assessment || "",
          reaction_treatment: data.reaction_treatment || "",
          consent: data.consent_confirmed || false,
        //  patientSignature: data.patient_signature || ""
        });

        // Load signatures into canvases
       // if (data.patient_signature) patientSigRef.current.fromDataURL(data.patient_signature);
        //if (data.practitioner_signature) practitionerSigRef.current.fromDataURL(data.practitioner_signature);

      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to fetch form.");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  //-----------------handle cancel and back-----------------
  // Navigate back to previous page
const handleBack = () => {
  window.history.back();
};
  // ------------------- UPDATE FORM -------------------
  const handleSubmitResponse = async () => {
    if (!currentForm?.id) return setErrorMsg("Form not found.");

    setLoading(true);
    setErrorMsg("");

    try {
      // Get patient signature
      const signatureData = patientSigRef.current && !patientSigRef.current.isEmpty()
        ? patientSigRef.current.getCanvas().toDataURL("image/png")
        : response.patientSignature;

      // Get practitioner signature
      const psignatureData = practitionerSigRef.current && !practitionerSigRef.current.isEmpty()
        ? practitionerSigRef.current.getCanvas().toDataURL("image/png")
        : currentForm.practitioner_signature;

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
          reaction_desc: response.reaction_Desc,
            reaction_assessment: response.reaction_assessment,
            reaction_treatment: response.reaction_treatment,
          consent_confirmed: response.consent,
          nurse_name: nurseName,
          patient_signature: signatureData,
          practitioner_signature: psignatureData,
          status: "Submitted"
        })
        .eq("id", currentForm.id);

      if (error) throw error;

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to update form.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- RENDER -------------------
  if (loading) return <div style={styles.container}><p>Loading...</p></div>;
  if (errorMsg) return <div style={styles.container}><p style={styles.error}>{errorMsg}</p></div>;
  if (!currentForm) return null;
  if (submitted) return (
    <div style={styles.container}>
      <h2>Form Updated Successfully ✅</h2>
      
<button
    style={{
      ...styles.primaryBtn,
      background: "#6c757d",
      padding: "10px 16px",
      fontSize: 14
    }}
    onClick={handleBack}
  >
    Back
  </button>
    </div>
  );

  return (

    <div style={styles.container}>

        <div style={{
  position: "fixed",
  top: 40,
  left: 330,
  display: "flex",
  gap: 12,
  zIndex: 9999
}}>
  <button
    style={{
      ...styles.primaryBtn,
      background: "#6c757d",
      padding: "10px 16px",
      fontSize: 14
    }}
    onClick={handleBack}
  >
    Back
  </button>
</div>

      <div style={styles.document }>
        {/* HEADER */}
           <div style={{ display: "flex", alignItems: "center", borderBottom: "2px solid #000",paddingTop: 10, paddingBottom: 10, marginBottom: 20 }}>
      <div>
        <img src={logo} alt="logo" style={{ height: 60 }} />
      </div>
      <div style={{ flex: 1, textAlign: "center" }}>
        <h2 style={{ fontStyle: "italic", margin: 0, fontFamily: "serif", color: "#0B2242", lineHeight: 1.3,   fontSize: 17 }}>
          Nachi Medical Solutions (Pty) Ltd
        </h2>
        <p style={{ fontSize: 9, fontStyle: "italic", margin: 0, fontFamily: "serif", color: "#0B2242" }}>
          Practice number Registered Nurse ND Kutama 1274872
        </p>
      </div>
    </div>
        <h2 style={{ textAlign: "center", lineHeight: 1.3,   fontSize: 19 }}>Clinical Record Form</h2>

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
          <input value={response.visitDate} type="date" style={styles.formInput}
            onChange={e => setResponse({ ...response, visitDate: e.target.value })}
          />
          <input value={response.visitTime} type="time" style={styles.formInput}
            onChange={e => setResponse({ ...response, visitTime: e.target.value })}
          />
          <input  value={response.bp}  placeholder="Blood Pressure" style={styles.formInput}
          
            onChange={e => setResponse({ ...response, bp: e.target.value })}
          />
          <input  value={response.pulse} placeholder="Pulse" style={styles.formInput}
           
            onChange={e => setResponse({ ...response, pulse: e.target.value })}
          />
          <input  value={response.temp}  placeholder="Temperature" style={styles.formInput}
                 
            onChange={e => setResponse({ ...response, temp: e.target.value })}
          />
          <input     value={response.spo2} placeholder="SpO2" style={styles.formInput}
        
            onChange={e => setResponse({ ...response, spo2: e.target.value })}
          />
          <label>Condition</label>
          <select value={response.condition} style={styles.formInput}
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
            checked={response.allergies}
            onChange={e => setResponse({ ...response, allergies: e.target.checked })}
          /> Allergies</label>
          <label><input type="checkbox"
            checked={response.chronic}      
            onChange={e => setResponse({ ...response, chronic: e.target.checked })}
          /> Chronic Illness</label>
          <label><input type="checkbox"
            checked={response.pregnancy}
            onChange={e => setResponse({ ...response, pregnancy: e.target.checked })}
          /> Pregnancy</label>
          <textarea
            placeholder="Details" value={response.historyDetails}
            style={styles.textarea}
            onChange={e => setResponse({ ...response, historyDetails: e.target.value })}
          />

           <input placeholder="Medication" value={response.medication}
            style={styles.formInput}
            onChange={e => setResponse({ ...response, medication: e.target.value })}
          />
        </div>

        {/* MEDICATION */}
        <div style={styles.section}>
          <h3>Medication & Diagnosis</h3>
 
          <input value={response.icd10} placeholder="ICD-10"
            style={styles.formInput}
            onChange={e => setResponse({ ...response, icd10: e.target.value })}
          />
        </div>

        {/* IV THERAPY */}
        <div style={styles.section}>
          <h3>Treatment</h3>
          <input value={response.ivTherapy} placeholder="IV Therapy"
            style={styles.formInput}
            onChange={e => setResponse({ ...response, ivTherapy: e.target.value })}
          />

          <h3>Administration Record</h3>
          <input value={response.ivSite} placeholder="IV Site"
            style={styles.formInput}
            onChange={e => setResponse({ ...response, ivSite: e.target.value })}
          />
          <input value={response.cannula} placeholder="Cannula"
            style={styles.formInput}
            onChange={e => setResponse({ ...response, cannula: e.target.value })}
          />
        </div>

        {/* DRUG ADMIN */}
        <div style={styles.section}>
          <h3>Drug Dose Batch No Expiry</h3>
         
          <input type="time" value={response.startTime} style={styles.formInput}
            onChange={e => setResponse({ ...response, startTime: e.target.value })}
          />
          <input type="time" value={response.endTime} style={styles.formInput}
            onChange={e => setResponse({ ...response, endTime: e.target.value })}
          />
        </div>

        {/* REACTION */}
      {/* REACTION */}
<div style={styles.section}>
  <label>Reaction</label>

  <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
    <label>
      <input
        type="radio"
        name="reaction"
        value="None"
        checked={response.reaction === "None"}
        onChange={e =>
          setResponse({ ...response, reaction: e.target.value })
        }
      /> None
    </label>

    <label>
      <input
        type="radio"
        name="reaction"
        value="Yes"
        checked={response.reaction === "Yes"}
        onChange={e =>
          setResponse({ ...response, reaction: e.target.value })
        }
      /> Yes
    </label>
  </div>

 {response.reaction === "Yes" && (
  <div style={{ marginTop: 10 }}>
    <label>Assessment</label>
    <textarea
      value={response.reaction_assessment || ""}
      style={styles.textarea}
      onChange={e =>
        setResponse({
          ...response,
          reaction_assessment: e.target.value
        })
      }
    />

    <label>Diagnosis</label>
    <textarea
      value={response.reaction_Desc || ""}
      style={styles.textarea}
      onChange={e =>
        setResponse({
          ...response,
          reaction_Desc: e.target.value
        })
      }
    />

    <label>Treatment</label>
    <textarea
      value={response.reaction_treatment || ""}
      style={styles.textarea}
      onChange={e =>
        setResponse({
          ...response,
          reaction_treatment: e.target.value
        })
      }
    />
  </div>
)}
</div>

<hr />
<div style={styles.section}>
  <h3>Visit Completion</h3>

  <label style={{ display: "block", marginBottom: 8 }}>
    <input
      type="radio"
      name="completed"
      value="Yes"
      checked={response.completed === "Yes"}
      onChange={e => setResponse({ ...response, completed: e.target.value })}
    />
    Completed
  </label>

  <label style={{ display: "block" }}>
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
  <p style={{lineHeight: 1.3,   fontSize: 9}}>I confirm:</p>

   <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.3,   fontSize: 9 }}>
    <li>Information provided is correct</li>
    <li>Procedure, risks, and alternatives explained</li>
    <li>Patient consented to IV therapy</li>
  </ul>
</div>

          

  {/* SIGNATURES (UNCHANGED UI) */}

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <strong>Patient Signature:</strong>
    {currentForm.patient_signature ? (
      <img
        src={currentForm.patient_signature}
        alt="patient signature"
        style={{ height: 40, borderBottom: "1px solid #000" }}
      />
    ) : (
      <span style={{ display: "inline-block", borderBottom: "1px solid #000", minWidth: 200 }}>
        {/* empty underline when no signature */}
      </span>
    )}
  </div>
        <hr />

        <div>
          <div style={{ marginTop: 10 }}>
  <strong>Practitioner:</strong>
  <input
    type="text"
    value={nurseName}
    onChange={(e) => setNurseName(e.target.value)}
    style={{
      marginLeft: 10,
      padding: "5px 8px",
      borderRadius: 5,
      border: "1px solid #ccc",
      fontSize: 12
    }}
  />
</div>
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

        {/* CANCEL */}
        <button
          style={{ ...styles.primaryBtn, background: "#dc3545", gap: 12, marginTop: 16  }}
          onClick={handleBack}
        >
          Cancel
        </button>

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


      </div>
    </div>
  );
}
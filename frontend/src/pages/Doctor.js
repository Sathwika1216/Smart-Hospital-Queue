import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PatientCard from '../components/PatientCard';
import { patientApi, getErrorMessage } from '../services/api';
import './Doctor.css';

/** Persists the active doctor-room patient across refresh (until completed). */
const SERVING_STORAGE_KEY = 'hq_doctor_serving_patient_id';

const POLL_MS = 4000;


/**
 * Doctor desk: pulls the next waiting patient, shows who is currently being served,
 * and completes the visit when finished.
 */
function Doctor() {
  console.log("🔥 DOCTOR COMPONENT LOADED");
  const [waiting, setWaiting] = useState([]);
  const [serving, setServing] = useState(null);
  const [loadingQueues, setLoadingQueues] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const persistServingId = (id) => {
    if (!id) {
      sessionStorage.removeItem(SERVING_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(SERVING_STORAGE_KEY, id);
  };

  const loadWaiting = useCallback(async () => {
    try {
      const { data } = await patientApi.getQueue('doctor');
      setWaiting(data.patients || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingQueues(false);
    }
  }, []);

  const restoreServing = useCallback(async () => {
    const id = sessionStorage.getItem(SERVING_STORAGE_KEY);
    if (!id) return;
    try {
      const { data } = await patientApi.getStatus(id);
      if (data.stage === 'doctor' && data.status === 'serving') {
        setServing(data);
      } else {
        persistServingId(null);
      }
    } catch {
      persistServingId(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingQueues(true);
      setError('');
      await restoreServing();
      await loadWaiting();
    })();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      loadWaiting();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [loadWaiting]);

  const canCallNext = !serving &&!loadingAction;

  const onCallNext = async () => {
    console.log("🔥 BUTTON CLICKED");
  
    try {
      console.log("🔥 CALLING API...");
  
      const res = await fetch('http://localhost:3999/next/doctor', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
  
      const data = await res.json();
  
      console.log("🔥 RESPONSE DATA:", data);
  
      if (!res.ok) {
        throw new Error(data.error || "Failed");
      }
  
      setServing(data); // 🔥 THIS WAS MISSING
  
    } catch (err) {
      console.error("🔥 ERROR:", err);
      setError(err.message);
    }
  };

  const onComplete = async () => {
    if (!serving?._id) return;
    setError('');
    setInfo('');
    setLoadingAction(true);
    try {
      await patientApi.complete(serving._id);
      setServing(null);
      persistServingId(null);
      setInfo('Visit completed. Patient removed from the active doctor queue.');
      await loadWaiting();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="doctor-page">
      <section className="page-hero">
        <h1 className="page-hero__title">Doctor dashboard</h1>
        <p className="page-hero__text">
          Call patients from the doctor waiting queue, then complete the visit to free the room for the next patient.
        </p>
      </section>

      {error ? (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      ) : null}
      {info ? (
        <div className="alert alert--info" role="status">
          {info}
        </div>
      ) : null}

      <div className="doctor-actions card card--doctor">
        <div className="doctor-actions__row">
        <button className="btn btn--primary" type="button" onClick={onCallNext} disabled={!canCallNext}>
            {loadingAction && !serving ? 'Calling…' : 'Call next patient'}
          </button>
          <button className="btn btn--danger" type="button" onClick={onComplete} disabled={!serving || loadingAction}>
            {loadingAction && serving ? 'Completing…' : 'Complete patient'}
          </button>
        </div>
        <p className="doctor-actions__hint">
          You must complete the current patient before calling the next one. This matches a single consultation room.
        </p>
      </div>
 
      <section className="doctor-serving" aria-label="Currently serving patient">
        <h2 className="section-title">Currently serving</h2>
        {!serving ? (
          <div className="empty">No active patient. Press “Call next patient” when you are ready.</div>
        ) : (
          <div className="serving-highlight">
            <PatientCard patient={serving} accent="doctor" />
          </div>
        )}
      </section>

      <section className="doctor-waiting" aria-label="Doctor waiting queue">
        <div className="doctor-waiting__head">
          <h2 className="section-title">Waiting for doctor</h2>
          <span className="doctor-waiting__count">{waiting.length} waiting</span>
        </div>
        {loadingQueues ? <div className="loading">Loading waiting list…</div> : null}
        <div className="doctor-waiting__grid">
          {waiting.length === 0 && !loadingQueues ? <div className="empty">No patients in the doctor queue.</div> : null}
          {waiting.map((p) => (
            <PatientCard key={p._id} patient={p} accent="doctor" />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Doctor;
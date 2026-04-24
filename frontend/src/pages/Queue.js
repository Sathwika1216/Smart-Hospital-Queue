import React, { useCallback, useEffect, useState,useRef} from 'react';
import PatientCard from '../components/PatientCard';
import { patientApi, getErrorMessage } from '../services/api';
import './Queue.css';

const POLL_MS = 6000;

/**
 * Live view of both waiting queues. Polls the API on an interval so the board stays fresh.
 */
function Queue() {
  const [registration, setRegistration] = useState([]);
  const [doctor, setDoctor] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

   const isFetching=useRef(false);
  const loadQueues = useCallback(async () => {
    if(isFetching.current) return;
    isFetching.current=true;
    setError('');
    try {
      const [regRes, docRes] = await Promise.all([patientApi.getQueue('registration'), patientApi.getQueue('doctor')]);
      setRegistration(regRes.data.patients || []);
      setDoctor(docRes.data.patients || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      isFetching.current=false;
    }
  }, []);

  useEffect(() => {
    loadQueues();
    const id = window.setInterval(loadQueues, POLL_MS);
    return () => window.clearInterval(id);
  }, [loadQueues]);

  return (
    <div className="queue-page">
      <section className="page-hero">
        <div className="queue-hero__row">
          <div>
            <h1 className="page-hero__title">Live queues</h1>
            <p className="page-hero__text">
              Waiting patients only. Emergencies appear first in each list. This page refreshes automatically every few
              seconds.
            </p>
          </div>
          <div className="queue-meta">
            <button className="btn btn--ghost" type="button" onClick={loadQueues} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh now'}
            </button>
            {lastUpdated ? (
              <span className="queue-meta__stamp">
                Last update: <strong>{lastUpdated.toLocaleTimeString()}</strong>
              </span>
            ) : null}
          </div>
        </div>
      </section>

      {error ? (
        <div className="alert alert--error" role="alert">
          {error}
        </div>
      ) : null}

      {loading && registration.length === 0 && doctor.length === 0 ? (
        <div className="loading">Loading queues…</div>
      ) : null}

      <div className="queue-grid">
        <section className="queue-section queue-section--registration" aria-label="Registration queue">
          <header className="queue-section__head">
            <h2 className="queue-section__title">Registration queue</h2>
            <span className="queue-section__count">{registration.length} waiting</span>
          </header>
          <div className="queue-section__body">
            {registration.length === 0 ? (
              <div className="empty">No patients waiting at registration.</div>
            ) : (
              registration.map((p) => <PatientCard key={p._id} patient={p} accent="registration" />)
            )}
          </div>
        </section>

        <section className="queue-section queue-section--doctor" aria-label="Doctor queue">
          <header className="queue-section__head">
            <h2 className="queue-section__title">Doctor queue</h2>
            <span className="queue-section__count">{doctor.length} waiting</span>
          </header>
          <div className="queue-section__body">
            {doctor.length === 0 ? (
              <div className="empty">No patients waiting for the doctor.</div>
            ) : (
              doctor.map((p) => <PatientCard key={p._id} patient={p} accent="doctor" />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Queue;

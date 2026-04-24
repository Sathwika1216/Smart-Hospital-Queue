import React, { useState } from 'react';
import { patientApi, getErrorMessage } from '../services/api';
import './Status.css';

/**
 * Public lookup: given a Mongo patient id, shows the latest stage/status from the server.
 */
function Status() {
  const [patientId, setPatientId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    const id = patientId.trim();
    if (!id) {
      setError('Please enter a patient ID.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await patientApi.getStatus(id);
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="status-page">
      <section className="page-hero">
        <h1 className="page-hero__title">Track patient status</h1>
        <p className="page-hero__text">
          Enter the MongoDB patient ID returned after registration (also shown on the registration success card).
        </p>
      </section>

      <form className="card status-form" onSubmit={onSubmit}>
        <h2 className="card__title">Lookup</h2>
        <label className="field">
          <span className="field__label">Patient ID</span>
          <input
            className="field__input field__input--mono"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="e.g. 65f1c2b4e2b4c2b4e2b4c2b4"
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        {error ? (
          <div className="alert alert--error" role="alert">
            {error}
          </div>
        ) : null}

        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? 'Checking…' : 'Check status'}
        </button>
      </form>

      {result ? (
        <section className="card status-result" aria-live="polite">
          <h3 className="status-result__title">Patient details</h3>
          <dl className="status-kv">
            <div className="status-kv__row">
              <dt>Name</dt>
              <dd>{result.name}</dd>
            </div>
            <div className="status-kv__row">
              <dt>Stage</dt>
              <dd className="status-kv__cap">{result.stage}</dd>
            </div>
            <div className="status-kv__row">
              <dt>Status</dt>
              <dd className="status-kv__cap">{result.status}</dd>
            </div>
            <div className="status-kv__row">
              <dt>Token</dt>
              <dd className="status-kv__mono">{result.token}</dd>
            </div>
          </dl>
        </section>
      ) : null}
    </div>
  );
}

export default Status;

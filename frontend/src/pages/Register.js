import React, { useState } from 'react';
import { patientApi, getErrorMessage } from '../services/api';
import './Register.css';

const initialForm = {
  name: '',
  age: '',
  issue: '',
  isEmergency: false,
};

/**
 * Intake form: collects patient details and issues a queue token from the API.
 */
function Register() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successPatient, setSuccessPatient] = useState(null);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessPatient(null);
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        age: Number(form.age),
        issue: form.issue.trim(),
        isEmergency: Boolean(form.isEmergency),
      };
      const { data } = await patientApi.register(payload);
      setSuccessPatient(data);
      setForm(initialForm);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <section className="page-hero">
        <h1 className="page-hero__title">Patient registration</h1>
        <p className="page-hero__text">
          Add a patient to the queue. Emergencies are prioritized automatically. You will receive a token to track
          progress.
        </p>
      </section>

      <div className="register-layout">
        <form className="card register-form" onSubmit={onSubmit}>
          <h2 className="card__title">New visit</h2>
          <p className="card__hint">Fields marked * are required.</p>

          {error ? (
            <div className="alert alert--error" role="alert">
              {error}
            </div>
          ) : null}

          <label className="field">
            <span className="field__label">Full name *</span>
            <input
              className="field__input"
              name="name"
              value={form.name}
              onChange={onChange}
              autoComplete="name"
              required
              minLength={1}
              maxLength={120}
              placeholder="e.g. Amina Rahman"
            />
          </label>

          <label className="field">
            <span className="field__label">Age *</span>
            <input
              className="field__input"
              name="age"
              type="number"
              inputMode="numeric"
              min={0}
              max={150}
              value={form.age}
              onChange={onChange}
              required
              placeholder="e.g. 42"
            />
          </label>

          <label className="field">
            <span className="field__label">Issue / reason for visit *</span>
            <textarea
              className="field__input field__input--textarea"
              name="issue"
              value={form.issue}
              onChange={onChange}
              required
              minLength={1}
              maxLength={2000}
              rows={4}
              placeholder="Short description for triage staff"
            />
          </label>

          <label className="checkbox">
            <input name="isEmergency" type="checkbox" checked={form.isEmergency} onChange={onChange} />
            <span>
              <strong>Emergency</strong>
              <span className="checkbox__hint">Check if the patient needs immediate attention.</span>
            </span>
          </label>

          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? 'Submitting…' : 'Register patient'}
          </button>
        </form>

        <aside className="register-side">
          {successPatient ? (
            <div className="card success-card" aria-live="polite">
              <div className="alert alert--success">Registration successful — patient is now in the queue.</div>
              <h3 className="success-card__title">Your queue token</h3>
              <p className="success-card__text">Share this token with the patient for kiosk / status lookup.</p>
              <div className="token-showcase" aria-label="Generated token">
                <span className="token-showcase__value">{successPatient.token}</span>
              </div>
              <dl className="kv">
                <div className="kv__row">
                  <dt>Name</dt>
                  <dd>{successPatient.name}</dd>
                </div>
                <div className="kv__row">
                  <dt>Patient ID</dt>
                  <dd className="kv__mono">{successPatient._id}</dd>
                </div>
                <div className="kv__row">
                  <dt>Stage</dt>
                  <dd className="kv__cap">{successPatient.stage}</dd>
                </div>
                <div className="kv__row">
                  <dt>Status</dt>
                  <dd className="kv__cap">{successPatient.status}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="card tips-card">
              <h3 className="tips-card__title">Tips</h3>
              <ul className="tips-card__list">
                <li>Tokens are unique and generated by the server.</li>
                <li>Use the Status page with the Patient ID to track progress.</li>
                <li>Queues update in real time on the Queue screen.</li>
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

export default Register;

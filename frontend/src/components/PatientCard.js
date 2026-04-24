import React from 'react';
import './PatientCard.css';

/**
 * Reusable patient summary used on queue screens.
 * `accent` controls the left stripe color (registration = blue, doctor = green).
 */
function PatientCard({ patient, accent = 'registration' }) {
  const isEmergency = Boolean(patient?.isEmergency);

  return (
    <article className={`patient-card patient-card--${accent}`}>
      <div className="patient-card__header">
        <div className="patient-card__name-row">
          <h3 className="patient-card__name">{patient.name}</h3>
          {isEmergency && (
            <span className="patient-card__badge patient-card__badge--emergency" title="Emergency priority">
              Emergency
            </span>
          )}
        </div>
        <div className="patient-card__token" aria-label="Queue token">
          {patient.token}
        </div>
      </div>

      <p className="patient-card__issue">
        <span className="patient-card__label">Issue</span>
        <span className="patient-card__issue-text">{patient.issue}</span>
      </p>

      <div className="patient-card__meta">
        <span className="patient-card__pill patient-card__pill--muted">Age {patient.age}</span>
        <span className="patient-card__pill patient-card__pill--status">
          Status: <strong>{patient.status}</strong>
        </span>
        {patient.isRemote ? (
          <span className="patient-card__pill patient-card__pill--muted">Remote</span>
        ) : null}
      </div>
    </article>
  );
}

export default PatientCard;

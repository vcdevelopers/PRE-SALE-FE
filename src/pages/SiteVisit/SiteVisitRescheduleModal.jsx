// src/pages/SiteVisit/SiteVisitRescheduleModal.jsx

import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-hot-toast";

const SiteVisitRescheduleModal = ({
  id,
  currentScheduledAt,
  onClose,
  onRescheduled,
}) => {
  const [scheduledAt, setScheduledAt] = useState(
    currentScheduledAt
      ? currentScheduledAt.slice(0, 16) // yyyy-MM-ddTHH:mm
      : ""
  );
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!scheduledAt) {
      toast.error("New date & time is required.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Reason is mandatory for reschedule.");
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post(`/sales/site-visits/${id}/reschedule/`, {
        new_scheduled_at: scheduledAt,
        reason: reason.trim(),
      });

      toast.success("Visit rescheduled.");
      onRescheduled && onRescheduled();
      onClose && onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to reschedule visit.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sv-modal-overlay">
      <div className="sv-modal">
        <div className="sv-modal-header">
          <h3>Reschedule Site Visit</h3>
          <button className="sv-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sv-modal-body">
          <label className="sv-label">
            New Date &amp; Time <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="datetime-local"
            className="sv-input"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />

          <label className="sv-label">
            Reason <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <textarea
            className="sv-input"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for rescheduling"
          />

          <div className="sv-modal-footer">
            <button
              type="button"
              className="sv-btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="sv-btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Reschedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteVisitRescheduleModal;

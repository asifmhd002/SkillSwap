import { useState } from "react";
import "./AvailabilityModal.css";

function AvailabilityModal({ availability: savedAvailability, onClose, onSave })  {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [availability, setAvailability] = useState(() => {
  if (savedAvailability) {
    return savedAvailability;
  }

  return days.reduce((acc, day) => {
    acc[day] = {
      enabled: false,
      from: "17:00",
      to: "20:00",
    };

    return acc;
  }, {});
});

  const handleToggle = (day) => {
    setAvailability((previous) => ({
      ...previous,
      [day]: {
        ...previous[day],
        enabled: !previous[day].enabled,
      },
    }));
  };

  const handleTimeChange = (day, field, value) => {
    setAvailability((previous) => ({
      ...previous,
      [day]: {
        ...previous[day],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(availability);
    }

    onClose();
  };

  return (
    <div className="availability-modal-overlay">
      <div
        className="availability-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="availability-modal-header">
          <div>
            <p className="availability-modal-label">
              YOUR SCHEDULE
            </p>

            <h2>Availability</h2>

            <p>
              Choose when you're available for SkillSwap sessions.
            </p>
          </div>

          <button
            className="availability-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="availability-days">
          {days.map((day) => (
            <div className="availability-day-row" key={day}>
              <div className="availability-day-name">
                <button
                  type="button"
                  className={`availability-checkbox ${
                    availability[day].enabled
                      ? "availability-checkbox-active"
                      : ""
                  }`}
                  onClick={() => handleToggle(day)}
                  aria-label={`Toggle ${day}`}
                >
                  {availability[day].enabled ? "✓" : ""}
                </button>

                <span>{day}</span>
              </div>

              <div className="availability-time-fields">
                <input
                  type="time"
                  value={availability[day].from}
                  disabled={!availability[day].enabled}
                  onChange={(event) =>
                    handleTimeChange(
                      day,
                      "from",
                      event.target.value
                    )
                  }
                />

                <span className="availability-time-separator">
                  —
                </span>

                <input
                  type="time"
                  value={availability[day].to}
                  disabled={!availability[day].enabled}
                  onChange={(event) =>
                    handleTimeChange(
                      day,
                      "to",
                      event.target.value
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="availability-modal-footer">
          <button
            className="availability-cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="availability-save-button"
            onClick={handleSave}
          >
            Save Availability
          </button>
        </div>
      </div>
    </div>
  );
}

export default AvailabilityModal;
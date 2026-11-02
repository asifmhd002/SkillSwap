function ViewAvailabilityModal({
  name,
  availability,
  onClose,
}) {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const hasAvailability =
    availability &&
    typeof availability === "object" &&
    days.some(
      (day) => availability[day]?.enabled
    );

  return (
    <div
      className="view-availability-overlay"
      onClick={onClose}
    >
      <div
        className="view-availability-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="view-availability-header">
          <div>
            <p className="view-availability-label">
              SCHEDULE
            </p>

            <h2>{name}'s Availability</h2>

            <p>
              Check when this person is available
              for SkillSwap sessions.
            </p>
          </div>

          <button
            className="view-availability-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {!hasAvailability ? (
          <div className="view-availability-empty">
            <p>Availability not set</p>
            <span>
              {name} has not set their availability yet.
            </span>
          </div>
        ) : (
          <div className="view-availability-days">
            {days.map((day) => {
              const dayData = availability[day];

              return (
                <div
                  className="view-availability-day"
                  key={day}
                >
                  <div className="view-availability-day-name">
                    <span
                      className={
                        dayData?.enabled
                          ? "availability-dot active"
                          : "availability-dot"
                      }
                    ></span>

                    <strong>{day}</strong>
                  </div>

                  <div className="view-availability-time">
                    {dayData?.enabled ? (
                      <>
                        {dayData.from} — {dayData.to}
                      </>
                    ) : (
                      <span className="not-available">
                        Not available
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="view-availability-footer">
          <button
            className="view-availability-close-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewAvailabilityModal;
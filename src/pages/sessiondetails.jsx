import { useEffect, useState } from "react";
import "./sessiondetails.css";
import Footer from "../components/Footer";

function SessionDetails() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const goToSessions = () => {
    window.history.pushState({}, "", "/sessions");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const goToDashboard = () => {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("id");

        if (!sessionId) {
          setError("Session ID is missing.");
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view this session.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://127.0.0.1:5000/api/sessions/${sessionId}`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load session.");
          setLoading(false);
          return;
        }

        setSession(data.session);
      } catch (err) {
        console.error("Session details error:", err);
        setError("Unable to connect to the backend.");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));

      return payload.user_id;
    } catch (error) {
      return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "Not available";

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    let difference = (end - start) / (1000 * 60);

    if (difference < 0) {
      difference += 24 * 60;
    }

    if (difference >= 60) {
      const hours = difference / 60;

      if (hours === 1) {
        return "1 hour";
      }

      return `${hours} hours`;
    }

    return `${difference} minutes`;
  };

  const getSessionType = () => {
    const currentUserId = getCurrentUserId();

    if (!session) return "Session";

    if (session.learner_id === currentUserId) {
      return "Learning";
    }

    if (session.teacher_id === currentUserId) {
      return "Teaching";
    }

    return "Session";
  };

  const getOtherPerson = () => {
    const currentUserId = getCurrentUserId();

    if (!session) return "User";

    if (session.learner_id === currentUserId) {
      return session.teacher_name;
    }

    if (session.teacher_id === currentUserId) {
      return session.learner_name;
    }

    return "User";
  };

  const getStatusText = () => {
    if (!session) return "";

    if (session.status === "pending") {
      return "Pending";
    }

    if (session.status === "upcoming") {
      return "Upcoming";
    }

    if (session.status === "completed") {
      return "Completed";
    }

    if (session.status === "cancelled") {
      return "Cancelled";
    }

    return session.status;
  };

  // =========================================================
  // CANCEL SESSION
  // =========================================================

  const handleCancelSession = async () => {
    if (!session) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this session?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please log in again.");
        return;
      }

      const response = await fetch(
        `http://127.0.0.1:5000/api/sessions/${session._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error || "Failed to cancel session."
        );
        return;
      }

      alert(
        `Session cancelled successfully! ${data.refunded_credits} credit returned.`
      );

      // Return to Sessions page
      window.history.pushState({}, "", "/sessions");
      window.dispatchEvent(
        new PopStateEvent("popstate")
      );

    } catch (error) {
      console.error(
        "Cancel session error:",
        error
      );

      alert(
        "Unable to connect to the backend."
      );
    }
  };

  // =========================================================
// MESSAGE OTHER SESSION PARTICIPANT
// =========================================================

const handleMessagePerson = async () => {
  if (!session) return;

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in again.");
      return;
    }

    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      alert("Unable to identify the logged-in user.");
      return;
    }

    // Find the other person in this session
    const otherUserId =
      String(session.teacher_id) === String(currentUserId)
        ? session.learner_id
        : session.teacher_id;

    if (!otherUserId) {
      alert("Unable to find the other session participant.");
      return;
    }

    // Find existing conversation or create a new one
    const response = await fetch(
      "http://127.0.0.1:5000/api/messages/conversations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          user_id: String(otherUserId),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(
        data.error || "Unable to open conversation."
      );
      return;
    }

    const conversationId =
      data.conversation?.id;

    if (!conversationId) {
      alert("Conversation could not be opened.");
      return;
    }

    // Open the exact conversation in Messages
    window.history.pushState(
      {},
      "",
      `/messages?conversation=${conversationId}`
    );

    window.dispatchEvent(
      new PopStateEvent("popstate")
    );

  } catch (error) {
    console.error(
      "Message person error:",
      error
    );

    alert(
      "Unable to connect to the messaging system."
    );
  }
};

  if (loading) {
    return (
      <div className="session-details-page">
        <main className="session-details-content">
          <h2>Loading session...</h2>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="session-details-page">
        <main className="session-details-content">

          <button
            className="session-details-back"
            onClick={goToSessions}
          >
            ← Back to Sessions
          </button>

          <h2>Unable to Load Session</h2>

          <p>{error}</p>

        </main>

        <Footer />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const sessionType = getSessionType();
  const otherPerson = getOtherPerson();
  const statusText = getStatusText();

  return (
    <div className="session-details-page">

      <header className="session-details-header">

        <button
          className="session-details-back"
          onClick={goToSessions}
        >
          ← Back to Sessions
        </button>

        <div className="session-details-title-row">

          <div>

            <p className="session-details-label">
              SESSION DETAILS
            </p>

            <h1>{session.skill}</h1>

            <p className="session-details-subtitle">
              {sessionType === "Learning"
                ? `Your learning session with ${otherPerson}.`
                : `Your teaching session with ${otherPerson}.`}
            </p>

          </div>

          <span className="details-status">
            {statusText}
          </span>

        </div>

      </header>

      <main className="session-details-content">

        <section className="details-main-grid">

          <div className="details-card session-overview-card">

            <div className="details-card-heading">

              <div>

                <h2>Session Overview</h2>

                <p>
                  Everything you need to know about this session.
                </p>

              </div>

            </div>

            <div className="session-info-grid">

              <div className="session-info-item">
                <span>Skill</span>
                <strong>{session.skill}</strong>
              </div>

              <div className="session-info-item">
                <span>Session Type</span>
                <strong>{sessionType}</strong>
              </div>

              <div className="session-info-item">
                <span>Date</span>
                <strong>
                  {formatDate(session.date)}
                </strong>
              </div>

              <div className="session-info-item">
                <span>Time</span>
                <strong>
                  {session.start_time} - {session.end_time}
                </strong>
              </div>

              <div className="session-info-item">
                <span>Duration</span>

                <strong>
                  {formatDuration(
                    session.start_time,
                    session.end_time
                  )}
                </strong>

              </div>

              <div className="session-info-item">
                <span>Location</span>
                <strong>Online</strong>
              </div>

            </div>

            <div className="session-description">

              <h3>About this session</h3>

              <p>
                This is a SkillSwap{" "}
                {sessionType.toLowerCase()} session
                for <strong>{session.skill}</strong>.
                You can use this session to learn,
                teach, and exchange knowledge with
                another SkillSwap member.
              </p>

            </div>

          </div>

          <aside className="details-card person-card">

            <p className="person-card-label">

              {sessionType === "Learning"
                ? "YOUR MENTOR"
                : "YOUR LEARNER"}

            </p>

            <div className="person-avatar">

              {otherPerson
                ? otherPerson.charAt(0).toUpperCase()
                : "U"}

            </div>

            <h2>{otherPerson}</h2>

            <p className="person-role">
              SkillSwap Member
            </p>

            <div className="person-rating">

              <span>★</span>

              <strong>—</strong>

              <small>Rating</small>

            </div>

            <div className="person-skills">

              <span>{session.skill}</span>

            </div>

           <button
  className="message-person-button"
  onClick={handleMessagePerson}
>
  Message {otherPerson}
</button>

          </aside>

        </section>

        <section className="details-card schedule-card">

          <div className="details-card-heading">

            <div>

              <h2>Session Schedule</h2>

              <p>Your session timeline.</p>

            </div>

          </div>

          <div className="schedule-timeline">

            <div className="timeline-item active">

              <div className="timeline-dot"></div>

              <div>

                <strong>Session booked</strong>

                <p>

                  {session.created_at
                    ? new Date(
                        session.created_at
                      ).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )
                    : "Booking date unavailable"}

                </p>

              </div>

            </div>

            <div className="timeline-line"></div>

            <div className="timeline-item active">

              <div className="timeline-dot"></div>

              <div>

                <strong>Session starts</strong>

                <p>
                  {formatDate(session.date)} •{" "}
                  {session.start_time}
                </p>

              </div>

            </div>

            <div className="timeline-line"></div>

            <div
              className={`timeline-item ${
                session.status === "completed"
                  ? "active"
                  : ""
              }`}
            >

              <div className="timeline-dot"></div>

              <div>

                <strong>Session completed</strong>

                <p>

                  {session.status === "completed"
                    ? "Session completed"
                    : `After the ${formatDuration(
                        session.start_time,
                        session.end_time
                      )} session`}

                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            SESSION ACTIONS
        ====================================================== */}

        <section className="details-actions">

  <button
    className="cancel-session-button"
    onClick={handleCancelSession}
    disabled={
      session.status === "cancelled" ||
      session.status === "completed"
    }
  >
    {session.status === "cancelled"
      ? "Session Cancelled"
      : "Cancel Session"}
  </button>

</section>

        <button
          className="details-dashboard-link"
          onClick={goToDashboard}
        >
          ← Back to Dashboard
        </button>

      </main>

      <Footer />

    </div>
  );
}

export default SessionDetails;
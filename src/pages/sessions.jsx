import { useEffect, useState } from "react";
import "./sessions.css";
import Footer from "../components/Footer";

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const goToSessionDetails = (sessionId) => {
    window.history.pushState(
      {},
      "",
      `/session-details?id=${sessionId}`
    );

    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const goToDashboard = () => {
    window.history.pushState({}, "", "/dashboard");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to view your sessions.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://127.0.0.1:5000/api/sessions",
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load sessions.");
          setLoading(false);
          return;
        }

        setSessions(data.sessions || []);
      } catch (err) {
        console.error("Session loading error:", err);
        setError("Unable to connect to the backend.");
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return null;

      const payload = JSON.parse(atob(token.split(".")[1]));

      return payload.user_id;
    } catch (error) {
      console.error("Could not read user ID:", error);
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  const upcomingSessions = sessions.filter(
    (session) =>
      session.status === "pending" ||
      session.status === "upcoming"
  );

  const completedSessions = sessions.filter(
    (session) => session.status === "completed"
  );

  const getSessionType = (session) => {
    if (session.learner_id === currentUserId) {
      return "Learning";
    }

    if (session.teacher_id === currentUserId) {
      return "Teaching";
    }

    return "Session";
  };

  const getOtherPerson = (session) => {
    if (session.learner_id === currentUserId) {
      return session.teacher_name;
    }

    if (session.teacher_id === currentUserId) {
      return session.learner_name;
    }

    return "User";
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return {
        month: "---",
        day: "--",
      };
    }

    const date = new Date(dateString + "T00:00:00");

    return {
      month: date
        .toLocaleString("en-US", {
          month: "short",
        })
        .toUpperCase(),
      day: date.getDate(),
    };
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) {
      return "";
    }

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

  const renderSessionCard = (session, isCompleted = false) => {
    const date = formatDate(session.date);
    const sessionType = getSessionType(session);
    const otherPerson = getOtherPerson(session);

    return (
      <div
        className={`session-large-card ${
          isCompleted ? "completed-card" : ""
        }`}
        key={session._id}
      >
        <div
          className={`session-date-box ${
            isCompleted ? "completed-date" : ""
          }`}
        >
          <span>{date.month}</span>
          <strong>{date.day}</strong>
        </div>

        <div className="session-card-main">
          <div className="session-card-top">
            <span
              className={`session-status ${
                isCompleted ? "completed" : "upcoming"
              }`}
            >
              {isCompleted
                ? "Completed"
                : session.status === "pending"
                ? "Pending"
                : "Upcoming"}
            </span>

            <span
              className={`session-type ${
                sessionType === "Teaching"
                  ? "teaching"
                  : "learning"
              }`}
            >
              {sessionType}
            </span>
          </div>

          <h3>{session.skill}</h3>

          <p className="session-person">
            {sessionType === "Learning"
              ? "Learning with"
              : "Teaching"}{" "}
            <strong>{otherPerson}</strong>
          </p>

          <div className="session-meta">
            <span>🕐 {session.start_time}</span>

            <span>
              ⏱{" "}
              {formatDuration(
                session.start_time,
                session.end_time
              )}
            </span>

            <span>📍 Online</span>
          </div>
        </div>

        <button
          className="session-details-button"
          onClick={() => goToSessionDetails(session._id)}
        >
          View Details
        </button>
      </div>
    );
  };

  return (
    <div className="sessions-page">
      <header className="sessions-header">
        <div>
          <button
            className="sessions-back-button"
            onClick={goToDashboard}
          >
            ← Back to Dashboard
          </button>

          <p className="sessions-label">MY SESSIONS</p>

          <h1>Sessions</h1>

          <p className="sessions-subtitle">
            Manage your upcoming learning and teaching sessions.
          </p>
        </div>
      </header>

      <main className="sessions-content">
        {loading && (
          <section className="sessions-section">
            <div className="sessions-section-heading">
              <div>
                <h2>Loading Sessions...</h2>
                <p>Fetching your sessions from SkillSwap.</p>
              </div>
            </div>
          </section>
        )}

        {error && !loading && (
          <section className="sessions-section">
            <div className="sessions-section-heading">
              <div>
                <h2>Unable to Load Sessions</h2>
                <p>{error}</p>
              </div>
            </div>
          </section>
        )}

        {!loading && !error && (
          <>
            <section className="sessions-section">
              <div className="sessions-section-heading">
                <div>
                  <h2>Upcoming Sessions</h2>
                  <p>
                    Your scheduled learning and teaching sessions.
                  </p>
                </div>

                <span className="session-count">
                  {upcomingSessions.length} upcoming
                </span>
              </div>

              <div className="sessions-list">
                {upcomingSessions.length === 0 ? (
                  <p>No upcoming sessions.</p>
                ) : (
                  upcomingSessions.map((session) =>
                    renderSessionCard(session)
                  )
                )}
              </div>
            </section>

            <section className="sessions-section completed-section">
              <div className="sessions-section-heading">
                <div>
                  <h2>Completed Sessions</h2>
                  <p>Your previous SkillSwap sessions.</p>
                </div>

                <span className="session-count">
                  {completedSessions.length} completed
                </span>
              </div>

              <div className="sessions-list">
                {completedSessions.length === 0 ? (
                  <p>No completed sessions yet.</p>
                ) : (
                  completedSessions.map((session) =>
                    renderSessionCard(session, true)
                  )
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Sessions;
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import ViewAvailabilityModal from "../components/ViewAvailabilityModal";
import API_BASE_URL from "../api";
import "./matching.css";

function Matching() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAvailability, setSelectedAvailability] =
  useState(null);


  useEffect(() => {
    const fetchMatches = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in to view available users.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/matches`,
          {
            method: "GET",
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load available users."
          );
        }

        setMatches(data.matches || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleViewAvailability = (match) => {
  setSelectedAvailability(match);
};

  const handleBookSession = async (userId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please log in first.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/messages/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            user_id: userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not start conversation."
        );
      }

      const conversationId = data.conversation.id;

      window.location.href =
        `/messages?conversation=${conversationId}`;
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="matching-page">
      <header className="matching-header">
        <p className="matching-label">MATCHING</p>

        <h1>Find Your Match</h1>

        <p className="matching-subtitle">
          People who match the skills you want to learn or teach.
        </p>
      </header>

      <main className="matching-container">
        <div className="matching-top">
          <div>
            <h2>Available Matches</h2>

            <p>
              {loading
                ? "Loading..."
                : `${matches.length} people found`}
            </p>
          </div>

          <button className="matching-filter">
            Filter
          </button>
        </div>

        {loading && (
          <div>
            <p>Loading available users...</p>
          </div>
        )}

        {error && (
          <div>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div>
            <p>No other users are available yet.</p>
          </div>
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="matches-list">
            {matches.map((match) => (
              <article
                className="match-card"
                key={match.id}
              >
                <div className="match-avatar">
                  {match.initials}
                </div>

                <div className="match-info">
                  <div className="match-name-row">
                    <h3>{match.name}</h3>

                    <button
  type="button"
  className="match-status availability-button"
  onClick={() =>
    handleViewAvailability(match)
  }
>
  See Availability
</button>

                  </div>

                  <p className="match-skill">
                    {match.teaches}
                  </p>

                  <div className="match-details">
                    <span>
                      <strong>Teaches:</strong>{" "}
                      {match.teaches}
                    </span>

                    <span>
                      <strong>Wants:</strong>{" "}
                      {match.wants}
                    </span>
                  </div>
                </div>

                <button
                  className="match-button"
                  onClick={() =>
                    handleBookSession(match.id)
                  }
                >
                  Book Session
                </button>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {selectedAvailability && (
        <ViewAvailabilityModal
          name={selectedAvailability.name}
          availability={selectedAvailability.availability}
          onClose={() =>
            setSelectedAvailability(null)
          }
        />
      )}
      
    </div>
  );
}

export default Matching;
import { useEffect, useState } from "react";
import "./dashboard.css";
import Footer from "../components/Footer";

function Dashboard() {

  const [currentUser, setCurrentUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setDashboardError("");

        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("You are not logged in.");
        }

        const headers = {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        };

        // =========================
        // USER
        // =========================

        const userResponse = await fetch(
          "http://127.0.0.1:5000/api/auth/me",
          {
            method: "GET",
            headers,
          }
        );

        const userData = await userResponse.json();
        console.log("Current user from backend:", userData);

        if (!userResponse.ok) {
          throw new Error(
            userData.error || "Failed to load user data"
          );
        }

        setCurrentUser(userData.user);

        // =========================
        // WALLET
        // =========================

        const walletResponse = await fetch(
          "http://127.0.0.1:5000/api/wallet",
          {
            method: "GET",
            headers,
          }
        );

        const walletData = await walletResponse.json();

        if (!walletResponse.ok) {
          throw new Error(
            walletData.error || "Failed to load wallet data"
          );
        }

        setWallet(walletData.wallet);

        // =========================
        // SESSIONS
        // =========================

        const sessionsResponse = await fetch(
          "http://127.0.0.1:5000/api/sessions",
          {
            method: "GET",
            headers,
          }
        );

        const sessionsData = await sessionsResponse.json();

        if (!sessionsResponse.ok) {
          throw new Error(
            sessionsData.error || "Failed to load sessions"
          );
        }

        setSessions(sessionsData.sessions || []);

        // =========================
        // TRANSACTIONS
        // =========================

        const transactionsResponse = await fetch(
          "http://127.0.0.1:5000/api/wallet/transactions",
          {
            method: "GET",
            headers,
          }
        );

        const transactionsData =
          await transactionsResponse.json();

        if (!transactionsResponse.ok) {
          throw new Error(
            transactionsData.error ||
              "Failed to load transactions"
          );
        }

        setTransactions(
          transactionsData.transactions || []
        );

      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );

        setDashboardError(error.message);

      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="dashboard-page">

      {/* =========================
          DASHBOARD HEADER
      ========================= */}

      <header className="dashboard-header">
        <div>
          <p className="dashboard-greeting">
  Welcome back, {currentUser?.name || "User"} 👋
</p>
          <h1>Ready to learn something new?</h1>
          <p className="dashboard-subtitle">
            Keep learning, keep teaching, and grow your skills one hour at a time.
          </p>
        </div>

        <button
          className="dashboard-profile-button"
          onClick={() => {
            window.history.pushState({}, "", "/profile");
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
        >
          View Profile
        </button>
      </header>


      {/* =========================
    QUICK STATS
========================= */}

<section className="dashboard-stats">

  <div className="dashboard-stat-card">
    <div className="stat-icon">◷</div>

    <div>
      <p>Time Credits</p>
      <h2>{wallet?.balance ?? 0}</h2>
      <span>Available credits</span>
    </div>
  </div>


  <div className="dashboard-stat-card">
    <div className="stat-icon">✓</div>

    <div>
      <p>Completed</p>
      <h2>
        {
          sessions.filter(
            (session) => session.status === "completed"
          ).length
        }
      </h2>
      <span>Sessions completed</span>
    </div>
  </div>


  <div className="dashboard-stat-card">
    <div className="stat-icon">◉</div>

    <div>
      <p>Upcoming</p>
      <h2>
        {
          sessions.filter(
            (session) =>
              session.status === "pending" ||
              session.status === "upcoming"
          ).length
        }
      </h2>
      <span>Sessions scheduled</span>
    </div>
  </div>


  <div className="dashboard-stat-card">
    <div className="stat-icon">★</div>

    <div>
      <p>Rating</p>
      <h2>—</h2>
      <span>No reviews yet</span>
    </div>
  </div>

</section>


      {/* =========================
          MAIN DASHBOARD GRID
      ========================= */}

      <section className="dashboard-grid">

        {/* UPCOMING SESSIONS */}

        <div className="dashboard-panel upcoming-panel">

          <div className="panel-heading">
            <div>
              <h2>Upcoming Sessions</h2>
              <p>Your next learning and teaching sessions.</p>
            </div>

            <button
              className="panel-link"
              onClick={() => {
                window.history.pushState({}, "", "/sessions");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
            >
              View all
            </button>
          </div>


          {sessions.length === 0 ? (
  <div className="empty-state">
    <p>No upcoming sessions yet.</p>
  </div>
) : (
  sessions
    .filter(
      (session) =>
        session.status === "pending" ||
        session.status === "upcoming"
    )
    .slice(0, 3)
    .map((session) => {
      const sessionDate = new Date(
        `${session.date}T00:00:00`
      );

      const month = sessionDate
        .toLocaleString("en-US", {
          month: "short",
        })
        .toUpperCase();

      const day = sessionDate.getDate();

      const isLearner =
        String(session.learner_id) ===
        String(currentUser?.user_id);

      const otherPerson = isLearner
        ? session.teacher_name
        : session.learner_name;

      return (
        <div
          className="session-card"
          key={session._id}
        >

          <div className="session-date">
            <span>{month}</span>
            <strong>{day}</strong>
          </div>

          <div className="session-info">
            <h3>{session.skill}</h3>

            <p>
              {isLearner
                ? `Learning with ${otherPerson}`
                : `Teaching ${otherPerson}`}
            </p>

            <span>
              {session.start_time} • {session.end_time}
            </span>
          </div>

          <button
            className="session-action"
            onClick={() => {
              window.history.pushState(
                {},
                "",
                `/session-details?id=${session._id}`
              );

              window.dispatchEvent(
                new PopStateEvent("popstate")
              );
            }}
          >
            View
          </button>

        </div>
      );
    })
)}

        </div>


        {/* WALLET */}

        <div className="dashboard-panel wallet-panel">

  <div className="panel-heading">
    <div>
      <h2>My Wallet</h2>
      <p>Your SkillSwap time credits.</p>
    </div>

    
  </div>


  <div className="wallet-balance">

    <span>Available balance</span>

    <div className="wallet-number">
      {wallet?.balance ?? 0}
      <small>credits</small>
    </div>

  </div>


  <div className="wallet-summary">

    <div>
      <span>Earned</span>
      <strong>
        {wallet?.total_earned ?? 0} credits
      </strong>
    </div>

    <div>
      <span>Spent</span>
      <strong>
        {wallet?.total_spent ?? 0} credits
      </strong>
    </div>

  </div>


  <button
    className="wallet-button"
    onClick={() => {
      window.history.pushState({}, "", "/wallet");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }}
  >
    View Wallet
  </button>

</div>


        {/* RECOMMENDED SKILLS */}

        <div className="dashboard-panel skills-panel">

          <div className="panel-heading">
            <div>
              <h2>Recommended Skills</h2>
              <p>Skills you might want to learn.</p>
            </div>

            <button className="panel-link"
            onClick={() => {
    window.history.pushState({}, "", "/matching");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }}>
              Explore
            </button>
          </div>


          <div className="recommended-skills">

            <button className="recommended-skill">
              <span>Python</span>
              
            </button>

            <button className="recommended-skill">
              <span>UI / UX Design</span>
              
            </button>

            <button className="recommended-skill">
              <span>Flask</span>
              
            </button>

            <button className="recommended-skill">
              <span>English</span>
              
            </button>

            <button className="recommended-skill">
              <span>React</span>
              
            </button>

            <button className="recommended-skill">
              <span>SQL</span>
              
            </button>

            <button className="recommended-skill">
              <span>Graphics Design</span>
              
            </button>

            <button className="recommended-skill">
              <span>Adobe Photoshop</span>
              
            </button>

            <button className="recommended-skill">
              <span>Flutter</span>
              
            </button>

            <button className="recommended-skill">
              <span>Java</span>
              
            </button>

            <button className="recommended-skill">
              <span>Excel</span>
              
            </button>

            <button className="recommended-skill">
              <span>Power BI</span>
              
            </button>

          </div>

        </div>


        {/* RECENT ACTIVITY */}

        <div className="dashboard-panel activity-panel">

  <div className="panel-heading">
    <div>
      <h2>Recent Activity</h2>
      <p>Your latest SkillSwap activity.</p>
    </div>

    <button
      className="panel-link"
      onClick={() => {
        window.history.pushState({}, "", "/wallet");
        window.dispatchEvent(new PopStateEvent("popstate"));
      }}
    >
      View all
    </button>
  </div>


  <div className="activity-list">

    {transactions.length === 0 ? (

      <div className="empty-state">
        <p>No recent activity yet.</p>
      </div>

    ) : (

      transactions.slice(0, 5).map((transaction) => {

        const amount = transaction.amount ?? 0;

        const isCredit =
          transaction.type === "credit" ||
          amount > 0;

        const date = transaction.created_at
          ? new Date(transaction.created_at)
          : null;

        const formattedDate = date
          ? date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "";

        return (
          <div
            className="activity-item"
            key={transaction._id}
          >

            <div className="activity-icon">
              {isCredit ? "+" : "-"}
            </div>


            <div className="activity-info">

              <h3>
                {transaction.title ||
                  transaction.description ||
                  "Wallet activity"}
              </h3>

              <p>
                {formattedDate}
              </p>

            </div>


            <div
              className={
                isCredit
                  ? "activity-amount credit"
                  : "activity-amount debit"
              }
            >
              {isCredit ? "+" : "-"}
              {Math.abs(amount)} credits
            </div>

          </div>
        );
      })

    )}

  </div>

</div>

      </section>


      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <section className="dashboard-actions">

        <h2>What would you like to do?</h2>

        <div className="quick-actions">

          <button
  onClick={() => {
    window.history.pushState({}, "", "/matching");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }}
>
  <span>🔎</span>
  <strong>Find a Skill</strong>
  <small>Discover people to learn from</small>
</button>

          <button
          onClick={() => {
    window.history.pushState({}, "", "/matching");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }}>
            <span>📅</span>
            <strong>Book a Session</strong>
            <small>Schedule a learning session</small>
          </button>

          <button
          onClick={() => {
    window.history.pushState({}, "", "/messages");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }}>
            <span>💬</span>
            <strong>Messages</strong>
            <small>Talk with your connections</small>
          </button>

          <button
          onClick={() => {
    window.history.pushState({}, "", "/profile");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }}>
            <span>🎓</span>
            <strong>Teach a Skill</strong>
            <small>Share what you know</small>
          </button>

        </div>

      </section>

      <Footer />

    </div>
  );
}

export default Dashboard;
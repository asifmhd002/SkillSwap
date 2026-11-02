import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Signin from "./pages/signin";
import Profile from "./pages/profile";
import Dashboard from "./pages/dashboard";
import Sessions from "./pages/sessions";
import SessionDetails from "./pages/sessiondetails";
import Messages from "./pages/messages";
import Wallet from "./pages/wallet";
import Matching from "./pages/matching";
import heroImage from "./assets/skillswaphomeintroimage.jpg";
import Settings from "./pages/settings";
import About from "./pages/about";


import "./App.css";

function App() {
  // Controls whether the Sign in / Login popup is visible
  const [showAuth, setShowAuth] = useState(false);

  // Controls which page is currently displayed
  const [currentPage, setCurrentPage] = useState(
    window.location.pathname
  );

  // Keep React updated when browser Back / Forward buttons are used
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // =========================================================
  // PROFILE PAGE
  // =========================================================

  if (currentPage === "/profile") {
    return <Profile />;
  }

  if (currentPage === "/about") {
  return <About />;
}

  // =========================================================
  // DASHBOARD PAGE
  // =========================================================

  if (currentPage === "/dashboard") {
    return <Dashboard />;
  }

  if (currentPage === "/sessions") {
  return <Sessions />;
}

if (currentPage === "/settings") {
  return <Settings />;
}

if (currentPage === "/session-details") {
  return <SessionDetails />;
}

if (currentPage === "/messages") {
  return <Messages />;
}

if (currentPage === "/wallet") {
  return <Wallet />;
}

if (currentPage === "/matching") {
  return <Matching />;
}

  const features = [
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle
            cx="9"
            cy="7"
            r="4"
            strokeWidth="2"
          />

          <path
            d="M22 21v-2a4 4 0 0 0-3-3.87"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M16 3.13a4 4 0 0 1 0 7.75"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),

      title: "Find your people",

      description:
        "Smart matches connect you with learners and mentors who share your goals.",
    },

    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="2"
            strokeWidth="2"
          />

          <path
            d="M3 8h18"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M7 12h10"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M7 16h6"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),

      title: "Time is the currency",

      description:
        "Earn credits for every hour you teach and spend them on learning something new.",
    },

    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="m9 12 2 2 4-4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),

      title: "Learn with confidence",

      description:
        "Profiles, ratings, and a thoughtful community keep every exchange meaningful.",
    },
  ];

  const categories = [
    "Design & creativity",
    "Technology",
    "Languages",
    "Business",
    "Wellness",
  ];

  return (
    <div className="app">

      {/* =========================
          NAVBAR
      ========================= */}

      <Navbar
        onAuthClick={() => setShowAuth(true)}
      />


      {/* =========================
          MAIN HOME PAGE
      ========================= */}

      <main>

        {/* =========================
            HERO SECTION
        ========================= */}

        <section
          className="hero"
          style={{
            "--hero-image": `url(${heroImage})`,
          }}
        >

          <div className="hero-content">

            <div className="hero-badge">
              <span className="sparkle">✦</span>
              <span>Learn. Teach. Grow</span>
            </div>


            <h1>
              Exchange Skills.
              <span>Learn. Teach. Grow</span>
            </h1>


            <p className="hero-description">
              A trusted community where your knowledge is currency. Teach what
              you know, learn what you love, and grow together — one hour at a
              time.
            </p>


            <button className="primary-button">
              <span>Start learning today</span>
              <span className="arrow">↗</span>
            </button>

          </div>

        </section>


        {/* =========================
            FEATURES SECTION
        ========================= */}

        <section className="features-section">

          <div className="section-heading">

            <h2>
              The smarter way to build real skills
            </h2>

            <p>
              Learn from people who have been there. Share what you know. Grow
              with purpose.
            </p>

          </div>


          <div className="features-container">

            {features.map((feature, index) => (

              <div
                className="feature-card"
                key={index}
              >

                <div className="feature-icon">
                  {feature.icon}
                </div>


                <h3>
                  {feature.title}
                </h3>


                <p>
                  {feature.description}
                </p>

              </div>

            ))}

          </div>

        </section>


        {/* =========================
            CATEGORIES SECTION
        ========================= */}

        <section className="categories-section">

          <p className="categories-label">
            BUILD A LIFE OF CONTINUOUS LEARNING
          </p>


          <div className="categories-list">

            {categories.map((category, index) => (

              <button
                key={index}
                className="category-item"
              >
                {category}
              </button>

            ))}

          </div>

        </section>

      </main>


      {/* =========================
          FOOTER
      ========================= */}

      <Footer />


      {/* =========================
          SIGN IN / LOGIN POPUP
      ========================= */}

      {showAuth && (

        <Signin
          onClose={() => setShowAuth(false)}
        />

      )}

    </div>
  );
}

export default App;
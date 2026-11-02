import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AvailabilityModal from "../components/AvailabilityModal";
import profileImage from "../assets/usersampledp.jpg";
import "./profile.css";

function Profile() {


    const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:5000/api/profile/",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setProfileError(data.error || "Unable to load profile");
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Profile error:", error);
      setProfileError("Unable to connect to the server");
    }
  };

  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:5000/api/profile/availability",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Availability error:",
          data.error
        );
        return;
      }

      if (data.availability) {
        setAvailability(data.availability);
      }
    } catch (error) {
      console.error(
        "Availability fetch error:",
        error
      );
    }
  };

  fetchProfile();
  fetchAvailability();
}, []);


  const [menuOpen, setMenuOpen] = useState(false);
  const [availabilityOpen, setAvailabilityOpen] = useState(false);

  const [availability, setAvailability] = useState(null);

  const skills = ["Python", "Django", "SQL"];

  const navigateTo = (page) => {
    if (page === "home") {
      window.location.href = "/";
    }

    if (page === "profile") {
      setMenuOpen(false);
    }

    if (page === "settings") {
  window.history.pushState({}, "", "/settings");
  window.dispatchEvent(new PopStateEvent("popstate"));
}

    if (page === "logout") {
      window.location.href = "/";
    }
  };

  const handleAvailabilitySave = async (newAvailability) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://127.0.0.1:5000/api/profile/availability",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          availability: newAvailability,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Failed to save availability");
      return;
    }

    setAvailability(data.availability);

    alert("Availability saved successfully!");
  } catch (error) {
    console.error("Availability save error:", error);
    alert("Unable to connect to the server");
  }
};

  return (
    <div className="profile-page">

      {/* TOP NAVBAR */}
      <Navbar />

      {/* SIDE MENU BUTTON */}
      <button
        className="menu-button"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* OVERLAY */}
      {menuOpen && (
        <div
          className="profile-menu-overlay"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* SLIDE MENU */}
      <aside
        className={`profile-sidebar ${
          menuOpen ? "open" : ""
        }`}
      >
        <button
          className="sidebar-close"
          onClick={() => setMenuOpen(false)}
        >
          ×
        </button>

        <nav className="sidebar-nav">

          <button
            onClick={() => navigateTo("home")}
          >
            Home
          </button>

          <button
            className="active"
            onClick={() => navigateTo("profile")}
          >
            Profile
          </button>

          <button
            onClick={() => {
              window.history.pushState({}, "", "/dashboard");
              window.dispatchEvent(
                new PopStateEvent("popstate")
              );
            }}
          >
            Dashboard
          </button>

          <button
            onClick={() => navigateTo("settings")}
          >
            Settings
          </button>

          <button
            onClick={() => navigateTo("logout")}
          >
            Logout
          </button>

        </nav>
      </aside>

      {/* MAIN PROFILE CONTENT */}
      <main className="profile-main">

        <section className="profile-card">

          {/* USER INFORMATION */}
          <div className="profile-intro">

            {/* PROFILE IMAGE */}
            <div className="profile-picture">
              <img
  src={
    profile?.profile_picture
      ? `http://127.0.0.1:5000/uploads/profile_pictures/${profile.profile_picture}`
      : profileImage
  }
  alt="Profile"
  className="profile-avatar"
/>
            </div>

            {/* USER DETAILS */}
            <div className="profile-info">

              <h1>
  Hello, {profile ? profile.name : "User"}
</h1>

              

              

              {/* AVAILABILITY BUTTON */}
              <button
                className="availability-profile-button"
                onClick={() => setAvailabilityOpen(true)}
              >
                Availability
              </button>

              {/* SMALL SAVED STATUS */}
              {availability && (
                <p className="availability-saved-text">
                  Availability schedule saved
                </p>
              )}

            </div>

          </div>

          {/* TEACH SKILL */}
          <div className="teach-section">

            <span className="teach-label">
              Teach | Skills:
            </span>

            <span className="teach-skill">
              Python
            </span>

          </div>

          {/* PROFILE OPTIONS */}
          <div className="profile-options">

            <button
              className="profile-option"
              onClick={() => {
                window.history.pushState(
                  {},
                  "",
                  "/messages"
                );

                window.dispatchEvent(
                  new PopStateEvent("popstate")
                );
              }}
            >
              Messages
            </button>

            <button
              className="profile-option"
              onClick={() => {
                window.history.pushState(
                  {},
                  "",
                  "/wallet"
                );

                window.dispatchEvent(
                  new PopStateEvent("popstate")
                );
              }}
            >
              Wallet
            </button>

            <button
              className="profile-option"
              onClick={() => {
                window.history.pushState(
                  {},
                  "",
                  "/sessions"
                );

                window.dispatchEvent(
                  new PopStateEvent("popstate")
                );
              }}
            >
              Sessions
            </button>

            <button
              className="profile-option"
              onClick={() => {
                window.history.pushState(
                  {},
                  "",
                  "/matching"
                );

                window.dispatchEvent(
                  new PopStateEvent("popstate")
                );
              }}
            >
              Matches
            </button>

          </div>

        </section>

      </main>

      {/* FOOTER */}
      <Footer />

      {/* AVAILABILITY MODAL */}
      {availabilityOpen && (
        <AvailabilityModal
  availability={availability}
  onClose={() => setAvailabilityOpen(false)}
  onSave={handleAvailabilitySave}
/>
      )}

    </div>
  );
}

export default Profile;
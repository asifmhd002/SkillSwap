import { useRef, useState } from "react";
import Footer from "../components/Footer";
import "./settings.css";

function Settings() {
  const [photoMessage, setPhotoMessage] = useState("");

  const fileInputRef = useRef(null);

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const maxSize = 1.5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Profile picture must be 1.5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      event.target.value = "";
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("profile_picture", file);

      const response = await fetch(
        "http://127.0.0.1:5000/api/profile/picture",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error || "Failed to upload profile picture."
        );
        return;
      }

      // Remember the newly uploaded picture
      localStorage.setItem(
        "skillswapProfilePicture",
        data.profile_picture
      );

      // Show success message inside the page
      setPhotoMessage(
        "Profile picture updated successfully!"
      );

      setTimeout(() => {
        setPhotoMessage("");
      }, 3000);

    } catch (error) {
      console.error(
        "Profile picture upload error:",
        error
      );

      alert("Unable to connect to the server.");
    }

    event.target.value = "";
  };

  const handleComingSoon = () => {
    alert("This feature will be enabled soon.");
  };

  const handleReturnToProfile = () => {
    window.history.pushState({}, "", "/profile");
    window.dispatchEvent(
      new PopStateEvent("popstate")
    );
  };

  return (
    <div className="settings-page">

      <main className="settings-container">

        <button
          className="settings-back-button"
          onClick={handleReturnToProfile}
        >
          ← Return to Profile
        </button>

        <div className="settings-header">

          <p className="settings-label">
            SETTINGS
          </p>

          <h1>Account Settings</h1>

          <p>
            Manage your SkillSwap profile and account
            preferences.
          </p>

        </div>

        {/* PROFILE SETTINGS */}

        <section className="settings-section">

          <div className="settings-section-heading">

            <h2>Profile</h2>

            <p>
              Manage your personal profile information.
            </p>

          </div>

          <div className="settings-card">

            {/* PROFILE PICTURE */}

            <div className="settings-row">

              <div className="settings-row-info">

                <h3>Profile Picture</h3>

                <p>
                  Update your profile photo.
                </p>

              </div>

              <div className="settings-photo-action">

                <button
                  className="settings-edit-button"
                  onClick={handleChangePhoto}
                >
                  Change Photo
                </button>

                {photoMessage && (
                  <p className="settings-photo-success">
                    ✓ {photoMessage}
                  </p>
                )}

              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoSelected}
              />

            </div>

            <div className="settings-divider" />

            {/* NAME */}

            <div className="settings-row">

              <div className="settings-row-info">

                <h3>Name</h3>

                <p>
                  Update your account name.
                </p>

              </div>

              <button
                className="settings-edit-button"
                onClick={handleComingSoon}
              >
                Edit
              </button>

            </div>

            <div className="settings-divider" />

            {/* EMAIL */}

            <div className="settings-row">

              <div className="settings-row-info">

                <h3>Email</h3>

                <p>
                  Manage your account email address.
                </p>

              </div>

              <button
                className="settings-edit-button"
                onClick={handleComingSoon}
              >
                Edit
              </button>

            </div>

            <div className="settings-divider" />

            {/* DESIGNATION */}

            <div className="settings-row">

              <div className="settings-row-info">

                <h3>Designation</h3>

                <p>
                  Update your profile designation.
                </p>

              </div>

              <button
                className="settings-edit-button"
                onClick={handleComingSoon}
              >
                Edit
              </button>

            </div>

          </div>

        </section>

        {/* SECURITY SETTINGS */}

        <section className="settings-section">

          <div className="settings-section-heading">

            <h2>Security</h2>

            <p>
              Manage your account security.
            </p>

          </div>

          <div className="settings-card">

            <div className="settings-row">

              <div className="settings-row-info">

                <h3>Password</h3>

                <p>
                  Change your account password.
                </p>

              </div>

              <button
                className="settings-edit-button"
                onClick={handleComingSoon}
              >
                Edit
              </button>

            </div>

          </div>

        </section>

      </main>

      <Footer />

    </div>
  );
}

export default Settings;
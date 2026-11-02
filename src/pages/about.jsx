import "./about.css";
import { useEffect } from "react";

function About() {

      useEffect(() => {
    const hash = window.location.hash;

    if (hash) {
      const element = document.querySelector(hash);

      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    }
  }, []);
  
  const goHome = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="about-page">

      {/* HERO */}
      <section className="about-hero" id="about">
        <div className="about-hero-content">

          <span className="about-badge">
            ✦ ABOUT SKILLSWAP
          </span>

          <h1>
            Learn Teach
            <span> Grow together</span>
          </h1>

          <p>
            SkillSwap is a community where people exchange knowledge,
            discover new skills, and grow together — one hour at a time.
          </p>

          <button
            className="about-home-button"
            onClick={goHome}
          >
            ← Back to Home
          </button>

        </div>
      </section>


      {/* ABOUT US */}
      <section className="about-section about-intro">
        <div className="about-section-content">

          <span className="section-label">
            ABOUT US
          </span>

          <h2>
            Knowledge becomes more valuable when it is shared.
          </h2>

          <p>
            SkillSwap is built around a simple idea:
            everyone has something they can teach, and everyone
            has something they can learn.
          </p>

          <p>
            Instead of treating knowledge as something that is only
            consumed, SkillSwap creates a community where members
            can exchange their skills with one another.
          </p>

          <p>
            Whether you want to learn programming, improve your
            design skills, practice a language, understand business,
            or share something you already know, SkillSwap gives you
            a place to connect with people who share the same goal.
          </p>

        </div>
      </section>


      {/* HOW IT WORKS */}
      <section
        className="about-section alternate-section"
        id="how-it-works"
      >
        <div className="about-section-content">

          <span className="section-label">
            HOW IT WORKS
          </span>

          <h2>
            Skill exchange made simple.
          </h2>

          <div className="info-grid">

            <div className="info-card">
              <div className="info-number">01</div>
              <h3>Create your profile</h3>
              <p>
                Tell the community what you know, what you can teach,
                and what skills you would like to learn.
              </p>
            </div>

            <div className="info-card">
              <div className="info-number">02</div>
              <h3>Find people</h3>
              <p>
                Discover people whose skills and learning interests
                match what you are looking for.
              </p>
            </div>

            <div className="info-card">
              <div className="info-number">03</div>
              <h3>Connect</h3>
              <p>
                Start a conversation and discuss what you would like
                to learn or teach.
              </p>
            </div>

            <div className="info-card">
              <div className="info-number">04</div>
              <h3>Exchange skills</h3>
              <p>
                Schedule sessions, share knowledge, and grow together
                through meaningful skill exchanges.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* COMMUNITY GUIDELINES */}
      <section
        className="about-section"
        id="guidelines"
      >
        <div className="about-section-content">

          <span className="section-label">
            COMMUNITY GUIDELINES
          </span>

          <h2>
            Keep SkillSwap welcoming for everyone.
          </h2>

          <div className="guideline-list">

            <div className="guideline-item">
              <span>01</span>
              <div>
                <h3>Respect others</h3>
                <p>
                  Treat every member with respect regardless of
                  their experience or background.
                </p>
              </div>
            </div>

            <div className="guideline-item">
              <span>02</span>
              <div>
                <h3>Keep communication constructive</h3>
                <p>
                  Share feedback respectfully and keep conversations
                  focused on learning and collaboration.
                </p>
              </div>
            </div>

            <div className="guideline-item">
              <span>03</span>
              <div>
                <h3>Be honest about your skills</h3>
                <p>
                  Represent your experience accurately so members
                  can make informed decisions about learning and teaching.
                </p>
              </div>
            </div>

            <div className="guideline-item">
              <span>04</span>
              <div>
                <h3>Protect personal information</h3>
                <p>
                  Avoid sharing sensitive personal information with
                  other members through public areas of the platform.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>


      {/* HELP CENTER */}
      <section
        className="about-section alternate-section"
        id="help"
      >
        <div className="about-section-content">

          <span className="section-label">
            HELP CENTER
          </span>

          <h2>
            Need some help?
          </h2>

          <p>
            SkillSwap is designed to keep the learning and teaching
            process simple. If something isn't working as expected,
            check the relevant part of your profile, sessions,
            messages, or wallet.
          </p>

          <div className="help-grid">

            <div className="info-card">
              <h3>Profile</h3>
              <p>
                Manage your personal information, skills, and
                availability from your profile and settings.
              </p>
            </div>

            <div className="info-card">
              <h3>Sessions</h3>
              <p>
                View your scheduled sessions and manage upcoming
                or cancelled sessions.
              </p>
            </div>

            <div className="info-card">
              <h3>Messages</h3>
              <p>
                Connect with other members and discuss your
                learning sessions through messaging.
              </p>
            </div>

            <div className="info-card">
              <h3>Wallet</h3>
              <p>
                Keep track of your available credits and
                transaction history.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* CONTACT */}
      <section
        className="about-section"
        id="contact"
      >
        <div className="about-section-content contact-content">

          <span className="section-label">
            CONTACT
          </span>

          <h2>
            Have a question?
          </h2>

          <p>
            If you have a question, suggestion, or issue with
            SkillSwap, you can reach out to the SkillSwap team.
          </p>

          <div className="contact-card">

            <div>
              <span>Email</span>
              <h3>support@skillswap.com</h3>
            </div>

            <a
              href="mailto:support@skillswap.com"
              className="contact-button"
            >
              Contact Support →
            </a>

          </div>

        </div>
      </section>


      {/* PRIVACY */}
      <section
        className="about-section alternate-section"
        id="privacy"
      >
        <div className="about-section-content">

          <span className="section-label">
            PRIVACY POLICY
          </span>

          <h2>
            Your information matters.
          </h2>

          <p>
            SkillSwap collects information needed to provide the
            platform's core functionality, such as creating your
            account, managing your profile, connecting you with
            other members, and managing sessions.
          </p>

          <div className="privacy-list">

            <div>
              <h3>Account information</h3>
              <p>
                Information such as your name and email address
                is used to maintain your SkillSwap account.
              </p>
            </div>

            <div>
              <h3>Profile information</h3>
              <p>
                Information you add to your profile may be visible
                to other SkillSwap members so they can discover
                compatible skills.
              </p>
            </div>

            <div>
              <h3>Messages</h3>
              <p>
                Messages are associated with the conversations
                you participate in and are used to provide the
                messaging functionality.
              </p>
            </div>

            <div>
              <h3>Security</h3>
              <p>
                Account credentials should be kept private.
                SkillSwap should never require you to publicly
                share your password or authentication information.
              </p>
            </div>

          </div>

          <p className="privacy-note">
            This page describes the current intended behavior of
            the SkillSwap application. A formal production privacy
            policy should be reviewed and finalized before the
            application is publicly launched.
          </p>

        </div>
      </section>


      {/* FOOTER OF ABOUT PAGE */}
      <section className="about-end">

        <div className="about-end-logo">
          <div className="about-logo-icon">
            ✦
          </div>

          <span>
            Skill<span>Swap</span>
          </span>
        </div>

        <p>
          Learn. Teach. Grow.
        </p>

        <button
          className="about-home-button"
          onClick={goHome}
        >
          Back to Home
        </button>

      </section>

    </div>
  );
}

export default About;
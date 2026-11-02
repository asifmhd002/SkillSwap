import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        <div className="footer-brand">

          <div className="footer-logo">
            <div className="footer-logo-icon">
              ✦
            </div>

            <span>
              Skill<span>Swap</span>
            </span>
          </div>

          <p>
            Learn what you love. Teach what you know.
            Grow together.
          </p>

        </div>


        <div className="footer-links">

          {/* PLATFORM */}

          <div className="footer-column">

            <h4>Platform</h4>

            <a href="/">
              Home
            </a>

            <a href="/matching">
              Explore Skills
            </a>

            <a href="/matching">
              Find People
            </a>

          </div>


          {/* COMMUNITY */}

          <div className="footer-column">

            <h4>Community</h4>

            <a href="/about#about">
              About Us
            </a>

            <a href="/about#how-it-works">
              How It Works
            </a>

            <a href="/about#guidelines">
              Community Guidelines
            </a>

          </div>


          {/* SUPPORT */}

          <div className="footer-column">

            <h4>Support</h4>

            <a href="/about#help">
              Help Center
            </a>

            <a href="/about#contact">
              Contact
            </a>

            <a href="/about#privacy">
              Privacy
            </a>

          </div>

        </div>

      </div>


      <div className="footer-bottom">

        <p>
          © {new Date().getFullYear()} SkillSwap. All rights reserved.
        </p>

        <p>
          Learn. Teach. Grow.
        </p>

      </div>

    </footer>
  );
}

export default Footer;
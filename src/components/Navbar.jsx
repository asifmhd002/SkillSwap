import "./Navbar.css";

function Navbar({ onAuthClick }) {
  return (
    <header className="navbar">

      <div className="navbar-container">

        {/* LOGO */}
        <a href="/" className="navbar-logo">

          <div className="logo-icon">
            ✦
          </div>

          <span className="logo-text">
            Skill<span>Swap</span>
          </span>

        </a>


        {/* NAVIGATION */}
        <nav className="navbar-actions">

          <button
            className="signin-link"
            onClick={onAuthClick}
          >
            Sign in
          </button>


          <button
            className="login-button"
            onClick={onAuthClick}
          >
            Login
          </button>

        </nav>

      </div>

    </header>
  );
}

export default Navbar;
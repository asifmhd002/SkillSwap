import "./forgotpassword.css";

function ForgotPassword({ onClose }) {
  return (
    <div className="forgot-overlay" onMouseDown={onClose}>
      <div
        className="forgot-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          className="forgot-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {/* HEADER */}
        <div className="forgot-header">
          <h2>Forgot Password?</h2>

          <p>
            Enter your email address and we'll send you a verification code.
          </p>
        </div>

        {/* FORM */}
        <form
          className="forgot-form"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="forgot-group">
            <label>Email address</label>

            <input
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            type="submit"
            className="forgot-submit"
          >
            Send Code
          </button>

          <button
            type="button"
            className="forgot-back"
            onClick={onClose}
          >
            ← Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
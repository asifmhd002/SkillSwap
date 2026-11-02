import { useState } from "react";
import "./signin.css";
import ForgotPassword from "./forgotpassword";

function Signin({ onClose }) {
  const [activeTab, setActiveTab] = useState("signin");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loginError, setLoginError] = useState("");


const [signupName, setSignupName] = useState("");
const [learnSkill, setLearnSkill] = useState("");
const [teachSkill, setTeachSkill] = useState("");
const [signupEmail, setSignupEmail] = useState("");
const [signupPassword, setSignupPassword] = useState("");
const [signupError, setSignupError] = useState("");


const handleLogin = async (e) => {
  e.preventDefault();

  setLoginError("");

  try {
    const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setLoginError(data.error || "Login failed");
      return;
    }

    // Save JWT token
    localStorage.setItem("token", data.token);

    // Save logged-in user
    localStorage.setItem("user", JSON.stringify(data.user));

    console.log("Login successful:", data.user);

onClose();

window.history.pushState({}, "", "/profile");
window.dispatchEvent(new PopStateEvent("popstate"));

  } catch (error) {
    console.error("Login error:", error);
    setLoginError("Unable to connect to the server");
  }
};


const handleSignup = async (e) => {
  e.preventDefault();

  setSignupError("");

  try {
   const response = await fetch(
  "http://127.0.0.1:5000/api/auth/register",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      learning_skill: learnSkill,
      teaching_skill: teachSkill,
    }),
  }
);

    const data = await response.json();

    if (!response.ok) {
      setSignupError(data.error || "Registration failed");
      return;
    }

    console.log("Registration successful:", data);

    // Automatically switch to Login after successful registration
    setActiveTab("login");

    // Clear signup fields
    setSignupName("");
    setLearnSkill("");
    setTeachSkill("");
    setSignupEmail("");
    setSignupPassword("");

  } catch (error) {
    console.error("Registration error:", error);
    setSignupError("Unable to connect to the server");
  }
};


  return (
    <div className="auth-overlay" onMouseDown={onClose}>
      
      <div
        className="auth-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >

        {/* CLOSE BUTTON */}
        <button
          className="auth-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>


        {/* HEADER */}
        <div className="auth-header">

          <h2>Login to SkillSwap</h2>

          <p>
            Enter your details to personalize your learning journey.
          </p>

        </div>


        {/* TABS */}
        <div className="auth-tabs">

          <button
            className={`auth-tab ${
              activeTab === "signin" ? "active" : ""
            }`}
            onClick={() => setActiveTab("signin")}
          >
            Sign in
          </button>

          <button
            className={`auth-tab ${
              activeTab === "login" ? "active" : ""
            }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>

        </div>


        {/* SIGN UP / SIGN IN FORM */}
        {activeTab === "signin" ? (

          <form className="auth-form" onSubmit={handleSignup}>

            {/* NAME + LEARN */}
            <div className="form-row">

              <div className="form-group">
                <label>Full name</label>

                <input
  type="text"
  placeholder="Alex Lee"
  value={signupName}
  onChange={(e) => setSignupName(e.target.value)}
/>
              </div>


              <div className="form-group">
                <label>I want to learn</label>

                <input
  type="text"
  placeholder="e.g. Python"
  value={learnSkill}
  onChange={(e) => setLearnSkill(e.target.value)}
/>
              </div>

            </div>


            {/* TEACH */}
            <div className="form-group">

              <label>I can teach</label>

              <input
  type="text"
  placeholder="e.g. Product design"
  value={teachSkill}
  onChange={(e) => setTeachSkill(e.target.value)}
/>

            </div>


            {/* EMAIL */}
            <div className="form-group">

              <label>Email address</label>

              <input
  type="email"
  placeholder="you@example.com"
  value={signupEmail}
  onChange={(e) => setSignupEmail(e.target.value)}
/>

            </div>


            {/* PASSWORD */}
            <div className="form-group">

              <label>Password</label>

              <input
  type="password"
  placeholder="••••••••"
  value={signupPassword}
  onChange={(e) => setSignupPassword(e.target.value)}
/>

            </div>


            {/* REMEMBER */}
            <label className="remember">

              <input type="checkbox" />

              <span>Remember me</span>

            </label>


            {/* BUTTON */}
            {/* REGISTRATION ERROR */}
{signupError && (
  <p style={{ color: "red", marginBottom: "10px" }}>
    {signupError}
  </p>
)}

{/* BUTTON */}
<button
  type="submit"
  className="auth-submit"
>
  Sign in
</button>


            {/* FOOTNOTE */}
            <p className="auth-footer-text">
              By continuing, you agree to our community guidelines.
            </p>

          </form>

        ) : (

          /* LOGIN FORM */
          <form className="auth-form login-form" onSubmit={handleLogin}>

            <div className="form-group">

              <label>Email address</label>

              <input
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

            </div>


            <div className="form-group">

              <label>Password</label>

              <input
  type="password"
  placeholder="••••••••"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
/>

            </div>


            {loginError && (
  <p style={{ color: "red", marginBottom: "10px" }}>
    {loginError}
  </p>
)}


            <div className="login-options">

              <label className="remember">

                <input type="checkbox" />

                <span>Remember me</span>

              </label>


              {/* FORGOT PASSWORD */}
              <button
                type="button"
                className="forgot-password"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot password?
              </button>

            </div>


            <button
  type="submit"
  className="auth-submit"
>
  Login
</button>


            <p className="auth-footer-text">
              Welcome back to SkillSwap.
            </p>

          </form>

        )}

      </div>


      {/* FORGOT PASSWORD MODAL */}
      {showForgotPassword && (
        <ForgotPassword
          onClose={() => setShowForgotPassword(false)}
        />
      )}

    </div>
  );
}

export default Signin;
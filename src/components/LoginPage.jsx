import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaEnvelope, FaLock, FaShieldAlt } from "react-icons/fa";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "admin@example.com",
    password: "admin123",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      localStorage.setItem("adminToken", data.token);
      navigate("/");
    } catch (submitError) {
      setError(submitError.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          background: #efefef;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #efefef;
          padding: 24px;
        }

        .login-card {
          width: min(100%, 434px);
          background: #f4f4f4;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 8px 18px rgba(27, 41, 52, 0.08);
        }

        .login-header {
          background: #243b4b;
          color: #ffffff;
          padding: 22px 22px 18px;
          text-align: center;
        }

        .shield-icon {
          width: 62px;
          height: 62px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 42px;
          margin-bottom: 12px;
        }

        .login-header h1 {
          margin: 0;
          font-size: clamp(1.6rem, 2.2vw, 2.2rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1.1;
        }

        .login-header p {
          margin: 10px 0 0;
          font-size: clamp(0.95rem, 1.2vw, 1.2rem);
          font-weight: 400;
          color: rgba(255, 255, 255, 0.82);
        }

        .login-form-wrap {
          background: #f3f3f3;
          padding: 18px 20px 14px;
        }

        .login-form {
          width: 100%;
        }

        .field-group {
          margin-bottom: 14px;
        }

        .field-label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 8px;
          color: #2b3d4d;
          font-size: clamp(0.92rem, 1.1vw, 1.08rem);
          font-weight: 700;
        }

        .field-label svg {
          font-size: 0.95rem;
          color: #2d3f50;
        }

        .login-input {
          width: 100%;
          border: 2px solid #d9dfe5;
          border-radius: 10px;
          background: #f5f5f5;
          color: #2f3f4f;
          padding: 14px 14px 13px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .login-input::placeholder {
          color: #6f7d89;
          opacity: 1;
        }

        .login-input:focus {
          border-color: #53a7e8;
          box-shadow: 0 0 0 3px rgba(83, 167, 232, 0.15);
        }

        .login-input.password-input {
          border-color: #5aa6d8;
          box-shadow: 0 0 0 1px rgba(90, 166, 216, 0.2);
        }

        .submit-btn {
          width: 100%;
          border: none;
          border-radius: 10px;
          background: linear-gradient(180deg, #2d4559 0%, #20364a 100%);
          color: #ffffff;
          padding: 14px 14px;
          font-size: clamp(1rem, 1.4vw, 1.35rem);
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          margin-top: 16px;
          box-shadow: 0 4px 10px rgba(24, 41, 53, 0.18);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .submit-btn:disabled {
          opacity: 0.8;
          cursor: wait;
        }

        .submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 12px rgba(24, 41, 53, 0.2);
        }

        .submit-btn svg {
          font-size: 1.1rem;
        }

        .login-error {
          margin-top: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          background: rgba(220, 38, 38, 0.08);
          color: #b91c1c;
          font-size: 0.9rem;
          border: 1px solid rgba(220, 38, 38, 0.15);
        }

        .login-footer {
          text-align: center;
          padding: 14px 12px 16px;
          color: #7b7b7b;
          font-size: 0.8rem;
          background: #f4f4f4;
        }

        @media (max-width: 520px) {
          .login-header {
            padding-left: 20px;
            padding-right: 20px;
          }

          .login-form-wrap {
            padding-left: 18px;
            padding-right: 18px;
          }

          .field-label {
            font-size: 0.95rem;
          }

          .login-input {
            padding-top: 15px;
            padding-bottom: 15px;
            font-size: 1.02rem;
          }

          .submit-btn {
            font-size: 1.1rem;
            padding-top: 16px;
            padding-bottom: 16px;
          }
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <div className="shield-icon" aria-label="security shield">
              <FaShieldAlt />
            </div>
            <h1>Admin Panel</h1>
            <p>Login to manage your store</p>
          </div>

          <div className="login-form-wrap">
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="field-group">
                <label className="field-label" htmlFor="email">
                  <FaEnvelope />
                  <span>Email Address</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="login-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="password">
                  <FaLock />
                  <span>Password</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="login-input password-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {error ? <div className="login-error">{error}</div> : null}

              <button type="submit" className="submit-btn" disabled={loading}>
                <FaArrowRight />
                <span>{loading ? "Logging in..." : "Login to Dashboard"}</span>
              </button>
            </form>
          </div>

          <div className="login-footer">© 2026 Ecommerce Admin Panel</div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

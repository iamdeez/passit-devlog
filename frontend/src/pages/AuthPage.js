import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");
    if (error === "kakao_login_failed") {
      setErrorMessage(message || "카카오 로그인에 실패했습니다. 다시 시도해주세요.");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleLoginSuccess = (user) => {
    if (user?.role === "ADMIN") navigate("/admin/users");
    else navigate("/");
  };

  const handleRegisterSuccess = () => {
    setSuccessMessage("회원가입이 완료되었습니다. 로그인해주세요.");
    setIsLogin(true);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container p-6 md:p-8">
        <header className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-primary-container flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              security
            </span>
          </div>
          <h1 className="text-on-surface font-display text-2xl font-extrabold tracking-tight mb-1">PASSIT</h1>
          <p className="text-on-surface-variant font-label text-sm">안전하게 거래하세요</p>
        </header>

        <nav className="flex border-b border-outline-variant mb-8">
          <button
            type="button"
            className={`flex-1 py-3 text-center font-bold text-sm transition-all duration-200 ${
              isLogin ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
            }`}
            onClick={() => setIsLogin(true)}
          >
            로그인
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-center font-bold text-sm transition-all duration-200 ${
              !isLogin ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
            }`}
            onClick={() => setIsLogin(false)}
          >
            회원가입
          </button>
        </nav>

        {errorMessage && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-start gap-2">
            <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5">error</span>
            <span className="flex-1">{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage(null)} className="flex-shrink-0 opacity-60 hover:opacity-100">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 text-green-800 text-sm flex items-start gap-2">
            <span className="material-symbols-outlined text-base flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <span className="flex-1">{successMessage}</span>
            <button type="button" onClick={() => setSuccessMessage(null)} className="flex-shrink-0 opacity-60 hover:opacity-100">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        {isLogin ? (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setIsLogin(false)}
          />
        ) : (
          <RegisterForm
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </main>

      <div className="mt-8 flex items-center gap-2 text-outline-variant bg-surface-container-low/50 px-4 py-2 rounded-full border border-surface-container">
        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
          lock
        </span>
        <p className="text-[10px] font-medium">SSL 암호화로 개인정보를 안전하게 보호합니다</p>
      </div>
    </div>
  );
};

export default AuthPage;

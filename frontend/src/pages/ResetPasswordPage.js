import React from "react";
import { useNavigate } from "react-router-dom";
import ResetPasswordForm from "../components/ResetPasswordForm";

const ResetPasswordPage = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <header className="fixed top-0 w-full z-50 flex items-center px-4 h-16 bg-surface border-b border-outline-variant">
        <button onClick={() => navigate("/auth")} className="p-2 hover:bg-surface-container-high transition-colors rounded-full active:scale-95">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <h1 className="flex-grow text-center font-headline font-bold text-lg text-on-surface">비밀번호 재설정</h1>
        <div className="p-2">
          <span className="material-symbols-outlined text-primary">lock</span>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-12 px-6 max-w-md mx-auto w-full">
        <ResetPasswordForm />
      </main>

      <footer className="p-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full">
          <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          <span className="text-[11px] font-medium text-on-surface-variant uppercase tracking-wider">Secure Escrow Protection</span>
        </div>
      </footer>
    </div>
  );
};

export default ResetPasswordPage;

import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const KakaoCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleKakaoCallback } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get("token");
      const refreshToken = searchParams.get("refreshToken");
      const userId = searchParams.get("userId");
      const email = searchParams.get("email");
      const name = searchParams.get("name");
      const provider = searchParams.get("provider");
      const error = searchParams.get("error");
      const errorMessage = searchParams.get("message");

      if (error) {
        console.error("Kakao login error:", errorMessage);
        navigate("/auth?error=kakao_login_failed&message=" + encodeURIComponent(errorMessage || error));
        return;
      }

      if (token && refreshToken && userId && email && name) {
        try {
          const result = handleKakaoCallback(token, refreshToken, userId, email, name, provider);
          if (result.success) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            navigate("/", { replace: true });
          } else {
            navigate("/auth?error=kakao_login_failed");
          }
        } catch (err) {
          console.error("Error processing Kakao callback:", err);
          navigate("/auth?error=kakao_login_failed&message=" + encodeURIComponent(err.message));
        }
      } else {
        console.error("Missing required parameters:", { token: !!token, refreshToken: !!refreshToken, userId: !!userId, email: !!email, name: !!name });
        navigate("/auth?error=kakao_login_failed&message=필수 정보가 누락되었습니다");
      }
    };

    processCallback();
  }, [searchParams, navigate, handleKakaoCallback]);

  return (
    <div className="bg-background text-on-background font-body h-screen flex flex-col overflow-hidden">
      <header className="bg-background w-full top-0 sticky flex items-center justify-between px-4 py-3 z-50">
        <button onClick={() => navigate("/auth")} className="active:scale-95 text-on-surface-variant flex items-center justify-center p-2 rounded-full hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          <span className="font-headline font-black text-xl tracking-tight">PASSIT</span>
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-grow flex flex-col items-center justify-center relative px-6">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#FEE500]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-[120px] h-[120px] mb-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-[3px] border-primary/10 scale-125" />
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden shadow-2xl shadow-primary/20 bg-gradient-to-br from-[#FEE500] via-primary to-primary-dim animate-spin" />
            <div className="absolute inset-4 rounded-full bg-background flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>login</span>
            </div>
          </div>
          <div className="text-center space-y-3">
            <h1 className="font-headline font-bold text-2xl text-on-surface">카카오 로그인 처리 중</h1>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              PASSIT 계정과 안전하게 연결하고 있습니다.
            </p>
            <div className="flex justify-center gap-1.5 pt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KakaoCallbackPage;

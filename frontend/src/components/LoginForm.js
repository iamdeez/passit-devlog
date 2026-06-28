import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import authService from "../services/authService";
import { isDemoMode } from "../demo/demoConfig";

const KAKAO_ICON = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMEMxMy45NzA2IDAgMTggMy4zODI3IDE4IDcuNTY3NjlDMTggMTEuNzUyNyAxMy45NzA2IDE1LjEzNTQgOSAxNS4xMzU0QzguMTI3MTggMTUuMTM1NCA3LjI5NDI1IDE1LjAyMDQgNi41MDk1NCAxNC44MDc4TDIuOTM5ODEgMTcuNDYwOUMyLjY2NDE4IDE3LjY5NDkgMi4yNzg0MSAxNy42NDgxIDIuMDU0NjkgMTcuMzU0OUMxLjk0MTE5IDE3LjIwODkgMS44ODM0OSAxNy4wMjI3IDEuODkxNTkgMTYuODMyM0wyLjExNDQyIDEyLjkxNTlDMC43ODU3MzggMTEuNjM0IDAgOS42OTc3NiAwIDcuNTY3NjlDMCAzLjM4MjcgNC4wMjk0NCAwIDkgMFoiIGZpbGw9IiMwMDAwMDAiLz4KPC9zdmc+";

const LoginForm = ({ onLoginSuccess, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const result = await login(formData.email, formData.password, rememberMe);
      if (result.success) onLoginSuccess(result.user);
      else setError(result.error || "이메일 또는 비밀번호를 확인해주세요");
    } catch (err) {
      setError(err.message || "이메일 또는 비밀번호를 확인해주세요");
    } finally { setLoading(false); }
  };

  const handleKakaoLogin = () => { window.location.href = authService.getKakaoLoginUrl(); };

  const handleDemoLogin = async (email) => {
    setError(""); setLoading(true);
    try {
      const result = await login(email, "demo");
      if (result.success) onLoginSuccess(result.user);
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-on-surface mb-1">로그인</h2>
        <p className="text-sm text-on-surface-variant">간편하게 로그인하고 서비스를 이용하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1 justify-between">
        <div className="space-y-4">
          {error && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

          {/* 데모 체험 — 데모 모드에서만 노출 */}
          {isDemoMode() && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-primary">
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span className="text-sm font-display font-bold">데모 체험 — 가입 없이 바로 둘러보기</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => handleDemoLogin("demo@passit.app")} disabled={loading}
                  className="py-2.5 rounded-xl bg-primary text-on-primary text-sm font-display font-bold hover:bg-primary-dim active:scale-[0.97] transition-all disabled:opacity-60">
                  구매자로 둘러보기
                </button>
                <button type="button" onClick={() => handleDemoLogin("admin@passit.app")} disabled={loading}
                  className="py-2.5 rounded-xl border border-primary text-primary text-sm font-display font-bold hover:bg-primary/10 active:scale-[0.97] transition-all disabled:opacity-60">
                  관리자로 둘러보기
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-on-surface-variant">
                백엔드 없이 mock 데이터로 동작합니다. 아래 폼에 아무 이메일/비밀번호를 넣어도 로그인됩니다
                (<span className="font-medium">admin</span> 포함 시 관리자).
              </p>
            </div>
          )}

          {/* 카카오 로그인 */}
          <button type="button" onClick={handleKakaoLogin}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#FEE500] text-black font-semibold rounded-xl hover:bg-[#FDD835] transition-all">
            <img src={KAKAO_ICON} alt="Kakao" className="w-5 h-5" />
            카카오로 3초만에 시작하기
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-outline-variant/30" />
            <span className="text-xs text-on-surface-variant">또는</span>
            <div className="flex-1 border-t border-outline-variant/30" />
          </div>

          <div className="space-y-3">
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              required placeholder="이메일@example.com" className="input-base" />

            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password}
                onChange={handleChange} required placeholder="비밀번호를 입력하세요"
                className="input-base pr-11" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-outline-variant text-primary" />
              <span className="text-sm font-medium text-on-surface-variant">로그인 상태 유지</span>
            </label>
            <button type="button" onClick={() => (window.location.href = "/reset-password")}
              className="text-sm font-medium text-primary hover:underline">
              비밀번호 찾기
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <button type="submit" disabled={loading}
            className="w-full btn-primary py-3 disabled:opacity-60">
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "로그인"}
          </button>
          <p className="text-center text-sm text-on-surface-variant">
            계정이 없으신가요?{" "}
            <button type="button" onClick={onSwitchToRegister} className="text-primary font-medium hover:underline">
              회원가입
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

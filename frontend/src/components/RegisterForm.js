import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import authService from "../services/authService";

const KAKAO_ICON = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMEMxMy45NzA2IDAgMTggMy4zODI3IDE4IDcuNTY3NjlDMTggMTEuNzUyNyAxMy45NzA2IDE1LjEzNTQgOSAxNS4xMzU0QzguMTI3MTggMTUuMTM1NCA3LjI5NDI1IDE1LjAyMDQgNi41MDk1NCAxNC44MDc4TDIuOTM5ODEgMTcuNDYwOUMyLjY2NDE4IDE3LjY5NDkgMi4yNzg0MSAxNy42NDgxIDIuMDU0NjkgMTcuMzU0OUMxLjk0MTE5IDE3LjIwODkgMS44ODM0OSAxNy4wMjI3IDEuODkxNTkgMTYuODMyM0wyLjExNDQyIDEyLjkxNTlDMC43ODU3MzggMTEuNjM0IDAgOS42OTc3NiAwIDcuNTY3NjlDMCAzLjM4MjcgNC4wMjk0NCAwIDkgMFoiIGZpbGw9IiMwMDAwMDAiLz4KPC9zdmc+";

const STEPS = ["이메일 인증", "기본 정보", "비밀번호 설정"];

const RegisterForm = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const { signup } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ name: "", nickname: "", email: "", verificationCode: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [timer, setTimer] = useState(0);

  const passwordStrength = useMemo(() => {
    const p = formData.password;
    if (!p) return { label: "", strength: 0, color: "bg-outline-variant" };
    let s = 0;
    if (p.length >= 6) s += 25;
    if (p.length >= 10) s += 25;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s += 25;
    if (/[0-9]/.test(p)) s += 15;
    if (/[^a-zA-Z0-9]/.test(p)) s += 10;
    if (s < 30) return { label: "약함", strength: s, color: "bg-red-500" };
    if (s < 60) return { label: "보통", strength: s, color: "bg-amber-400" };
    return { label: "강함", strength: s, color: "bg-green-500" };
  }, [formData.password]);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(""); };

  useEffect(() => {
    if (timer > 0) { const t = setTimeout(() => setTimer(timer - 1), 1000); return () => clearTimeout(t); }
  }, [timer]);

  const handleSendVerificationCode = async () => {
    if (!formData.email) { setError("이메일 주소를 입력해주세요"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError("이메일 형식을 확인해주세요"); return; }
    setSendingEmail(true); setError("");
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setEmailSent(true); setTimer(180);
      alert("인증 코드가 이메일로 발송되었습니다.");
    } catch (err) { setError(err.message || "인증 코드를 보내는 중 문제가 발생했어요");
    } finally { setSendingEmail(false); }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode) { setError("인증 코드를 입력해주세요"); return; }
    setVerifyingCode(true); setError("");
    try {
      await new Promise((r) => setTimeout(r, 500));
      if (formData.verificationCode === "123456") {
        setEmailVerified(true); setTimer(0);
        setTimeout(() => setCurrentStep(2), 500);
      } else { setError("인증 코드가 일치하지 않아요"); }
    } catch (err) { setError(err.message || "인증 코드 확인 중 문제가 발생했어요");
    } finally { setVerifyingCode(false); }
  };

  const handleSelectMethod = (method) => {
    if (method === "kakao") window.location.href = authService.getKakaoLoginUrl();
    else setCurrentStep(1);
  };

  const handleNextStep = () => {
    setError("");
    if (currentStep === 1) {
      if (!emailVerified) { setError("이메일 인증을 먼저 완료해주세요"); return; }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.name.trim()) { setError("이름을 입력해주세요"); return; }
      if (!formData.nickname.trim()) { setError("닉네임을 입력해주세요"); return; }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    setError("");
    if (currentStep === 1) { setCurrentStep(0); }
    else if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!agreedToTerms) { setError("서비스 이용을 위해 약관에 동의해주세요"); return; }
    if (formData.password.length < 6) { setError("비밀번호를 6자 이상으로 설정해주세요"); return; }
    if (formData.password !== formData.confirmPassword) { setError("비밀번호가 일치하지 않아요"); return; }
    setLoading(true);
    try {
      const { confirmPassword, verificationCode, ...userData } = formData;
      const result = await signup(userData);
      if (result.success) { const userInfo = result.data?.data || result.data; onRegisterSuccess(userInfo); }
      else setError(result.error || "회원가입 중 문제가 발생했어요");
    } catch (err) { setError(err.message || "회원가입 중 문제가 발생했어요");
    } finally { setLoading(false); }
  };

  const StepIndicator = () => (
    <div className="flex items-center mb-6">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const active = currentStep === stepNum;
        const done = currentStep > stepNum;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? "bg-primary text-on-primary" : active ? "bg-primary text-on-primary ring-4 ring-primary/20" : "bg-surface-container text-on-surface-variant"}`}>
                {done ? <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span> : stepNum}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${active ? "text-primary" : "text-on-surface-variant"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 mb-4 ${done ? "bg-primary" : "bg-surface-container"}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-5 flex-shrink-0">
        <h2 className="text-2xl font-display font-bold text-on-surface mb-1">회원가입</h2>
        <p className="text-sm text-on-surface-variant">
          {currentStep === 0 ? "가입 방법을 선택해주세요" : "간편하게 가입하고 안전한 티켓 거래를 시작하세요"}
        </p>
      </div>

      {currentStep > 0 && <StepIndicator />}

      <form onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}
        className="flex flex-col gap-4 flex-1 justify-between">
        <div className="space-y-4">
          {error && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

          {/* Step 0 */}
          {currentStep === 0 && (
            <div className="flex flex-col gap-3 py-2">
              <button type="button" onClick={() => handleSelectMethod("kakao")}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#FEE500] text-black font-semibold rounded-xl hover:bg-[#FDD835] transition-all">
                <img src={KAKAO_ICON} alt="Kakao" className="w-5 h-5" />
                카카오로 3초만에 시작하기
              </button>
              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-outline-variant/30" />
                <span className="text-xs text-on-surface-variant">또는</span>
                <div className="flex-1 border-t border-outline-variant/30" />
              </div>
              <button type="button" onClick={() => handleSelectMethod("email")}
                className="w-full py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary/5 transition-all">
                이메일로 가입하기
              </button>
              <p className="text-center text-sm text-on-surface-variant mt-2">
                이미 계정이 있으신가요?{" "}
                <button type="button" onClick={onSwitchToLogin} className="text-primary font-medium hover:underline">로그인</button>
              </p>
            </div>
          )}

          {/* Step 1: 이메일 인증 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">이메일</label>
                <div className="flex gap-2">
                  <input type="email" name="email" value={formData.email} onChange={handleChange}
                    required placeholder="이메일@example.com" disabled={emailVerified}
                    className="input-base flex-1" />
                  <button type="button" onClick={handleSendVerificationCode}
                    disabled={sendingEmail || emailVerified || timer > 0}
                    className="px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-all disabled:opacity-50 whitespace-nowrap">
                    {sendingEmail ? <span className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin inline-block" />
                      : timer > 0 ? `${Math.floor(timer/60)}:${String(timer%60).padStart(2,"0")}`
                      : emailSent ? "재발송" : "인증"}
                  </button>
                </div>
                {emailVerified && <p className="text-xs text-green-600 mt-1 font-medium">✓ 인증완료</p>}
              </div>
              {emailSent && !emailVerified && (
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">인증 코드</label>
                  <div className="flex gap-2">
                    <input name="verificationCode" value={formData.verificationCode} onChange={handleChange}
                      required placeholder="인증 코드 6자리" maxLength={6} autoFocus
                      className="input-base flex-1" />
                    <button type="button" onClick={handleVerifyCode}
                      disabled={verifyingCode || !formData.verificationCode}
                      className="px-4 py-2.5 bg-primary text-on-primary font-semibold rounded-xl text-sm disabled:opacity-50 transition-all whitespace-nowrap">
                      {verifyingCode ? <span className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin inline-block" /> : "확인"}
                    </button>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">테스트용 인증 코드: 123456</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: 기본 정보 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">이름</label>
                <input name="name" value={formData.name} onChange={handleChange} required
                  placeholder="홍길동" autoFocus className="input-base" />
                <p className="text-xs text-on-surface-variant mt-1">실명을 입력해주세요</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">닉네임</label>
                <input name="nickname" value={formData.nickname} onChange={handleChange} required
                  placeholder="사용하실 닉네임을 입력하세요" className="input-base" />
                <p className="text-xs text-on-surface-variant mt-1">다른 사용자에게 표시될 이름입니다</p>
              </div>
            </div>
          )}

          {/* Step 3: 비밀번호 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">비밀번호</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password}
                    onChange={handleChange} required placeholder="비밀번호를 입력하세요" autoFocus
                    className="input-base pr-11" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined text-xl">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <p className="text-xs text-on-surface-variant mb-1">비밀번호 강도: {passwordStrength.label}</p>
                    <div className="h-1.5 bg-surface-container rounded-full">
                      <div className={`h-full rounded-full transition-all ${passwordStrength.color}`} style={{ width: `${passwordStrength.strength}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">비밀번호 확인</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword}
                    onChange={handleChange} required placeholder="비밀번호를 다시 입력하세요"
                    className="input-base pr-11" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined text-xl">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant text-primary" />
                <span className="text-sm text-on-surface-variant">
                  <a href="#" className="text-primary hover:underline">이용약관</a> 및{" "}
                  <a href="#" className="text-primary hover:underline">개인정보처리방침</a>에 동의합니다
                </span>
              </label>
            </div>
          )}
        </div>

        {/* 버튼 영역 */}
        {currentStep > 0 && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <button type="button" onClick={handlePrevStep}
                className="btn-outlined flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">arrow_back</span>이전
              </button>
              {currentStep < 3 ? (
                <button type="button" onClick={handleNextStep}
                  disabled={currentStep === 1 && !emailVerified}
                  className="flex-1 btn-primary disabled:opacity-60">
                  다음
                </button>
              ) : (
                <button type="submit" disabled={loading} className="flex-1 btn-primary disabled:opacity-60">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "회원가입"}
                </button>
              )}
            </div>
            <p className="text-center text-sm text-on-surface-variant">
              이미 계정이 있으신가요?{" "}
              <button type="button" onClick={onSwitchToLogin} className="text-primary font-medium hover:underline">로그인</button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default RegisterForm;

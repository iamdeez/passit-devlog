import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../services/userService";

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", verificationCode: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [timer, setTimer] = useState(0);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(""); };
  const setCodeDigit = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const chars = formData.verificationCode.padEnd(6).split("");
    chars[index] = digit;
    setFormData({ ...formData, verificationCode: chars.join("").trim() });
    setError("");
  };

  useEffect(() => {
    if (timer > 0) { const t = setTimeout(() => setTimer(timer - 1), 1000); return () => clearTimeout(t); }
  }, [timer]);

  const handleSendVerificationCode = async () => {
    if (!formData.email) { setError("이메일 주소를 입력해주세요"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError("이메일 형식을 확인해주세요"); return; }
    setSendingEmail(true); setError("");
    try {
      await userService.sendPasswordResetCode(formData.email);
      setTimer(180); alert("인증 코드가 이메일로 발송되었습니다.");
    } catch (err) { setError(err.message || "인증 코드를 보내는 중 문제가 발생했어요");
    } finally { setSendingEmail(false); }
  };

  const handleVerifyCode = async () => {
    if (!formData.verificationCode) { setError("인증 코드를 입력해주세요"); return; }
    setVerifyingCode(true); setError("");
    try {
      await userService.verifyPasswordResetCode(formData.email, formData.verificationCode);
      setEmailVerified(true); setTimer(0);
    } catch (err) { setError(err.message || "인증 코드를 확인하는 중 문제가 발생했어요");
    } finally { setVerifyingCode(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (formData.password.length < 6) { setError("비밀번호를 6자 이상으로 설정해주세요"); return; }
    if (formData.password !== formData.confirmPassword) { setError("비밀번호가 일치하지 않아요"); return; }
    setLoading(true);
    try {
      await userService.resetPassword(formData.email, formData.password);
      alert("비밀번호가 변경되었습니다. 로그인해주세요."); navigate("/auth");
    } catch (err) { setError(err.message || "비밀번호 변경 중 문제가 발생했어요");
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-20 h-20 bg-primary-container/30 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>lock_reset</span>
        </div>
        <h2 className="font-headline font-bold text-xl leading-snug text-on-surface px-4">
          가입하신 이메일로<br />인증 코드를 보내드립니다
        </h2>
      </div>

      {error && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm mb-6">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 mb-8">
          <div className="relative">
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5 ml-1">이메일 주소</label>
            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="example@passit.com"
                className="flex-grow min-w-0 px-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
              />
              <button
                type="button"
                onClick={handleSendVerificationCode}
                disabled={sendingEmail || !formData.email}
                className="whitespace-nowrap px-4 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary/5 transition-colors active:scale-95 disabled:opacity-50"
              >
                {sendingEmail ? "발송 중" : "인증 코드 발송"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center my-8">
          <div className="flex-grow border-t border-outline-variant" />
          <span className="px-4 text-xs font-medium text-outline">인증 단계</span>
          <div className="flex-grow border-t border-outline-variant" />
        </div>

        <div className="space-y-4 mb-10">
          <div className="flex justify-between items-end mb-1.5 ml-1">
            <label className="block text-sm font-medium text-on-surface-variant">인증 코드 입력</label>
            <button type="button" onClick={handleVerifyCode} disabled={verifyingCode || formData.verificationCode.length < 6} className="text-primary font-bold text-sm disabled:opacity-40">
              {emailVerified ? "인증완료" : timer > 0 ? `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, "0")}` : "확인"}
            </button>
          </div>
          <div className="flex justify-between gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-outline-variant rounded-xl bg-white focus:border-primary focus:shadow-[0_0_0_2px_rgba(81,93,140,0.15)] focus:outline-none"
                maxLength={1}
                value={formData.verificationCode[index] || ""}
                onChange={(event) => setCodeDigit(index, event.target.value)}
                type="text"
                inputMode="numeric"
              />
            ))}
          </div>
          <p className="text-xs text-on-surface-variant text-center mt-2">
            메일을 받지 못하셨나요?{" "}
            <button type="button" onClick={handleSendVerificationCode} className="text-primary font-semibold underline decoration-primary/30">
              다시 보내기
            </button>
          </p>
        </div>

        <div className="space-y-4 mb-10">
          <div className="relative">
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5 ml-1">새 비밀번호</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password}
                onChange={handleChange} required placeholder="새 비밀번호 입력"
                className="w-full px-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline cursor-pointer">
                <span className="material-symbols-outlined">{showPassword ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5 ml-1">비밀번호 확인</label>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword}
                onChange={handleChange} required placeholder="비밀번호 다시 입력"
                className="w-full px-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline cursor-pointer">
                <span className="material-symbols-outlined">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-1">
            <span className="material-symbols-outlined text-xs text-primary">check_circle</span>
            <p className="text-xs text-on-surface-variant">8자 이상, 영문+숫자+특수문자 포함</p>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-60 bg-primary">
          {loading ? "변경 중..." : "비밀번호 변경"}
        </button>
        <button type="button" onClick={() => navigate("/auth")} className="w-full mt-4 text-sm text-primary font-medium">
          로그인으로 돌아가기
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;

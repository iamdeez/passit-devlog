import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import reportService from "../../services/reportService";
import PageHeader from "../../components/common/PageHeader";

const TARGET_TYPES = [
  { value: "USER", label: "사용자" },
  { value: "TICKET", label: "티켓" },
];

export default function ReportCreatePage() {
  const navigate = useNavigate();
  const [targetType, setTargetType] = useState("USER");
  const [targetId, setTargetId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!targetId.trim()) return setErrorMsg("대상 ID를 입력해 주세요.");
    if (!reason.trim()) return setErrorMsg("신고 사유를 입력해 주세요.");

    try {
      setSubmitting(true);
      await reportService.createReport({
        targetType,
        targetId: Number(targetId),
        reason: reason.trim(),
      });
      setSuccess(true);
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg("신고 등록 실패. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <PageHeader
        icon="flag"
        title="신고하기"
        subtitle="문제가 되는 사항을 신고해주세요"
      />

      <div className="max-w-xl mx-auto px-4 py-8">
        {errorMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-error-container text-error text-sm flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="ml-3 text-error hover:opacity-70">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-secondary-container text-on-secondary-container text-sm">
            신고가 등록되었습니다. 잠시 후 이동합니다.
          </div>
        )}

        <div className="card p-6">
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  신고 대상 유형
                </label>
                <select
                  value={targetType}
                  onChange={(e) => setTargetType(e.target.value)}
                  className="input-base appearance-none"
                >
                  {TARGET_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  대상 ID
                </label>
                <input
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="예: 101"
                  inputMode="numeric"
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">
                  신고 사유
                </label>
                <textarea
                  rows={5}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="신고 사유를 구체적으로 입력해 주세요."
                  className="input-base resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant text-sm font-semibold hover:bg-surface-container transition-all disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-display font-bold hover:bg-primary-dim active:scale-[0.97] transition-all disabled:opacity-50"
                >
                  {submitting ? "등록 중..." : "신고 등록"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

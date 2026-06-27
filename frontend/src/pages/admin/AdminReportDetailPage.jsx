import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { Spinner } from "../../components/common";
import reportService from "../../services/reportService";

const STATUS_MAP = {
  PENDING:   { label: "접수됨",  cls: "bg-amber-100 text-amber-700",  icon: "inbox" },
  IN_REVIEW: { label: "처리중",  cls: "bg-primary-container text-primary",    icon: "manage_search" },
  RESOLVED:  { label: "완료",    cls: "bg-green-100 text-green-700",  icon: "check_circle" },
  DISMISSED: { label: "기각",    cls: "bg-surface-container text-on-surface-variant", icon: "cancel" },
};

const TARGET_CONFIG = {
  TICKET: { icon: "confirmation_number", color: "bg-primary-container text-primary",    label: "티켓" },
  USER:   { icon: "person",              color: "bg-purple-100 text-purple-600", label: "회원" },
  TRADE:  { icon: "swap_horiz",          color: "bg-green-100 text-green-600",   label: "거래" },
  CHAT:   { icon: "chat_bubble",         color: "bg-violet-100 text-violet-600", label: "채팅" },
};

const OUTCOME_OPTIONS = [
  { value: "",          label: "처리 결과 선택" },
  { value: "경고",      label: "경고 조치" },
  { value: "정지",      label: "계정 정지" },
  { value: "해지",      label: "계정 해지" },
  { value: "무혐의",    label: "혐의 없음" },
  { value: "해결",      label: "당사자 간 해결" },
];

const AdminReportDetailPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState("PENDING");
  const [outcome, setOutcome] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await reportService.getAdminReportDetail(reportId);
      setReport(data);
      setNewStatus(data.status ?? "PENDING");
      setNote(data.admin_note ?? "");
      setOutcome(data.outcome ?? "");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [reportId]); // eslint-disable-line

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await reportService.updateReportStatus(reportId, newStatus, { note, outcome });
      await load();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("저장 실패: " + err.message);
    } finally { setSaving(false); }
  };

  if (loading) return <AdminLayout><div className="p-8 flex items-center justify-center h-64"><Spinner size="lg" /></div></AdminLayout>;
  if (!report) return <AdminLayout><div className="p-8 text-on-surface-variant">신고를 찾을 수 없습니다.</div></AdminLayout>;

  const statusInfo = STATUS_MAP[report.status] ?? STATUS_MAP.PENDING;
  const targetCfg  = TARGET_CONFIG[report.target_type] ?? { icon: "warning", color: "bg-amber-100 text-amber-600", label: report.target_type };
  const isResolved = report.status === "RESOLVED" || report.status === "DISMISSED";

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-3xl">

        {/* 상단 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/admin/reports")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-on-surface-variant">
              #{reportId?.slice(0, 8).toUpperCase() ?? "—"}
            </p>
            <h1 className="text-xl font-display font-bold text-on-surface truncate">신고 상세</h1>
          </div>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${statusInfo.cls}`}>
            <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>{statusInfo.icon}</span>
            {statusInfo.label}
          </span>
        </div>

        {/* 신고 정보 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${targetCfg.color}`}>
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>{targetCfg.icon}</span>
            </div>
            <div>
              <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${targetCfg.color} mr-1.5`}>{targetCfg.label}</span>
              <span className="text-sm font-bold text-on-surface">{report.reason?.slice(0, 40) ?? "신고 내용 없음"}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            <span>{new Date(report.created_at).toLocaleString("ko-KR")}</span>
          </div>
        </div>

        {/* 당사자 정보 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { role: "신고자", icon: "person", user: report.profiles ?? { name: report.user_id ?? "-" }, color: "text-primary bg-primary-container" },
            { role: "피신고자", icon: "person_off", user: { name: report.reported_user ?? "-" }, color: "text-red-600 bg-red-100" },
          ].map(({ role, icon, user, color }) => (
            <div key={role} className="rounded-2xl border border-outline-variant/30 bg-white p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${color}`}>
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                </div>
                <span className="text-xs font-semibold text-on-surface-variant">{role}</span>
              </div>
              <p className="text-sm font-bold text-on-surface">{user.name ?? "-"}</p>
              {user.email && <p className="text-xs text-on-surface-variant mt-0.5 truncate">{user.email}</p>}
              {user.nickname && user.nickname !== user.name && (
                <p className="text-xs text-on-surface-variant mt-0.5">@{user.nickname}</p>
              )}
            </div>
          ))}
        </div>

        {/* 신고 상세 내용 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-on-surface-variant text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>description</span>
            <h2 className="text-sm font-bold text-on-surface">신고 상세 내용</h2>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
            {report.reason ?? "내용 없음"}
          </p>
          {report.detail && (
            <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap mt-2">
              {report.detail}
            </p>
          )}
        </div>

        {/* 처리 이력 */}
        {report.history?.length > 0 && (
          <div className="rounded-2xl border border-outline-variant/30 bg-white p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-on-surface-variant text-lg">history</span>
              <h2 className="text-sm font-bold text-on-surface">처리 이력</h2>
            </div>
            <div className="space-y-3">
              {report.history.map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface font-semibold">{h.action}</p>
                    <p className="text-xs text-on-surface-variant">
                      {new Date(h.created_at).toLocaleString("ko-KR")}
                      {h.actor && ` · ${h.actor}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 처리 결과 입력 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-on-surface-variant text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>gavel</span>
            <h2 className="text-sm font-bold text-on-surface">처리 결과</h2>
          </div>

          <div className="space-y-4">
            {/* 상태 변경 */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">처리 상태</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_MAP).map(([k, v]) => (
                  <button key={k} onClick={() => setNewStatus(k)} disabled={isResolved}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      newStatus === k
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}>
                    <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>{v.icon}</span>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 처리 결과 선택 */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">조치 내용</label>
              <select value={outcome} onChange={(e) => setOutcome(e.target.value)} disabled={isResolved}
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/30 text-sm text-on-surface bg-white focus:outline-none focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {OUTCOME_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* 처리 메모 */}
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">처리 메모</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={isResolved}
                rows={4}
                placeholder="처리 내용 및 특이사항을 기록하세요..."
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/30 text-sm text-on-surface bg-white focus:outline-none focus:border-primary transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* 저장 버튼 */}
            {!isResolved && (
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-on-surface-variant">
                  {report.status !== newStatus && (
                    <span className="text-primary font-semibold">상태 변경: {STATUS_MAP[report.status]?.label ?? report.status} → {STATUS_MAP[newStatus]?.label}</span>
                  )}
                </p>
                <button onClick={handleSave} disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60">
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      저장 중...
                    </>
                  ) : saved ? (
                    <>
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      저장됨
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">save</span>
                      처리 결과 저장
                    </>
                  )}
                </button>
              </div>
            )}

            {isResolved && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
                <span className="material-symbols-outlined text-green-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p className="text-sm text-green-700 font-semibold">이미 처리 완료된 신고입니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReportDetailPage;

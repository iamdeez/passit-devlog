import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../components/common";
import reportService from "../../services/reportService";
import { useAuth } from "../../contexts/AuthContext";
import PageHeader from "../../components/common/PageHeader";

export default function ReportListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await reportService.getMyReports(user.userId);
        const raw = res?.data;
        const data = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.content)
            ? raw.content
            : Array.isArray(raw?.data)
              ? raw.data
              : [];
        setReports(data);
      } catch (e) {
        console.error(e);
        setErrorMsg("신고 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user.userId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <PageHeader
        icon="flag"
        title="신고 내역"
        subtitle="내 신고 내역을 확인하세요"
        action={
          <button
            onClick={() => navigate("/cs/reports/new")}
            className="px-4 py-2 border border-white/40 text-white text-sm font-display font-bold rounded-xl hover:bg-white/15 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">add</span>
            신고하기
          </button>
        }
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {errorMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-error-container text-error text-sm">
            {errorMsg}
          </div>
        )}

        {reports.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-secondary">flag</span>
            </div>
            <p className="text-on-surface-variant mb-4">등록된 신고가 없습니다.</p>
            <button
              onClick={() => navigate("/cs/reports/new")}
              className="px-5 py-2.5 bg-primary text-on-primary text-sm font-display font-bold rounded-xl hover:bg-primary-dim"
            >
              신고 등록하기
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
            {reports.map((r, idx) => {
              const id = r.reportId ?? r.id;
              const dateStr = r.createdAt
                ? new Date(r.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : null;
              const reasonText = r.reason ?? "(사유 없음)";
              const truncated = reasonText.length > 50
                ? reasonText.slice(0, 50) + "..."
                : reasonText;

              return (
                <div key={id ?? idx}>
                  <button
                    onClick={() => id && navigate(`/cs/reports/${id}`)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-container-low transition-colors text-left"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex-shrink-0 mt-0.5">
                        {r.status === "PENDING" && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                            검토 중
                          </span>
                        )}
                        {r.status === "RESOLVED" && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            처리 완료
                          </span>
                        )}
                        {r.status === "REJECTED" && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
                            반려
                          </span>
                        )}
                        {r.status && !["PENDING", "RESOLVED", "REJECTED"].includes(r.status) && (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant">
                            {r.status}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-on-surface">{truncated}</p>
                        {r.targetType && (
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {r.targetType} · ID {r.targetId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {dateStr && (
                        <span className="text-xs text-on-surface-variant">{dateStr}</span>
                      )}
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">
                        chevron_right
                      </span>
                    </div>
                  </button>
                  {idx < reports.length - 1 && (
                    <div className="border-b border-outline-variant/20 mx-5" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "../../components/common";
import reportService from "../../services/reportService";

export default function ReportDetailPage() {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await reportService.getMyReportDetail(reportId);
        const data = res.data?.data ?? res.data;
        setReport(data);
      } catch (e) {
        console.error(e);
        setErrorMsg("신고 상세 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-16">
        <div className="min-h-[50vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-16">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="px-4 py-3 rounded-xl bg-error-container text-error text-sm">
            {errorMsg}
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-16">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-on-surface-variant text-sm">데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  const status = report.status ?? "";
  const dateStr = report.createdAt
    ? new Date(report.createdAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-background pt-16 pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary mb-6 transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          목록으로
        </button>

        <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 md:p-8">
          {/* Status + date header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              {status === "PENDING" && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                  검토 중
                </span>
              )}
              {status === "RESOLVED" && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  처리 완료
                </span>
              )}
              {status === "REJECTED" && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
                  반려
                </span>
              )}
              {status && !["PENDING", "RESOLVED", "REJECTED"].includes(status) && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant">
                  {status}
                </span>
              )}
            </div>
            {dateStr && (
              <span className="text-xs text-on-surface-variant">{dateStr}</span>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-on-surface-variant w-20 flex-shrink-0">
                대상 유형
              </span>
              <span className="text-sm text-on-surface">{report.targetType ?? "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-on-surface-variant w-20 flex-shrink-0">
                대상 ID
              </span>
              <span className="text-sm text-on-surface">{report.targetId ?? "-"}</span>
            </div>
          </div>

          {/* Reason */}
          <div className="border-t border-outline-variant/20 pt-5">
            <p className="text-xs font-semibold text-on-surface-variant mb-2">신고 사유</p>
            <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
              {report.reason ?? "(사유 없음)"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

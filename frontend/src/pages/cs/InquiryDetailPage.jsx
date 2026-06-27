import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "../../components/common";
import { getInquiryDetail } from "../../api/services/inquiryService";

const InquiryDetailPage = () => {
  const { inquiryId } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInquiryDetail = async () => {
      try {
        const res = await getInquiryDetail(inquiryId);
        setInquiry(res.data);
      } catch (err) {
        setError("문의 상세 조회 실패");
      } finally {
        setLoading(false);
      }
    };

    fetchInquiryDetail();
  }, [inquiryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-16 md:pb-0">
        <div className="min-h-[50vh] flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-16 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="px-4 py-3 rounded-xl bg-error-container text-error text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-background pt-16 pb-16 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <p className="text-on-surface-variant text-sm">문의 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  const status = inquiry.status ?? "";
  const dateStr = inquiry.createdAt
    ? new Date(inquiry.createdAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : null;

  return (
    <div className="min-h-screen bg-background pt-16 pb-16 md:pb-0">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary mb-6 transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          목록으로
        </button>

        <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-xl font-display font-bold text-on-surface">
              {inquiry.title ?? "(제목 없음)"}
            </h1>
            <div className="flex-shrink-0">
              {status === "PENDING" && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                  답변 대기
                </span>
              )}
              {status === "ANSWERED" && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                  답변 완료
                </span>
              )}
              {status && status !== "PENDING" && status !== "ANSWERED" && (
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant">
                  {status}
                </span>
              )}
            </div>
          </div>

          {dateStr && (
            <p className="text-sm text-on-surface-variant mb-5">{dateStr}</p>
          )}

          {/* Content */}
          <div className="border-t border-outline-variant/20 pt-5">
            <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
              {inquiry.content ?? "(내용 없음)"}
            </p>
          </div>

          {/* Answer */}
          {inquiry.answer && (
            <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-base text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <span className="text-sm font-semibold text-green-700">답변</span>
              </div>
              <p className="text-sm text-green-900 leading-relaxed whitespace-pre-wrap">
                {inquiry.answer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InquiryDetailPage;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "../../components/common";
import { getFaqDetail } from "../../api/services/faqService";
import PageHeader from "../../components/common/PageHeader";

export default function FaqPage() {
  const { faqId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getFaqDetail(faqId);
        const dto = data?.data ?? data;
        setItem(dto);
      } catch (e) {
        setError("FAQ 상세 조회 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, [faqId]);

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
        icon="help"
        title="자주 묻는 질문"
        subtitle="궁금한 점을 찾아보세요"
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/cs/faqs")}
          className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary mb-6 transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          목록으로
        </button>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-error-container text-error text-sm mb-4">
            {error}
          </div>
        )}

        {item && (
          <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 md:p-8">
            {/* Question */}
            <div className="flex items-start gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-on-primary text-sm font-bold font-display">Q</span>
              </div>
              <h1 className="text-lg font-display font-bold text-on-surface leading-snug pt-1">
                {item.question ?? item.title ?? `FAQ #${faqId}`}
              </h1>
            </div>

            <div className="border-t border-outline-variant/20 pt-5">
              {/* Answer */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold font-display">A</span>
                </div>
                <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap pt-1">
                  {item.answer ?? item.content ?? ""}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

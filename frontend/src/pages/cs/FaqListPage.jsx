import React, { useEffect, useState } from "react";
import { Spinner } from "../../components/common";
import { getFaqs } from "../../api/services/faqService";
import PageHeader from "../../components/common/PageHeader";

export default function FaqListPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const data = await getFaqs();
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setItems(list);
      } catch (e) {
        setError("FAQ 목록 조회 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-error-container text-error text-sm">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-secondary">help</span>
            </div>
            <p className="text-on-surface-variant mb-4">등록된 FAQ가 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((faq, idx) => {
              const id = faq.id ?? faq.faqId;
              const question = faq.question ?? faq.title ?? `FAQ #${id}`;
              const answer = faq.answer ?? faq.content ?? "";
              const isOpen = expanded === idx;

              return (
                <div
                  key={id ?? idx}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? "border-primary shadow-sm"
                      : "border-outline-variant/30"
                  }`}
                >
                  <button
                    onClick={() => setExpanded(isOpen ? -1 : idx)}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-on-primary text-xs font-bold font-display">Q</span>
                    </div>
                    <span className="flex-1 text-sm font-semibold text-on-surface leading-snug">
                      {question}
                    </span>
                    <span
                      className={`material-symbols-outlined text-base text-on-surface-variant transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-outline-variant/20 px-5 py-4 flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold font-display">A</span>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap pt-0.5">
                        {answer}
                      </p>
                    </div>
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

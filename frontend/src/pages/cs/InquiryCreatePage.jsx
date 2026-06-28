import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createInquiry } from "../../api/services/inquiryService";
import PageHeader from "../../components/common/PageHeader";

const InquiryCreatePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return setError("제목을 입력해주세요.");
    if (!content.trim()) return setError("내용을 입력해주세요.");

    setSubmitting(true);
    setError("");
    try {
      await createInquiry({ title: title.trim(), content: content.trim() });
      navigate("/cs/inquiries");
    } catch (err) {
      console.error(err);
      setError("문의 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <PageHeader
        icon="edit"
        title="문의하기"
        subtitle="궁금한 사항을 문의해주세요"
      />

      <div className="max-w-xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-error-container text-error text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="ml-3 text-error hover:opacity-70">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        <div className="card p-6">
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">제목</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="문의 제목을 입력하세요"
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-on-surface mb-1.5">내용</label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="문의 내용을 자세히 입력해주세요"
                  className="input-base resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/cs/inquiries")}
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
                  {submitting ? "등록 중..." : "문의 등록"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InquiryCreatePage;

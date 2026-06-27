import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { createFaq } from "../../api/services/faqService";

const CATEGORIES = ["결제", "거래", "계정", "티켓", "기타"];

const Toggle = ({ value, onChange, label }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-semibold text-on-surface">{label}</span>
    <button type="button" onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-primary" : "bg-outline-variant"}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  </div>
);

const AdminFaqCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    question: "",
    answer: "",
    category: "기타",
    is_visible: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      await createFaq(form);
      navigate("/admin/faqs");
    } catch (err) {
      alert("저장 실패: " + err.message);
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-3xl">

        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/admin/faqs")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <h1 className="text-xl font-display font-bold text-on-surface flex-1">FAQ 등록</h1>
          <button onClick={handleSubmit} disabled={saving || !form.question.trim() || !form.answer.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50">
            <span className="material-symbols-outlined text-base">save</span>
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>

        {/* 카테고리 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-5 mb-4">
          <label className="block text-xs font-semibold text-on-surface-variant mb-3">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                  form.category === cat
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 질문 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-5 mb-4">
          <label className="block text-xs font-semibold text-on-surface-variant mb-2">질문</label>
          <input
            type="text"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            placeholder="질문을 입력하세요"
            className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/30 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* 답변 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-5 mb-4">
          <label className="block text-xs font-semibold text-on-surface-variant mb-2">답변</label>
          <textarea
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            placeholder="답변 내용을 입력하세요..."
            rows={8}
            className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/30 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary transition-all resize-none"
          />
        </div>

        {/* 노출 설정 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-5 mb-6">
          <Toggle
            value={form.is_visible}
            onChange={(v) => setForm({ ...form, is_visible: v })}
            label="노출 설정 (켜면 사용자에게 표시됩니다)"
          />
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-end gap-2">
          <button type="button" onClick={() => navigate("/admin/faqs")}
            className="px-4 py-2.5 border border-outline-variant/30 text-on-surface-variant text-sm font-semibold rounded-xl hover:bg-surface-container transition-all">
            취소
          </button>
          <button onClick={handleSubmit} disabled={saving || !form.question.trim() || !form.answer.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50">
            <span className="material-symbols-outlined text-base">save</span>
            {saving ? "저장 중..." : "FAQ 등록하기"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminFaqCreatePage;

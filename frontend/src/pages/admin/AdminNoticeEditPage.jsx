import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { Spinner } from "../../components/common";
import { getNoticeDetail, updateAdminNotice, deleteAdminNotice } from "../../services/noticeService";

const Toggle = ({ value, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-sm font-semibold text-on-surface">{label}</p>
      {description && <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>}
    </div>
    <button type="button" onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? "bg-primary" : "bg-outline-variant"}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  </div>
);

const AdminNoticeEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", content: "", status: "PUBLISHED", is_pinned: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getNoticeDetail(id)
      .then((data) => setForm({
        title: data.title ?? "",
        content: data.content ?? "",
        status: data.status ?? "PUBLISHED",
        is_pinned: data.is_pinned ?? false,
      }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      await updateAdminNotice(id, form);
      navigate("/admin/notices");
    } catch (err) {
      alert("저장 실패: " + err.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("공지사항을 삭제하시겠습니까?")) return;
    await deleteAdminNotice(id);
    navigate("/admin/notices");
  };

  if (loading) return <AdminLayout><div className="p-8 flex items-center justify-center h-64"><Spinner size="lg" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-3xl">

        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate("/admin/notices")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <h1 className="text-xl font-display font-bold text-on-surface flex-1">공지 수정</h1>
          <button type="button" onClick={handleDelete}
            className="px-3 py-2 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-all">
            삭제
          </button>
          <button onClick={handleSubmit} disabled={saving || !form.title.trim() || !form.content.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50">
            <span className="material-symbols-outlined text-base">save</span>
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>

        <p className="text-xs text-on-surface-variant mb-6 ml-11">수정 전 내용을 다시 한번 확인해주세요.</p>

        {/* 제목 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-5 mb-4">
          <label className="block text-xs font-semibold text-on-surface-variant mb-2">공지 제목</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="공지사항 제목을 입력하세요"
            className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/30 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* 노출 설정 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white px-5 mb-4 divide-y divide-outline-variant/20">
          <Toggle
            value={form.is_pinned}
            onChange={(v) => setForm({ ...form, is_pinned: v })}
            label="상단 고정"
            description="공지사항 목록 최상단에 상시 노출됩니다"
          />
          <Toggle
            value={form.status === "PUBLISHED"}
            onChange={(v) => setForm({ ...form, status: v ? "PUBLISHED" : "DRAFT" })}
            label="즉시 발행"
            description="저장 시 즉시 앱에 노출됩니다"
          />
        </div>

        {/* 본문 에디터 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-5 mb-4">
          <label className="block text-xs font-semibold text-on-surface-variant mb-2">본문 내용</label>

          <div className="flex items-center gap-1 pb-2 mb-3 border-b border-outline-variant/20">
            {["format_bold", "format_italic", "link", "image"].map((icon) => (
              <button key={icon} type="button"
                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-base">{icon}</span>
              </button>
            ))}
          </div>

          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="공지 내용을 입력하세요..."
            rows={12}
            className="w-full text-sm text-on-surface leading-relaxed focus:outline-none resize-none"
          />
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between">
          <button type="button" onClick={handleDelete}
            className="px-4 py-2.5 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-all">
            삭제
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={() => navigate("/admin/notices")}
              className="px-4 py-2.5 border border-outline-variant/30 text-on-surface-variant text-sm font-semibold rounded-xl hover:bg-surface-container transition-all">
              취소
            </button>
            <button onClick={handleSubmit} disabled={saving || !form.title.trim() || !form.content.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50">
              <span className="material-symbols-outlined text-base">save</span>
              {saving ? "저장 중..." : "수정 저장"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminNoticeEditPage;

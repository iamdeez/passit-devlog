import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { Spinner } from "../../components/common";
import { getAdminFaqs, deleteFaq } from "../../api/services/faqService";

const CATEGORIES = ["전체", "결제", "거래", "계정", "티켓", "기타"];

const AdminFaqListPage = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAdminFaqs();
      setFaqs(Array.isArray(data) ? data : (data?.data ?? []));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("FAQ를 삭제하시겠습니까?")) return;
    await deleteFaq(id);
    load();
  };

  const filtered = useMemo(() =>
    categoryFilter === "전체"
      ? faqs
      : faqs.filter((f) => (f.category ?? f.type ?? "기타") === categoryFilter),
    [faqs, categoryFilter]
  );

  const stats = useMemo(() => ({
    total: faqs.length,
    visible: faqs.filter((f) => f.is_visible !== false).length,
    hidden: faqs.filter((f) => f.is_visible === false).length,
  }), [faqs]);

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-on-surface">FAQ 관리</h1>
            <p className="text-sm text-on-surface-variant mt-1">자주 묻는 질문을 등록하고 관리합니다.</p>
          </div>
          <button onClick={() => navigate("/admin/faqs/new")}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-sm transition-colors">
            <span className="material-symbols-outlined text-base">add</span>
            FAQ 등록
          </button>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "전체 질문",    value: stats.total,   icon: "quiz",       color: "text-primary",   bg: "bg-primary/10" },
            { label: "노출 중",      value: stats.visible, icon: "visibility", color: "text-green-600", bg: "bg-green-100" },
            { label: "숨김 처리",    value: stats.hidden,  icon: "pending",    color: "text-amber-600", bg: "bg-amber-100" },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="rounded-2xl border border-outline-variant/30 bg-white p-4">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <span className={`material-symbols-outlined text-xl ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
              </div>
              <p className="text-2xl font-display font-bold text-on-surface">{value}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* 카테고리 탭 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-4 mb-4">
          <div className="flex gap-1 p-1 bg-surface-container rounded-xl w-fit flex-wrap">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
                  categoryFilter === cat ? "bg-white text-on-surface shadow-sm" : "text-on-surface-variant"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-16 bg-white rounded-2xl border border-outline-variant/30">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-outline-variant/30">
            <div className="w-14 h-14 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl text-secondary">quiz</span>
            </div>
            <p className="text-sm text-on-surface-variant">FAQ가 없습니다</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-outline-variant/30 bg-white overflow-hidden">
            <div className="divide-y divide-outline-variant/20">
              {filtered.map((f) => {
                const id = f.faq_id ?? f.id;
                const isOpen = expanded === id;
                const isVisible = f.is_visible !== false;
                const category = f.category ?? f.type ?? "기타";

                return (
                  <div key={id}>
                    {/* 질문 헤더 */}
                    <div className="flex items-center gap-3 px-5 py-4">
                      <button onClick={() => setExpanded(isOpen ? null : id)}
                        className="flex-1 flex items-center gap-3 text-left">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="px-2 py-0.5 rounded-md bg-surface-container text-xs font-semibold text-on-surface-variant">{category}</span>
                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                              isVisible ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {isVisible ? "노출" : "숨김"}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-on-surface">{f.question ?? f.title}</p>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant text-base flex-shrink-0">
                          {isOpen ? "expand_less" : "expand_more"}
                        </span>
                      </button>
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/admin/faqs/${id}/edit`)}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors">
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button onClick={() => handleDelete(id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* 답변 펼치기 */}
                    {isOpen && (
                      <div className="px-5 pb-4 ml-16 bg-surface-container-low/30">
                        <div className="border-l-2 border-primary/30 pl-3">
                          <p className="text-xs font-semibold text-primary mb-1">A</p>
                          <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                            {f.answer ?? "답변이 없습니다."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminFaqListPage;

import React, { useState, useEffect, useCallback } from "react";
import { categoryService } from "../../api/services/categoryService";
import AdminLayout from "../../components/admin/AdminLayout";
import { Spinner } from "../../components/common";

const ICON_OPTIONS = [
  { id: "music_note",     label: "음악" },
  { id: "sports_soccer",  label: "스포츠" },
  { id: "theater_comedy", label: "공연" },
  { id: "palette",        label: "전시" },
  { id: "festival",       label: "축제" },
  { id: "stadium",        label: "경기장" },
];

const Toast = ({ msg, type, onClose }) =>
  msg ? (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold
      ${type === "success" ? "bg-green-50 border-green-300 text-green-800" : "bg-red-50 border-red-300 text-red-800"}`}>
      <span className="material-symbols-outlined text-base">{type === "success" ? "check_circle" : "error"}</span>
      {msg}
      <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  ) : null;

const IconGrid = ({ selected, onSelect }) => (
  <div className="flex flex-wrap gap-2">
    {ICON_OPTIONS.map(({ id, label }) => (
      <button key={id} type="button" title={label} onClick={() => onSelect(id)}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border ${
          selected === id ? "border-primary bg-primary/5" : "border-outline-variant/30 hover:bg-surface-container"
        }`}>
        <span className={`material-symbols-outlined text-lg ${selected === id ? "text-primary" : "text-on-surface-variant"}`}
          style={{ fontVariationSettings: "'FILL' 1" }}>
          {id}
        </span>
      </button>
    ))}
  </div>
);

const AdminCategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", icon: "music_note" });

  const [addForm, setAddForm] = useState({ name: "", icon: "music_note" });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), type === "success" ? 3000 : 5000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(Array.isArray(data) ? data : (data?.data ?? []));
    } catch (err) {
      showToast(err.message || "카테고리 목록을 불러오는데 실패했습니다", "error");
    } finally { setLoading(false); }
  }, []); // eslint-disable-line

  useEffect(() => { load(); }, [load]);

  const startEdit = (cat) => {
    setEditId(cat.id);
    setEditForm({ name: cat.name ?? "", icon: cat.icon ?? "music_note" });
  };

  const handleUpdate = async (id) => {
    if (!editForm.name.trim()) { showToast("카테고리 이름을 입력해주세요", "error"); return; }
    setSaving(true);
    try {
      await categoryService.updateCategory(id, { name: editForm.name.trim(), icon: editForm.icon });
      showToast("카테고리가 수정되었습니다");
      setEditId(null);
      load();
    } catch (err) {
      showToast(err.message || "수정 중 오류가 발생했습니다", "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`"${cat.name}" 카테고리를 삭제하시겠습니까?`)) return;
    setSaving(true);
    try {
      await categoryService.deleteCategory(cat.id);
      showToast("카테고리가 삭제되었습니다");
      load();
    } catch (err) {
      showToast(err.message || "삭제 중 오류가 발생했습니다", "error");
    } finally { setSaving(false); }
  };

  const handleAdd = async () => {
    if (!addForm.name.trim()) { showToast("카테고리 이름을 입력해주세요", "error"); return; }
    setAdding(true);
    try {
      await categoryService.createCategory({ name: addForm.name.trim(), icon: addForm.icon, parentId: null });
      showToast("카테고리가 추가되었습니다");
      setAddForm({ name: "", icon: "music_note" });
      load();
    } catch (err) {
      showToast(err.message || "추가 중 오류가 발생했습니다", "error");
    } finally { setAdding(false); }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-2xl">

        {/* 헤더 */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-on-surface">카테고리 관리</h1>
            <p className="text-sm text-on-surface-variant mt-1">티켓 카테고리를 추가하고 관리합니다.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>category</span>
            {categories.length}개
          </span>
        </div>

        {/* 카테고리 목록 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white overflow-hidden mb-4">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Spinner size="lg" /></div>
          ) : categories.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl text-on-surface-variant">category</span>
              </div>
              <p className="text-sm text-on-surface-variant">등록된 카테고리가 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {categories.map((cat) => {
                const isEditing = editId === cat.id;
                const ticketCount = cat.ticket_count ?? cat.ticketCount ?? 0;
                const icon = cat.icon || "category";

                if (isEditing) {
                  return (
                    <div key={cat.id} className="p-5 bg-surface-container-low/50">
                      <p className="text-xs font-semibold text-on-surface-variant mb-2">아이콘</p>
                      <IconGrid selected={editForm.icon} onSelect={(id) => setEditForm({ ...editForm, icon: id })} />
                      <div className="flex items-center gap-2 mt-3">
                        <input
                          autoFocus
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(cat.id); if (e.key === "Escape") setEditId(null); }}
                          className="flex-1 px-3 py-2 rounded-xl border border-outline-variant/30 text-sm text-on-surface bg-white focus:outline-none focus:border-primary transition-all"
                          placeholder="카테고리 이름"
                        />
                        <button type="button" onClick={() => handleUpdate(cat.id)} disabled={saving}
                          className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                          {saving ? "저장 중..." : "저장"}
                        </button>
                        <button type="button" onClick={() => setEditId(null)}
                          className="px-3 py-2 rounded-xl border border-outline-variant/30 text-on-surface-variant text-sm hover:bg-surface-container transition-colors">
                          취소
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={cat.id} className="flex items-center gap-3 px-5 py-4 hover:bg-surface-container-low/40 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-lg text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}>
                        {icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface">{cat.name}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-xs font-semibold text-on-surface-variant flex-shrink-0">
                      <span className="material-symbols-outlined text-xs">confirmation_number</span>
                      {ticketCount}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(cat)}
                        className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors" title="수정">
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>
                      <button onClick={() => handleDelete(cat)} disabled={saving}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors disabled:opacity-30" title="삭제">
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 새 카테고리 추가 폼 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-5">
          <h2 className="text-sm font-bold text-on-surface mb-4">새 카테고리 추가</h2>
          <p className="text-xs font-semibold text-on-surface-variant mb-2">아이콘 선택</p>
          <IconGrid selected={addForm.icon} onSelect={(id) => setAddForm({ ...addForm, icon: id })} />
          <div className="flex items-center gap-2 mt-4">
            <input
              type="text"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="카테고리 이름을 입력하세요"
              className="flex-1 px-3 py-2.5 rounded-xl border border-outline-variant/30 text-sm text-on-surface bg-surface-container-low focus:outline-none focus:border-primary transition-all"
            />
            <button type="button" onClick={handleAdd} disabled={adding || !addForm.name.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-sm font-semibold transition-colors disabled:opacity-50 whitespace-nowrap">
              <span className="material-symbols-outlined text-base">add</span>
              {adding ? "추가 중..." : "카테고리 저장하기"}
            </button>
          </div>
        </div>
      </div>

      <Toast msg={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
    </AdminLayout>
  );
};

export default AdminCategoryManagementPage;

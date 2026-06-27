import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { Spinner } from "../../components/common";
import { getInquiryDetail, answerInquiry } from "../../api/services/inquiryService";

const CATEGORY_COLORS = {
  결제: "bg-primary-container text-primary",
  계정: "bg-purple-100 text-purple-700",
  티켓: "bg-green-100 text-green-700",
  기타: "bg-surface-container text-on-surface-variant",
};

const QUICK_TEMPLATES = [
  { label: "결제 오류 안내", text: "안녕하세요. 결제 오류가 발생하신 불편을 드려 죄송합니다.\n\n결제 오류는 일시적인 네트워크 문제나 카드사 서버 이슈로 발생할 수 있습니다. 잠시 후 다시 시도해주시거나, 다른 결제 수단을 이용해 주시기 바랍니다.\n\n추가 문의 사항이 있으시면 언제든지 연락 주세요. 감사합니다." },
  { label: "계정 확인 요청", text: "안녕하세요. 문의 주셔서 감사합니다.\n\n계정 관련 확인을 위해 가입하신 이메일 주소와 가입일을 알려주시면 신속하게 도움드리겠습니다.\n\n불편을 드려 죄송합니다." },
  { label: "처리 완료 안내", text: "안녕하세요. 문의하신 내용을 확인하여 처리 완료하였습니다.\n\n추가 문의 사항이 있으시면 언제든지 고객센터로 연락 주세요. 이용해 주셔서 감사합니다." },
];

const AdminInquiryDetailPage = () => {
  const { inquiryId } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getInquiryDetail(inquiryId);
      const dto = data?.data ?? data;
      setInquiry(dto);
      setAnswer(dto?.answer_content ?? "");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [inquiryId]); // eslint-disable-line

  const handleAnswer = async () => {
    if (!answer.trim()) return;
    setSaving(true);
    setSaved(false);
    try {
      await answerInquiry(inquiryId, { answer_content: answer });
      await load();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("답변 실패: " + err.message);
    } finally { setSaving(false); }
  };

  const applyTemplate = (text) => {
    if (isAnswered) return;
    setAnswer((prev) => (prev ? prev + "\n\n" + text : text));
  };

  if (loading) return <AdminLayout><div className="p-8 flex items-center justify-center h-64"><Spinner size="lg" /></div></AdminLayout>;
  if (!inquiry) return <AdminLayout><div className="p-8 text-on-surface-variant">문의를 찾을 수 없습니다.</div></AdminLayout>;

  const isAnswered = !!inquiry.answer_content;
  const category = inquiry.category ?? "기타";
  const catCls = CATEGORY_COLORS[category] ?? CATEGORY_COLORS["기타"];

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 max-w-3xl">

        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/admin/inquiries")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-on-surface-variant">#{inquiryId?.slice(-8) ?? "—"}</p>
            <h1 className="text-xl font-display font-bold text-on-surface truncate">문의 상세</h1>
          </div>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
            isAnswered ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}>
            <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isAnswered ? "check_circle" : "hourglass_empty"}
            </span>
            {isAnswered ? "답변 완료" : "답변 대기"}
          </span>
        </div>

        {/* 문의 정보 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-5 mb-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${catCls}`}>[{category}]</span>
              </div>
              <h2 className="text-base font-bold text-on-surface">{inquiry.title}</h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant mb-4">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">person</span>
              {inquiry.user?.nickname ?? inquiry.user_id ?? "-"}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              {new Date(inquiry.created_at).toLocaleString("ko-KR")}
            </span>
          </div>

          <div className="border-t border-outline-variant/20 pt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-on-surface-variant text-base" style={{ fontVariationSettings: "'FILL' 0" }}>description</span>
              <p className="text-xs font-semibold text-on-surface-variant">문의 내용</p>
            </div>
            <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{inquiry.content}</p>
          </div>
        </div>

        {/* 기존 답변 표시 */}
        {isAnswered && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-base text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>support_agent</span>
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">관리자 답변</p>
                {inquiry.answered_at && (
                  <p className="text-xs text-green-600">{new Date(inquiry.answered_at).toLocaleString("ko-KR")}</p>
                )}
              </div>
            </div>
            <p className="text-sm text-green-900 leading-relaxed whitespace-pre-wrap">{inquiry.answer_content}</p>
          </div>
        )}

        {/* 답변 작성 */}
        <div className="rounded-2xl border border-outline-variant/30 bg-white p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-on-surface-variant text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>edit_note</span>
            <h2 className="text-sm font-bold text-on-surface">
              {isAnswered ? "답변 수정" : "답변 작성"}
            </h2>
          </div>

          {/* 빠른 템플릿 */}
          {!isAnswered && (
            <div className="mb-3">
              <p className="text-xs text-on-surface-variant font-semibold mb-2">빠른 답변 템플릿</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map(({ label, text }) => (
                  <button key={label} onClick={() => applyTemplate(text)}
                    className="px-3 py-1.5 rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface-variant hover:bg-surface-container hover:border-primary/30 transition-all">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 텍스트에리어 */}
          <div className="relative">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value.slice(0, 2000))}
              disabled={isAnswered && saved}
              rows={6}
              placeholder="답변 내용을 입력하세요... (최대 2,000자)"
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 text-sm text-on-surface bg-white focus:outline-none focus:border-primary transition-all resize-none"
            />
            <span className="absolute bottom-3 right-3 text-xs text-on-surface-variant">{answer.length}/2000</span>
          </div>

          {/* 제출 버튼 */}
          <div className="flex items-center justify-between mt-3">
            <div />
            <button onClick={handleAnswer}
              disabled={saving || !answer.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all disabled:opacity-60">
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  등록 중...
                </>
              ) : saved ? (
                <>
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  등록됨
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">send</span>
                  {isAnswered ? "답변 수정하기" : "답변 등록하기"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminInquiryDetailPage;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner } from "../../components/common";
import { getNoticeDetail } from "../../services/noticeService";
import PageHeader from "../../components/common/PageHeader";

export default function NoticePage() {
  const { noticeId } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await getNoticeDetail(noticeId);
        const data = res?.data?.data ?? null;
        setNotice(data);
      } catch (e) {
        console.error(e);
        setErrorMsg("공지 상세 조회 실패");
      } finally {
        setLoading(false);
      }
    };
    if (noticeId) fetchDetail();
  }, [noticeId]);

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
        icon="campaign"
        title="공지사항"
        subtitle="서비스 공지를 확인하세요"
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate("/cs/notices")}
          className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary mb-6 transition-colors"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          목록으로
        </button>

        {errorMsg && (
          <div className="px-4 py-3 rounded-xl bg-error-container text-error text-sm mb-4">
            {errorMsg}
          </div>
        )}

        {notice && (
          <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 md:p-8">
            <h1 className="text-xl font-display font-bold text-on-surface mb-2">
              {notice.title ?? "(제목 없음)"}
            </h1>
            {notice.createdAt && (
              <p className="text-sm text-on-surface-variant mb-5">
                {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
              </p>
            )}
            <div className="border-t border-outline-variant/20 pt-5">
              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                {notice.content ?? "(내용 없음)"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

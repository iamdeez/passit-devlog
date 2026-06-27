import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../components/common";
import { getNotices } from "../../services/noticeService";
import PageHeader from "../../components/common/PageHeader";

export default function NoticeListPage() {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await getNotices();
        const list = res?.data?.data ?? [];
        setNotices(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
        setErrorMsg("공지 목록 조회 실패");
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <PageHeader
        icon="campaign"
        title="공지사항"
        subtitle="서비스 공지를 확인하세요"
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {errorMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-error-container text-error text-sm">
            {errorMsg}
          </div>
        )}

        {notices.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-secondary">campaign</span>
            </div>
            <p className="text-on-surface-variant mb-4">등록된 공지사항이 없습니다.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
            {notices.map((n, i) => {
              const id = n.id ?? n.noticeId;
              const dateStr = n.createdAt
                ? new Date(n.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : null;
              return (
                <div key={id ?? i}>
                  <button
                    onClick={() => navigate(`/cs/notices/${id}`)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-container-low transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {n.important && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
                          중요
                        </span>
                      )}
                      <span className="text-sm font-medium text-on-surface">
                        {n.title ?? "(제목 없음)"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {dateStr && (
                        <span className="text-xs text-on-surface-variant">{dateStr}</span>
                      )}
                      <span className="material-symbols-outlined text-sm text-on-surface-variant">
                        chevron_right
                      </span>
                    </div>
                  </button>
                  {i < notices.length - 1 && (
                    <div className="border-b border-outline-variant/20 mx-5" />
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

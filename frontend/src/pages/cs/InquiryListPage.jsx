import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../../components/common";
import { getMyInquiries } from "../../api/services/inquiryService";
import PageHeader from "../../components/common/PageHeader";

const InquiryListPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchList = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getMyInquiries();
      const raw = res?.data;
      const data = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.content)
          ? raw.content
          : Array.isArray(raw?.data)
            ? raw.data
            : [];
      setItems(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("문의 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
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
        icon="question_answer"
        title="문의 목록"
        subtitle="내 문의 내역을 확인하세요"
        action={
          <button
            onClick={() => navigate("/cs/inquiries/new")}
            className="px-4 py-2 border border-white/40 text-white text-sm font-display font-bold rounded-xl hover:bg-white/15 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">add</span>
            문의하기
          </button>
        }
      />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {errorMsg && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-error-container text-error text-sm">
            {errorMsg}
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-secondary">question_answer</span>
            </div>
            <p className="text-on-surface-variant mb-4">등록된 문의가 없습니다.</p>
            <button
              onClick={() => navigate("/cs/inquiries/new")}
              className="px-5 py-2.5 bg-primary text-on-primary text-sm font-display font-bold rounded-xl hover:bg-primary-dim"
            >
              첫 문의 작성하기
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
            {items.map((it, idx) => {
              const id = it?.inquiryId ?? it?.id;
              const title = it?.title ?? it?.subject ?? `문의 #${id ?? idx + 1}`;
              const status = it?.status ?? it?.answerStatus ?? "";
              const dateStr = it?.createdAt
                ? new Date(it.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                : it?.createdDate ?? null;

              return (
                <div key={id ?? idx}>
                  <button
                    onClick={() => id && navigate(`/cs/inquiries/${id}`)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-container-low transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {status === "PENDING" && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                          답변 대기
                        </span>
                      )}
                      {status === "ANSWERED" && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          답변 완료
                        </span>
                      )}
                      {status && status !== "PENDING" && status !== "ANSWERED" && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant">
                          {status}
                        </span>
                      )}
                      <span className="text-sm font-medium text-on-surface">{title}</span>
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
                  {idx < items.length - 1 && (
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
};

export default InquiryListPage;

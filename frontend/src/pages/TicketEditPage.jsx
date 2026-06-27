import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ticketService from "../api/services/ticketService";
import { API_SERVICES } from "../config/apiConfig";

const CATEGORIES = ["콘서트", "스포츠", "뮤지컬", "전시"];

const splitDateTime = (value) => {
  if (!value) return { date: "", time: "" };
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  return { date: normalized.slice(0, 10), time: normalized.slice(11, 16) };
};

const TicketEditPage = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ eventName: "", eventDate: "", sellingPrice: "", description: "" });
  const [meta, setMeta] = useState({ category: "콘서트", venue: "", seatInfo: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await ticketService.getTicketDetail(ticketId);
        const ticket = res.data;
        setForm({
          eventName: ticket.eventName || "",
          eventDate: ticket.eventDate || "",
          sellingPrice: ticket.sellingPrice || "",
          description: ticket.description || "",
        });
        setMeta({
          category: ticket.categoryName || "콘서트",
          venue: ticket.venue || ticket.location || "서울 올림픽주경기장",
          seatInfo: ticket.seatInfo || "1층 지정석 R석 / 12구역 14열",
        });
        if (ticket.image1) setImagePreview(`${API_SERVICES.TICKET}${ticket.image1}`);
      } catch (err) {
        setError("티켓 정보를 불러올 수 없습니다.");
      }
    };
    fetchTicket();
  }, [ticketId]);

  const dateTime = splitDateTime(form.eventDate);

  const updateDateTime = (part, value) => {
    const next = { ...dateTime, [part]: value };
    setForm((prev) => ({ ...prev, eventDate: `${next.date || "2024-12-15"}T${next.time || "18:00"}` }));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      ["eventName", "eventDate", "sellingPrice", "description"].forEach((key) => formData.append(key, form[key]));
      if (imageFile) formData.append("image1", imageFile);
      await ticketService.updateTicket(ticketId, formData);
      navigate("/mypage/my-tickets");
    } catch (err) {
      setError("티켓 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="bg-background text-on-surface flex flex-col min-h-screen max-w-md mx-auto">
      <header className="fixed md:sticky top-0 w-full md:w-auto z-50 bg-surface border-b border-outline-variant">
        <div className="flex items-center px-4 h-16 w-full max-w-md mx-auto">
          <button
            onClick={() => navigate("/mypage/my-tickets")}
            className="material-symbols-outlined p-2 hover:bg-surface-container-high rounded-full transition-colors active:scale-95 text-primary"
          >
            arrow_back
          </button>
          <h1 className="ml-4 font-headline font-bold text-lg text-primary">티켓 수정</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto pt-20 md:pt-4 pb-32 px-4 space-y-8 overflow-y-auto hide-scrollbar">
        {error && <div className="rounded-xl bg-error-container/40 px-4 py-3 text-sm text-error">{error}</div>}

        <section className="space-y-4">
          <h2 className="font-label font-medium text-sm text-on-surface-variant">티켓 이미지</h2>
          <label className="relative group aspect-video rounded-xl overflow-hidden bg-surface-container-high shadow-sm block cursor-pointer">
            {imagePreview ? (
              <img alt="Current Ticket" className="w-full h-full object-cover" src={imagePreview} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-outline">
                <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                <span className="text-sm mt-1">이미지 선택</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <span className="bg-surface p-3 rounded-full shadow-lg active:scale-95 transition-transform text-primary">
                <span className="material-symbols-outlined">edit</span>
              </span>
              <button
                type="button"
                onClick={(event) => { event.preventDefault(); setImagePreview(""); setImageFile(null); }}
                className="bg-error-container p-3 rounded-full shadow-lg active:scale-95 transition-transform text-on-error-container"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
          </label>
          <p className="text-xs text-outline text-center">공연을 잘 나타내는 선명한 사진을 선택해주세요.</p>
        </section>

        <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); handleSubmit(); }}>
          <div className="space-y-2">
            <label className="font-label font-medium text-sm text-on-surface-variant" htmlFor="ticket-title">제목</label>
            <input id="ticket-title" name="eventName" value={form.eventName} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:border-primary transition-all font-medium" type="text" />
          </div>

          <div className="space-y-2">
            <label className="font-label font-medium text-sm text-on-surface-variant">카테고리</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setMeta((prev) => ({ ...prev, category }))}
                  className={`px-5 py-2 rounded-full border font-medium text-sm transition-colors ${meta.category === category ? "border-primary bg-primary-container text-on-primary-container" : "border-outline-variant hover:border-primary text-on-surface-variant"}`}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-label font-medium text-sm text-on-surface-variant">관람 날짜</label>
              <div className="relative">
                <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-3 py-3 text-on-surface focus:border-primary" type="date" value={dateTime.date} onChange={(e) => updateDateTime("date", e.target.value)} />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">calendar_today</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-label font-medium text-sm text-on-surface-variant">관람 시간</label>
              <div className="relative">
                <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-3 py-3 text-on-surface focus:border-primary" type="time" value={dateTime.time} onChange={(e) => updateDateTime("time", e.target.value)} />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">schedule</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-label font-medium text-sm text-on-surface-variant">장소</label>
            <div className="relative">
              <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pl-10 pr-4 py-3 text-on-surface focus:border-primary" value={meta.venue} onChange={(e) => setMeta((prev) => ({ ...prev, venue: e.target.value }))} type="text" />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">location_on</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-label font-medium text-sm text-on-surface-variant">좌석 정보</label>
            <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:border-primary" value={meta.seatInfo} onChange={(e) => setMeta((prev) => ({ ...prev, seatInfo: e.target.value }))} type="text" />
          </div>

          <div className="space-y-2">
            <label className="font-label font-medium text-sm text-on-surface-variant">판매 가격</label>
            <div className="relative">
              <input name="sellingPrice" value={form.sellingPrice} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl pr-10 pl-4 py-3 text-on-surface focus:border-primary text-right font-bold text-lg" type="text" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface font-medium">원</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-label font-medium text-sm text-on-surface-variant">상세 설명</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:border-primary resize-none" rows="5" />
          </div>
        </form>

        <div className="flex items-center gap-3 p-4 bg-primary-container/30 border border-primary-container rounded-2xl">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
          <div>
            <p className="text-sm font-bold text-on-primary-container">에스크로 안전거래 보호</p>
            <p className="text-xs text-on-primary-fixed-variant">구매자가 구매를 확정해야 판매자에게 정산됩니다.</p>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant shadow-lg z-50">
        <div className="flex gap-3 px-4 h-24 items-center w-full max-w-md mx-auto">
          <button onClick={() => navigate("/mypage/my-tickets")} className="flex-1 h-14 rounded-xl border border-outline text-on-surface-variant font-bold hover:bg-surface-container-high transition-colors active:scale-95">
            임시저장
          </button>
          <button onClick={handleSubmit} className="flex-[2] h-14 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:bg-primary-dim transition-all active:scale-95 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>save</span>
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketEditPage;

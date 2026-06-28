import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ticketService from "../api/services/ticketService";
import { categoryService } from "../api/services/categoryService";
import { Alert } from "../components/common";

const FIELD =
  "w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline/50 text-on-surface";

const categoryName = (cat) => cat.name || cat.categoryName || "기타";
const categoryId = (cat) => cat.id || cat.categoryId;

export default function TicketCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    eventName: "",
    eventDate: "",
    eventLocation: "",
    originalPrice: "",
    categoryId: "",
    tradeType: "ONSITE",
    sellingPrice: "",
    seatInfo: "",
    ticketType: "일반",
    description: "",
    image1: null,
    image2: null,
  });
  const [imagePreviews, setImagePreviews] = useState({ image1: null, image2: null });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    categoryService
      .getAllCategories(true)
      .then((res) => {
        if (res.success) {
          const roots = Array.isArray(res.data) ? res.data : [];
          setCategories(roots);
          if (roots[0] && !form.categoryId) {
            setForm((prev) => ({ ...prev, categoryId: String(categoryId(roots[0])) }));
          }
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDatePart = (value) => {
    const time = form.eventDate?.slice(11, 16) || "18:00";
    setForm((prev) => ({ ...prev, eventDate: value ? `${value}T${time}` : "" }));
  };

  const setTimePart = (value) => {
    const date = form.eventDate?.slice(0, 10) || new Date().toISOString().slice(0, 10);
    setForm((prev) => ({ ...prev, eventDate: `${date}T${value}` }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "sellingPrice" || name === "originalPrice") {
      const op = name === "originalPrice" ? Number(value) : Number(form.originalPrice);
      const sp = name === "sellingPrice" ? Number(value) : Number(form.sellingPrice);
      if (sp > 0 && op > 0 && sp > op) setError("판매 가격은 정가보다 높을 수 없습니다.");
      else if (error === "판매 가격은 정가보다 높을 수 없습니다.") setError(null);
    }
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    const file = files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("이미지 파일은 5MB 이하여야 합니다.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }
    setForm((prev) => ({ ...prev, [name]: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreviews((prev) => ({ ...prev, [name]: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const op = Number(form.originalPrice);
    const sp = Number(form.sellingPrice || form.originalPrice);
    if (sp > 0 && op > 0 && sp > op) {
      setError("판매 가격은 정가보다 높을 수 없습니다.");
      return;
    }
    if (!form.eventName.trim()) {
      setError("공연명을 입력해주세요.");
      return;
    }
    if (!form.eventDate) {
      setError("공연 날짜와 시간을 입력해주세요.");
      return;
    }
    if (!form.eventLocation.trim()) {
      setError("공연 장소를 입력해주세요.");
      return;
    }
    if (!form.originalPrice || op <= 0) {
      setError("판매 가격을 입력해주세요.");
      return;
    }
    if (!form.categoryId) {
      setError("카테고리를 선택해주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    Object.entries({ ...form, sellingPrice: form.sellingPrice || form.originalPrice }).forEach(([key, value]) => {
      if (value === null || value === "") return;
      if (key === "eventDate") formData.append(key, value.length === 16 ? `${value}:00` : value);
      else if ((key === "image1" || key === "image2") && value instanceof File) formData.append(key, value);
      else if (key !== "image1" && key !== "image2") formData.append(key, String(value));
    });

    try {
      const response = await ticketService.createTicket(formData);
      if (!response.success) throw new Error(response.error || response.message || "티켓 등록에 실패했습니다.");
      setSuccess(true);
      setTimeout(() => navigate("/tickets"), 1200);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || "티켓 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const activeCategory = String(form.categoryId || "");
  const previewCount = Object.values(imagePreviews).filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="bg-surface text-on-surface min-h-screen pb-32">
      <nav className="fixed top-0 inset-x-0 mx-auto w-full max-w-md z-50 bg-surface border-b border-outline-variant">
        <div className="flex items-center px-4 h-16 w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="material-symbols-outlined text-primary p-2 hover:bg-surface-container-high rounded-full transition-colors active:scale-95 duration-100"
            aria-label="뒤로가기"
          >
            arrow_back
          </button>
          <h1 className="ml-2 font-headline font-bold text-lg text-primary">티켓 등록</h1>
        </div>
      </nav>

      <main className="pt-20 px-4 max-w-md mx-auto space-y-8">
        {(error || success) && (
          <Alert
            type={success ? "success" : "error"}
            message={success ? "티켓이 성공적으로 등록되었습니다." : error}
            onClose={() => setError(null)}
          />
        )}

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-on-surface-variant flex items-center gap-1">
            카테고리 선택
            <span className="w-1 h-1 bg-primary rounded-full" />
          </h2>
          <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
            {categories.slice(0, 6).map((cat) => {
              const id = String(categoryId(cat));
              const active = activeCategory === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, categoryId: id }))}
                  className={`px-5 py-2.5 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:border-primary"
                  }`}
                >
                  {categoryName(cat)}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex justify-between items-end">
            <h2 className="text-sm font-bold text-on-surface-variant">
              티켓 사진 <span className="text-primary-dim font-normal">(선택)</span>
            </h2>
            <span className="text-xs text-outline">{previewCount} / 2</span>
          </div>
          <div className="flex gap-3">
            {["image1", "image2"].map((name) => (
              <label
                key={name}
                className={`w-24 h-24 rounded-xl overflow-hidden shrink-0 cursor-pointer ${
                  imagePreviews[name]
                    ? "bg-surface-container relative"
                    : "border-2 border-dashed border-outline-variant flex flex-col items-center justify-center gap-1 text-outline hover:border-primary hover:text-primary transition-all active:scale-95"
                }`}
              >
                {imagePreviews[name] ? (
                  <img src={imagePreviews[name]} alt="티켓 미리보기" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                    <span className="text-[10px] font-bold">사진 추가</span>
                  </>
                )}
                <input type="file" name={name} hidden accept="image/*" onChange={handleFileChange} />
              </label>
            ))}
            <div className="w-24 h-24 rounded-xl bg-surface-container flex items-center justify-center text-outline-variant shrink-0">
              <span className="material-symbols-outlined">image</span>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface-variant">공연명</label>
            <input
              className={FIELD}
              name="eventName"
              value={form.eventName}
              onChange={handleChange}
              placeholder="공연 제목을 입력해주세요"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant">공연 날짜</label>
              <div className="relative">
                <input className={`${FIELD} pl-10`} type="date" value={form.eventDate.slice(0, 10)} onChange={(e) => setDatePart(e.target.value)} />
                <span className="material-symbols-outlined absolute left-3 top-3.5 text-outline text-sm">calendar_month</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant">공연 시간</label>
              <div className="relative">
                <input className={`${FIELD} pl-10`} type="time" value={form.eventDate.slice(11, 16)} onChange={(e) => setTimePart(e.target.value)} />
                <span className="material-symbols-outlined absolute left-3 top-3.5 text-outline text-sm">schedule</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface-variant">공연 장소</label>
            <div className="relative">
              <input
                className={`${FIELD} pl-10`}
                name="eventLocation"
                value={form.eventLocation}
                onChange={handleChange}
                placeholder="공연 장소를 검색하세요"
              />
              <span className="material-symbols-outlined absolute left-3 top-3.5 text-outline text-sm">location_on</span>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-surface-container-low rounded-2xl">
            <div className="space-y-3">
              <label className="text-sm font-bold text-on-surface-variant">좌석 등급</label>
              <div className="flex gap-2">
                {["일반", "스탠딩", "A석"].map((seat) => {
                  const active = form.ticketType === seat;
                  return (
                    <button
                      key={seat}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, ticketType: seat }))}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        active
                          ? "bg-primary-container text-on-primary-container border-primary"
                          : "border-outline-variant bg-surface-container-lowest hover:bg-primary-container/20"
                      }`}
                    >
                      {seat}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface-variant">상세 좌석 번호</label>
              <input className={FIELD} name="seatInfo" value={form.seatInfo} onChange={handleChange} placeholder="예: 1층 12열 15번" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface-variant">판매 가격</label>
            <div className="relative">
              <input
                className="w-full pr-12 pl-4 py-4 bg-surface-container-lowest border-2 border-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold text-lg text-primary placeholder:text-outline/30"
                placeholder="0"
                type="number"
                name="originalPrice"
                value={form.originalPrice}
                onChange={(e) => {
                  handleChange(e);
                  setForm((prev) => ({ ...prev, sellingPrice: e.target.value }));
                }}
              />
              <span className="absolute right-4 top-4 font-bold text-on-surface-variant">원</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface-variant">추가 설명</label>
            <textarea
              className={`${FIELD} resize-none`}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="직거래 희망 여부나 티켓 상태 등 상세 내용을 적어주세요."
              rows={4}
            />
          </div>
        </section>

        <section className="bg-tertiary-container/30 border border-tertiary-container p-4 rounded-xl flex gap-3 items-start">
          <span className="material-symbols-outlined text-tertiary mt-0.5">verified_user</span>
          <p className="text-xs text-on-tertiary-container leading-relaxed">
            <span className="font-bold block mb-1">안전거래 시스템 안내</span>
            에스크로 안전거래 시스템이 적용되어 판매 금액은 구매 확정 후 정산됩니다. PASSIT은 안전한 티켓 거래를 보장합니다.
          </p>
        </section>
      </main>

      <footer className="fixed bottom-0 inset-x-0 mx-auto max-w-md bg-surface border-t border-outline-variant p-4 z-50">
        <div className="max-w-md mx-auto">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary text-on-primary font-bold rounded-xl active:scale-[0.98] transition-transform shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{loading ? "등록 중..." : "등록하기"}</span>
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </div>
      </footer>
    </form>
  );
}

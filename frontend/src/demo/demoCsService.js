import { demoInquiries, demoReports } from "./demoData";

const demoNotices = [
  {
    id: 1,
    noticeId: 1,
    title: "[공지] PASSIT 서비스 이용 안내",
    content:
      "PASSIT은 정가 티켓 양도 플랫폼입니다. 모든 거래는 정가 기준으로 이루어지며, 안전한 거래를 위해 판매자 본인 확인 절차를 진행합니다.",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    viewCount: 1024,
  },
  {
    id: 2,
    noticeId: 2,
    title: "[공지] 정가 양도 정책 업데이트",
    content: "2024년부터 모든 티켓은 원가 이하 또는 동일 금액으로만 거래할 수 있습니다. 위반 시 계정 정지될 수 있습니다.",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    viewCount: 892,
  },
];

const demoFaqs = [
  {
    id: 1,
    faqId: 1,
    category: "거래",
    question: "양도 요청을 하면 바로 결제가 진행되나요?",
    answer:
      "아니요. 양도 요청 후 판매자가 수락하면 결제 단계로 넘어갑니다. 판매자 수락 전에는 구매자가 요청을 취소할 수 있습니다.",
  },
  {
    id: 2,
    faqId: 2,
    category: "거래",
    question: "정가보다 비싸게 거래할 수 있나요?",
    answer: "PASSIT은 정가 양도 플랫폼입니다. 원가 초과 거래는 정책상 금지되어 있으며 신고 대상이 됩니다.",
  },
  {
    id: 3,
    faqId: 3,
    category: "결제",
    question: "결제 수단은 어떻게 되나요?",
    answer: "신용카드, 체크카드, 계좌이체를 지원합니다. 데모 환경에서는 실제 결제가 발생하지 않습니다.",
  },
  {
    id: 4,
    faqId: 4,
    category: "채팅",
    question: "채팅은 언제 이용할 수 있나요?",
    answer: "티켓 상세 페이지에서 채팅 시작 버튼을 눌러 판매자에게 문의할 수 있습니다. 거래 요청 후에도 채팅이 유지됩니다.",
  },
];

let _inquiries = demoInquiries.map((i) => ({ ...i }));
let _reports = demoReports.map((r) => ({ ...r }));

export const demoCsService = {
  async getNotices(params = {}) {
    return { success: true, data: { content: demoNotices, totalElements: demoNotices.length } };
  },

  async getNoticeDetail(noticeId) {
    const notice = demoNotices.find((n) => String(n.id ?? n.noticeId) === String(noticeId));
    if (!notice) return { success: false, error: "공지사항을 찾을 수 없습니다." };
    return { success: true, data: notice };
  },

  async getFaqs(params = {}) {
    return { success: true, data: { content: demoFaqs, totalElements: demoFaqs.length } };
  },

  async getFaqDetail(faqId) {
    const faq = demoFaqs.find((f) => String(f.id ?? f.faqId) === String(faqId));
    if (!faq) return { success: false, error: "FAQ를 찾을 수 없습니다." };
    return { success: true, data: faq };
  },

  async createInquiry(data) {
    const inquiry = {
      id: Date.now(),
      ...data,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    _inquiries.unshift(inquiry);
    return { success: true, data: inquiry };
  },

  async getInquiries(params = {}) {
    return { success: true, data: { content: _inquiries, totalElements: _inquiries.length } };
  },

  async createReport(data) {
    const report = {
      id: Date.now(),
      ...data,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };
    _reports.unshift(report);
    return { success: true, data: report };
  },

  async getReports(params = {}) {
    return { success: true, data: { content: _reports, totalElements: _reports.length } };
  },
};

export default demoCsService;

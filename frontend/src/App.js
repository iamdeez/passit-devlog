import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { LoadingSpinner } from "./components/common/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

import ChatLayout from "./layouts/ChatLayout";
import ChatRoomPage from "./pages/chat/ChatRoomPage";
import TicketCreatePage from "./pages/TicketCreatePage";
import TicketListPage from "./pages/TicketListPage";
import MyTicketListPage from "./pages/MyTicketListPage";
import TicketEditPage from "./pages/TicketEditPage";
import DealListPage from "./pages/trade/DealListPage";

// 네비게이션
import NavBar from "./components/NavBar";
import BottomNav from "./components/BottomNav";

// 공지
import NoticePage from "./pages/cs/NoticePage";
import NoticeListPage from "./pages/cs/NoticeListPage";

// 관리자 공지
import AdminNoticeListPage from "./pages/admin/AdminNoticeListPage";
import AdminNoticeCreatePage from "./pages/admin/AdminNoticeCreatePage";
import AdminNoticeEditPage from "./pages/admin/AdminNoticeEditPage";

// 신고
import ReportCreatePage from "./pages/cs/ReportCreatePage";
import ReportListPage from "./pages/cs/ReportListPage";
import ReportDetailPage from "./pages/cs/ReportDetailPage";
import AdminReportListPage from "./pages/admin/AdminReportListPage";
import AdminReportDetailPage from "./pages/admin/AdminReportDetailPage";

// 문의 (유저)
import InquiryListPage from "./pages/cs/InquiryListPage";
import InquiryDetailPage from "./pages/cs/InquiryDetailPage";
import InquiryCreatePage from "./pages/cs/InquiryCreatePage";

// 문의 (관리자)
import AdminInquiryListPage from "./pages/admin/AdminInquiryListPage";
import AdminInquiryDetailPage from "./pages/admin/AdminInquiryDetailPage";

// FAQ
import FaqListPage from "./pages/cs/FaqListPage";
import FaqPage from "./pages/cs/FaqPage";
import AdminFaqListPage from "./pages/admin/AdminFaqListPage";
import AdminFaqCreatePage from "./pages/admin/AdminFaqCreatePage";
import AdminFaqEditPage from "./pages/admin/AdminFaqEditPage";

// lazy pages
const HomePage = lazy(() => import("./pages/HomePage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const KakaoCallbackPage = lazy(() => import("./pages/KakaoCallbackPage"));

// 마이페이지
const MyPageLayout = lazy(() => import("./layouts/MyPageLayout"));
const ProfilePage = lazy(() => import("./pages/mypage/ProfilePage"));
const ActivityPage = lazy(() => import("./pages/mypage/ActivityPage"));

// 신규 페이지
const NotificationPage = lazy(() => import("./pages/NotificationPage"));

// 관리자
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminUserManagementPage = lazy(() => import("./pages/admin/AdminUserManagementPage"));
const AdminUserDetailPage = lazy(() => import("./pages/admin/AdminUserDetailPage"));
const AdminCategoryManagementPage = lazy(() => import("./pages/admin/AdminCategoryManagementPage"));
const AdminTicketManagementPage = lazy(() => import("./pages/admin/AdminTicketManagementPage"));
const AdminTradeManagementPage = lazy(() => import("./pages/admin/AdminTradeManagementPage"));

// PrivateRoute
const PrivateRoute = lazy(() => import("./components/auth/PrivateRoute"));
const TicketDetailPage = lazy(() => import("./pages/TicketDetailPage.jsx"));
const DealAcceptPage = lazy(() => import("./pages/DealAcceptPage"));
const BuyerPaymentPage = lazy(() => import("./pages/BuyerPaymentPage"));
const PaymentResultPage = lazy(() => import("./pages/PaymentResultPage"));


function App() {
  return (
    <ErrorBoundary>
      <LoadingProvider>
          <AuthProvider>
            <Router>
              <Suspense fallback={<LoadingSpinner fullPage message="페이지를 불러오는 중..." />}>
                {/* 네비게이션 */}
                <NavBar />
                <BottomNav />

                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/notifications" element={<NotificationPage />} />

                  {/* 마이페이지 */}
                  <Route
                    path="/mypage"
                    element={
                      <PrivateRoute>
                        <MyPageLayout />
                      </PrivateRoute>
                    }
                  >
                    <Route index element={<Navigate to="/mypage/profile" replace />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="activities" element={<ActivityPage />} />
                    <Route path="my-tickets" element={<MyTicketListPage />} />
                    <Route path="my-tickets/:ticketId/edit" element={<TicketEditPage />} />
                  </Route>

                  {/* 관리자 */}
                  <Route
                    path="/admin"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminDashboardPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/tickets"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminTicketManagementPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminUserManagementPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/users/:userId"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminUserDetailPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/trades"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminTradeManagementPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/categories"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminCategoryManagementPage />
                      </PrivateRoute>
                    }
                  />

                  {/* 관리자 공지 */}
                  <Route
                    path="/admin/notices"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminNoticeListPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/notices/new"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminNoticeCreatePage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/notices/:id/edit"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminNoticeEditPage />
                      </PrivateRoute>
                    }
                  />

                  {/* CS 공지 */}
                  <Route path="/cs/notices" element={<NoticeListPage />} />
                  <Route path="/cs/notices/:noticeId" element={<NoticePage />} />

                  {/* 신고 */}
                  <Route
                    path="/cs/reports"
                    element={
                      <PrivateRoute>
                        <ReportListPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/cs/reports/new"
                    element={
                      <PrivateRoute>
                        <ReportCreatePage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/cs/reports/:reportId"
                    element={
                      <PrivateRoute>
                        <ReportDetailPage />
                      </PrivateRoute>
                    }
                  />

                  {/* 관리자 신고 */}
                  <Route
                    path="/admin/reports"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminReportListPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/reports/:reportId"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminReportDetailPage />
                      </PrivateRoute>
                    }
                  />

                  {/* 문의 */}
                  <Route
                    path="/cs/inquiries"
                    element={
                      <PrivateRoute>
                        <InquiryListPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/cs/inquiries/new"
                    element={
                      <PrivateRoute>
                        <InquiryCreatePage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/cs/inquiries/:inquiryId"
                    element={
                      <PrivateRoute>
                        <InquiryDetailPage />
                      </PrivateRoute>
                    }
                  />

                  {/* 관리자 문의 */}
                  <Route
                    path="/admin/inquiries"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminInquiryListPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/inquiries/:inquiryId"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminInquiryDetailPage />
                      </PrivateRoute>
                    }
                  />

                  {/* FAQ */}
                  <Route path="/cs/faqs" element={<FaqListPage />} />
                  <Route path="/cs/faqs/:faqId" element={<FaqPage />} />

                  {/* 관리자 FAQ */}
                  <Route
                    path="/admin/faqs"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminFaqListPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/faqs/new"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminFaqCreatePage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/faqs/:faqId/edit"
                    element={
                      <PrivateRoute adminOnly={true}>
                        <AdminFaqEditPage />
                      </PrivateRoute>
                    }
                  />

                  {/* 티켓 */}
                  <Route path="/tickets" element={<TicketListPage />} />
                  <Route path="/tickets/:ticket_id/detail" element={<TicketDetailPage />} />
                  <Route
                    path="/sell"
                    element={
                      <PrivateRoute>
                        <TicketCreatePage />
                      </PrivateRoute>
                    }
                  />

                  {/* 거래 */}
                  <Route
                    path="/deals"
                    element={
                      <PrivateRoute>
                        <DealListPage />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/deals/:deal_id/detail" element={<DealAcceptPage />} />
                  <Route path="/payments/:payment_id/detail" element={<BuyerPaymentPage />} />
                  <Route path="/payments/:payment_id/result" element={<PaymentResultPage />} />

                  {/* 채팅 */}
                  <Route path="/chat" element={<ChatLayout />}>
                    <Route index element={null} />
                    <Route path=":chatroomId" element={<ChatRoomPage />} />
                  </Route>

                  {/* 404 */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </Router>
          </AuthProvider>
        </LoadingProvider>
    </ErrorBoundary>
  );
}

export default App;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import tradeService from "../../../services/tradeService";

const SystemActionMessage = ({ message, userId, chatroomId, roomInfo }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const visibleTarget = message.metadata?.visibleTarget;
  const buyerId = message.metadata?.buyerId;
  const sellerId = message.metadata?.sellerId || roomInfo?.seller_id;

  if (visibleTarget === "BUYER" && userId !== buyerId) return null;
  if (visibleTarget === "SELLER" && userId !== sellerId) return null;

  const handleActionClick = async (actionCode) => {
    try {
      setLoading(true);
      const dealId = message.metadata?.dealId;
      const ticketId = message.metadata?.ticketId ?? roomInfo?.ticket_id;

      switch (actionCode) {
        case "REQUEST_DEAL":
          await tradeService.createDeal(ticketId, Number(chatroomId));
          break;
        case "ACCEPT_DEAL":
          await tradeService.acceptDeal(dealId, Number(chatroomId));
          break;
        case "REJECT_DEAL":
          await tradeService.rejectDeal(dealId, Number(chatroomId));
          break;
        case "START_PAYMENT":
          navigate(`/tickets/${ticketId}/detail`);
          return;
        default:
          console.warn("알 수 없는 액션 코드:", actionCode);
      }
    } catch (err) {
      alert(err.message || "요청 처리에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center my-4 px-4">
      <div className="w-full max-w-sm bg-secondary-container border border-outline-variant/30 rounded-2xl p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <span className="material-symbols-outlined text-primary text-base">info</span>
          <p className="text-sm font-semibold text-primary">티켓 양도 안내</p>
        </div>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-3">{message.content}</p>
        <div className="flex gap-2 flex-wrap">
          {message.metadata?.actions?.map((action, i) => (
            <button
              key={i}
              onClick={() => handleActionClick(action.actionCode)}
              disabled={loading}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-60 ${
                action.isPrimary
                  ? "bg-primary text-on-primary hover:bg-primary-dim"
                  : "bg-white border border-primary-container text-primary hover:bg-primary-container/40"
              }`}
            >
              {loading && <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin inline-block" />}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemActionMessage;

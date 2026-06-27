import React, { useState } from "react";
import { Modal } from "../common";

const DealRequestModal = ({ open, onClose, ticket, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);

  const handleConfirmClick = () => {
    if (quantity <= 0) { alert("수량을 1개 이상 입력해주세요."); return; }
    const ticketId = ticket.ticketId || ticket.id;
    if (!ticketId) { alert("티켓 ID를 찾을 수 없습니다."); return; }
    onConfirm(ticketId, quantity);
    onClose();
  };

  if (!ticket) return null;

  const totalPrice = (ticket.sellingPrice || 0) * quantity;

  return (
    <Modal isOpen={open} onClose={onClose} title="구매 정보 확인" size="md">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 이미지 */}
          <div className="w-full sm:w-40 h-40 rounded-xl overflow-hidden bg-surface-container flex items-center justify-center flex-shrink-0">
            {ticket.image1 || ticket.imageUrl ? (
              <img src={ticket.image1 || ticket.imageUrl} alt={ticket.eventName}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = "none"; }} />
            ) : (
              <span className="material-symbols-outlined text-5xl text-outline-variant">confirmation_number</span>
            )}
          </div>

          {/* 티켓 정보 */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-on-surface">{ticket.eventName}</h3>
              {ticket.eventDate && (
                <p className="text-sm text-on-surface-variant">
                  공연일자: {new Date(ticket.eventDate).toLocaleString("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
              <p className="text-sm text-on-surface-variant">좌석정보: {ticket.seatInfo || "정보 없음"}</p>
              <p className="font-display font-bold text-primary text-lg">{ticket.sellingPrice?.toLocaleString()}원</p>
            </div>

            {/* 수량 선택 */}
            <div className="flex items-center gap-3 mt-4">
              <span className="font-semibold text-sm text-on-surface">수량 선택</span>
              <div className="flex items-center border border-outline-variant rounded-xl overflow-hidden">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-40"
                  disabled={quantity <= 1}>
                  <span className="material-symbols-outlined text-lg">remove</span>
                </button>
                <span className="w-10 text-center font-bold text-on-surface text-sm">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 총 금액 */}
        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/30">
          <span className="text-sm text-on-surface-variant">총 결제 예정 금액</span>
          <span className="text-xl font-display font-bold text-error">{totalPrice.toLocaleString()}원</span>
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-outlined btn-sm">취소</button>
          <button onClick={handleConfirmClick} className="btn-primary btn-sm">양도 요청하기</button>
        </div>
      </div>
    </Modal>
  );
};

export default DealRequestModal;

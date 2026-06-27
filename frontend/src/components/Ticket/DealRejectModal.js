import React, { useState } from "react";
import { Modal } from "../common";

const DealRejectModal = ({ open, onClose, onConfirmReject }) => {
  const [rejectReason, setRejectReason] = useState("");

  const handleClose = () => { setRejectReason(""); onClose(); };
  const handleConfirm = () => {
    if (!rejectReason.trim()) { alert("거절 사유를 입력해주세요."); return; }
    onConfirmReject(rejectReason);
    setRejectReason("");
  };

  return (
    <Modal isOpen={open} onClose={handleClose} title="양도 거절 사유 입력">
      <div className="space-y-3">
        <p className="text-sm text-on-surface-variant">이 거래 요청을 거절하려면 사유를 입력해주세요. 거절 처리 후 거래는 취소됩니다.</p>
        <textarea
          autoFocus
          className="input-base resize-none min-h-[96px]"
          placeholder="거절 사유 (필수)"
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={handleClose} className="btn-outlined btn-sm">취소</button>
          <button onClick={handleConfirm} disabled={!rejectReason.trim()}
            className="px-4 py-1.5 bg-error text-on-error font-semibold rounded-xl hover:opacity-90 text-sm transition-all disabled:opacity-50">
            확인 (거래 거절)
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DealRejectModal;

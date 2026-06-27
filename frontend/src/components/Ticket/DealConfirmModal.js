import React from "react";
import { Modal } from "../common";

const DealConfirmModal = ({ open, onClose, onConfirmCompletion }) => {
  return (
    <Modal isOpen={open} onClose={onClose} title="구매 확정 안내" size="sm">
      <div className="space-y-4">
        <div className="text-center py-2">
          <p className="text-sm text-on-surface-variant">구매 확정을 진행하시겠습니까?</p>
          <p className="text-sm font-semibold text-error mt-2">⚠️ 구매확정 시 환불이 불가능합니다.</p>
          <p className="text-sm text-on-surface-variant mt-1">공연에 입장 후 눌러주세요.</p>
        </div>
        <div className="flex justify-center gap-2">
          <button onClick={onConfirmCompletion} className="btn-primary btn-sm">확정 및 거래 완료</button>
          <button onClick={onClose} className="btn-outlined btn-sm">취소</button>
        </div>
      </div>
    </Modal>
  );
};

export default DealConfirmModal;

import React from "react";
import { Modal } from "../common";

const DealCancelModal = ({ open, onClose, onConfirmCancel }) => {
  return (
    <Modal isOpen={open} onClose={onClose} title="양도 취소 확인" size="sm">
      <div className="space-y-4">
        <div className="text-center py-2">
          <span className="material-symbols-outlined text-error text-5xl mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          <h3 className="font-display font-bold text-on-surface mb-2">정말로 이 거래를 취소하시겠습니까?</h3>
          <p className="text-sm text-on-surface-variant">취소 시, 거래가 즉시 종료되며 티켓은 재고(AVAILABLE) 상태로 복구됩니다.</p>
          <p className="text-sm text-error mt-2">이 작업은 되돌릴 수 없습니다. 신중하게 진행해주세요.</p>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-outlined btn-sm">유지 (취소 안 함)</button>
          <button onClick={onConfirmCancel} className="px-4 py-1.5 bg-error text-on-error font-semibold rounded-xl hover:opacity-90 text-sm transition-all">확인 (양도 취소)</button>
        </div>
      </div>
    </Modal>
  );
};

export default DealCancelModal;

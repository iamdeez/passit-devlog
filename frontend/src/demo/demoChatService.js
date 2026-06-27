import { demoChatRooms, demoMessages, demoUser } from "./demoData";

let _rooms = demoChatRooms.map((r) => ({ ...r }));
let _messages = {
  301: demoMessages.map((m) => ({ ...m })),
};
let _nextMsgId = 100;

export const demoChatService = {
  async getChatRooms(userId) {
    return { success: true, data: _rooms };
  },

  async getChatRoomDetail(roomId) {
    const room = _rooms.find((r) => String(r.chatroomId) === String(roomId));
    if (!room) return { success: false, error: "채팅방을 찾을 수 없습니다." };
    return { success: true, data: room };
  },

  async createChatRoom({ ticketId, buyerId }) {
    const existing = _rooms.find(
      (r) => String(r.ticketId) === String(ticketId) && String(r.buyerId ?? buyerId) === String(buyerId)
    );
    if (existing) return existing;

    const chatroomId = Date.now();
    const room = {
      chatroomId,
      ticketId,
      ticketTitle: `티켓 #${ticketId}`,
      buyerId,
      sellerName: "판매자",
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
    };
    _rooms.unshift(room);
    const systemMsgAt = new Date().toISOString();
    _messages[chatroomId] = [
      {
        messageId: _nextMsgId++,
        chatroomId,
        senderId: null,
        type: "SYSTEM",
        content: "채팅방이 생성되었습니다.",
        createdAt: systemMsgAt,
        sentAt: systemMsgAt,
      },
    ];
    return room;
  },

  async getMessages(chatroomId) {
    const msgs = (_messages[chatroomId] || []).map((m) => ({
      ...m,
      sentAt: m.sentAt ?? m.createdAt,
    }));
    return { success: true, data: msgs };
  },

  async sendMessage(chatroomId, content) {
    const now = new Date().toISOString();
    const msg = {
      messageId: _nextMsgId++,
      chatroomId: Number(chatroomId),
      senderId: demoUser.userId,
      type: "TEXT",
      content,
      createdAt: now,
      sentAt: now,
    };
    if (!_messages[chatroomId]) _messages[chatroomId] = [];
    _messages[chatroomId].push(msg);

    const room = _rooms.find((r) => String(r.chatroomId) === String(chatroomId));
    if (room) {
      room.lastMessage = content;
      room.lastMessageTime = msg.createdAt;
    }

    return { success: true, data: msg };
  },

  async markAllMessagesAsRead(chatroomId, userId) {
    const room = _rooms.find((r) => String(r.chatroomId) === String(chatroomId));
    if (room) room.unreadCount = 0;
    return { success: true };
  },

  async deleteChatRoom(chatroomId, userId) {
    _rooms = _rooms.filter((r) => String(r.chatroomId) !== String(chatroomId));
    return { success: true };
  },
};

export default demoChatService;

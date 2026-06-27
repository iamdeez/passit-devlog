import supabase from "../../../config/supabaseClient";

const ROOM_SELECT = `
  *,
  ticket:tickets!ticket_id(ticket_id, event_name, selling_price, image1),
  buyer:profiles!buyer_id(id, nickname, profile_image_url),
  seller:profiles!seller_id(id, nickname, profile_image_url),
  last_message:chat_messages!last_message_id(content, sent_at, type)
`;

export const getChatRooms = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("chat_rooms")
    .select(ROOM_SELECT)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
};

export const createChatRoom = async ({ ticketId }) => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data: ticket } = await supabase
    .from("tickets")
    .select("owner_id")
    .eq("ticket_id", ticketId)
    .single();

  if (!ticket) throw new Error("티켓을 찾을 수 없습니다");
  if (ticket.owner_id === user.id) throw new Error("본인 티켓에는 채팅할 수 없습니다");

  // 이미 존재하는 채팅방 확인
  const { data: existing } = await supabase
    .from("chat_rooms")
    .select("chatroom_id")
    .eq("ticket_id", ticketId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("chat_rooms")
    .insert({ ticket_id: ticketId, buyer_id: user.id, seller_id: ticket.owner_id })
    .select(ROOM_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getChatRoomDetail = async (chatroomId) => {
  const { data, error } = await supabase
    .from("chat_rooms")
    .select(ROOM_SELECT)
    .eq("chatroom_id", chatroomId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getMessages = async (chatroomId) => {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*, sender:profiles!sender_id(id, nickname, profile_image_url)")
    .eq("chatroom_id", chatroomId)
    .order("sent_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
};

export const sendMessage = async (chatroomId, content, type = "TEXT", metadata = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ chatroom_id: chatroomId, sender_id: user.id, content, type, metadata })
    .select()
    .single();
  if (error) throw new Error(error.message);

  // 채팅방 last_message_id 갱신
  await supabase
    .from("chat_rooms")
    .update({ last_message_id: data.message_id })
    .eq("chatroom_id", chatroomId);

  return data;
};

export const deleteChatRoom = async (chatroomId) => {
  const { error } = await supabase
    .from("chat_rooms")
    .delete()
    .eq("chatroom_id", chatroomId);
  if (error) throw new Error(error.message);
};

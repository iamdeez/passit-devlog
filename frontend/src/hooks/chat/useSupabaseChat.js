import { useEffect, useRef, useCallback } from "react";
import supabase from "../../config/supabaseClient";

const useSupabaseChat = ({ chatroomId, onMessage }) => {
  const channelRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const subscribe = useCallback(() => {
    if (!chatroomId) return;

    // 기존 채널 정리
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`chat-room-${chatroomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chatroom_id=eq.${chatroomId}`,
        },
        (payload) => {
          onMessageRef.current(payload.new);
        }
      )
      .subscribe();

    channelRef.current = channel;
  }, [chatroomId]);

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, [subscribe, unsubscribe]);

  return { unsubscribe };
};

export default useSupabaseChat;

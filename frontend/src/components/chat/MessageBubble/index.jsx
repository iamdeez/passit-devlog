import React from "react";
import TextMessage from "./TextMessage";
import SystemInfoMessage from "./SystemInfoMessage";
import SystemActionMessage from "./SystemActionMessage";

const MessageBubble = ({ message, userId, chatroomId, roomInfo, isFirstInGroup, isLastInGroup }) => {
  const isMine = message.senderId === userId;

  switch (message.type) {
    case "TEXT":
      return (
        <TextMessage
          message={message}
          isMine={isMine}
          isFirstInGroup={isFirstInGroup}
          isLastInGroup={isLastInGroup}
        />
      );
    case "SYSTEM_MESSAGE":
    case "SYSTEM_INFO_MESSAGE":
      return <SystemInfoMessage message={message} />;
    case "SYSTEM_ACTION_MESSAGE":
      return (
        <SystemActionMessage
          message={message}
          userId={userId}
          chatroomId={chatroomId}
          roomInfo={roomInfo}
        />
      );
    default:
      return null;
  }
};

export default MessageBubble;

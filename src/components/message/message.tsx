// src/components/message/Message.tsx

import './message.css';
import React, { forwardRef } from 'react';

export enum MessageType {
	User = 'user',
	Bot = 'bot',
}

interface MessageProps {
  content: string;
  type: MessageType;
}

const Message = forwardRef<HTMLLIElement, MessageProps>(({ content, type }, ref) => (
	<li ref={ref} className={`message ${type === MessageType.User ? 'user-message' : 'bot-message'}`}>
	  {content}
	</li>
  ));
export default Message;

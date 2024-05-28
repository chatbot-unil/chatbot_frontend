// src/components/chatview/chatview.tsx

import React, { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import './chatview.css';
import Message, { MessageType } from '../message/message';
import IconButton from '@mui/material/IconButton';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SendIcon from '@mui/icons-material/Send';

const SERVER_URL = `http://${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

const ChatView = () => {
  const [messages, setMessages] = useState<{ content: string; type: MessageType }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('sessionId'));
  const [isLastMessageInView, setIsLastMessageInView] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const lastMessageRef = useRef<HTMLLIElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    socketRef.current = io(SERVER_URL);

    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      if (sessionId) {
        socketRef.current!.emit('restore_session', { session_id: sessionId });
      } else {
        socketRef.current!.emit('init');
      }
    });

    socketRef.current.on('session_init', (data) => {
      localStorage.setItem('sessionId', data.session_id);
      setSessionId(data.session_id);
      setMessages(messages => [...messages, { type: MessageType.Bot, content: data.initial_message }]);
      console.log(`Session initialized with ID: ${data.session_id}`);
    });

    socketRef.current.on('session_restored', (data) => {
      localStorage.setItem('sessionId', data.session_id);
      setSessionId(data.session_id);
      setMessages(data.chat_history);
      console.log(`Session restored with ID: ${data.session_id}`);
    });

    socketRef.current.on('response', (message) => {
      setMessages(messages => [...messages, { type: MessageType.Bot, content: message }]);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [sessionId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (sessionId) {
      socketRef.current!.emit('query', { question: newMessage, session_id: sessionId });
      setMessages(messages => [...messages, { type: MessageType.User, content: newMessage }]);
      setNewMessage('');
    } else {
      console.error('Session ID is not set.');
    }
  };

  const scrollToLastMessage = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      const entry = entries[0];
      setIsLastMessageInView(entry.isIntersecting);
    });

    if (lastMessageRef.current) {
      observerRef.current.observe(lastMessageRef.current);
    }

    return () => {
      if (observerRef.current && lastMessageRef.current) {
        observerRef.current.unobserve(lastMessageRef.current);
      }
    };
  }, [messages]);

  return (
    <div className="chat-container">
      <ul className="messages-list">
        {messages.map((message, index) => (
          <Message
            key={index}
            type={message.type}
            content={message.content}
            ref={index === messages.length - 1 ? lastMessageRef : null}
          />
        ))}
      </ul>
	  {!isLastMessageInView && (
        <div className="scroll-button-container">
          <IconButton onClick={scrollToLastMessage} className="scroll-button">
		  	<ArrowDownwardIcon sx={{ color: 'white' }} />
          </IconButton>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
		<IconButton
          type="submit"
          className="send-button"
          sx={{
            backgroundColor: '#007bff',
            '&:hover': {
              backgroundColor: '#0056b3',
            },
            color: 'white'
          }}
        >
		  <SendIcon style={{ color: 'white' }} />
		</IconButton>
      </form>
    </div>
  );
};

export default ChatView;

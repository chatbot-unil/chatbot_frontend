import React, { useEffect, useState, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import './chatview.css';
import Message, { MessageType } from '../message/message';
import IconButton from '@mui/material/IconButton';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SendIcon from '@mui/icons-material/Send';

const SERVER_URL = `http://${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<{ content: string; type: MessageType }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('sessionId'));
  const [isLastMessageInView, setIsLastMessageInView] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const lastMessageRef = useRef<HTMLLIElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
	const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server with ID:', socket.id);
      if (sessionId) {
        socket!.emit('restore_session', { session_id: sessionId });
      } else {
        socket!.emit('init');
      }
    });

    socket.on('session_init', (data) => {
		localStorage.setItem('sessionId', data.session_id);
		setSessionId(data.session_id);
		setMessages((prevMessages) => [
			...prevMessages,
			{ type: MessageType.Bot, content: data.initial_message },
		]);
		console.log(`Session initialized with ID: ${data.session_id}`);
	});

    socket.on('session_restored', (data) => {
      localStorage.setItem('sessionId', data.session_id);
      setSessionId(data.session_id);
      setMessages(data.chat_history);
      console.log(`Session restored with ID: ${data.session_id}`);
    });

    socket.on('response', (message) => {
		setMessages((prevMessages) => [
			...prevMessages,
			{ type: MessageType.Bot, content: message },
		]);
	});

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket?.disconnect();
    };
  }, [sessionId]);

  const handleSendMessage = useCallback((e: React.FormEvent) => {
	e.preventDefault();
	if (!newMessage.trim()) return;
	if (sessionId) {
		socketRef.current?.emit('query', { question: newMessage, session_id: sessionId });
		setMessages((prevMessages) => [
			...prevMessages,
			{ type: MessageType.User, content: newMessage },
		]);
		setNewMessage('');
	} else {
		console.error('Session ID is not set.');
	}
  }, [sessionId, newMessage]);

  const scrollToLastMessage = useCallback(() => {
	if (lastMessageRef.current) {
	  lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
	}
  }, []);

  useEffect(() => {
	scrollToLastMessage();
  }, [messages, scrollToLastMessage]);
  
  useEffect(() => {
	observerRef.current = new IntersectionObserver((entries) => {
		const entry = entries[0];
		setIsLastMessageInView(entry.isIntersecting);
	});

	const currentLastMessageRef = lastMessageRef.current;

	if (currentLastMessageRef) {
		observerRef.current.observe(currentLastMessageRef);
	}

	return () => {
		if (observerRef.current && currentLastMessageRef) {
			observerRef.current.unobserve(currentLastMessageRef);
		}
	};
	}, [messages]);
  
  return (
    <div className="chat-container">
		<div className="chat-message-list">
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
		</div>
      <form onSubmit={handleSendMessage} className="message-form">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
		  rows={1}
        />
        <IconButton
          type="submit"
          className="send-button"
          sx={{
            backgroundColor: '#007bff',
            '&:hover': {
              backgroundColor: '#0056b3',
            },
            color: 'white',
            width: '50px',
            height: '50px',
          }}
        >
          <SendIcon style={{ color: 'white' }} />
        </IconButton>
      </form>
    </div>
  );
};

export default ChatView;

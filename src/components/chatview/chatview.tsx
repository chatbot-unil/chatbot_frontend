import React, { useEffect, useState, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { Box, IconButton, TextareaAutosize } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SendIcon from '@mui/icons-material/Send';
import Message, { MessageType, MessageStatus, MessageProps } from '../message/message';
import './chatview.css';
import Fab from '@mui/material/Fab';
import NavigationIcon from '@mui/icons-material/Navigation';

const SERVER_URL = `http://${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('sessionId'));
  const [isLastMessageInView, setIsLastMessageInView] = useState(false);
  const [isReciving, setIsReciving] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const lastMessageRef = useRef<HTMLLIElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
	const socket = io(SERVER_URL)
	socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`Connecté au serveur avec l'ID: ${socket.id}`);
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
      console.log(`Session initialisée avec l'ID: ${data.session_id}`);
    });

    socket.on('session_restored', (data) => {
      localStorage.setItem('sessionId', data.session_id);
      setSessionId(data.session_id);
      setMessages(data.chat_history);
      console.log(`Session restorée avec l'ID: ${data.session_id}`);
    });

    socket.on('response_start', () => {
      console.log('Début de la réponse');
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: MessageType.Bot, content: '', status: MessageStatus.Ongoing },
      ]);
      setIsReciving(true);
    });

    socket.on('response', (message) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.status === MessageStatus.Ongoing ? { ...msg, content: msg.content + message } : msg
        )
      );
    });

    socket.on('response_end', () => {
      console.log('Fin de la réponse');
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.status === MessageStatus.Ongoing ? { ...msg, status: MessageStatus.Finished } : msg
        )
      );
      setIsReciving(false);
    });

    socket.on('disconnect', () => {
      console.log('Déconnecté du serveur');
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

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage(event);
    } else if (event.key === 'Enter' && event.ctrlKey) {
      setNewMessage(prevMessage => prevMessage + '\n');
    }
  }, [handleSendMessage]);

  const scrollToLastMessage = useCallback(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
    <Box className="chat-container">
      <Box className="chat-message-list">
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
      </Box>
	  	{!isLastMessageInView && (
          	<Box className="scroll-button-container">
				<IconButton onClick={scrollToLastMessage} className="scroll-button">
					<ArrowDownwardIcon sx={{ color: 'white' }} />
				</IconButton>
           	</Box>
		)}
      <Box component="form" onSubmit={handleSendMessage} className="message-form">
        <TextareaAutosize
          value={newMessage}
          onKeyDown={handleKeyDown}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
          className="message-input"
          minRows={1}
          maxRows={3}
        />
        <IconButton
          type="submit"
          className={`send-button ${isReciving ? 'receiving' : ''}`}
          disabled={isReciving}
        >
          <SendIcon className="send-icon" />
        </IconButton>
      </Box>
    </Box>
	
  );
};

export default ChatView;
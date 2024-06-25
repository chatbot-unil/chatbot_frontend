// src/components/chatview/ChatManager.ts
import io, { Socket } from 'socket.io-client';
import { MessageProps, MessageType, MessageStatus } from '../message/message';

const SERVER_URL = `http://${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}`;

class ChatManager {
  private static instance: ChatManager;
  private socket: Socket | null = null;
  private sessionId: string | null = localStorage.getItem('sessionId');
  private messages: MessageProps[] = [];
  private callback: ((messages: MessageProps[]) => void) | null = null;

  private constructor() {
    this.initSocket();
  }

  public static getInstance(): ChatManager {
    if (!ChatManager.instance) {
      ChatManager.instance = new ChatManager();
    }
    return ChatManager.instance;
  }

  public setCallback(callback: (messages: MessageProps[]) => void) {
    this.callback = callback;
    this.updateMessages();
  }

  private initSocket() {
    this.socket = io(SERVER_URL);

    this.socket.on('connect', () => {
      console.log(`Connected to server with ID: ${this.socket!.id}`);
      if (this.sessionId) {
        this.socket!.emit('restore_session', { session_id: this.sessionId });
      } else {
        this.socket!.emit('init');
      }
    });

    this.socket.on('session_init', (data) => {
      localStorage.setItem('sessionId', data.session_id);
      this.sessionId = data.session_id;
      this.messages.push({ type: MessageType.Bot, content: data.initial_message });
      this.updateMessages();
      console.log(`Session initialized with ID: ${data.session_id}`);
    });

    this.socket.on('session_restored', (data) => {
      localStorage.setItem('sessionId', data.session_id);
      this.sessionId = data.session_id;
      this.messages = data.chat_history;
      this.updateMessages();
      console.log(`Session restored with ID: ${data.session_id}`);
    });

    this.socket.on('response_start', () => {
      console.log('Response started');
      this.messages.push({ type: MessageType.Bot, content: '', status: MessageStatus.Ongoing });
      this.updateMessages();
    });

    this.socket.on('response', (message) => {
      this.messages = this.messages.map((msg) =>
        msg.status === MessageStatus.Ongoing ? { ...msg, content: msg.content + message } : msg
      );
      this.updateMessages();
    });

    this.socket.on('response_end', () => {
      console.log('Response ended');
      this.messages = this.messages.map((msg) =>
        msg.status === MessageStatus.Ongoing ? { ...msg, status: MessageStatus.Finished } : msg
      );
      this.updateMessages();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
  }

  public sendMessage(content: string) {
    if (this.sessionId) {
      this.socket?.emit('query', { question: content, session_id: this.sessionId });
      this.messages.push({ type: MessageType.User, content });
      this.updateMessages();
    } else {
      console.error('Session ID is not set.');
    }
  }

  public createNewSession() {
    localStorage.removeItem('sessionId');
    this.sessionId = null;
    this.messages = [];
    this.socket?.emit('init');
  }

  private updateMessages() {
    if (this.callback) {
      this.callback(this.messages);
    }
  }

  public disconnect() {
    this.socket?.disconnect();
  }
}

export default ChatManager;

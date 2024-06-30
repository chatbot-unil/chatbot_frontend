// // src/App.tsx
// import { useCallback, useEffect, useState } from "react";
// import { Grid, Box } from "@mui/material";
// import ChatView from "./components/chatview/chatview";
// import Sidebar from "./components/sidebar/sidebar";
// import WelcomeBarComponent from "./components/welcomebar/welcomebar";
// import ChatManager from "./components/chatview/chatmanager";
// import { MessageProps } from "./components/message/message";
// import "./App.css";

// function App() {
//   const [showNavMenu, setShowNavMenu] = useState(false);
//   const [messages, setMessages] = useState<MessageProps[]>([]);
//   const [listSessions, setListSessions] = useState<string[]>([]);
//   const [chatManager] = useState(ChatManager.getInstance());
//   const [activeSession, setActiveSession] = useState<string | null>(null);

//   const handleOpenCloseNavMenu = () => {
//     setShowNavMenu((prev) => !prev);
//   };

//   useEffect(() => {
//     chatManager.setCallback(setMessages);

// 	initApp();

//     return () => {
//       chatManager.disconnect();
//     };
//   }, []);

//   const handleRestoreSession = useCallback((sessionId: string) => {
// 	chatManager.restoreSession(sessionId);
// 	setActiveSession(sessionId);
// 	setShowNavMenu(false);
//   }, []);


//   const handleCreateNewChat = () => {
// 	chatManager.createNewSession();
// 	setShowNavMenu(false);
//   };

//   const initApp = async () => {
// 	const sessions = await chatManager.getUserSessions();
// 	setListSessions(sessions);
// 	setActiveSession(localStorage.getItem('sessionId'));
//   };

//   return (
//     <Box className="App">
//       <WelcomeBarComponent handleOpenCloseNavMenu={handleOpenCloseNavMenu} />
//       <Grid container className="App-container">
//         <Grid
//           item
//           xs={12}
//           sm={12}
//           md={showNavMenu ? 3 : 0}
//           lg={showNavMenu ? 3 : 0}
//           xl={showNavMenu ? 2 : 0}
//           className={`Sidebar ${showNavMenu ? 'show' : 'hide'}`}
//         >
//           <Sidebar listSessions={listSessions} onRestoreSession={handleRestoreSession} onCreateNewChat={handleCreateNewChat} activeSessionId={activeSession} />
//         </Grid>
//         <Grid item xs={12} sm={12} md={showNavMenu ? 9 : 12} lg={showNavMenu ? 9 : 12} xl={showNavMenu ? 10 : 12} className="Chat-container">
//           <ChatView messages={messages} />
//         </Grid>
//       </Grid>
//     </Box>
//   );
// }

// export default App;
import { useCallback, useEffect, useState } from "react";
import { Grid, Box } from "@mui/material";
import ChatView from "./components/chatview/chatview";
import Sidebar from "./components/sidebar/sidebar";
import WelcomeBarComponent from "./components/welcomebar/welcomebar";
import ChatManager from "./components/chatview/chatmanager";
import { MessageProps } from "./components/message/message";
import "./App.css";

function App() {
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [listSessions, setListSessions] = useState<string[]>([]);
  const [chatManager] = useState(ChatManager.getInstance());
  const [activeSession, setActiveSession] = useState<string | null>(() => localStorage.getItem('sessionId'));

  const handleOpenCloseNavMenu = () => {
    setShowNavMenu((prev) => !prev);
  };

  useEffect(() => {
    chatManager.setCallback(setMessages);
    chatManager.setNewSessionCallback((newSessionId) => {
      setActiveSession(newSessionId);
	  localStorage.setItem('sessionId', newSessionId);
	  console.log('New session:', newSessionId);
	  initApp();
    });
    initApp();
    return () => {
      chatManager.disconnect();
    };
  }, [chatManager]);

  const handleRestoreSession = useCallback((sessionId: string) => {
    chatManager.restoreSession(sessionId);
    setActiveSession(sessionId);
    setShowNavMenu(false);
  }, [chatManager]);

  const handleCreateNewChat = useCallback(() => {
    chatManager.createNewSession();
    setShowNavMenu(false);
  }, [chatManager]);

  const initApp = useCallback(async () => {
    try {
      console.log('Initializing app...');
      const sessions = await chatManager.getUserSessions();
      console.log('Fetched sessions:', sessions);
      setListSessions(sessions);

      if (sessions.length > 0) {
        const storedSessionId = localStorage.getItem('sessionId');
        const flattenedSessions = sessions.flat();

        if (storedSessionId && flattenedSessions.includes(storedSessionId)) {
          console.log('Using stored session:', storedSessionId);
          setActiveSession(storedSessionId);
          chatManager.restoreSession(storedSessionId);
        } else {
          console.log('No stored session found, restoring first session:', flattenedSessions[0]);
          setActiveSession(flattenedSessions[0]);
          localStorage.setItem('sessionId', flattenedSessions[0]);
          chatManager.restoreSession(flattenedSessions[0]);
        }
      } else {
        console.log('No sessions found, creating new chat');
        chatManager.createNewSession();
      }
    } catch (error) {
      console.error('Error in initApp:', error);
    }
  }, [chatManager, handleCreateNewChat]);

  return (
    <Box className="App">
      <WelcomeBarComponent handleOpenCloseNavMenu={handleOpenCloseNavMenu} />
      <Grid container className="App-container">
        <Grid
          item
          xs={12}
          sm={12}
          md={showNavMenu ? 3 : 0}
          lg={showNavMenu ? 3 : 0}
          xl={showNavMenu ? 2 : 0}
          className={`Sidebar ${showNavMenu ? 'show' : 'hide'}`}
        >
          <Sidebar
            listSessions={listSessions}
            onRestoreSession={handleRestoreSession}
            onCreateNewChat={handleCreateNewChat}
            activeSessionId={activeSession}
          />
        </Grid>
        <Grid
          item
          xs={12}
          sm={12}
          md={showNavMenu ? 9 : 12}
          lg={showNavMenu ? 9 : 12}
          xl={showNavMenu ? 10 : 12}
          className="Chat-container"
        >
          <ChatView messages={messages} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default App;
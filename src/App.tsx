// src/App.tsx
import { useEffect, useState } from "react";
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

  const handleOpenCloseNavMenu = () => {
    setShowNavMenu((prev) => !prev);
  };

  useEffect(() => {
    const chatManager = ChatManager.getInstance();
    chatManager.setCallback(setMessages);

    return () => {
      chatManager.disconnect();
    };
  }, []);

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
          <Sidebar sideBarState={showNavMenu} setSideBarState={setShowNavMenu} />
        </Grid>
        <Grid item xs={12} sm={12} md={showNavMenu ? 9 : 12} lg={showNavMenu ? 9 : 12} xl={showNavMenu ? 10 : 12} className="Chat-container">
          <ChatView messages={messages} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default App;

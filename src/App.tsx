import React from 'react';
import { Container, Box, CssBaseline, AppBar, Toolbar, Typography, Grid } from '@mui/material';
import ChatView from './components/chatview/chatview';
import './App.css';

function App() {
  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            UNIL Chatbot
          </Typography>
        </Toolbar>
      </AppBar>
	  <Container className="App-header" maxWidth="xl">
	  <CssBaseline />
	  	<ChatView />
	  </Container>
    </div>
  );
}

export default App;

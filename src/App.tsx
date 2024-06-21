import React from "react";
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import ChatView from "./components/chatview/chatview";
import Sidebar from "./components/sidebar/sidebar";
import "./App.css";
import logo from "./assets/UNIL_logo.png";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";

function App() {
	const [showNavMenu, setShowNavMenu] = React.useState(false);

	const handleOpenCloseNavMenu = () => {
		setShowNavMenu(!showNavMenu);
	}
	
  return (
    <Box className="App">
      <AppBar position="sticky" className="AppBar">
        <Toolbar>
			<IconButton
				size="large"
				edge="start"
				color="inherit"
				aria-label="menu"
				sx={{ mr: 2 }}
				onClick={handleOpenCloseNavMenu}
			>
            <MenuIcon />
          </IconButton>
          <img src={logo} alt="UNIL Logo" className="app-logo" />
        </Toolbar>
      </AppBar>
      <Grid container className="App-container">
	  	<Grid
			item
			xs={12}
			sm={showNavMenu ? 4 : 0}
			md={showNavMenu ? 3 : 0}
			lg={showNavMenu ? 3 : 0}
			xl={showNavMenu ? 2 : 0}
			className={`Sidebar ${showNavMenu ? 'show' : 'hide'}`}
		>
			<Sidebar />
		</Grid>
		<Grid item xs={12} sm={showNavMenu ? 8 : 12} md={showNavMenu ? 9 : 12} lg={showNavMenu ? 9 : 12} xl={showNavMenu ? 10 : 12} className="Chat-container">
			<ChatView />
		</Grid>
      </Grid>
    </Box>
  );
}

export default App;

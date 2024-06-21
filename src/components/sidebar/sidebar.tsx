import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import HelpIcon from "@mui/icons-material/Help";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import "./sidebar.css";

function Sidebar() {
	const [newChat, setNewChat] = React.useState(false);
	const [help, setHelp] = React.useState(false);
	const [contact, setContact] = React.useState(false);

	const handleNewChat = () => {
		setNewChat(true);
		alert("Pas encore implémenté");
	}

  return (
    <Box className="sidebar-container">
      <List>
        <ListItemButton onClick={handleNewChat}>
          <ListItemIcon>
            <ChatIcon />
          </ListItemIcon>
          <ListItemText primary="Nouveau Chat" />
        </ListItemButton>
        <ListItemButton>
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText primary="Aide" />
        </ListItemButton>
        <ListItemButton>
          <ListItemIcon>
            <ContactMailIcon />
          </ListItemIcon>
          <ListItemText primary="Nous contacter" />
        </ListItemButton>
      </List>
    </Box>
  );
};

export default Sidebar;

// src/components/sidebar/Sidebar.tsx
import React, { useState } from "react";
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
import ChatManager from "../chatview/chatmanager";
import "./sidebar.css";

interface SidebarProps {
	sideBarState: boolean;
	setSideBarState: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ sideBarState, setSideBarState }) => {
  const handleNewChat = () => {
    ChatManager.getInstance().createNewSession();
	setSideBarState(false);
  };

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

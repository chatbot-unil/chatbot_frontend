// src/components/sidebar/Sidebar.tsx
import React, { useEffect, useState } from "react";
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

interface SidebarProps {
	listSessions: string[];
	onCreateNewChat: () => void;
	onRestoreSession: (sessionId: string) => void;
	activeSessionId: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ listSessions, onRestoreSession, onCreateNewChat, activeSessionId }) => {
  return (
    <Box className="sidebar-container">
      	<List className="new-session-button">
			<ListItemButton onClick={onCreateNewChat}>
			<ListItemIcon>
				<ChatIcon />
			</ListItemIcon>
			<ListItemText primary="Nouveau Chat" />
        </ListItemButton>
	  	</List>
		<List className="sessions-list">
			{listSessions.flat().map((sessionId) => (
				<ListItemButton 
					key={sessionId}
					className={`session-item ${sessionId === activeSessionId ? 'active-session' : ''}`}
					onClick={() => onRestoreSession(sessionId)}
				>
					<ListItemIcon>
						<ChatIcon />
					</ListItemIcon>
					<ListItemText primary={`Session ${sessionId}`} />
				</ListItemButton>
			))}
		</List>
		<List className="fixed-bottom">
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

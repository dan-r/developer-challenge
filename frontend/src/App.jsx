import * as React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import FlightTakeoff from '@mui/icons-material/FlightTakeoff';
import Home from './Home';
import Flight from './Flight';
import { Link } from 'react-router-dom';
import "./App.css";
import { Container } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './includes/Theme';
import io from "socket.io-client";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

function App(props) {
  const [alert, setAlert] = useState({
    open: false
  });

  const [event, setEvent] = useState({});
  const [admin, setAdmin] = useState(false);

  function adminEnable() {
    setAdmin(true);
  }
  function adminDisable() {
    setAdmin(false);
  }

  useEffect(() => {
    const socket = io("ws://localhost:4000");

    socket.on("connect", () => {
      console.log("Connected to the Socket.IO server");
    });

    socket.on("blockchainEvent", (data) => {
      console.log("Received blockchain event:", data);
      setEvent(data);
      if (data.name === "FlightChanged") {
        setAlert({ open: true, message: `Flight ${data.data.flightNumber} changed` });
      }
      else if (data.name === "FlightAdded") {
        setAlert({ open: true, message: `Flight ${data.data.flightNumber} added` })
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from the Socket.IO server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Link to="/" style={{
                color: 'white',
                textDecoration: 'none',
                fontSize: '1.25rem',
                fontWeight: 400,
                flexGrow: 1,
              }}>
                <FlightTakeoff /> &nbsp;FireFly Air
              </Link>
              {admin ? <Button color="inherit" onClick={adminDisable}>User</Button> : <Button color="inherit" onClick={adminEnable}>Administrator</Button>}
            </Toolbar>
          </AppBar>
        </Box>
        <Container maxWidth="lg">
          <Routes>
            <Route path="/" element={<Home admin={admin} event={event} />} />
            <Route path="/flight/:id" element={<Flight admin={admin} />} />
          </Routes>
        </Container>
      </BrowserRouter>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={alert.open}
        onClose={() => { setAlert({ open: false }) }}
        autoHideDuration={3000}
        key={"alert"}
      >
        <Alert
          onClose={() => { setAlert({ open: false }) }}
          severity="info"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;

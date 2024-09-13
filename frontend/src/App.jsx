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
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

function App(props) {
  const [alert, setAlert] = useState({
    open: false
  });

  const [flightEvent, setFlightEvent] = useState({});
  const [seatEvent, setSeatEvent] = useState({});
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
      if (data.name === "FlightChanged") {
        setAlert({ open: true, message: `Flight ${data.data.flightNumber} changed` });
        setFlightEvent(data);
      }
      else if (data.name === "FlightAdded") {
        setAlert({ open: true, message: `Flight ${data.data.flightNumber} added` })
        setFlightEvent(data);
      } else if (data.name === "SeatChanged") {
        setAlert({ open: true, message: `Seat booking changed for ${data.data.flightNumber}` })
        setSeatEvent(data);
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
            <Route path="/" element={<Home admin={admin} flightEvent={flightEvent} />} />
            <Route path="/flight/:id" element={<Flight admin={admin} flightEvent={flightEvent} seatEvent={seatEvent} />} />
          </Routes>
          <Divider sx={{ margin: '20px 0 5px' }} />
          <Typography color="textSecondary" variant="subtitle1">
            {`© ${new Date().getFullYear()}`}
          </Typography>
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

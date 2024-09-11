import * as React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import { useState } from 'react';
import FlightTakeoff from '@mui/icons-material/FlightTakeoff';
import Home from './Home';
import Flight from './Flight';
import { Link } from 'react-router-dom';
import "./App.css";
import { Container } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './includes/Theme';

function App(props) {
  const [admin, setAdmin] = useState(false);

  function adminEnable() {
    setAdmin(true);
  }
  function adminDisable() {
    setAdmin(false);
  }

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
            <Route path="/" element={<Home admin={admin} />} />
            <Route path="/flight/:id" element={<Flight admin={admin} />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

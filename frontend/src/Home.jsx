
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { FlightTakeoff } from '@mui/icons-material';
import "./App.css";
import { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import NewFlight from "./components/NewFlight";
import { flightStatuses } from "./includes/const";

function Home(props) {
  const [data, setData] = useState([])


  const refresh = () => {
    axios.get(`/api/flights`)
      .then(response => {
        setData(response.data)
      })
      .catch(console.error);
  }


  useEffect(() => {
    refresh();
  }, [props.flightEvent]);

  return (
    <>
      <Typography variant="h5" gutterBottom style={{ marginTop: "1em" }}>
        <FlightTakeoff /> Welcome to FireFly Air
      </Typography>
      <Divider sx={{ margin: '10px 0' }} />
      {props.admin ? <p>You are logged in as an Administrator so can create and edit flights.</p> : <p>From here you can track flights operated by FireFly Air and our partners.</p>}

      {props.admin ? <NewFlight /> : <></>}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Departure Time</TableCell>
              <TableCell>Flight Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Origin</TableCell>
              <TableCell>Destination</TableCell>
              <TableCell>Plane</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {new Date(row.departureTime * 1000).toLocaleString()}
                </TableCell>
                <TableCell><Link to={"/flight/" + row.id}>{row.flightNumber}</Link></TableCell>
                <TableCell>{flightStatuses[row.status]}</TableCell>
                <TableCell>{row.origin}</TableCell>
                <TableCell>{row.destination}</TableCell>
                <TableCell>{row.planeType}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default Home;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, Typography, Box, Chip, CircularProgress, TextField, Button, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DoneIcon from '@mui/icons-material/Done';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorIcon from '@mui/icons-material/Error';
import FlightIcon from '@mui/icons-material/Flight';
import dayjs from 'dayjs';
import { flightStatuses } from './includes/const';
import SeatMap from "./components/SeatMap";

const FlightStatusChip = ({ status }) => {
  let icon, color;

  switch (status) {
    case 'On Time':
      icon = <DoneIcon />;
      color = 'success';
      break;
    case 'Boarding':
    case 'Gate Closed':
    case 'Departed':
    case 'Landed':
      icon = <ScheduleIcon />;
      color = 'primary';
      break;
    case 'Delayed':
      icon = <ScheduleIcon />;
      color = 'warning';
      break;
    case 'Cancelled':
      icon = <CancelIcon />;
      color = 'error';
      break;
    default:
      icon = <AccessTimeIcon />;
      color = 'default';
  }

  return <Chip icon={icon} label={status} color={color} />;
};

const Flight = ({ admin, flightEvent, seatEvent }) => {
  const { id } = useParams(); // Flight id from the URL
  const navigate = useNavigate();
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState(null); // State for editable form data
  const [loadingAction, setLoadingAction] = useState(false); // Track if waiting for API
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchFlightData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/flight/${id}`);
        setFlightData(response.data);
        
        if (response.data.origin === "") {
          throw new Error('Flight not found.');
        }

        setFormData({
          flightNumber: response.data.flightNumber,
          origin: response.data.origin,
          destination: response.data.destination,
          departureTime: dayjs.unix(response.data.departureTime).format('YYYY-MM-DDTHH:mm'),
          arrivalTime: dayjs.unix(response.data.arrivalTime).format('YYYY-MM-DDTHH:mm'),
          planeType: response.data.planeType,
          status: response.data.status.toString(),
        });
      } catch (error) {
        setError('Flight not found');

        // Redirect to homepage after 2s
        setTimeout(() => {
          navigate('/');
          }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchFlightData();
  }, [id, flightEvent, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setLoadingAction(true);
    try {
      const updatedData = {
        flightNumber: formData.flightNumber,
        origin: formData.origin,
        destination: formData.destination,
        departureTime: dayjs(formData.departureTime).unix(),
        arrivalTime: dayjs(formData.arrivalTime).unix(),
        planeType: formData.planeType,
        status: parseInt(formData.status, 10),
      };
      await axios.put(`/api/flight/${id}`, updatedData);
      setAlert({ type: 'success', message: 'Flight updated successfully!' });
    } catch (error) {
      console.error('Error updating flight:', error);
      setAlert({ type: 'error', message: 'Failed to update flight data.' });
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle flight deletion
  const handleDelete = async () => {
    setLoadingAction(true);
    try {
      await axios.delete(`/api/flight/${id}`);
      setAlert({ type: 'success', message: 'Flight deleted successfully!' });

      // Redirect to homepage after 2s
      setTimeout(() => {
        navigate('/');
        setLoadingAction(false);
      }, 2000);
    } catch (error) {
      console.error('Error deleting flight:', error);
      setAlert({ type: 'error', message: 'Failed to delete flight data.' });
      setLoadingAction(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error">
          <ErrorIcon fontSize="large" /> {error}
        </Typography>
      </Box>
    );
  }

  if (!flightData || !formData) {
    return null;
  }

  const isEditable = admin;

  return (
    <Box sx={{ p: 2 }}>
      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        Flight Tracking - {flightData.flightNumber}
      </Typography>

      <Card sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {isEditable ? (
                <TextField
                  label="Flight Number"
                  name="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleChange}
                  fullWidth
                />
              ) : (
                <Typography variant="h6" gutterBottom>
                  Flight Number: {flightData.flightNumber}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              {isEditable ? (
                <TextField
                  label="Origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  fullWidth
                />
              ) : (
                <Typography variant="h6" gutterBottom>
                  <FlightTakeoffIcon fontSize="small" /> Origin: {flightData.origin}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              {isEditable ? (
                <TextField
                  label="Destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  fullWidth
                />
              ) : (
                <Typography variant="h6" gutterBottom>
                  <FlightLandIcon fontSize="small" /> Destination: {flightData.destination}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              {isEditable ? (
                <TextField
                  label="Plane Type"
                  name="planeType"
                  value={formData.planeType}
                  onChange={handleChange}
                  fullWidth
                />
              ) : (
                <Typography variant="body1">
                  <FlightIcon fontSize="small" /> Plane Type: {flightData.planeType}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              {isEditable ? (
                <TextField
                  label="Departure Time"
                  name="departureTime"
                  type="datetime-local"
                  value={formData.departureTime}
                  onChange={handleChange}
                  fullWidth
                />
              ) : (
                <Typography variant="body1">
                  <AccessTimeIcon fontSize="small" /> Departure Time: {dayjs.unix(flightData.departureTime).format('DD MMM YYYY, HH:mm A')}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              {isEditable ? (
                <TextField
                  label="Arrival Time"
                  name="arrivalTime"
                  type="datetime-local"
                  value={formData.arrivalTime}
                  onChange={handleChange}
                  fullWidth
                />
              ) : (
                <Typography variant="body1">
                  <AccessTimeIcon fontSize="small" /> Arrival Time: {dayjs.unix(flightData.arrivalTime).format('DD MMM YYYY, HH:mm A')}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              {isEditable ? (
                <TextField
                  label="Flight Status"
                  name="status"
                  select
                  SelectProps={{ native: true }}
                  value={formData.status}
                  onChange={handleChange}
                  fullWidth
                >
                  {flightStatuses.map((status, index) => (
                    <option key={index} value={index}>
                      {status}
                    </option>
                  ))}
                </TextField>
              ) : (
                <Typography variant="body1">
                  Flight Status: <FlightStatusChip status={flightStatuses[flightData.status]} />
                </Typography>
              )}
            </Grid>

            {isEditable && (
              <>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    fullWidth
                    disabled={loadingAction}
                  >
                    Update Flight
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDelete}
                    fullWidth
                    disabled={loadingAction}
                  >
                    Delete Flight
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>
      <SeatMap flightId={id} seatEvent={seatEvent} admin={admin} />
    </Box>
  );
};

export default Flight;

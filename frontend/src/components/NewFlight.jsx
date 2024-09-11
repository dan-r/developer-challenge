import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import axios from 'axios';
import 'dayjs/locale/en-gb';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';

const NewFlight = (props) => {
    const [formValues, setFormValues] = useState({
        flightNumber: 'EZY1234',
        origin: 'LHR',
        destination: 'GRZ',
        planeType: "B744",
        departureTime: null,
        arrivalTime: null,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [success, setSuccess] = useState(false);

    const setAccordion = (e, value) => {
        setExpanded(value);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const handleTimeChange = (name, value) => {
        setFormValues({ ...formValues, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { flightNumber, origin, destination, departureTime, arrivalTime, planeType } = formValues;

        const flightNumberRegex = /^[A-Z]{3}\d{1,4}$/;
        const airportCodeRegex = /^[A-Z]{3}$/;

        if (!flightNumberRegex.test(flightNumber)) {
            alert('Flight number must be in the format XXX1234');
            return;
        }

        if (!airportCodeRegex.test(origin) || !airportCodeRegex.test(destination)) {
            alert('Origin and destination must be valid 3-letter airport codes.');
            return;
        }

        // Convert times to Unix timestamps
        const departureTimestamp = dayjs(departureTime).unix();
        const arrivalTimestamp = dayjs(arrivalTime).unix();

        const payload = {
            flightNumber,
            origin,
            destination,
            departureTime: departureTimestamp,
            arrivalTime: arrivalTimestamp,
            planeType
        };

        console.log('Form Payload:', payload);

        try {
            setIsLoading(true);

            const response = await axios.post('/api/flight', payload);
            console.log('API Response:', response.data);

            setExpanded(false);
            setSuccess(true);
        } catch (error) {
            console.error('API Error:', error);
            alert('There was an error submitting the form.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {success ?
                <Alert icon={<CheckIcon fontSize="inherit" />} severity="success" style={{ marginBottom: "1em" }}>
                    Flight added successfully.
                </Alert> : <></>}
            <Accordion expanded={expanded} onChange={setAccordion} style={{ marginBottom: "1em" }}>
                <AccordionSummary
                    expandIcon={<ArrowDropDownIcon />}
                    aria-controls="panel2-content"
                    id="panel2-header"
                >
                    <Typography>New Flight</Typography>
                </AccordionSummary>
                <AccordionDetails>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={2}>
                                <TextField
                                    label="Flight Number"
                                    name="flightNumber"
                                    value={formValues.flightNumber}
                                    onChange={handleChange}
                                    placeholder="XXX1234"
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={1}>
                                <TextField
                                    label="Origin"
                                    name="origin"
                                    value={formValues.origin}
                                    onChange={handleChange}
                                    placeholder="LHR"
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={2}>
                                <TextField
                                    label="Destination"
                                    name="destination"
                                    value={formValues.destination}
                                    onChange={handleChange}
                                    placeholder="JFK"
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={1}>
                                <TextField
                                    label="Plane"
                                    name="planeType"
                                    value={formValues.planeType}
                                    onChange={handleChange}
                                    placeholder="B744"
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                                    <DateTimePicker
                                        label="Departure Time"
                                        value={formValues.departureTime}
                                        onChange={(newValue) => handleTimeChange('departureTime', newValue)}
                                        renderInput={(params) => <TextField {...params} fullWidth required />}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={3}>
                                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                                    <DateTimePicker
                                        label="Arrival Time"
                                        value={formValues.arrivalTime}
                                        onChange={(newValue) => handleTimeChange('arrivalTime', newValue)}
                                        renderInput={(params) => <TextField {...params} fullWidth required />}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" color="primary" type="submit" disabled={isLoading}>
                                    {isLoading ? 'Submitting...' : 'Submit'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </AccordionDetails>
            </Accordion>
        </>
    );
};

export default NewFlight;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Grid, Typography, Button, Box, Alert } from "@mui/material";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';

// Convert rows and cols to alphanumeric seat (eg. 0-0 = 1A)
const getSeatLabel = (row, column) => {
    const columnLabel = String.fromCharCode(65 + column);
    return `${row + 1}${columnLabel}`;
};

const SeatBooking = ({ flightId, seatEvent, admin }) => {
    const [seats, setSeats] = useState([]);
    const [seatNames, setSeatNames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    // Fetch seat availability
    useEffect(() => {
        const fetchSeats = async () => {
            try {
                const response = await axios.get(`/api/flight/${flightId}/seats`);
                setSeats(response.data.output);
            } catch (error) {
                console.error("Error fetching seat data", error);
            }

            if (admin) {
                try {
                    const response = await axios.get(`/api/flight/${flightId}/seatnames`);
                    setSeatNames(response.data.output);
                } catch (error) {
                    console.error("Error fetching seat data", error);
                }

            } else {
                setSeatNames([]);
            }
            setLoading(false);
        };
        fetchSeats();
    }, [flightId, seatEvent, admin]);

    // Handle clicks
    const handleSeatClick = async (row, column, isBooked) => {
        const seatLabel = getSeatLabel(row, column);
        var passengerName;
        if (isBooked && admin) {
            passengerName = seatNames[row][column];
        } else {
            passengerName = window.prompt(
                isBooked
                    ? `Enter the passenger's name to cancel the booking for seat ${seatLabel}`
                    : `Enter the passenger's name to book seat ${seatLabel}`
            );
        }


        if (!passengerName) return;

        try {
            if (isBooked) {
                // Delete
                await axios.delete(`/api/flight/${flightId}/seats`, {
                    data: { row, column, passengerName },
                });
                setAlert({ type: 'success', message: `Booking for seat ${seatLabel} cancelled!` });
            } else {
                // Book
                await axios.post(`/api/flight/${flightId}/seats`, {
                    row,
                    column,
                    passengerName,
                });
                setAlert({ type: 'success', message: `Seat ${seatLabel} booked for ${passengerName}!` });
            }
        } catch (error) {
            console.error(error);
            if (isBooked) {
                setAlert({ type: 'error', message: 'Error occurred cancelling seat. Please check your name and try again.' });
            } else {
                setAlert({ type: 'error', message: 'Error occurred booking seat.' });
            }
        }
    };

    if (loading) {
        return <></>;
    }

    return (
        <>
            <Card variant="outlined" sx={{ maxWidth: 900, width: '100%', mx: 'auto', my: 4, p: 2 }} style={{ marginBottom: 0 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Seat Map
                    </Typography>
                    {alert && (
                        <Alert severity={alert.type} sx={{ mb: 2 }}>
                            {alert.message}
                        </Alert>
                    )}
                    <Box>
                        {seats.map((rowSeats, rowIndex) => {
                            const numberOfColumns = rowSeats.length;
                            const aisleIndex = Math.floor(numberOfColumns / 2);

                            return (
                                <Grid
                                    container
                                    spacing={1}
                                    key={rowIndex}
                                    alignItems="center"
                                    sx={{
                                        justifyContent: 'center',
                                        gap: '5px',
                                        display: 'flex',
                                        marginBottom: "0.1em",
                                        flexDirection: 'row',
                                    }}
                                >
                                    {rowSeats.map((isBooked, columnIndex) => (
                                        <React.Fragment key={columnIndex}>
                                            {/* Add invisible button for aisle gap */}
                                            {columnIndex === aisleIndex ? (
                                                <Grid item>
                                                    <Button
                                                        variant="contained"
                                                        sx={{ width: '16px', height: '40px', visibility: 'hidden' }}
                                                    />
                                                </Grid>
                                            ) : null}
                                            <Grid item>
                                                <Button
                                                    data-tooltip-id="tooltip"
                                                    data-tooltip-content={isBooked && admin && seatNames.length > 0 ? seatNames[rowIndex][columnIndex] : undefined}
                                                    variant="contained"
                                                    color={isBooked ? "secondary" : "primary"}
                                                    onClick={() =>
                                                        handleSeatClick(rowIndex, columnIndex, isBooked)
                                                    }
                                                    sx={{ width: '40px', height: '40px', fontSize: '13px' }}
                                                >
                                                    {getSeatLabel(rowIndex, columnIndex)}
                                                </Button>
                                            </Grid>
                                        </React.Fragment>
                                    ))}
                                </Grid>
                            );
                        })}
                    </Box>
                </CardContent>
            </Card>
            <Tooltip id="tooltip" />
        </>
    );
};

export default SeatBooking;

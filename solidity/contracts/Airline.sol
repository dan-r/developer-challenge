// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

contract Airline {
    struct Flight {
        string flightNumber;
        FlightStatus status;
        string origin;
        string destination;
        uint256 departureTime; // Unix timestamp
        uint256 arrivalTime; // Unix timestamp
        string planeType;
        address owner;
        mapping(uint256 => mapping(uint256 => string)) seatBookings; // Row > Column > Name
        uint256 rows;
        uint256 columns;
    }

    enum FlightStatus {
        OnTime,
        Boarding,
        GateClosed,
        Departed,
        Landed,
        Delayed,
        Cancelled
    }

    // Mapping from flight ID to Flight details
    mapping(uint256 => Flight) private flights;

    // Array to store all flight IDs
    uint256[] private flightIds;

    // Counter for generating unique flight IDs
    uint256 private flightIdCounter;

    // Aircraft seat configs
    struct PlaneTypeConfig {
        uint256 rows;
        uint256 columns;
    }

    mapping(string => PlaneTypeConfig) private planeTypeConfigs;

    // Flight change events
    event FlightAdded(
        uint256 flightId,
        string flightNumber,
        string origin,
        string destination
    );
    event FlightChanged(
        uint256 flightId,
        string flightNumber,
        string origin,
        string destination
    );

    // Seat change event. Seat changes do not trigger FlightChanged
    event SeatChanged(
        uint256 flightId,
        string flightNumber,
        uint256 row,
        uint256 column,
        string passengerName
    );

    constructor() {
        planeTypeConfigs["B738"] = PlaneTypeConfig({rows: 30, columns: 6}); // Boeing 737-800
        planeTypeConfigs["B772"] = PlaneTypeConfig({rows: 40, columns: 10}); // Boeing 777-200
        planeTypeConfigs["A320"] = PlaneTypeConfig({rows: 30, columns: 6}); // Airbus A320
        planeTypeConfigs["A332"] = PlaneTypeConfig({rows: 40, columns: 8}); // Airbus A330
        planeTypeConfigs["B744"] = PlaneTypeConfig({rows: 60, columns: 6}); // Boeing 747-400
        planeTypeConfigs["E195"] = PlaneTypeConfig({rows: 32, columns: 4}); // Embraer E195
        planeTypeConfigs["B789"] = PlaneTypeConfig({rows: 30, columns: 9}); // Boeing 787-9
        planeTypeConfigs["A321"] = PlaneTypeConfig({rows: 30, columns: 6}); // Airbus A321
    }

    // Function to add a new flight
    function addFlight(
        string memory flightNumber,
        string memory origin,
        string memory destination,
        uint256 departureTime,
        uint256 arrivalTime,
        string memory planeType
    ) public returns (uint256) {
        // Ensure valid departure and arrival times
        require(
            departureTime < arrivalTime,
            "Departure time must be before arrival time"
        );

        // Ensure plane type is valid
        require(planeTypeConfigs[planeType].rows != 0, "Invalid plane type");

        // Generate a new flight ID
        uint256 flightId = flightIdCounter;
        flightIdCounter++;

        // Add the flight to the mapping
        Flight storage flight = flights[flightId];
        flight.flightNumber = flightNumber;
        flight.status = FlightStatus.OnTime;
        flight.origin = origin;
        flight.destination = destination;
        flight.departureTime = departureTime;
        flight.arrivalTime = arrivalTime;
        flight.planeType = planeType;
        flight.owner = msg.sender;

        // Set the seat configuration based on the plane type
        flight.rows = planeTypeConfigs[planeType].rows;
        flight.columns = planeTypeConfigs[planeType].columns;

        // Add the flight ID to the array
        flightIds.push(flightId);

        // Emit an event for the new flight
        emit FlightAdded(flightId, flightNumber, origin, destination);

        return flightId;
    }

    // Function to get flight details by ID
    function getFlight(
        uint256 flightId
    )
        public
        view
        returns (
            uint256 id,
            string memory flightNumber,
            uint16 status,
            string memory origin,
            string memory destination,
            uint256 departureTime,
            uint256 arrivalTime,
            string memory planeType
        )
    {
        Flight storage flight = flights[flightId];
        return (
            flightId,
            flight.flightNumber,
            uint16(flight.status),
            flight.origin,
            flight.destination,
            flight.departureTime,
            flight.arrivalTime,
            flight.planeType
        );
    }

    // Function to get all flight IDs
    function getAllFlightIds() public view returns (uint256[] memory) {
        return flightIds;
    }

    // Function to update flight details
    function updateFlight(
        uint256 flightId,
        string memory flightNumber,
        string memory origin,
        string memory destination,
        uint256 departureTime,
        uint256 arrivalTime,
        FlightStatus status,
        string memory planeType
    ) public {
        // Fetch the flight by ID
        Flight storage flight = flights[flightId];

        require(
            msg.sender == flight.owner,
            "Only the owning airline can update the flight"
        );

        // Ensure valid departure and arrival times
        require(
            departureTime < arrivalTime,
            "Departure time must be before arrival time"
        );

        // Ensure the plane type is valid
        require(planeTypeConfigs[planeType].rows != 0, "Invalid plane type");

        // Update the flight details
        flight.flightNumber = flightNumber;
        flight.origin = origin;
        flight.destination = destination;
        flight.departureTime = departureTime;
        flight.arrivalTime = arrivalTime;
        flight.status = status;
        flight.planeType = planeType;

        // Update the seat configuration based on the new plane type
        flight.rows = planeTypeConfigs[planeType].rows;
        flight.columns = planeTypeConfigs[planeType].columns;

        // Emit an event for the changed flight
        emit FlightChanged(flightId, flightNumber, origin, destination);
    }

    // Get booked seats - available publically
    function getSeatAvailability(
        uint256 flightId
    ) public view returns (bool[][] memory) {
        Flight storage flight = flights[flightId];

        bool[][] memory seatAvailability = new bool[][](flight.rows);

        for (uint256 row = 0; row < flight.rows; row++) {
            seatAvailability[row] = new bool[](flight.columns);
            for (uint256 column = 0; column < flight.columns; column++) {
                if (bytes(flight.seatBookings[row][column]).length != 0) {
                    seatAvailability[row][column] = true; // booked
                } else {
                    seatAvailability[row][column] = false; // available
                }
            }
        }

        return seatAvailability;
    }

    // Get booked seats with passenger names - private
    function getSeatPassengerNames(
        uint256 flightId
    ) public view returns (string[][] memory) {
        Flight storage flight = flights[flightId];

        require(
            msg.sender == flight.owner,
            "Only the owning airline can view passenger names"
        );

        string[][] memory seatPassengers = new string[][](flight.rows);

        for (uint256 row = 0; row < flight.rows; row++) {
            seatPassengers[row] = new string[](flight.columns);
            for (uint256 column = 0; column < flight.columns; column++) {
                seatPassengers[row][column] = flight.seatBookings[row][column];
            }
        }

        return seatPassengers;
    }

    // Book a seat
    function bookSeat(
        uint256 flightId,
        uint256 row,
        uint256 column,
        string memory passengerName
    ) public {
        Flight storage flight = flights[flightId];

        require(
            msg.sender == flight.owner,
            "Only the owning airline can book seats"
        );
        require(
            flight.status == FlightStatus.OnTime,
            "Flight status must be On Time to book seats"
        );
        require(row >= 0 && row < flight.rows, "Invalid row");
        require(column >= 0 && column < flight.columns, "Invalid column");
        require(
            bytes(flight.seatBookings[row][column]).length == 0,
            "Seat already booked"
        );

        flight.seatBookings[row][column] = passengerName;

        emit SeatChanged(
            flightId,
            flight.flightNumber,
            row,
            column,
            passengerName
        );
    }

    // Function to cancel a seat booking
    function cancelSeat(
        uint256 flightId,
        uint256 row,
        uint256 column,
        string memory passengerName
    ) public {
        Flight storage flight = flights[flightId];

        require(
            msg.sender == flight.owner,
            "Only the owning airline can cancel seat bookings"
        );
        require(
            flight.status == FlightStatus.OnTime,
            "Flight status must be On Time to cancel seats"
        );
        require(row >= 0 && row < flight.rows, "Invalid row");
        require(column >= 0 && column < flight.columns, "Invalid column");
        require(
            keccak256(abi.encodePacked(flight.seatBookings[row][column])) ==
                keccak256(abi.encodePacked(passengerName)),
            "You do not own this booking"
        );

        delete flight.seatBookings[row][column];

        emit SeatChanged(
            flightId,
            flight.flightNumber,
            row,
            column,
            passengerName
        );
    }

    // Function to delete a flight
    function deleteFlight(uint256 flightId) public {
        // Check if the flight exists
        require(flights[flightId].departureTime != 0, "Flight does not exist");

        require(
            msg.sender == flights[flightId].owner,
            "Only the owning airline can delete a flight"
        );

        // Emit before deleting
        emit FlightChanged(flightId, flights[flightId].flightNumber, flights[flightId].origin, flights[flightId].destination);

        // Remove the flight from the mapping
        delete flights[flightId];

        // Remove the flight ID from the array
        for (uint256 i = 0; i < flightIds.length; i++) {
            if (flightIds[i] == flightId) {
                // Swap with the last element and remove the last element
                flightIds[i] = flightIds[flightIds.length - 1];
                flightIds.pop();
                break;
            }
        }
    }
}

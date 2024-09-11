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

    // Event that is emitted when a flight is added
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

        // Generate a new flight ID
        uint256 flightId = flightIdCounter;
        flightIdCounter++;

        // Add the flight to the mapping
        flights[flightId] = Flight({
            flightNumber: flightNumber,
            status: FlightStatus.OnTime,
            origin: origin,
            destination: destination,
            departureTime: departureTime,
            arrivalTime: arrivalTime,
            planeType: planeType
        });

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
        Flight memory flight = flights[flightId];
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

        // Ensure valid departure and arrival times
        require(
            departureTime < arrivalTime,
            "Departure time must be before arrival time"
        );

        // Update the flight details
        flight.flightNumber = flightNumber;
        flight.origin = origin;
        flight.destination = destination;
        flight.departureTime = departureTime;
        flight.arrivalTime = arrivalTime;
        flight.status = status;
        flight.planeType = planeType;

        // Emit an event for the changed flight
        emit FlightChanged(flightId, flightNumber, origin, destination);
    }

    // Function to delete a flight
    function deleteFlight(uint256 flightId) public {
        // Check if the flight exists
        require(flights[flightId].departureTime != 0, "Flight does not exist");

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

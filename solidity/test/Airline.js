const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Airline contract", function () {
    let Airline, airline, owner, addr1, addr2;

    beforeEach(async function () {
        Airline = await ethers.getContractFactory("Airline");
        [owner, addr1, addr2] = await ethers.getSigners();
        airline = await Airline.deploy();

        await airline.deployed();
    });

    it("Should add a flight", async function () {
        const tx = await airline.addFlight(
            "FFA0001",
            "LHR",
            "RDU",
            Math.floor(Date.now() / 1000) + 3600,
            Math.floor(Date.now() / 1000) + 7200,
            "B772"
        );

        const flightId = await tx.wait();
        const flightDetails = await airline.getFlight(flightId.events[0].args.flightId);

        expect(flightDetails.flightNumber).to.equal("FFA0001");
        expect(flightDetails.origin).to.equal("LHR");
        expect(flightDetails.destination).to.equal("RDU");
        expect(flightDetails.planeType).to.equal("B772");
    });

    it("Should fail to add a flight with invalid plane", async function () {
        await expect(airline.addFlight(
            "FFA0001",
            "LHR",
            "RDU",
            Math.floor(Date.now() / 1000) + 3600,
            Math.floor(Date.now() / 1000) + 7200,
            "D4N"
        )).to.be.revertedWith("Invalid plane type");
    });

    it("Should fail to add a flight with invalid times", async function () {
        await expect(airline.addFlight(
            "FFA0001",
            "LHR",
            "RDU",
            Math.floor(Date.now() / 1000) + 7200,  // Arrival before departure
            Math.floor(Date.now() / 1000) + 3600,
            "B772"
        )).to.be.revertedWith("Departure time must be before arrival time");
    });

    it("Should update a flight", async function () {
        const tx = await airline.addFlight(
            "FFA0001",
            "LHR",
            "RDU",
            Math.floor(Date.now() / 1000) + 3600,
            Math.floor(Date.now() / 1000) + 7200,
            "B772"
        );
        const flightId = await tx.wait();

        await airline.updateFlight(
            flightId.events[0].args.flightId,
            "FFA0001",
            "LHR",
            "RDU",
            Math.floor(Date.now() / 1000) + 3600,
            Math.floor(Date.now() / 1000) + 7200,
            1, // Status changed
            "B772"
        );

        const updatedFlight = await airline.getFlight(flightId.events[0].args.flightId);
        expect(updatedFlight.status).to.equal(1);
    });

    it("Should only allow the owner to update the flight", async function () {
        const tx = await airline.addFlight(
            "FFA0001",
            "LHR",
            "RDU",
            Math.floor(Date.now() / 1000) + 3600,
            Math.floor(Date.now() / 1000) + 7200,
            "B772"
        );
        const flightId = await tx.wait();

        await expect(airline.connect(addr1).updateFlight(
            flightId.events[0].args.flightId,
            "FFA0001",
            "LHR",
            "RDU",
            Math.floor(Date.now() / 1000) + 3600,
            Math.floor(Date.now() / 1000) + 7200,
            1,
            "B772"
        )).to.be.revertedWith("Only the owning airline can update the flight");
    });

    it("Should only allow the owner to see passenger names", async function () {
        const tx = await airline.addFlight(
            "FFA0001",
            "LHR",
            "RDU",
            Math.floor(Date.now() / 1000) + 3600,
            Math.floor(Date.now() / 1000) + 7200,
            "B772"
        );
        const flightId = await tx.wait();

        await expect(airline.connect(addr1).getSeatPassengerNames(
            flightId.events[0].args.flightId)
        ).to.be.revertedWith("Only the owning airline can view passenger names");
    });

    it("Should book a seat", async function () {
        const tx = await airline.addFlight(
            "FFA0001",
            "LHR",
            "RDU",
            Math.floor(Date.now() / 1000) + 3600,
            Math.floor(Date.now() / 1000) + 7200,
            "B744"
        );
        const flightId = await tx.wait();

        await airline.bookSeat(flightId.events[0].args.flightId, 1, 1, "Dan");

        const seats = await airline.getSeatAvailability(flightId.events[0].args.flightId);
        expect(seats[1][1]).to.be.true; // Seat should be booked
    });

    it("Should fail to book a seat if it's already booked", async function () {
        const tx = await airline.addFlight(
            "FFA0001",
            "LHR",
            "RDU",
            Math.floor(Date.now() / 1000) + 3600,
            Math.floor(Date.now() / 1000) + 7200,
            "B744"
        );
        const flightId = await tx.wait();

        await airline.bookSeat(flightId.events[0].args.flightId, 1, 1, "Bill");

        // Attempt to book the same seat again
        await expect(
            airline.bookSeat(flightId.events[0].args.flightId, 1, 1, "Bob")
        ).to.be.revertedWith("Seat already booked");
    });

    it("Should fail to book a seat if flight has departed", async function () {
        const tx = await airline.addFlight(
            "FFA0001",
            "LHR",
            "RDU",
            Math.floor(Date.now() / 1000) + 3600,
            Math.floor(Date.now() / 1000) + 7200,
            "B744"
        );
        const flightId = await tx.wait();

        await airline.updateFlight(
            flightId.events[0].args.flightId,
            "FFA0001",
            "LHR",
            "RDU",
            Math.floor(Date.now() / 1000) + 3600,
            Math.floor(Date.now() / 1000) + 7200,
            3,
            "B744"
        );

        await expect(
            airline.bookSeat(flightId.events[0].args.flightId, 1, 1, "Dan")
        ).to.be.revertedWith("Flight status must be On Time to book seats");
    });

    it("Should cancel a seat", async function () {
        const tx = await airline.addFlight(
            "FFA0001",
            "LHR",
            "RDU",
            Math.floor(Date.now() / 1000) + 3600,
            Math.floor(Date.now() / 1000) + 7200,
            "B772"
        );
        const flightId = await tx.wait();

        await airline.bookSeat(flightId.events[0].args.flightId, 1, 1, "Dan");
        await airline.cancelSeat(flightId.events[0].args.flightId, 1, 1, "Dan");

        const seats = await airline.getSeatAvailability(flightId.events[0].args.flightId);
        expect(seats[1][1]).to.be.false; // Seat should be available
    });

    it("Should only allow the owner to book a seat", async function () {
        const tx = await airline.addFlight(
            "FFA0001",
            "LHR",
            "RDU",
            Math.floor(Date.now() / 1000) + 3600,
            Math.floor(Date.now() / 1000) + 7200,
            "B772"
        );
        const flightId = await tx.wait();

        // Try to book a seat from a different airline
        await expect(airline.connect(addr1).bookSeat(
            flightId.events[0].args.flightId, 1, 1, "John"
        )).to.be.revertedWith("Only the owning airline can book seats");
    });

    it("Should delete a flight", async function () {
        const tx = await airline.addFlight(
            "FFA0001",
            "LHR",
            "RDU",
            Math.floor(Date.now() / 1000) + 3600,
            Math.floor(Date.now() / 1000) + 7200,
            "B772"
        );
        const flightId = await tx.wait();

        await airline.deleteFlight(flightId.events[0].args.flightId);

        await expect(airline.getFlight(flightId.events[0].args.flightId)).to.be.reverted;
    });
});

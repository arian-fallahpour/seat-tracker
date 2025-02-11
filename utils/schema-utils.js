exports.validateSeatsTaken = function (value) {
  return value <= this.seatsAvailable;
};

exports.calculateEmptySeats = function () {
  return this.seatsAvailable - this.seatsTaken;
};

// Checks if seats have been re-opened if all have previously been taken
exports.haveSeatsFreed = function (updatedSection) {
  const updatedSeatsEmpty = updatedSection.seatsAvailable - updatedSection.seatsTaken;
  return this.seatsEmpty === 0 && updatedSeatsEmpty !== 0;
};

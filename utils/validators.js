exports.validateSeatsTaken = function (value) {
  return value <= this.seatsAvailable;
};

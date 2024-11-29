const response = (status,  message, data, res) => ({
  payload: {
    status,
    message,
    data
  },
  pagination: {
    prev: "",
    next: "",
    max: ""
  }
});

module.exports = response
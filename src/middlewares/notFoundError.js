const notFoundError = (message = "data is not found") => {
  return {
    status: 'fail',
    message: message
  }
}

module.exports = notFoundError
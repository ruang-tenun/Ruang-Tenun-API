const serverError = (message = "Internal server Error", errors) => {
  return {
    status: 'fail',
    message: message,
    error: errors
  }
}

module.exports = serverError
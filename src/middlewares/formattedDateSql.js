const formatMySQLDate = (date) => {
  const dt = new Date(date);
  const pad = (n) => (n < 10 ? '0' + n : n);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
}

module.exports = formatMySQLDate;
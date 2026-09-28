function getLastMonthDates() {

  const today = new Date();

  // Start date of last month
  const startLastMonth = new Date(
    today.getFullYear(),
    today.getMonth() - 1,
    1
  );

  // End date of last month
  const endLastMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    0
  );

  // Common date formatter
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
  }

  return {
    startDate: formatDate(startLastMonth),
    endDate: formatDate(endLastMonth)
  };
}

module.exports = { getLastMonthDates };

//
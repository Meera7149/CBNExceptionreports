function getCurrentMonthDates() {

  const today = new Date();

  const startMonthDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  );

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${day}-${month}-${year}`;
  }

  return {
    startDate: formatDate(startMonthDate),
    endDate: formatDate(today)
  };
}

module.exports = { getCurrentMonthDates };


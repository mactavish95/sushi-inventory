function findAllDatesAtLeastTenDaysAgo(dateList) {
    const today = new Date(); // Get today's date
    const tenDaysAgo = new Date(); // Calculate 10 days ago
    tenDaysAgo.setDate(today.getDate() - 10);

    const matchingDates = [];

    for (const date of dateList) {
        const [day, month, year] = date.split('/'); // Split the date into components
        const parsedDate = new Date(`${year}-${month}-${day}`); // Convert to a Date object

        // Check if the parsed date is >= 10 days ago
        if (parsedDate >= tenDaysAgo) {
            matchingDates.push(date); // Add to the list of matching dates
        }
    }

    return matchingDates;
}

// Example usage
const dates = ["10/10/2024", "25/12/2024", "19/12/2024", "5/12/2024", "30/12/2024"];
const result = findAllDatesAtLeastTenDaysAgo(dates);

console.log(result.length > 0
    ? `The dates >= 10 days ago are: ${result.join(', ')}`
    : "No matching dates found in the list.");

module.exports = {findAllDatesAtLeastTenDaysAgo};
export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const monthsShort = [
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  "May",
  "Jun.",
  "Jul.",
  "Aug.",
  "Sept.",
  "Oct.",
  "Nov.",
  "Dec.",
];
export function FormatHours(hours, minutes = 0) {
  adjustedMinutes = minutes < 10 ? "0" + minutes : minutes;
  formattedHours =
    hours < 12
      ? hours + 1 + ":" + adjustedMinutes + " AM"
      : hours + 1 + ":" + adjustedMinutes + " PM";
  return formattedHours;
}

export default months;

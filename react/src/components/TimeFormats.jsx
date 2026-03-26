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
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];
export function FormatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 12 ? "AM" : "PM";
  const adjustedHours = hours < 12 ? (hours == 0 ? 12 : hours) : hours - 12;
  const adjustedMinutes = minutes < 10 ? "0" + minutes : minutes;
  const formattedTime = adjustedHours + ":" + adjustedMinutes + " " + period;
  return formattedTime;
}

export function FormatDate(date, short = false) {
  const day = date.getDate();
  const month = short ? monthsShort[date.getMonth()] : months[date.getMonth()];
  const year = date.getFullYear();
  const formattedDate = month + " " + day + ", " + year;
  return formattedDate;
}

export default months;

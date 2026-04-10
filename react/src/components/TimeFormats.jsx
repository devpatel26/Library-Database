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
  let formattedTime = "";
  try {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours < 12 ? "AM" : "PM";
    const adjustedHours = hours < 12 ? (hours == 0 ? 12 : hours) : hours - 12;
    const adjustedMinutes = minutes < 10 ? "0" + minutes : minutes;
    formattedTime = adjustedHours + ":" + adjustedMinutes + " " + period;
  } catch (err) {
    formattedDate = "N/A";
  }
  return formattedTime;
}

export function FormatDate(date, short = false) {
  let formattedDate = "";
  try {
    const day = date.getDate();
    const month = short
      ? monthsShort[date.getMonth()]
      : months[date.getMonth()];
    const year = date.getFullYear();
    formattedDate = month + " " + day + ", " + year;
  } catch (err) {
    formattedDate = "N/A";
  }
  return formattedDate;
}

export function FormatBirthdateField(date) {
  let formattedDate = "";
  try {
    let day = date.getDate();
    day = day <= 9 ? `0${day}` : day;
    let month = date.getMonth() + 1;
    month = month <= 9 ? `0${month}` : month;
    let year = date.getFullYear();
    formattedDate = year + "-" + month + "-" + day;
  } catch (err) {
    formattedDate = "0000-00-00";
  }
  return formattedDate;
}

export default months;

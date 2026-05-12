function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
function isNight(date = new Date()) {
  const h = date.getHours();
  return h >= 0 && h < 5;
}
module.exports = { todayKey, isNight };

const axios = require('axios');
const tzLookup = require('tz-lookup');

async function enrichFromZip(zip, country = 'US') {
  const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zip},${country}&appid=${process.env.OWM_API_KEY}`;
  const { data } = await axios.get(url);
  const lat = data?.coord?.lat;
  const lon = data?.coord?.lon;
  if (lat == null || lon == null) throw new Error('Not resolve coordinates');
  const timezone = tzLookup(lat, lon); // "America/New_York"
  return { lat, lon, timezone, tzOffsetSeconds: data?.timezone ?? null };
}
module.exports = { enrichFromZip };

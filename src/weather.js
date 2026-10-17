export const cities = [
  { id: 'hanoi', name: 'Hà Nội', lat: 21.0285, lon: 105.8542 },
  { id: 'haiphong', name: 'Hải Phòng', lat: 20.8449, lon: 106.6881 },
  { id: 'hue', name: 'Huế', lat: 16.4637, lon: 107.5909 },
  { id: 'danang', name: 'Đà Nẵng', lat: 16.0544, lon: 108.2022 },
  { id: 'nhatrang', name: 'Nha Trang', lat: 12.2388, lon: 109.1967 },
  { id: 'dalat', name: 'Đà Lạt', lat: 11.9404, lon: 108.4583 },
  { id: 'hcm', name: 'TP. Hồ Chí Minh', lat: 10.8231, lon: 106.6297 },
  { id: 'cantho', name: 'Cần Thơ', lat: 10.0452, lon: 105.7469 },
];
export function normalize(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
}
export function temperature(value, unit) {
  if (!Number.isFinite(value)) return '—';
  return Math.round(unit === 'F' ? value * 9 / 5 + 32 : value);
}
export function weatherInfo(code) {
  if (code === 0) return { text: 'Trời quang', type: 'sun' };
  if (code === 1) return { text: 'Ít mây', type: 'partly' };
  if (code === 2) return { text: 'Mây rải rác', type: 'partly' };
  if (code === 3) return { text: 'Nhiều mây', type: 'cloud' };
  if ([45, 48].includes(code)) return { text: 'Sương mù', type: 'fog' };
  const descriptions = {51:'Mưa phùn nhẹ',53:'Mưa phùn vừa',55:'Mưa phùn dày',56:'Mưa phùn đóng băng nhẹ',57:'Mưa phùn đóng băng mạnh',61:'Mưa nhẹ',63:'Mưa vừa',65:'Mưa to',66:'Mưa đóng băng nhẹ',67:'Mưa đóng băng mạnh',71:'Tuyết nhẹ',73:'Tuyết vừa',75:'Tuyết dày',77:'Hạt tuyết',80:'Mưa rào nhẹ',81:'Mưa rào vừa',82:'Mưa rào mạnh',85:'Tuyết rào nhẹ',86:'Tuyết rào mạnh',95:'Dông',96:'Dông kèm mưa đá nhẹ',99:'Dông kèm mưa đá mạnh'};
  if ([95,96,99].includes(code)) return { text: descriptions[code], type: 'storm' };
  if ([71,73,75,77,85,86].includes(code)) return { text: descriptions[code], type: 'snow' };
  if (descriptions[code]) return { text: descriptions[code], type: 'rain' };
  return { text: 'Chưa xác định', type: 'unknown' };
}
export function dateLabel(date) {
  return new Date(date + 'T12:00:00+07:00').toLocaleDateString('vi-VN', { weekday: 'long', timeZone: 'Asia/Ho_Chi_Minh' });
}
export async function fetchWeather(city, signal) {
  const params = new URLSearchParams({
    latitude: city.lat, longitude: city.lon,
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    timezone: 'Asia/Ho_Chi_Minh', forecast_days: '7',
    temperature_unit: 'celsius', wind_speed_unit: 'kmh',
  });
  const response = await fetch('https://api.open-meteo.com/v1/forecast?' + params, { signal });
  if (!response.ok) throw new Error('Không tải được thời tiết (HTTP ' + response.status + ').');
  const data = await response.json();
  const daily = data.daily;
  const fields = ['time', 'weather_code', 'temperature_2m_max', 'temperature_2m_min'];
  if (!data.current || typeof data.current.time !== 'string' || !Number.isFinite(data.current.temperature_2m) || !daily || fields.some(key => !Array.isArray(daily[key]) || daily[key].length !== 7)) {
    throw new Error('Dữ liệu thời tiết chưa đầy đủ. Vui lòng thử lại.');
  }
  return data;
}

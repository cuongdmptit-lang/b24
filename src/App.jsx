import React, { useEffect, useState } from 'react';
import WeatherIcon from './WeatherIcon.jsx';
import { cities, normalize, temperature, weatherInfo, dateLabel, fetchWeather } from './weather.js';

export default function App() {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const [unit, setUnit] = useState('C');
  const [weather, setWeather] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('may-favorites') || '[]');
      return Array.isArray(saved) ? saved.filter(id => cities.some(city => city.id === id)) : [];
    } catch { return []; }
  });
  const [storageError, setStorageError] = useState('');
  useEffect(() => {
    try { localStorage.setItem('may-favorites', JSON.stringify(favorites)); }
    catch { setStorageError('Trình duyệt không cho lưu yêu thích; lựa chọn chỉ giữ trong phiên này.'); }
  }, [favorites]);

  // Chỉ gọi API khi đổi thành phố hoặc bấm Thử lại. Đổi đơn vị không nằm trong dependencies.
  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    let active = true;
    let timedOut = false;
    setStatus('loading');
    setWeather(null);
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
    fetchWeather(selected, controller.signal)
      .then(data => { if (active) { setWeather(data); setStatus('success'); } })
      .catch(err => {
        if (!active) return;
        setError(timedOut ? 'Kết nối quá lâu. Vui lòng thử lại.' : err.message === 'Failed to fetch' ? 'Không thể kết nối. Hãy kiểm tra mạng rồi thử lại.' : err.message);
        setStatus('error');
      })
      .finally(() => clearTimeout(timer));
    // Ngăn kết quả của thành phố cũ ghi đè khi người dùng bấm nhanh.
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [selected, retry]);

  function chooseCity(city) {
    if (selected?.id === city.id) return;
    setWeather(null);
    setStatus('loading');
    setSelected(city);
  }
  function toggleFavorite(id) {
    setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }
  const visibleCities = cities.filter(city => normalize(city.name).includes(normalize(query)));
  const info = weather ? weatherInfo(weather.current.weather_code) : null;
  const temp = value => temperature(value, unit);
  return <div className={'app theme-' + (info?.type || 'default')}>
    <header className="topbar"><a className="brand" href="./" aria-label="Mây — trang chủ"><span className="brand-icon">☁</span> mây<span className="brand-dot">.</span></a><span className="top-note">Một chút thời tiết, cho ngày của bạn.</span><span className="country">VIỆT NAM <span>•</span> UTC+7</span></header>
    <main className="layout">
      <aside className="sidebar">
        <p className="eyebrow">ĐIỂM ĐẾN CỦA BẠN</p><h1>Hôm nay,<br/>trời thế nào?</h1><p className="intro">Chọn một thành phố để bắt đầu.</p>
        <label className="search"><span aria-hidden="true">⌕</span><input aria-label="Tìm thành phố" placeholder="Tìm thành phố…" value={query} onChange={e => setQuery(e.target.value)}/></label>
        <div className="list-label"><span>THÀNH PHỐ</span><span>{visibleCities.length} / 8</span></div>
        <nav className="city-list" aria-label="Danh sách thành phố">{visibleCities.map((city, index) => <div className={'city-row ' + (selected?.id === city.id ? 'active' : '')} key={city.id}>
          <button className="city-button" aria-pressed={selected?.id === city.id} onClick={() => chooseCity(city)}><span className="city-number">{String(cities.indexOf(city) + 1).padStart(2, '0')}</span><span>{city.name}</span><span className="city-arrow" aria-hidden="true">↗</span></button>
          <button className="favorite" aria-label={(favorites.includes(city.id) ? 'Bỏ yêu thích ' : 'Yêu thích ') + city.name} aria-pressed={favorites.includes(city.id)} onClick={() => toggleFavorite(city.id)}>{favorites.includes(city.id) ? '★' : '☆'}</button>
        </div>)}</nav>
        {!visibleCities.length && <p className="no-results">Không tìm thấy thành phố phù hợp.</p>}
        {storageError && <p className="small">{storageError}</p>}
        <div className="sidebar-note"><span>✦</span><p>8 thành phố, một bầu trời.<br/><small>Dự báo để sẵn sàng cho mỗi ngày.</small></p></div>
      </aside>
      <section className="content" aria-label="Thông tin thời tiết">
        <div className="content-heading"><span className="eyebrow">BẢN TIN THỜI TIẾT</span><div className="unit-switch" aria-label="Đơn vị nhiệt độ">{['C','F'].map(value => <button key={value} className={unit === value ? 'chosen' : ''} aria-pressed={unit === value} onClick={() => setUnit(value)}>°{value}</button>)}</div></div>
        <div aria-live="polite" aria-busy={status === 'loading'}>
          {status === 'idle' && <div className="state-panel"><WeatherIcon type="partly" large/><span className="eyebrow">XIN CHÀO, NGÀY MỚI</span><h2>Thời tiết nơi bạn muốn đến</h2><p>Chọn một trong 8 thành phố để xem thời tiết<br className="desktop-break"/> hiện tại và dự báo 7 ngày tới.</p><button className="primary" onClick={() => chooseCity(cities[0])}>Khám phá Hà Nội <span>↗</span></button></div>}
          {status === 'loading' && <div className="state-panel"><span className="spinner"/><h2>Đang xem bầu trời {selected?.name}…</h2><p>Đang lấy dữ liệu mới từ Open-Meteo.</p></div>}
          {status === 'error' && <div className="state-panel" role="alert"><WeatherIcon type="cloud" large/><h2>Chưa thể xem thời tiết</h2><p>{error}</p><button className="primary" onClick={() => setRetry(value => value + 1)}>Thử lại ↻</button></div>}
          {status === 'success' && weather && <>
            <article className="current-card"><div className="current-top"><span className="pill"><span className="live-dot"/> THỜI TIẾT HIỆN TẠI</span><span className="small">Giờ Việt Nam</span></div>
              <h2>{selected.name}</h2><p className="date">{dateLabel(weather.current.time.slice(0,10))}, {weather.current.time.slice(0,10).split('-').reverse().join('/')}</p>
              <div className="weather-hero"><div><div className="temperature">{temp(weather.current.temperature_2m)}<span>°{unit}</span></div><p className="description">{info.text}</p></div><WeatherIcon type={info.type} large/></div>
              <div className="metrics"><div><span>Độ ẩm</span><strong>{weather.current.relative_humidity_2m ?? '—'}<small> %</small></strong></div><div><span>Tốc độ gió</span><strong>{weather.current.wind_speed_10m ?? '—'}<small> km/h</small></strong></div><div><span>Cập nhật lúc</span><strong>{weather.current.time.slice(11,16)}<small> UTC+7</small></strong></div></div>
            </article>
            <section className="forecast"><div className="forecast-heading"><h2>7 ngày sắp tới</h2><span>Cao nhất / Thấp nhất</span></div><div className="forecast-grid">{weather.daily.time.map((day, index) => {
              const dailyInfo = weatherInfo(weather.daily.weather_code[index]);
              return <article className="day-card" key={day}><h3>{dateLabel(day)}</h3><span className="day-date">{day.slice(8,10)}/{day.slice(5,7)}</span><WeatherIcon type={dailyInfo.type}/><p className="day-description">{dailyInfo.text}</p><div className="day-temperatures"><strong aria-label="Cao nhất">{temp(weather.daily.temperature_2m_max[index])}°{unit}</strong><span aria-label="Thấp nhất">{temp(weather.daily.temperature_2m_min[index])}°{unit}</span></div></article>;
            })}</div></section>
          </>}
        </div>
        <footer><span>Dữ liệu từ <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a></span><span>TH02 · React Weather</span></footer>
      </section>
    </main>
  </div>;
}

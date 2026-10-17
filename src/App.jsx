import { useEffect, useState } from "react";
import "./App.css";

const cities = [
  { name: "Hà Nội", lat: 21.0285, lon: 105.8542 },
  { name: "Hải Phòng", lat: 20.8449, lon: 106.6881 },
  { name: "Huế", lat: 16.4637, lon: 107.5909 },
  { name: "Đà Nẵng", lat: 16.0544, lon: 108.2022 },
  { name: "Nha Trang", lat: 12.2388, lon: 109.1967 },
  { name: "Đà Lạt", lat: 11.9404, lon: 108.4583 },
  { name: "TP. Hồ Chí Minh", lat: 10.8231, lon: 106.6297 },
  { name: "Cần Thơ", lat: 10.0452, lon: 105.7469 },
];


function getWeather(code) {
  if (code === 0) return { icon: "☀️", text: "Trời quang" };
  if (code === 1) return { icon: "🌤️", text: "Ít mây" };
  if (code === 2) return { icon: "⛅", text: "Mây rải rác" };
  if (code === 3) return { icon: "☁️", text: "Nhiều mây" };

  if ([45, 48].includes(code)) {
    return { icon: "🌫️", text: "Sương mù" };
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return { icon: "🌦️", text: "Mưa phùn" };
  }

  if ([61, 63, 65, 66, 67].includes(code)) {
    return { icon: "🌧️", text: "Mưa" };
  }

  if ([80, 81, 82].includes(code)) {
    return { icon: "🌧️", text: "Mưa rào" };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { icon: "🌨️", text: "Tuyết rơi" };
  }

  if ([95, 96, 99].includes(code)) {
    return { icon: "⛈️", text: "Dông" };
  }

  return { icon: "❔", text: "Chưa có thông tin" };
}


function formatTemperature(value, unit) {
  if (typeof value !== "number") return "--";

  const temperature = unit === "F" ? (value * 9) / 5 + 32 : value;

  return temperature.toFixed(1) + "°" + unit;
}


function removeAccents(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export default function App() {
  const [city, setCity] = useState(null);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [unit, setUnit] = useState("C");
  const [search, setSearch] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!city) return;

    const controller = new AbortController();
    let active = true;

    
    const timeout = setTimeout(() => controller.abort(), 15000);

    async function loadWeather() {
      try {
        const params = new URLSearchParams({
          latitude: city.lat,
          longitude: city.lon,
          current:
            "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
          daily: "weather_code,temperature_2m_max,temperature_2m_min",
          timezone: "Asia/Ho_Chi_Minh",
          forecast_days: 7,
        });

        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?" + params,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Không tải được dữ liệu");
        }

        const result = await response.json();

        if (!result.current || result.daily?.time?.length !== 7) {
          throw new Error("Dữ liệu chưa đầy đủ");
        }

        if (active) {
          setData(result);
          setStatus("success");
        }
      } catch {
        if (active) {
          setStatus("error");
        }
      } finally {
        clearTimeout(timeout);
      }
    }

    loadWeather();

    
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [city, retry]);

  function chooseCity(item) {
    if (city === item) return;

    setData(null);
    setStatus("loading");
    setCity(item);
  }

  function tryAgain() {
    setData(null);
    setStatus("loading");
    setRetry(retry + 1);
  }

  const filteredCities = cities.filter((item) =>
    removeAccents(item.name).includes(removeAccents(search))
  );

  const currentWeather = data
    ? getWeather(data.current.weather_code)
    : null;

  return (
    <div className="app">
      <header>
        <div>
          <h1>Thời tiết Việt Nam</h1>
          <p className="subtitle">Xem thời tiết tại 8 thành phố</p>
        </div>

        <div className="units">
          {["C", "F"].map((item) => (
            <button
              key={item}
              className={unit === item ? "active" : ""}
              aria-pressed={unit === item}
              onClick={() => setUnit(item)}
            >
              °{item}
            </button>
          ))}
        </div>
      </header>

      <main className="layout">
        <aside className="panel">
          <h2>Chọn thành phố</h2>

          <label htmlFor="search">Tìm thành phố</label>
          <input
            id="search"
            placeholder="Ví dụ: da nang"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="city-list">
            {filteredCities.map((item) => (
              <button
                key={item.name}
                className={city === item ? "active" : ""}
                aria-pressed={city === item}
                onClick={() => chooseCity(item)}
              >
                {item.name}
              </button>
            ))}
          </div>

          {filteredCities.length === 0 && (
            <p>Không tìm thấy thành phố.</p>
          )}
        </aside>

        <section
          className="panel"
          aria-live="polite"
          aria-busy={status === "loading"}
        >
          {status === "idle" && (
            <div className="status">
              <h2>Chưa chọn thành phố</h2>
              <p>Hãy chọn một thành phố để xem thời tiết.</p>
            </div>
          )}

          {status === "loading" && (
            <div className="status">
              Đang tải thời tiết {city?.name}…
            </div>
          )}

          {status === "error" && (
            <div className="status">
              <h2 className="error">Không tải được thời tiết</h2>
              <p>Kiểm tra kết nối Internet rồi thử lại.</p>
              <button onClick={tryAgain}>Thử lại</button>
            </div>
          )}

          {status === "success" && data && (
            <>
              <h2>{city.name}</h2>

              <p className="subtitle">
                Cập nhật:{" "}
                {new Date(data.current.time + "+07:00").toLocaleString(
                  "vi-VN",
                  {
                    timeZone: "Asia/Ho_Chi_Minh",
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }
                )}
                {" "}(giờ Việt Nam)
              </p>

              <div className="current-main">
                <span className="icon" aria-hidden="true">
                  {currentWeather.icon}
                </span>

                <div>
                  <div className="temperature">
                    {formatTemperature(data.current.temperature_2m, unit)}
                  </div>
                  <p>{currentWeather.text}</p>
                </div>
              </div>

              <div className="details">
                <span>
                  Độ ẩm: <b>{data.current.relative_humidity_2m}%</b>
                </span>
                <span>
                  Tốc độ gió: <b>{data.current.wind_speed_10m} km/h</b>
                </span>
              </div>

              <div className="forecast">
                <h2>Dự báo 7 ngày</h2>

                <div className="days">
                  {data.daily.time.map((date, index) => {
                    const weather = getWeather(
                      data.daily.weather_code[index]
                    );

                    const day = new Date(date + "T12:00:00+07:00");

                    return (
                      <article className="day" key={date}>
                        <b>
                          {day.toLocaleDateString("vi-VN", {
                            weekday: "short",
                            timeZone: "Asia/Ho_Chi_Minh",
                          })}
                        </b>

                        <p>
                          {day.toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            timeZone: "Asia/Ho_Chi_Minh",
                          })}
                        </p>

                        <div className="day-icon" aria-hidden="true">
                          {weather.icon}
                        </div>
                        <p>{weather.text}</p>

                        <p>
                          <b>
                            ↑{" "}
                            {formatTemperature(
                              data.daily.temperature_2m_max[index],
                              unit
                            )}
                          </b>
                        </p>

                        <p className="low">
                          ↓{" "}
                          {formatTemperature(
                            data.daily.temperature_2m_min[index],
                            unit
                          )}
                        </p>
                      </article>
                    );
                  })}
                </div>

                <p className="subtitle">↑ Cao nhất · ↓ Thấp nhất</p>
              </div>
            </>
          )}
        </section>
      </main>

      <footer>
        Dữ liệu:{" "}
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noreferrer"
        >
          Open-Meteo
        </a>
        {" "}· Bài thực hành React
      </footer>
    </div>
  );
}
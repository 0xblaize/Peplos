export interface WeatherSnapshot {
  tempC: number;
  condition: string;
  precipitationChance: number;
  humidity: number;
}

const MOCK_WEATHER: WeatherSnapshot = {
  tempC: 4,
  condition: 'Snow',
  precipitationChance: 0.8,
  humidity: 82,
};

export async function getWeather(city: string): Promise<WeatherSnapshot> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    // No key configured — return a deterministic mock so the coordination
    // engine can be demoed without external setup.
    return MOCK_WEATHER;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city,
  )}&units=metric&appid=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) {
    throw new Error(`OpenWeatherMap request failed: ${res.status}`);
  }
  const data = await res.json();

  return {
    tempC: data.main?.temp ?? MOCK_WEATHER.tempC,
    condition: data.weather?.[0]?.main ?? MOCK_WEATHER.condition,
    precipitationChance: data.rain ? Math.min(1, (data.rain['1h'] ?? 0) / 5) : 0,
    humidity: data.main?.humidity ?? MOCK_WEATHER.humidity,
  };
}

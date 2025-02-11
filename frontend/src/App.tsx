import { useState } from 'react'
import WeatherForm from './components/WeatherForm'
import CompareForm from './components/CompareForm'
import Favorites from './components/Favorites'
import WeatherDisplay from './components/WeatherDisplay'

// CurrentLocationは削除し、代わりにCurrentLocationWeatherをインポート
import CurrentLocationWeather from './components/CurrentLocation'

interface WeatherData {
  city: string;
  temp: number;
  weather: string;
  humidity: number;
  feels_like?: number;
  wind_speed?: number;
  wind_deg?: number;
  sunrise?: string;
  sunset?: string;
}

interface CompareResults {
  [city: string]: {
    city?: string;
    temp?: number;
    weather?: string;
    humidity?: number;
    error?: string;
  };
}

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [compareData, setCompareData] = useState<CompareResults | null>(null)

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Weather App</h1>
      <p></p>
      
      <h2>都市の天気情報</h2>
      <WeatherForm onWeatherUpdate={(data) => { setWeather(data); setCompareData(null) }} />
      {weather && <WeatherDisplay weather={weather} />}

      <hr />

      <h2>複数都市の比較</h2>
      <CompareForm onCompare={(data) => { setCompareData(data); setWeather(null) }} />
      {compareData && (
        <div>
          <h3>Comparison Results:</h3>
          <ul>
            {Object.entries(compareData).map(([city, info]) => (
              <li key={city}>
                {info.error 
                  ? `${city}: ${info.error}`
                  : `${info.city}: ${info.temp}°C, ${info.weather}, Humidity: ${info.humidity}%`
                }
              </li>
            ))}
          </ul>
        </div>
      )}

      <hr />

      <h2>お気に入り都市</h2>
      <Favorites onSelectWeather={(data) => { setWeather(data); setCompareData(null) }} />

      <hr />

      <h2></h2>
      {/* CurrentLocationからCurrentLocationWeatherに置き換え */}
      <CurrentLocationWeather onWeatherUpdate={(data) => { setWeather(data); setCompareData(null) }} />
    </div>
  )
}

export default App

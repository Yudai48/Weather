import React from 'react'
import axios from 'axios'

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

interface CurrentLocationWeatherProps {
  onWeatherUpdate: (data: WeatherData) => void;
}

const CurrentLocationWeather: React.FC<CurrentLocationWeatherProps> = ({ onWeatherUpdate }) => {
  const [error, setError] = React.useState('')

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude

        try {
          const res = await axios.get(`http://localhost:3000/weather/current?lat=${lat}&lon=${lon}`)
          onWeatherUpdate(res.data) // 天気取得成功時にコールバック呼び出し
          setError('')
        } catch (err: any) {
          console.error('Failed to fetch weather data:', err)
          setError('Failed to fetch weather data.')
        }
      },
      () => {
        setError('Unable to retrieve your location.')
      }
    )
  }

  return (
    <div>
      <h2>現在地の天気情報</h2>
      <button onClick={getCurrentLocation}>現在地の天気を取得</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  )
}

export default CurrentLocationWeather

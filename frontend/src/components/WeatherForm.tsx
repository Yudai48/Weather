import { useState } from 'react'
import axios from 'axios'

interface Props {
  onWeatherUpdate: (data: any) => void
}

const WeatherForm: React.FC<Props> = ({ onWeatherUpdate }) => {
  const [city, setCity] = useState('')

  const fetchWeather = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/weather/${city}`)
      onWeatherUpdate(res.data)
    } catch (error) {
      console.error('Failed to fetch weather:', error)
      onWeatherUpdate(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchWeather()
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '10px' }}>
      <input
        type="text"
        value={city}
        onChange={e => setCity(e.target.value)}
        placeholder="Enter city name"
        required
        style={{ marginRight: '5px' }}
      />
      <button type="submit">Get Weather</button>
    </form>
  )
}

export default WeatherForm

import { useEffect, useState } from 'react'
import axios from 'axios'

interface Props {
  onSelectWeather: (data: any) => void
}

const Favorites: React.FC<Props> = ({ onSelectWeather }) => {
  const [favorites, setFavorites] = useState<string[]>([])
  const [newCity, setNewCity] = useState('')

  const fetchFavorites = async () => {
    try {
      const res = await axios.get('http://localhost:3000/favorites?userId=default')
      setFavorites(res.data.favorites)
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
    }
  }

  const addFavorite = async () => {
    if (!newCity.trim()) return
    try {
      const res = await axios.post('http://localhost:3000/favorites', { userId: 'default', city: newCity })
      setFavorites(res.data.favorites)
      setNewCity('')
    } catch (error) {
      console.error('Failed to add favorite:', error)
    }
  }

  const removeFavorite = async (city: string) => {
    try {
      const res = await axios.delete('http://localhost:3000/favorites', { data: { userId: 'default', city } })
      setFavorites(res.data.favorites)
    } catch (error) {
      console.error('Failed to remove favorite:', error)
    }
  }

  const showWeather = async (city: string) => {
    try {
      const res = await axios.get(`http://localhost:3000/weather/${city}`)
      onSelectWeather(res.data)
    } catch (error) {
      console.error('Failed to fetch weather for favorite city:', error)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  return (
    <div style={{ marginTop: '10px' }}>
      <h3>Your Favorite Cities</h3>
      <ul>
        {favorites.map(city => (
          <li key={city}>
            {city}{' '}
            <button onClick={() => showWeather(city)}>Show Weather</button>{' '}
            <button onClick={() => removeFavorite(city)}>Remove</button>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          value={newCity}
          onChange={e => setNewCity(e.target.value)}
          placeholder="Add new favorite city"
          style={{ marginRight: '5px' }}
        />
        <button onClick={addFavorite}>Add</button>
      </div>
    </div>
  )
}

export default Favorites

import { useState } from 'react'
import axios from 'axios'

interface Props {
  onCompare: (data: any) => void
}

const CompareForm: React.FC<Props> = ({ onCompare }) => {
  const [cities, setCities] = useState('')

  const fetchCompare = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/compare?cities=${encodeURIComponent(cities)}`)
      onCompare(res.data)
    } catch (error) {
      console.error('Failed to compare cities:', error)
      onCompare(null)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCompare()
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '10px' }}>
      <input
        type="text"
        value={cities}
        onChange={e => setCities(e.target.value)}
        placeholder="Enter cities separated by commas (e.g. Tokyo,Osaka,Kyoto)"
        required
        style={{ width: '300px', marginRight: '5px' }}
      />
      <button type="submit">Compare</button>
    </form>
  )
}

export default CompareForm

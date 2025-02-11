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
  
  interface Props {
    weather: WeatherData
  }
  
  const WeatherDisplay: React.FC<Props> = ({ weather }) => {
    return (
      <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
        <h3>Weather in {weather.city}</h3>
        <p>Temperature: {weather.temp}°C</p>
        {weather.feels_like !== undefined && <p>Feels Like: {weather.feels_like}°C</p>}
        <p>Weather: {weather.weather}</p>
        <p>Humidity: {weather.humidity}%</p>
        {weather.wind_speed !== undefined && <p>Wind: {weather.wind_speed} m/s, {weather.wind_deg}°</p>}
        {weather.sunrise && <p>Sunrise: {weather.sunrise}</p>}
        {weather.sunset && <p>Sunset: {weather.sunset}</p>}
      </div>
    )
  }
  
  export default WeatherDisplay
  
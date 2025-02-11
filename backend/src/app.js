import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import 'dotenv/config';
const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL || 'https://api.openweathermap.org/data/2.5';
if (!API_KEY) {
    console.error('Please set API_KEY in .env file');
    process.exit(1);
}
const app = new Hono();
app.get('/', (c) => c.text('Weather Backend API is running!'));
app.get('/weather/:city', async (c) => {
    const city = c.req.param('city');
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            return c.json({ error: 'Failed to fetch weather data' }, 500);
        }
        const data = await res.json();
        return c.json({
            city: data.name,
            temp: data.main.temp,
            weather: data.weather[0].description,
            humidity: data.main.humidity
        });
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
});
// PORT環境変数を設定しておく
process.env.PORT = '3000';
serve(app, (info) => {
    console.log(`Listening on http://localhost:${info.port}`);
});

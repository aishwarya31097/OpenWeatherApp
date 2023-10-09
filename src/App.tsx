import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'font-awesome/css/font-awesome.min.css';
import './App.css';

const OPENWEATHERMAP_API_KEY = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;
const IPSTACK_API_KEY = process.env.REACT_APP_IPSTACK_API_KEY;

interface WeatherData {
  main: {
    temp: number;
    pressure: number;
    humidity: number;
    feels_like: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
}

const App: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null); // Selected city
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null); // Weather data
  const [userLocation, setUserLocation] = useState<string | null>(''); // User's location

  useEffect(() => {
    // Function to fetch user's location using IP Stack
    const fetchUserLocation = async () => {
      try {
        const response = await axios.get(
          `http://api.ipstack.com/check?access_key=${IPSTACK_API_KEY}`
        );
        const userLocation = `${response.data.city}, ${response.data.country_name}`;
        setUserLocation(userLocation);
        setSelectedCity(userLocation); // Setting user location as the initial selected city
        localStorage.setItem('selectedCity', userLocation); // Saving user location to local storage

      } catch (error) {
        console.error('Error fetching user location:', error);
      }
    };

    // Fetch user's location when the component mounts
    fetchUserLocation();
  }, []);

  useEffect(() => {
    // Function to fetch weather data for the selected city
    const fetchWeatherData = async () => {
      if (selectedCity) {
        try {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${selectedCity}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`
          );
          setWeatherData(response.data);
          const weatherDescription = response.data.weather[0].description.toLowerCase().replace(/ /g,"_");
          const bodyClass = `weather-${weatherDescription}`;
          console.log("bodyClass",bodyClass)
          document.body.className = bodyClass; 
          localStorage.setItem('weatherData', JSON.stringify(response.data)); // Saving weather data to local storage for later use 
   
          console.log("document.body.className:", document.body.className);
      // document.body.className = `weather-${weatherDescription}`;
        } catch (error) {
          console.error('Error fetching weather data:', error);
        }
      }
    };

    // Fetch weather data when the component mounts or when selectedCity changes
    fetchWeatherData();
  }, [selectedCity]);

  const reloadPage = () => {
    // Force a page reload to update weather data
    window.location.reload();
  };

  return (
    <div className="App">
      <h1>Open Weather App</h1>
      <div>
        <label>Select a City:</label>
        <select
          onChange={(e) => setSelectedCity(e.target.value)}
          value={selectedCity || ''}
        >
          {userLocation && <option value={userLocation}>{userLocation}</option>}
          <option value="London">London</option>
          <option value="Amsterdam">Amsterdam</option>
          <option value="Moscow">Moscow</option>
          <option value="New York">New York</option>
        </select>
        <button onClick={reloadPage}>
  <i className="fa fa-refresh"></i> Refresh
</button>
      </div>
      {weatherData && (
        <div className="weather-info">
          <h2>Weather in {selectedCity || userLocation}</h2>
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png`}
            alt="Weather Icon"
          />
          <p>Temperature: {weatherData.main.temp}°C</p>
          <p>Weather: {weatherData.weather[0].description}</p>
          <p>Pressure: {weatherData.main.pressure} hPa</p>
          <p>Wind Speed: {weatherData.wind.speed} m/s</p>
          <p>Feels Like: {weatherData.main.feels_like}°C</p>
          <p>Humidity: {weatherData.main.humidity}%</p>
       
        </div>
      )}
    </div>
  );
};

export default App;

import { FaTemperatureLow } from 'react-icons/fa';
import { WiHumidity } from 'react-icons/wi';

const Popup = ({ title, acres, year, weatherData }) => {
  return (
    <>
      <h3 className='popup-title'>{title}</h3>
      <p className='popup-text'>Acres: {acres} sq ft</p>
      <p className='popup-text'>Year: {year}</p>

      <div className='popup-weather-row'>
        <div className='popup-weather-col' style={{ paddingLeft: '10px' }}>
          <FaTemperatureLow 
            style={{ marginRight: '0.60em' }}
            size='1.75em'
            color={
              weatherData?.temp <= 60 ? 'blue' :
              weatherData?.temp > 60 && weatherData?.temp <= 90 ? 'orange' :
              'red'
            }
          />
          <p className='popup-text'>{weatherData?.temp}</p>
        </div>
        <div className='popup-weather-col'>
          <WiHumidity 
            style={{ marginRight: '0.25em' }}
            size='2.75em'
            color={
              weatherData?.humidity <= 30 ? 'lightskyblue' :
              weatherData?.humidity > 30 && weatherData?.humidity <= 50 ? 'blue' :
              'darkblue'
            }
          />
          <p className='popup-text'>{weatherData?.humidity}%</p>
        </div>
      </div>

      <div className='popup-weather-col'>
          <img src={`icons/${weatherData?.icon}.png`} alt='weather icon' className='popup-weather-icon' />
          <p className='popup-text weather-text'>{weatherData?.weather}</p>
      </div>
    </>
  )
};

export default Popup;
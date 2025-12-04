const API_KEY = 'db9e8007a26c453a8c1111956250412';
const BASE_URL = 'https://api.weatherapi.com/v1/current.json';

const input = document.getElementById('locationInput');
const getBtn = document.getElementById('getBtn');
const geoBtn = document.getElementById('geoBtn');
const output = document.getElementById('output');
const errorEl = document.getElementById('error');

async function fetchWeather(q){
  // q can be city name, lat,long or postal code
  const url = `${BASE_URL}?key=${encodeURIComponent(API_KEY)}&q=${encodeURIComponent(q)}&aqi=no`;
  try{
    showLoading();
    const res = await fetch(url);
    if(!res.ok){
      const text = await res.text();
      throw new Error('API error: ' + res.status + ' ' + text);
    }
    const data = await res.json();
    hideError();
    renderWeather(data);
  }
  catch(err){
    showError(err.message || 'Failed to get weather');
    clearOutput();
  }
}

function showLoading(){
  output.innerHTML = `<div style="font-weight:700;color:var(--muted)">Loading…</div>`;
}

function clearOutput(){
    output.innerHTML = '' 
}

function showError(msg){ 
    errorEl.hidden = false; 
    errorEl.textContent = msg;
}

function hideError(){ 
    errorEl.hidden = true; 
    errorEl.textContent = '';
}

function renderWeather(d){
  if(!d || !d.location || !d.current){
    showError('Unexpected API response');
    return;
  }
  const loc = d.location;
  console.log(loc);
  const cur = d.current;
  console.log(cur);
  const icon = cur.condition && cur.condition.icon ? `https:${cur.condition.icon}` : '';

  output.innerHTML = `
    <div class="weather-card" role="region" aria-label="Weather results for ${escapeHtml(loc.name)}">
      <img src="${icon}" alt="${escapeHtml(cur.condition ? cur.condition.text : 'Weather')} icon" />
      <div>
        <div style="display:flex;gap:8px;align-items:baseline">
          <div class="temp">${Math.round(cur.temp_c)}°C</div>
          <div style="font-weight:600">${escapeHtml(loc.name)}, ${escapeHtml(loc.country)}</div>
        </div>
        <div class="desc">${escapeHtml(cur.condition ? cur.condition.text : '')}</div>
        <div class="meta">Feels like ${Math.round(cur.feelslike_c)}°C · Humidity ${cur.humidity}% · Wind ${cur.wind_kph} kph</div>
      </div>
    </div>
  `;
}


function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

getBtn.addEventListener('click', ()=>{
  const q = input.value.trim();
  if(!q){ 
    showError('Please enter a location'); 
    return; 
  }
  fetchWeather(q);
});
input.addEventListener('keydown', (e)=>{ 
    if(e.key === 'Enter'){
        getBtn.click() 
    } 
});


geoBtn.addEventListener('click', ()=>{
  if(!navigator.geolocation){ 
    showError('Geolocation is not supported in this browser'); 
    return 
  }
  showLoading();
  navigator.geolocation.getCurrentPosition(async (pos)=>{
    const lat = pos.coords.latitude.toFixed(4);
    const lon = pos.coords.longitude.toFixed(4);
    await fetchWeather(`${lat},${lon}`);
  }, (err)=>{
    showError('Unable to get location: ' + (err.message || err.code));
    clearOutput();
  }, {timeout:10000});
});
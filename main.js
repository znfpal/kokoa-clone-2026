const clock = document.querySelector("#clock");
const loginForm = document.querySelector("#login-form");
const loginInput = loginForm.querySelector("input");
const greetingBox = document.querySelector("#greeting-box");
const greeting = document.querySelector("#greeting");
const logoutButton = document.querySelector("#logout-button");
const todoForm = document.querySelector("#todo-form");
const todoInput = todoForm.querySelector("input");
const todoList = document.querySelector("#todo-list");
const weather = document.querySelector("#weather");

const USERNAME_KEY = "username";
const TODOS_KEY = "todos";

const backgrounds = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=80",
];

let todos = [];

function paintClock() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  clock.innerText = `${hours}:${minutes}:${seconds}`;
}

function paintBackground() {
  const randomIndex = Math.floor(Math.random() * backgrounds.length);
  document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url("${backgrounds[randomIndex]}")`;
}

function saveTodos() {
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}

function deleteTodo(event) {
  const li = event.target.parentElement;
  li.remove();
  todos = todos.filter((todo) => todo.id !== Number(li.id));
  saveTodos();
}

function paintTodo(todo) {
  const li = document.createElement("li");
  li.id = todo.id;

  const span = document.createElement("span");
  span.innerText = todo.text;

  const button = document.createElement("button");
  button.type = "button";
  button.innerText = "X";
  button.addEventListener("click", deleteTodo);

  li.appendChild(span);
  li.appendChild(button);
  todoList.appendChild(li);
}

function handleTodoSubmit(event) {
  event.preventDefault();

  const text = todoInput.value.trim();
  if (text === "") {
    return;
  }

  const newTodo = {
    id: Date.now(),
    text,
  };

  todoInput.value = "";
  todos.push(newTodo);
  paintTodo(newTodo);
  saveTodos();
}

function showGreeting(username) {
  loginForm.classList.add("hidden");
  greetingBox.classList.remove("hidden");
  greeting.innerText = `Hello, ${username}`;
}

function handleLoginSubmit(event) {
  event.preventDefault();

  const username = loginInput.value.trim();
  if (username === "") {
    return;
  }

  localStorage.setItem(USERNAME_KEY, username);
  showGreeting(username);
}

function handleLogout() {
  localStorage.removeItem(USERNAME_KEY);
  greetingBox.classList.add("hidden");
  loginForm.classList.remove("hidden");
  loginInput.value = "";
  loginInput.focus();
}

function weatherName(code) {
  if (code === 0) return "Clear";
  if ([1, 2, 3].includes(code)) return "Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunder";
  return "Weather";
}

function onGeoSuccess(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
  const placeUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&format=json`;

  Promise.all([fetch(weatherUrl), fetch(placeUrl)])
    .then((responses) => Promise.all(responses.map((response) => response.json())))
    .then(([weatherData, placeData]) => {
      const current = weatherData.current;
      const place = placeData.results?.[0];
      const location = place?.name || `${lat.toFixed(1)}, ${lon.toFixed(1)}`;

      weather.innerText = `${location} / ${Math.round(current.temperature_2m)} C / ${weatherName(current.weather_code)}`;
    })
    .catch(() => {
      weather.innerText = "Cannot load weather";
    });
}

function onGeoError() {
  weather.innerText = "Location permission needed";
}

paintBackground();
paintClock();
setInterval(paintClock, 1000);

const savedUsername = localStorage.getItem(USERNAME_KEY);
if (savedUsername === null) {
  loginForm.classList.remove("hidden");
} else {
  showGreeting(savedUsername);
}

const savedTodos = localStorage.getItem(TODOS_KEY);
if (savedTodos !== null) {
  todos = JSON.parse(savedTodos);
  todos.forEach(paintTodo);
}

loginForm.addEventListener("submit", handleLoginSubmit);
logoutButton.addEventListener("click", handleLogout);
todoForm.addEventListener("submit", handleTodoSubmit);
navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError);

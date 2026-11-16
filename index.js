const weatherForm = document.querySelector(".weatherForm");
const cityInput = document.querySelector(".cityInput");
const card = document.querySelector(".card");
const apiKey ="4f2fbf38452a042fce5bebc4b893b10c";
const backgroundVideo = document.querySelector(".videoBackground");
let activeBackgroundVideo = backgroundVideo;
let nextBackgroundVideo = backgroundVideo.cloneNode(true);
let videoChangeId = 0;

backgroundVideo.after(nextBackgroundVideo);

function showBackgroundVideo(video) {
    video.classList.add("is-visible");
    video.play().catch(error => {
        console.error("Could not play background video:", error);
    });
}

if (activeBackgroundVideo.readyState >= 2) {
    showBackgroundVideo(activeBackgroundVideo);
} else {
    activeBackgroundVideo.addEventListener("loadeddata", () => {
        showBackgroundVideo(activeBackgroundVideo);
    }, { once: true });
}

weatherForm.addEventListener("submit",async event =>{
    event.preventDefault();

    const city = cityInput.value;

    if (city){
        try{
            const weatherData = await getWeatherData(city);
            displayWeatherInfo (weatherData);
        }
        catch (error){
            console.error(error);
            displayError(error);
        }
    }
    else{
        displayError("Please enter a city");
    }
})

async function getWeatherData(city){
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok){
        throw new Error ("could not fetch weather data");
    }
    else{
        return await response.json();
    }
}

function displayWeatherInfo(data){
    const {name : city,
          main: {temp, humidity},
          weather: [{description, id}]} = data;

        setWeatherVideo(id);

        card.textContent = "";
        showCard();

        const cityDisplay = document.createElement("h1");
        const tempDisplay = document.createElement("p");
        const humidityDisplay = document.createElement("p");
        const descDisplay = document.createElement("p");
        const weatherEmoji = document.createElement("p");
        const cBtn = document.createElement("input");
        const fBtn = document.createElement("input");
        const cLabel = document.createElement("label");
        const fLabel = document.createElement("label");
        const unitControls = document.createElement("div");
        const cChoice = document.createElement("div");
        const fChoice = document.createElement("div");
        let tempTemp = Math.floor(temp-273.15);
        let isC = true;

        cLabel.textContent = "c";
        fLabel.textContent = "f";

        cityDisplay.textContent =city;

        tempDisplay.textContent = `${tempTemp}° C`;
        humidityDisplay.textContent = `Humidity: ${humidity}%`;
        descDisplay.textContent = description;
        weatherEmoji.textContent = getWeatherEmoji(id);

        cBtn.type = "radio";
        cBtn.name = "choice"; 
        cBtn.value = "c";
        cBtn.id = "choice-c";
        cBtn.checked = true;
        cLabel.htmlFor = cBtn.id;
        fBtn.type = "radio";
        fBtn.name = "choice"; 
        fBtn.value = "f";
        fBtn.id = "choice-f";
        fLabel.htmlFor = fBtn.id;

        unitControls.classList.add("unitControls");
        cChoice.classList.add("unitChoice");
        fChoice.classList.add("unitChoice");
        cChoice.append(cBtn, cLabel);
        fChoice.append(fBtn, fLabel);
        unitControls.append(cChoice, fChoice);

        cityDisplay.classList.add("cityDisplay");
        tempDisplay.classList.add("tempDisplay");
        humidityDisplay.classList.add("humidityDisplay");
        descDisplay.classList.add("descDisplay");
        weatherEmoji.classList.add("weatherEmoji");

        card.appendChild(cityDisplay);
        card.appendChild(tempDisplay);
        card.appendChild(humidityDisplay);
        card.appendChild(descDisplay);
        card.appendChild(weatherEmoji);
        card.appendChild(unitControls);

        cBtn.addEventListener("click", () =>{
            if (!isC){
                tempTemp =convertToC(isC, tempTemp);
                tempDisplay.textContent = `${tempTemp}° C`;
                isC = true;
            }
        })
        fBtn.addEventListener("click", () =>{
            if (isC){
                tempTemp =convertToF(isC, tempTemp);
                tempDisplay.textContent = `${tempTemp}° F`;
                isC = false;
            }
        })
}

function getWeatherEmoji(weatherId){
    switch (true){
        case (weatherId >= 200 && weatherId < 300):
            return "⛈️";
        case (weatherId >= 300 && weatherId < 400):
            return "🌦️";
        case (weatherId >= 500 && weatherId < 600):
            return "🌧️";
        case (weatherId>= 600 && weatherId < 700):
            return "❄️";
        case (weatherId>= 700 && weatherId < 800):
            return "🌫️";
        case (weatherId == 800):
            return "☀️";
        case (weatherId >= 801 && weatherId < 810):
            return "☁︎";
        default:
            return "❓";
    }
}
function displayError(message){
    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("errorDisplay");

    card.textContent = "";
    showCard();
    card.appendChild(errorDisplay);

}

function showCard() {
    card.style.display = "flex";
}

function setWeatherVideo(weatherId) {
    let videoPath = "background_videos/cloudy.mp4";

    if (weatherId >= 200 && weatherId < 300) {
        videoPath = "background_videos/thunderstorm.mp4";
    } else if ((weatherId >= 300 && weatherId < 400) ||
               (weatherId >= 500 && weatherId < 600)) {
        videoPath = "background_videos/rain.mp4";
    } else if (weatherId >= 600 && weatherId < 700) {
        videoPath = "background_videos/snow.mp4";
    } else if (weatherId >= 700 && weatherId < 800) {
        videoPath = "background_videos/fog.mp4";
    } else if (weatherId === 800) {
        videoPath = "background_videos/clear sky.mp4";
    }

    if (activeBackgroundVideo.src.endsWith(encodeURI(videoPath))) {
        return;
    }

    const changeId = ++videoChangeId;
    nextBackgroundVideo.classList.remove("is-visible");
    nextBackgroundVideo.onloadeddata = () => {
        if (changeId !== videoChangeId) {
            return;
        }

        const previousVideo = activeBackgroundVideo;
        const newActiveVideo = nextBackgroundVideo;
        activeBackgroundVideo = newActiveVideo;
        nextBackgroundVideo = previousVideo;

        showBackgroundVideo(newActiveVideo);
        previousVideo.classList.remove("is-visible");
    };
    nextBackgroundVideo.src = videoPath;
    nextBackgroundVideo.load();
}
function convertToC(isC, temp){
        return Math.round((temp -32)/1.8);
}
function convertToF(isC, temp){
    return Math.round((temp* 1.8)+32);
}
let canvas = document.getElementById('gameCanvas');
let tickSlider = document.getElementById('tick');
let speed = document.getElementById("number");
let ctx = canvas.getContext('2d');
let currentTick = 0;
let interval;
let isPlaying = false;

let posData = [];
let damageData = [];
let grenadeData = [];

var drawCache = [];

var images;
var he_grenade, he, flash;

async function fetchPositions() {
    try {
        let response = await fetch(`/app/2d/posdata/16`);
        if (response.ok) {
            posData = await response.json();

            keys = Object.keys(posData).map(Number);
            currentTick = Math.min(...keys);
            lastTick = Math.max(...keys);
            tickSlider.max = lastTick;
            tickSlider.min = currentTick;
            tickSlider.value = currentTick;

            console.log(posData);
            return true;
        } else {
            console.log('Failed to fetch positions');
            return false;
        }
    } catch (err) {
        console.error('Error fetching positions:', err);
        return false;
    }
}

async function fetchDamage() {
    try {
        let response = await fetch(`/app/2d/damagedata`);
        if (response.ok) {
            damageData = await response.json();
            console.log(damageData);
            return true;
        } else {
            console.log('Failed to fetch positions');
            return false;
        }
    } catch (err) {
        console.error('Error fetching positions:', err);
        return false;
    }
}

async function fetchGrenade() {
    try {
        let response = await fetch(`/app/2d/grenadedata/16`);
        if (response.ok) {
            grenadeData = await response.json();
            console.log(grenadeData);
            return true;
        } else {
            console.log('Failed to fetch positions');
            return false;
        }
    } catch (err) {
        console.error('Error fetching positions:', err);
        return false;
    }
}

function preloadImages(urls) {
    const promises = urls.map((url) => {
      return new Promise((resolve, reject) => {
        const image = new Image();
  
        image.src = url;
  
        image.onload = () => resolve(image);
        image.onerror = () => reject(`Image failed to load: ${url}`);
      });
    });
  
    return Promise.all(promises);
}

const urls = [
    '/static/img/molotov.png',
    '/static/img/he.png',
    '/static/img/flash.png'
];

(async() => {
    images = await preloadImages(urls);
  
    [he_grenade, he, flash] = await preloadImages(urls);
})();

fetchPositions();
fetchDamage();
fetchGrenade();

async function draw(tick) {
    if (posData.length === 0) {
        return;  // No data to draw
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (i = 0; i < drawCache.length; i++) {
        var item = drawCache[i];

        if (item.clear <= new Date().getTime())
        {
            drawCache.splice(i, 1);
        } else 
        {

            if (item.type == "circle")
            {
                console.log(item);
                ctx.fillStyle = item.color;
                ctx.beginPath();
                ctx.arc((item.x + 3150)/5, (-item.y + 1700)/5, 2, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }

    const entriesG = grenadeData[tick.toString()];
    if (entriesG != null)
    {
        for (const [key, value] of Object.entries(entriesG)) {
            //console.log(value);
            //if (value.name == "megaskittle") {
                //ctx.fillStyle = "white";
            //} else if (value.team_num == 2)
            //{
                //ctx.fillStyle = "yellow";
                    
            //} else {
                //ctx.fillStyle = "blue";
            //}
            if (value.grenade_type == "he_grenade")
            {
                ctx.drawImage(he_grenade, (value.X + 3150)/5 - 15, (-value.Y + 1700)/5 - 15, 25, 45);
            } else if (value.grenade_type == "flashbang")
            {
                ctx.drawImage(flash, (value.X + 3150)/5 - 15, (-value.Y + 1700)/5 - 25, 25, 45);
            } else if (value.grenade_type == "grenade")
            {
                ctx.drawImage(he, (value.X + 3150)/5 -15, (-value.Y + 1700)/5 -15, 25, 45);
            }

            drawCache.push({
                x: value.X,
                y: value.Y,
                type: "circle",
                clear: new Date().getTime() + 2000,
                color: "#FFFFFF"
            });
            //ctx.fillStyle = "green";
    
            //ctx.beginPath();
            //ctx.arc((value.X + 3150)/5, (-value.Y + 1700)/5, 3, 0, 2 * Math.PI);
            //ctx.fill();
        }
    }
    //console.log(posData);
    //console.log(currentTick);
    const entries = posData[tick.toString()];
    for (const [key, value] of Object.entries(entries)) {
        //console.log(key, value);
        //console.log(value.x);
        if (value.is_alive)
        {
            if (value.name == "megaskittle") {
                ctx.fillStyle = "white";
            } else if (value.team_num == 2)
            {
                ctx.fillStyle = "yellow";
                
            } else {
                ctx.fillStyle = "blue";
            }

            ctx.font = "12px Arial";
            ctx.fillText(value.name,(value.x + 3150)/5 + 10, (-value.y + 1700)/5 + 5);

            ctx.beginPath();
            ctx.arc((value.x + 3150)/5, (-value.y + 1700)/5, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    if (damageData[tick.toString()] != null) 
    {
        damageData[tick.toString()].forEach(event => {
                    
            positions = posData[tick.toString()];

            attacker = positions[event.attacker_steamid.toString()];
            attacked = positions[event.user_steamid.toString()];
            //console.log(positions);
            //console.log(attacker);
            //console.log(attacked);
            ctx.beginPath();
            ctx.moveTo((attacker.x + 3150)/5, (-attacker.y + 1700)/5);
            ctx.lineTo((attacked.x + 3150)/5, (-attacked.y + 1700)/5);
            ctx.lineWidth = 5;
            ctx.strokeStyle = "red";
            ctx.stroke();
        });
    }
}

tickSlider.oninput = function() {
    draw(this.value);
}


function play() {
    if (!isPlaying && posData.length != 0) {
        isPlaying = true;
        keys = Object.keys(posData).map(Number);
        currentTick = Math.min(...keys);
        lastTick = Math.max(...keys);
        interval = setInterval(() => {
            newValue = parseInt(tickSlider.value) + 1;
            tickSlider.value = newValue;
            draw(newValue);
        }, 1000 / speed.value);
    }
}

function pause() {
    isPlaying = false;
    clearInterval(interval);
}

function rewind() {
    pause();
    currentTick = Math.max(0, currentTick - 1);
    draw();
}

function forward() {
    pause();
    currentTick++;
    draw();
}

speed.onchange = function() {
    isPlaying = false;
    clearInterval(interval);
    play();
}
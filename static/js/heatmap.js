let canvas = document.getElementById('gameCanvas');
let plrColors = document.getElementById('colors');
let ctx = canvas.getContext('2d');

const colors = {
    2: ["yellow","brown","pink","red","green"],
    3: ["black","purple","orange","white","blue"]
}

const colorKey = {}

async function fetchPositions(round) {
    try {
        let response = await fetch(`/app/heatmap/posdata/`+round);
        if (response.ok) {
            var posData = Object.values(await response.json());

            for(let i = 0; i < posData.length; i++){
                if (posData[i].name == "megaskittle")
                {
                    ctx.fillStyle = colors[posData[i].team][posData[i].color];
                ctx.fillRect((posData[i].x + 3150)/5, (-posData[i].y + 1700)/5, 1, 1);

                if (colorKey[posData[i].name] == null)
                {
                    colorKey[posData[i].name] = colors[posData[i].team][posData[i].color];
                }
                }
            }

            for (const [key, value] of Object.entries(colorKey)) {
                plrColors.innerText += key+": "+value+"\n"
            }

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

for(let i = 0; i < 20; i++){
    fetchPositions(i.toString());
    console.log(i);
}
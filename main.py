from demoparser2 import DemoParser
from flask import Flask, request, send_file, jsonify, send_from_directory
import json

app = Flask(__name__,
            static_url_path='', 
            static_folder='static')

@app.route('/static/<path:path>')
def send_report(path):
    return send_from_directory('static', path)

@app.route('/app/2d')
def twodimensional():
    return '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Player Positions</title>
    <style>
        canvas {
            border: 1px solid black;
        }
        .controls {
            margin-top: 10px;
        }
        .slider {
          -webkit-appearance: none;
          width: 800px;
          height: 25px;
          background: #d3d3d3;
          outline: none;
          opacity: 0.7;
          -webkit-transition: .2s;
          transition: opacity .2s;
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas" width="800" height="800" style="background: url('/static/img/de_vertigo_radar.png'); background-size: cover;"></canvas>
    <div class="controls">
        <input type="range" min="1" max="100" value="1" class="slider" id="tick"><br>
        <input id="number" type="number" value="60"/>
        <button onclick="rewind()">Rewind</button>
        <button onclick="play()">Play</button>
        <button onclick="pause()">Pause</button>
        <button onclick="forward()">Forward</button>
    </div>
    <script src="/static/js/2d.js"></script>
</body>
</html>
'''

@app.route('/app/2d/posdata/<round>')
def posdata(round):
    parser = DemoParser("demos/1-a415ce39-45bc-4893-a9f9-45bb5806627c-1-1.dem")

    json_str = parser.parse_event(event_name="round_prestart").to_json(orient="index")
    data = json.loads(json_str)

    df = parser.parse_ticks(["X", "Y", "is_alive", "player_color", "team_num", "player_state"], ticks=list(range(data[round]["tick"], data[str(int(round)+1)]["tick"])))
    result = {}
    for tick, group in df.groupby('tick'):
        tick_data = {}
        for index, row in group.iterrows():
            steamid = str(row['steamid'])
            tick_data[steamid] = {'x': row['X'], 'y': row['Y'], 'is_alive': row['is_alive'], 'player_color': row['player_color'], 'team_num': row['team_num'], 'player_state': row['player_state'], 'name': row['name']}
        result[tick] = tick_data
    return jsonify(result)

@app.route('/app/2d/damagedata')
def damagedata():
    parser = DemoParser("demos/1-a415ce39-45bc-4893-a9f9-45bb5806627c-1-1.dem")

    json_str = parser.parse_event(event_name="player_hurt").to_json(orient="index")
    json_str = json.loads(json_str)
    organized_data = {}

    for entry in json_str.values():
        tick = entry['tick']
        if tick not in organized_data:
            organized_data[tick] = []
        organized_data[tick].append(entry)

    return jsonify(organized_data)

@app.route('/app/2d/grenadedata/<round>')
def grenadedata(round):
    parser = DemoParser("demos/1-a415ce39-45bc-4893-a9f9-45bb5806627c-1-1.dem")

    json_str = parser.parse_event(event_name="round_prestart").to_json(orient="index")
    data = json.loads(json_str)

    df = parser.parse_grenades()

    start_tick = data[round]["tick"]
    end_tick = data[str(int(round)+1)]["tick"]

    df = df[(df['tick'] >= start_tick) & (df['tick'] <= end_tick)]

    json_data = {}

    for tick, group in df.groupby('tick'):
        events = group.drop(columns=['tick']).to_dict(orient='records')
        json_data[tick] = events

    json_data = json.dumps(json_data)

    return json_data


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
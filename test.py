from demoparser2 import DemoParser
import json

parser = DemoParser("demos/1-a415ce39-45bc-4893-a9f9-45bb5806627c-1-1.dem")

print(parser.parse_event(event_name="player_hurt"))
#print(parser.parse_event(event_name="round_prestart").to_json(orient = "index")["2"]["tick"])
json_str = parser.parse_event(event_name="player_hurt").to_json(orient="index")
json_str = json.loads(json_str)
organized_data = {}

for entry in json_str.values():
    tick = entry['tick']
    if tick not in organized_data:
        organized_data[tick] = []
    organized_data[tick].append(entry)

print(organized_data)

data = json.loads(json_str)
print(data)
print(data["2"]["tick"])
print(data["3"]["tick"])
#print(parser.parse_event(event_name="round_officially_ended"))
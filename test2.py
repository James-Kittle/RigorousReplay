from demoparser2 import DemoParser
import json

parser = DemoParser("demos/1-a415ce39-45bc-4893-a9f9-45bb5806627c-1-1.dem")

df = parser.parse_grenades()

start_tick = 0
end_tick = 9000

# Filter the DataFrame to include only the ticks within the specified range
df = df[(df['tick'] >= start_tick) & (df['tick'] <= end_tick)]

json_data = {}

# Iterate over each group (tick and entity_id) and populate the JSON dictionary
for (tick, entity_id), group in df.groupby(['tick', 'entity_id']):
    if tick not in json_data:
        json_data[tick] = {'tick': tick, 'events': []}
    event_dict = group.drop(columns=['tick', 'entity_id']).to_dict(orient='records')[0]
    json_data[tick]['events'].append(event_dict)

# Convert the dictionary to JSON format
json_data = json.dumps(list(json_data.values()), indent=4)

print(json_data)
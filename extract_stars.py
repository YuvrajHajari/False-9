import json

# Load your original player data
with open('src/data/players.json', 'r', encoding='utf-8') as f:
    players = json.load(f)

# Extract players where isStar is True
star_players = [p for p in players if p.get("isStar") == True]

# Save the extracted stars to a new file
with open('star_players.json', 'w', encoding='utf-8') as f:
    json.dump(star_players, f, indent=4)

print(f"Successfully extracted {len(star_players)} star players.")
import pandas as pd
import json
import os
import unicodedata

def format_search_name(name):
    """Removes accents and converts to lowercase for easy searching."""
    if not isinstance(name, str): return ""
    return "".join(c for c in unicodedata.normalize('NFD', name)
                   if unicodedata.category(c) != 'Mn').lower()

def parse_age(age_val):
    """Handles formats like '20-094', '20.0', or '20'."""
    try:
        age_str = str(age_val)
        if '-' in age_str:
            return int(age_str.split('-')[0])
        return int(float(age_str))
    except (ValueError, TypeError):
        return 0

# 1. Load Data
df = pd.read_csv('players.csv')
df.columns = df.columns.str.strip()

# 2. Map Columns (Adjusting for common FBRef/Kaggle names)
NAME_COL = 'Player' if 'Player' in df.columns else 'name'
NATION_COL = 'Nation' if 'Nation' in df.columns else 'nation'
SQUAD_COL = 'Squad' if 'Squad' in df.columns else 'squad'
MP_COL = 'MP' if 'MP' in df.columns else 'matches played'
POS_COL = 'Pos' if 'Pos' in df.columns else 'position'
LG_COL = 'Comp' if 'Comp' in df.columns else 'league'
AGE_COL = 'Age' if 'Age' in df.columns else 'age'

# 3. Define "Target" Pool Criteria
# These are teams whose players are likely to be the "Mystery Player"
STAR_TEAMS = [
    'Real Madrid', 'Barcelona', 'Manchester City', 'Liverpool', 'Arsenal', 
    'Bayern Munich', 'Bayer Leverkusen', 'Inter', 'AC Milan', 'Juventus', 'PSG'
]

# 4. Process Players
players_list = []

for _, row in df.iterrows():
    # Only include players who have actually played matches
    if row.get(MP_COL, 0) < 3:
        continue

    # Extract Nationality code (e.g., "se SWE" -> "se")
    nat_raw = str(row.get(NATION_COL, ""))
    nat_code = nat_raw.split(' ')[0].lower() if ' ' in nat_raw else nat_raw.lower()

    player_obj = {
        "name": row[NAME_COL],
        "search": format_search_name(row[NAME_COL]),
        "natCode": nat_code,
        "pos": row.get(POS_COL, "N/A"),
        "club": row[SQUAD_COL],
        "league": row.get(LG_COL, "Unknown"),
        "age": parse_age(row.get(AGE_COL, 0)),
        # isStar determines if they can be the Mystery Player
        "isStar": row[SQUAD_COL] in STAR_TEAMS or row.get(MP_COL, 0) > 25
    }
    players_list.append(player_obj)

# 5. Save to JSON
os.makedirs('src/data', exist_ok=True)
with open('src/data/players.json', 'w', encoding='utf-8') as f:
    json.dump(players_list, f, ensure_ascii=False, indent=2)

print(f"Success! Saved {len(players_list)} players to src/data/players.json")
print(f"Target pool size: {len([p for p in players_list if p['isStar']])} stars.")
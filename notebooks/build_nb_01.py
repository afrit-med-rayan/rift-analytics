import nbformat as nbf

nb = nbf.v4.new_notebook()

# Markdown cell 1
text_setup = """\
# Phase 1: Data Cleaning

Loads the raw CSVs from the `datasets` folder, cleans them, merges them, and outputs a single `clean_matches.csv` for EDA."""

# Code cell 1
code_setup = """\
import pandas as pd
import numpy as np
import os
import io

DATA_DIR = '../datasets/League of Legends Ranked Matches'
CHAMP_DIR = '../datasets/League of Legends Champion'
OUTPUT_DIR = '../data/processed'

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)"""

# Markdown cell 2
text_load = "## 1. Load Data"

# Code cell 2
code_load = """\
# Load core match data
matches = pd.read_csv(f'{DATA_DIR}/matches.csv')
participants = pd.read_csv(f'{DATA_DIR}/participants.csv')
stats1 = pd.read_csv(f'{DATA_DIR}/stats1.csv')
stats2 = pd.read_csv(f'{DATA_DIR}/stats2.csv')
teamstats = pd.read_csv(f'{DATA_DIR}/teamstats.csv')

# Load champion mapping
champs_old = pd.read_csv(f'{DATA_DIR}/champs.csv')
champs_new = pd.read_csv(f'{CHAMP_DIR}/League of legend Champions 2024.csv')

print(f"Loaded {len(matches)} matches, {len(participants)} participants, and {len(champs_new)} new champions.")
"""

# Markdown cell 3
text_clean_champs = "## 2. Prepare Champion Data\nThe new champion dataset has names that might slightly differ from the old one, and it contains the metadata we need (Classes, Role, Difficulty)."

# Code cell 3
code_clean_champs = """\
# Clean champion names for better mapping
def clean_champ_name(name):
    if not isinstance(name, str): return name
    return name.lower().replace(" ", "").replace("'", "").replace(".", "")

champs_old['name_clean'] = champs_old['name'].apply(clean_champ_name)
champs_new['name_clean'] = champs_new['Name'].apply(clean_champ_name)

# Identify unmapped ones and fix (e.g. Wukong vs MonkeyKing)
champs_old.loc[champs_old['name'] == 'MonkeyKing', 'name_clean'] = 'wukong'
champs_old.loc[champs_old['name'] == 'ChoGath', 'name_clean'] = 'chogath'
champs_old.loc[champs_old['name'] == 'KhaZix', 'name_clean'] = 'khazix'
champs_old.loc[champs_old['name'] == 'Leblanc', 'name_clean'] = 'leblanc'
champs_old.loc[champs_old['name'] == 'VelKoz', 'name_clean'] = 'velkoz'

# Join old IDs to new metadata
champ_meta = champs_old.merge(champs_new[['name_clean', 'Classes', 'Role', 'Difficulty']], on='name_clean', how='left')

# Fill missing metadata with "Unknown" for old champs not in 2024 list (if any remain)
champ_meta['Classes'].fillna('Unknown', inplace=True)
champ_meta['Role'].fillna('Unknown', inplace=True)
champ_meta['Difficulty'].fillna('Unknown', inplace=True)

print("Champion metadata shape:", champ_meta.shape)
"""

# Markdown cell 4
text_merge = "## 3. Merge Datasets"

# Code cell 4
code_merge = """\
# Concatenate stats1 and stats2 since they are row-wise splits of the same columns
stats = pd.concat([stats1, stats2], ignore_index=True)

# Merge participants with their stats
df = pd.merge(participants, stats, on='id', how='left')

# Drop duration from matches if we only need specific columns, but duration is crucial
# Merge with matches to get duration and game start time
df = pd.merge(df, matches[['id', 'duration', 'creation']], left_on='matchid', right_on='id', suffixes=('', '_match'))
df.rename(columns={'id_match': 'matchid_check'}, inplace=True)
df.drop('matchid_check', axis=1, inplace=True)

# Add team mapping (100 and 200 based on participant player 1-5 = 100, 6-10 = 200)
df['team_id'] = np.where(df['player'] <= 5, 100, 200)

# Merge with teamstats
teamstats_subset = teamstats[['matchid', 'teamid', 'firstblood', 'firsttower', 'firstinhib', 'firstbaron', 'firstdragon', 'firstharry', 'towerkills', 'inhibkills', 'baronkills', 'dragonkills', 'harrykills']]
df = pd.merge(df, teamstats_subset, left_on=['matchid', 'team_id'], right_on=['matchid', 'teamid'], how='left', suffixes=('', '_team'))
df.drop('teamid', axis=1, inplace=True)

# Merge with champion metadata
df = pd.merge(df, champ_meta[['id', 'name', 'Classes', 'Role', 'Difficulty']], left_on='championid', right_on='id', suffixes=('', '_champ'))
df.rename(columns={'name': 'champion_name', 'Classes': 'champion_classes', 'Role': 'champion_role', 'Difficulty': 'champion_difficulty'}, inplace=True)
if 'id_champ' in df.columns:
    df.drop('id_champ', axis=1, inplace=True)

print(f"Merged dataframe shape: {df.shape}")
"""

# Markdown cell 5
text_clean = "## 4. Final Cleanup & Outliers"

# Code cell 5
code_clean = """\
# 1. Standardize column names (lowercase) FIRST
df.columns = [col.lower() for col in df.columns]

# 2. Filter out remakes (duration < 300 seconds)
df = df[df['duration'] >= 300].copy()

# 3. Handle outliers
# Cap extreme values
df['kills'] = df['kills'].clip(upper=df['kills'].quantile(0.999))
df['deaths'] = df['deaths'].clip(upper=df['deaths'].quantile(0.999))
df['assists'] = df['assists'].clip(upper=df['assists'].quantile(0.999))

# Check missing values
missing = df.isnull().sum()
print("Top missing values:\\n", missing[missing > 0])

# Fill na for firstblood, firsttower, etc with 0 since it implies it didn't happen
cols_to_fill_0 = ['firstblood', 'firsttower', 'firstinhib', 'firstbaron', 'firstdragon', 'firstharry']
df[cols_to_fill_0] = df[cols_to_fill_0].fillna(0)

print(f"Final clean matches shape: {df.shape}")
"""

# Markdown cell 6
text_save = "## 5. Save Processed Data"

# Code cell 6
code_save = """\
# Save to processed directory
# We only save columns that are useful for EDA and modeling to save space
cols_to_keep = [
    'id', 'matchid', 'player', 'champion_name', 'champion_classes', 'champion_role', 'champion_difficulty',
    'ss1', 'ss2', 'role', 'position', 'win', 'kills', 'deaths', 'assists',
    'totdmgtochamp', 'totdmgdealt', 'totdmgtaken', 'goldearned', 'goldspent', 
    'totminionskilled', 'neutralminionskilled', 'visionscore', 'wardsplaced', 'wardskilled', 'duration',
    'team_id', 'firstblood', 'firsttower', 'firstbaron', 'firstdragon', 'towerkills', 'dragonkills', 'baronkills'
]

df_final = df[cols_to_keep]
df_final.to_csv(f'{OUTPUT_DIR}/clean_matches.csv', index=False)
print("Saved clean_matches.csv!")
"""

# Add cells to notebook
nb['cells'] = [
    nbf.v4.new_markdown_cell(text_setup),
    nbf.v4.new_code_cell(code_setup),
    nbf.v4.new_markdown_cell(text_load),
    nbf.v4.new_code_cell(code_load),
    nbf.v4.new_markdown_cell(text_clean_champs),
    nbf.v4.new_code_cell(code_clean_champs),
    nbf.v4.new_markdown_cell(text_merge),
    nbf.v4.new_code_cell(code_merge),
    nbf.v4.new_markdown_cell(text_clean),
    nbf.v4.new_code_cell(code_clean),
    nbf.v4.new_markdown_cell(text_save),
    nbf.v4.new_code_cell(code_save)
]

# Write out
with open('c:/Users/asus/rift-analytics/notebooks/01_data_cleaning.ipynb', 'w') as f:
    nbf.write(nb, f)

print("Notebook generated successfully!")

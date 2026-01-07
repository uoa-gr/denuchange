import urllib.request
import json
import time

locations = [
    ("Apeiranthos", "Apeiranthos,Naxos,Greece"),
    ("Kinidaros", "Kinidaros,Naxos,Greece"),
    ("Mikri Vigla", "Mikri Vigla beach,Naxos,Greece"),
    ("Stelida", "Stelida,Naxos,Greece"),
    ("Pyrgaki", "Pyrgaki beach,Naxos,Greece"),
    ("Alyko", "Alyko beach,Naxos,Greece"),
    ("Laguna", "Laguna,Naxos,Greece"),
    ("Aplomata", "Aplomata,Naxos,Greece"),
    ("Faneromeni", "Engares,Naxos,Greece"),  # Faneromeni is near Engares
]

for name, query in locations:
    try:
        url = f"https://nominatim.openstreetmap.org/search?q={query.replace(' ', '+').replace(',', '%2C')}&format=json&limit=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        data = json.loads(response.read())
        if data:
            print(f"{name}: lat={data[0]['lat']}, lng={data[0]['lon']}")
        else:
            print(f"{name}: NOT FOUND")
        time.sleep(1)  # Be polite to Nominatim
    except Exception as e:
        print(f"{name}: ERROR - {e}")


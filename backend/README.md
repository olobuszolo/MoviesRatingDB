# MoviesRatingDB Backend

Backend FastAPI korzystający z bazy grafowej Neo4j.

## Uruchomienie lokalne

1. Utworz plik `.env` na podstawie `.env.example`.
2. Uruchom Neo4j:

```powershell
docker compose up -d
```

3. Zainstaluj zaleznosci:

```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

4. Uruchom API:

```powershell
uvicorn main:app --reload
```

API bedzie dostepne pod adresem `http://127.0.0.1:8000`.
Dokumentacja Swagger: `http://127.0.0.1:8000/docs`.

Panel Neo4j Browser: `http://localhost:7474`.

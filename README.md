# Vaultkey – Password Generator

Flask-served, installable (PWA) password generator. Passwords are generated in the
browser with `crypto.getRandomValues()` and are never sent to the server.

## Run
    pip install -r requirements.txt
    python app.py
Open http://127.0.0.1:5000 (service workers work on localhost and HTTPS only).

## CLI
    python password_generator.py

## Structure
- `app.py` – Flask app (serves page + service worker at `/`)
- `password_generator.py` – Python logic using `secrets` (CLI / reusable)
- `templates/index.html`, `static/` – UI, PWA manifest, service worker, icons

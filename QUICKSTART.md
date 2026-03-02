# 🚀 Szybki Start - Wtyczka Sensor

## ⚡ 5 Minut do Pierwszego Użytku

### Opcja A: Chrome Extension (Zalecane)

#### 1. Przygotowanie (2 minuty)
```
Upewnij się że posiadasz:
✓ Chrome/Edge
✓ Kamera
✓ Folder z plikami wtyczki
```

#### 2. Instalacja (1 minuta)
```
1. Wejdź na chrome://extensions/
2. Włącz "Tryb dla programisty" (prawy góry róg)
3. Kliknij "Załaduj rozpakowane rozszerzenie"
4. Wybierz folder WtyczkaSensor
```

#### 3. Użytkowanie (2 minuty)
```
1. Kliknij ikonę wtyczki
2. Kliknij "Start" - włączy się kamera
3. Pokaż rękę do kamery
4. 👆 = Scroll Up, 👉 = Scroll Down
5. Otwórz stronę www i przewijaj!
```

---

### Opcja B: Wersja Standalone (Python)

#### 1. Instalacja Python (3 minuty)
```bash
# Pobierz z https://www.python.org (Python 3.8+)
# I zainstaluj

# Sprawdź czy zainstalowany:
python --version
```

#### 2. Instalacja pakietów (2 minuty)
```bash
cd C:\Users\HP\Desktop\WtyczkaSensor
pip install -r requirements.txt
```

#### 3. Uruchomienie (1 minuta)
```bash
python standalone.py
```

#### 4. Użytkowanie (same instrukcje co wyżej)
```
👆 Indeks = Scroll Up
👉 Mały palec = Scroll Down
ESC = Wyjście
```

---

## 🎯 Podstawowe Gesty

```
┌─────────────────────────────────┐
│  👆 = SCROLL UP                 │
│  (podnieś TYLKO indeks)         │
├─────────────────────────────────┤
│  👉 = SCROLL DOWN               │
│  (podnieś TYLKO mały palec)     │
├─────────────────────────────────┤
│  ✌️ = NOŻYCE (rozpoznane)       │
│  ✊ = KAMIEŃ (rozpoznane)       │
│  ✋ = PAPIER (rozpoznane)       │
└─────────────────────────────────┘
```

---

## 🐛 Szybkie Rozwiązania

### Kamera się nie włącza
```
Chrome: chrome://settings/content/camera → Zezwól
Standalone: Spróbuj innej kamery w kodzie (VideoCapture(1))
```

### Gesty nie działają
```
1. Zmniejsz próg detektowania (0.3 zamiast 0.5)
2. Popraw oświetlenie
3. Pokaż całą rękę (od nadgarstka)
4. Stań z boku do kamery
```

### Model się nie pobiera
```bash
python setup_helper.py  # Opcja 3 - Pobierz model
```

---

## 📊 Struktura folderów

```
WtyczkaSensor/
├── 📝 manifest.json          Konfiguracja wtyczki Chrome
├── 🌐 popup.html             UI wtyczki
├── 💻 popup.js               Logika detektowania (Chrome)
├── 📄 content.js             Skrypt na stronach www
├── 🔧 background.js          Service worker
├── 🐍 standalone.py          Aplikacja Python (samodzielna)
├── 🔧 setup_helper.py        Helper do instalacji
├── ⚙️ config.json            Ustawienia
├── 📖 README.md              Dokumentacja
├── 📖 INSTRUKCJA.md          Pełna instrukcja
├── 📖 QUICKSTART.md          Ten plik
└── 📦 requirements.txt       Python pakiety
```

---

## ✅ Checklist Instalacji

### Chrome Extension
- [ ] Pobrane pliki do folderu
- [ ] Chrome zainstalowany
- [ ] Wtyczka załadowana
- [ ] Uprawnienia do kamery przyznane
- [ ] Kamera testowana i działająca

### Wersja Standalone
- [ ] Python 3.8+ zainstalowany
- [ ] Pakiety z requirements.txt zainstalowane
- [ ] Model hand_landmarker.task pobrany lub automatycznie
- [ ] Kamera testowana i działająca
- [ ] Plik standalone.py w tym folderze

---

## 🎮 Pierwsze Testy

### Test 1: Czy kamera działa?

**Chrome:**
1. Otwórz wtyczkę
2. Kliknij "Start"
3. Powinna być widoczna kamera

**Standalone:**
```bash
python standalone.py
# Powinno włączyć okno z podglądem
```

### Test 2: Czy gesty są rozpoznawane?

1. Pokaż rękę do kamery
2. Sprawdź czy wypisuje rozpoznany gest
3. Jeśli nie - zmniejsz próg detektowania

### Test 3: Czy przewijanie działa?

1. Otwórz stronę www (np. wikipedia.com)
2. Pokaż indeks - powinna przewijać w górę
3. Pokaż mały palec - powinna przewijać w dół

---

## 🎯 Porady

### Dla Najlepszych Wyników
```
✓ Miej dobre oświetlenie (lampow lub okno)
✓ Pokażj całą rękę (od nadgarstka)
✓ Bądź w odległości 30-60cm od kamery
✓ Rób gesty wyraźnie i wolniej
✓ Tło powinno być względnie jednokolorowe
```

### Dostosowanie Czułości

**Chrome Extension:**
- Suwak "Próg detekcji" - niska = czułe
- Suwak "Czułość przewijania" - wysoka = więcej pikseli

**Standalone (w kodzie):**
```python
MIN_CONFIDENCE = 0.3      # Niżej = czułość
SCROLL_PIXELS = 100       # Więcej = większe przewijanie
```

---

## 🔗 Linki Przydatne

- 📖 Pełna dokumentacja: Otwórz `INSTRUKCJA.md`
- 🎮 Konfiguracja: `config.json`
- ⚙️ Setup: Uruchom `python setup_helper.py`

---

## ❓ FAQ

**P: Czy mogę używać dwie ręce?**
Tak, wtyczka wspiera do 2 rąk równocześnie. Będzie rozpoznawać niezależnie.

**P: Czy wysyła dane do internetu?**
Nie! Wszystko dzieje się na Twoim komputerze off-line.

**P: Czy mogę dostosować komendy?**
Tak! Edytuj `config.json` aby własne ustawienia.

**P: Czy działa na Linuxie/Macu?**
Tak! Kod jest cross-platform.

---

## 🆘 Potrzebujesz Pomocy?

1. **Sprawdź konsolę:**
   - Chrome: F12 → Console
   - Python: Czytaj komunikaty błędów

2. **Przeczytaj INSTRUKCJA.md** - Pełna dokumentacja

3. **Spróbuj setup_helper.py:**
   ```bash
   python setup_helper.py
   ```

---

## 📞 Kontakt

Masz problem? Sprawdź:
- Chrome EventListener (F12)
- Python traceback
- System Event Viewer

---

**Powodzenia! 🚀**

Gotowy do użytku? Przechodf do [INSTRUKCJA.md](INSTRUKCJA.md) aby poznać wszystkie możliwości!

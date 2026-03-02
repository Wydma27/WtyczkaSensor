# 🎮 Wtyczka Sensor - Przewijaj Stronę Ręką

Kompletne rozwiązanie do przewijania stron www za pomocą gestów rąk. Dostępne dwie wersje:
1. **Chrome Extension** - Wtyczka do przeglądarki Chrome
2. **Standalone** - Samodzielna aplikacja Python

---

## 📋 Spis treści

- [Wymagania systemowe](#-wymagania-systemowe)
- [Chrome Extension](#-chrome-extension)
  - [Instalacja](#instalacja-chrome-extension)
  - [Użytkowanie](#użytkowanie-chrome-extension)
- [Wersja Standalone](#-wersja-standalone)
  - [Instalacja](#instalacja-wersji-standalone)
  - [Użytkowanie](#użytkowanie-wersji-standalone)
- [Dostępne gesty](#-dostępne-gesty)
- [Rozwiązywanie problemów](#-rozwiązywanie-problemów)

---

## ✅ Wymagania systemowe

### Ogólne
- Kamera internetowa (webcam)
- Dobre oświetlenie
- Windows 10/11, macOS lub Linux

### Chrome Extension
- Przeglądarka Chrome/Edge/Chromium (wersja 90+)
- Dostęp do kamery

### Wersja Standalone
- Python 3.8+
- Pakiety z `requirements.txt`

---

## 🔌 Chrome Extension

### Instalacja Chrome Extension

#### Krok 1: Przygotowanie
Upewnij się, że posiadasz wszystkie pliki w jednym folderze:
```
WtyczkaSensor/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── background.js
└── README.md
```

#### Krok 2: Załadowanie do Chrome
1. Otwórz Chrome i wejdź na stronę `chrome://extensions/`
2. Włącz **"Tryb dla programisty"** (guzik w prawym górnym rogu)
3. Kliknij **"Załaduj rozpakowane rozszerzenie"**
4. Wybierz folder `WtyczkaSensor`
5. ✓ Gotowe! Wtyczka powinna się pojawić na liście

#### Krok 3: Uprawnienia
Chrome poprosi o uprawnienia:
- ✓ Dostęp do aktywnej karty
- ✓ Dostęp do kamery

**Zatwierdź wszystkie uprawnienia!**

### Użytkowanie Chrome Extension

1. **Otwórz stronę www** którą chcesz przewijać
2. **Kliknij ikonę wtyczki** w pasku Chrome
3. **Kliknij "Start"** aby włączyć kamerę
4. **Pokaż swoją rękę** do kamery - powinna być widoczna w podglądzie
5. Wykonuj gesty:
   - 👆 **Podnieś indeks** → Przewijanie w górę
   - 👉 **Podnieś mały palec** → Przewijanie w dół
6. Na stronie zobaczysz animowane wskaźniki przewijania
7. **Kliknij "Stop"** aby wyłączyć kamerę

### Interfejs Chrome Extension

```
┌─────────────────────────────────┐
│ 🎮 Wtyczka Sensor               │
│ Przewijaj stronę www ręką       │
├─────────────────────────────────┤
│ [PODGLĄD KAMERY ← TUTAJ]        │
│                                 │
│ Brak detekcji                   │
│                                 │
│ [▶ Start] [⏹ Stop]             │
├─────────────────────────────────┤
│ FPS: 30                         │
│ Ręka: ✅ Tak (1)               │
│ Gesty: 45                       │
│ Przewijania: 12                 │
├─────────────────────────────────┤
│ Próg detektowania: ─────○       │
│ Czułość przewijania: [20]       │
└─────────────────────────────────┘
```

---

## 🐍 Wersja Standalone

### Instalacja Wersji Standalone

#### Krok 1: Zainstaluj Python
Pobierz Python 3.8+ z https://www.python.org

#### Krok 2: Zainstaluj zależności
```bash
# Przejdź do folderu projektu
cd C:\Users\HP\Desktop\WtyczkaSensor

# Zainstaluj pakiety
pip install -r requirements.txt
```

#### Krok 3: Pobierz model (opcjonalnie)
Model MediaPipe pobierze się automatycznie przy pierwszym uruchomieniu. Jeśli chcesz pobrać go wcześniej:

```bash
python -c "
import urllib.request
import os
if not os.path.exists('hand_landmarker.task'):
    print('Pobieranie...')
    urllib.request.urlretrieve(
        'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
        'hand_landmarker.task'
    )
    print('Gotowe!')
"
```

### Użytkowanie Wersji Standalone

#### Uruchomienie
```bash
python standalone.py
```

#### Instrukcja
Pojawi się okno z podglądem kamery:

```
============================================================
✓ Detektor załadowany prawidłowo
✓ Model: hand_landmarker.task
✓ Próg detektowania: 0.5
✓ Uruchamianie kamery...
============================================================

🎮 INSTRUKCJA UŻYCIA:
  • Pokaż INDEKS - Przewijanie w GÓRĘ
  • Pokaż MAŁY PALEC - Przewijanie w DÓŁ 
  • Zamknięta pięść - KAMIEŃ
  • Otwarta dłoń - PAPIER
  • Indeks + Środek - NOŻYCE

  Naciśnij ESC aby wyjść
============================================================
```

1. Pokaż rękę do kamery
2. Wykonuj gesty z instrukcji
3. Stona powinna się przewijać automatycznie
4. Naciśnij **ESC** aby wyjść

#### Dostosowanie parametrów (w kodzie)
W pliku `standalone.py` możesz zmienić:

```python
GESTURE_SCROLL_DELAY = 0.5      # Sekundy między przewijaniami
SCROLL_PIXELS = 50              # Piksele na jedno przewijanie
MIN_CONFIDENCE = 0.5            # Próg detektowania (0.3-0.9)
```

---

## 👆 Dostępne Gesty

| Gest | Działanie | Instrukcja |
|------|----------|----------|
| 👆 Indeks | **Scroll Up** | Podnieś TYLKO palec wskazujący, reszta zamknięta |
| 👉 Mały palec | **Scroll Down** | Podnieś TYLKO mały palec, reszta zamknięta |
| ✌️ Nożyce | Rozpoznane | Indeks + Środek uniesione |
| ✊ Kamień | Rozpoznane | Wszystkie palce zamknięte |
| ✋ Papier | Rozpoznane | Wszystkie palce otwarte |

### Porady do rozpoznawania gestów

✅ **Działa dobrze gdy:**
- Pokażesz całą rękę do kamery
- Będzie dobre oświetlenie
- Będziesz blisko kamery (30-60cm)
- Tło będzie jednokolorowe/neutralne

❌ **Może nie pracować gdy:**
- Będziesz za daleko
- Oświetlenie będzie słabe
- Tło będzie chaotyczne
- Reka będzie załadzona czymś (biżuteria, rękawiczki)

---

## 🐛 Rozwiązywanie Problemów

### Problem: Kamera się nie włącza

**Chrome Extension:**
```
Rozwiązanie:
1. Przejdź do chrome://settings/content/camera
2. Pozwól Chrome na dostęp do kamery
3. Dodaj chrome://extensions do listy dozwolonych witryn
4. Przeładuj wtyczkę (F5)
```

**Wersja Standalone:**
```
Sprawdź:
- Czy kamera nie jest używana przez inny program
- Czy zainstalowane są drivers kamery
- Czy kamera się pojawia w urządzeniach systemowych
```

### Problem: Gesty nie są rozpoznawane

```
Spróbuj:
1. Zmniejsz próg detektowania (Próg: 0.3-0.4)
2. Pokaż całą rękę - od nadgarstka w górę
3. Popraw oświetlenie
4. Stań z prawa albo lewa stroną do kamery
5. Rób gesty wolniej i wyraźniej
```

### Problem: Błędy związane z MediaPipe

```bash
# Aby naprawić błędy MediaPipe:
pip install --upgrade mediapipe
# lub
pip uninstall mediapipe
pip install mediapipe==0.10.0
```

### Problem: "hand_landmarker.task not found"

```bash
# Ręcznie pobierz model:
python -c "
import urllib.request
print('Pobieranie modelu...')
urllib.request.urlretrieve(
    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task',
    'hand_landmarker.task'
)
print('Gotowe!')
"
```

### Problem: Przewijanie nie działa (Standalone)

```
Sprawdź:
1. Czy aktywne okno jest stronę internetową
2. Czy przeglądarka nie blokuje przewijania
3. Czy PyAutoGUI ma uprawnienia
4. Spróbuj nacisnąć guzik myszy nad stronę przed testem
```

### Problem: Słabe Performance (mało FPS)

```python
# W standalone.py zmień grę progu detektowania:
MIN_CONFIDENCE = 0.6  # lub wyżej
# Wyżtawy próg = szybsze przetwarzanie
```

---

## 🎯 Porownanie Wersji

| Cecha | Chrome Extension | Standalone |
|-------|------------------|-----------|
| Instalacja | Łatwa | Wymaga Pythona |
| Interfejs | Interfejsowy | Konsola + okno |
| Integracja z Chrome | ✓ | ✗ |
| Automatyczne przewijanie | ✓ | ✓ |
| Kustomizacja | Średnia | Wysoka |
| Zasoby systemowe | Niskie | Średnie |
| Działanie w tle | Ograniczone | Nieograniczone |

---

## 📊 Jak działają gesty?

```
Punkt 8 = koniec palca wskazującego
Punkt 6 = przegub indeksa

Jeśli Y(8) < Y(6) → Palec jest uniesiony ✓
Jeśli Y(8) > Y(6) → Palec jest opuszczony ✗

Podobnie dla pozostałych palców:
- Punkt 12, 10 = środek
- Punkt 16, 14 = serdeczny  
- Punkt 20, 18 = mały

Logika gestu:
- Indeks UP + Reszta DOWN = Scroll Up
- Mały UP + Reszta DOWN = Scroll Down
```

---

## 🔗 Linki

- [MediaPipe Hand Tracking](https://google.github.io/mediapipe/)
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [Python OpenCV](https://opencv.org/)

---

## 📝 Changelog

### v1.0.0 (2 marca 2026)
- ✓ Pierwsza wersja Chrome Extension
- ✓ Wersja Standalone
- ✓ Obsługa gestów Scroll Up/Down
- ✓ Statystyki sesji
- ✓ Interfejs użytkownika

---

## 👨‍💻 Wsparcie

Jeśli napotkasz problem:
1. Sprawdź konsolę (F12 w Chrome)
2. Przejrzyj dziennik błędów
3. Upewnij się, że spełniasz wymagania systemowe
4. Spróbuj ponownie zainstalować pakiety

---

## 📄 Licencja

MIT License © 2026 WtyczkaSensor

---

**Przyjemności użytkowania! 🚀**

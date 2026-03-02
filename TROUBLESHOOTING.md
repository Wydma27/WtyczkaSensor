# 🔧 Rozwiązywanie Problemów - Wtyczka Sensor

## 🆘 Szybki Index Problemów

| Problem | Rozwiązanie | Sekcja |
|---------|-------------|---------|
| Kamera się nie włącza | Sprawdź uprawnienia Chrome | #1 |
| Gesty nie są rozpoznawane | Zmniejsz próg detektowania | #2 |
| Brak modelu MediaPipe | Pobierz model | #3 |
| FPS zbyt niskie | Zmniejsz jakość kamery | #4 |
| Przewijanie nie pracuje | Testuj na różnych stronach | #5 |

---

## 1️⃣ PROBLEM: Kamera się nie włącza

### 🔴 Chrome Extension

#### Objaw:
- Przycisk "Start" nie włącza kamery
- Podgląd pokazuje czarny ekran
- Błąd: "Permission denied"

#### Rozwiązanie Krok po Kroku:

**Krok 1: Sprawdź uprawnienia systemu**
```
Windows 10/11:
1. Ustawienia → Prywatność → Kamera
2. Sprawdź czy aplikacje mogą używać kamery
3. Włącz dostęp do kamery
```

**Krok 2: Sprawdź uprawnienia Chrome**
```
1. chrome://settings/content/camera
2. Pozwól na dostęp do kamery
3. Dodaj do listy dozwolonych: chrome://extensions
4. Usuń z listy blokowanych
```

**Krok 3: Przeładuj wtyczkę**
```
1. Przejdź na chrome://extensions/
2. Wyłącz wtyczkę (toggle off)
3. Czekaj 2 sekundy
4. Włącz wtyczkę (toggle on)
5. Kliknij ikonę wtyczki i spróbuj "Start"
```

**Krok 4: Czyść cache**
```
chrome://settings → Prywatność → Wyczyść dane przeglądania
Zaznacz:
- Pliki cookies i dane stron
- Obrazy i pliki w pamięci podręcznej
```

**Krok 5: Restart Chrome**
```
Całkowicie zamknij Chrome (Ctrl+Shift+Q)
Czekaj 10 sekund
Ponownie otwórz Chrome
```

#### Jeśli nic nie pomaga:
```
1. Odinastaluj wtyczkę
2. Usuń folder (lub weź nowy)
3. Zainstaluj od nowa
4. Jeśli dalej nie działa - spróbuj Edge zamiast Chrome
```

---

### 🔴 Wersja Standalone

#### Objaw:
- Błąd: "Cannot open camera"
- Okno się otwiera ale czarny ekran

#### Rozwiązanie:

**Krok 1: Sprawdź czy kamera działa**
```python
python -c "
import cv2
cap = cv2.VideoCapture(0)
if cap.isOpened():
    print('✓ Kamera 0 działa')
    cap.release()
else:
    print('❌ Kamera 0 nie działa')
    
    # Spróbuj inną:
    cap = cv2.VideoCapture(1)
    if cap.isOpened():
        print('✓ Kamera 1 działa')
        cap.release()
"
```

**Krok 2: Zmień numer kamery w kodzie**
```python
# W standalone.py -> zmień:
cap = cv2.VideoCapture(0)  # 0 = pierwsza kamera

# Na:
cap = cv2.VideoCapture(1)  # 1 = druga kamera (jeśli jest)
```

**Krok 3: Sprawdź drivers**
```
Windows:
1. Device Manager (Urządzenia i drukarki)
2. Szukaj kamery (zwykle pod "Imaging devices")
3. Jeśli brak - zainstaluj drivers z strony producenta
```

**Krok 4: Zamknij inne aplikacje**
```
Zamknij:
- Zoom
- Skype
- OBS
- Inne aplikacje używające kamery

(mogą blokować dostęp)
```

---

## 2️⃣ PROBLEM: Gesty nie są rozpoznawane

### 🔴 Chrome Extension

#### Objaw:
- "Brak detekcji" lub "Nieznany"
- Podgląd pokazuje kamerę ale brak punktów
- Seria FPS jest wysoka ale bez detekcji

#### Rozwiązanie:

**Krok 1: Zmniejsz próg detektowania**
```
W popup Chrome Extension:
"Próg detekcji ręki: ─────●"

Przesuń suwak W LEWO (0.3-0.4)
(mniejsza wartość = bardziej czułe)
```

**Krok 2: Pokaż całą rękę**
```
✓ Od nadgarstka w górę
✓ Wszystkie palce widoczne
✓ Reka w środku kadru
✓ Oświetlenie na dłoni
```

**Krok 3: Popraw oświetlenie**
```
Dobierz:
✓ Lampę biurkową
✓ Otwórz okna (światło dzienne)
✓ Unikaj backlightu
✓ Tło powinno być jasne
```

**Krok 4: Pozycja kamery**
```
Kamera powinna być:
✓ Na poziomie oczu
✓ 30-60cm daleko
✓ Prostopadle do twarzy

Unikaj:
✗ Kamery skierowanej w dół
✗ Zbyt bliskie zdjęcia
✗ Bocznych kątów
```

**Krok 5: Rób gesty wolniej**
```
Mediapipe lepiej rozpoznaje wolne ruchy
Szybkie gesty mogą nie być wychwycone

Porada: Rób gesty w ciągu 1-2 sekund
```

---

### 🔴 Wersja Standalone

#### Rozwiązanie (jak wyżej + dodatkowo):

**Sprawdź wynik detektowania**
```python
# W standalone.py dodaj print():
if result.hand_landmarks:
    for i, landmark in enumerate(result.hand_landmarks[0]):
        print(f"Punkt {i}: x={landmark.x:.2f}, y={landmark.y:.2f}")
```

**Sprawdź funkcję rozpoznawania gestów**
```python
# W standalone.py zmień:
gesture = recognize_gesture(result.hand_landmarks[0])
print(f"DEBUG: Palce = {fingers}")
print(f"DEBUG: Gest = {gesture}")
```

---

## 3️⃣ PROBLEM: Model MediaPipe się nie pobiera

### Objaw:
- Błąd: "hand_landmarker.task not found"
- "Error: Cannot load model"

### Rozwiązanie:

**Metoda 1: Użyj setup helper (ZALECANE)**
```bash
python setup_helper.py
# Wybierz opcję 3 "Pobierz model MediaPipe"
```

**Metoda 2: Ręczne pobieranie**
```bash
python -c "
import urllib.request
import os

print('Pobieranie modelu...')
url = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task'

urllib.request.urlretrieve(url, 'hand_landmarker.task')
print(f'Gotowe! Rozmiar: {os.path.getsize(\"hand_landmarker.task\")/1024/1024:.1f} MB')
"
```

**Metoda 3: wget (jeśli zainstalowany)**
```bash
wget https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task
```

**Jeśli nie możesz pobrać (brak internetu):**
```
1. Pobierz na innym komputerze
2. Skopiuj plik hand_landmarker.task
3. Umieść w folderze projektu
```

---

## 4️⃣ PROBLEM: Niskie FPS / Powolna praca

### Objaw:
- FPS poniżej 10
- Aplikacja zawieszył się
- Duże zużycie CPU

### Rozwiązanie:

**Krok 1: Zmniejsz rozdzielczość kamery**
```python
# W standalone.py zmień:
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 320)   # Zamiast 640
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 240)  # Zamiast 480
```

**Krok 2: Zwiększ próg detektowania**
```python
# W standalone.py zmień:
MIN_CONFIDENCE = 0.7  # Zamiast 0.5
# (wyżej = szybciej ale mniej czułe)
```

**Krok 3: Wyłącz zbędne funkcje**
```python
# W standalone.py:
# Zakomentuj linię:
# cv2.putText(frame, ...) # Wyłącz wypisywanie na ekran
```

**Krok 4: Sprawdź użycie zasobów**
```
Windows: Ctrl+Shift+Esc (Task Manager)
Szukaj Python/Chrome
Jeśli CPU > 80% - jest problem
```

**Krok 5: Zamknij inne aplikacje**
```
Zamknij:
- Chrome / Firefox
- Discord
- Gry
- Streaming
```

---

## 5️⃣ PROBLEM: Przewijanie nie działa

### 🔴 Chrome Extension

#### Objaw:
- Gesty są rozpoznawane ale strona się nie przewija
- Widać animację ale nie przewija

#### Rozwiązanie:

**Krok 1: Testuj na różnych stronach**
```
Spróbuj:
✓ Google.com
✓ Wikipedia.org
✓ YouTube.com
✓ Facebook.com

Jeśli działa na jednej a nie na drugiej,
to problem jest ze stroną (blokuje przewijanie)
```

**Krok 2: Sprawdź konsolę**
```
1. Otwórz Chrome DevTools (F12)
2. Przejdź na "Console"
3. Sprawdź czy są błędy
4. Dodaj log:
```

**Krok 3: Ręczne testowanie**
```
1. Otwórz stronę
2. Spróbuj przewinąć myszką (scroll wheel)
3. Jeśli się nie przewija - to problem ze stroną
4. Spróbuj innej strony
```

**Krok 4: Włącz JavaScript**
```
chrome://settings/content/javascript
Upewnij się że JavaScript jest włączony
```

**Krok 5: Sprawdź politykę bezpieczeństwa**
```
Niektóre strony (iframe) blokują przewijanie
To jest normalne i brak na to rozwiązania
```

---

### 🔴 Wersja Standalone

#### Objaw:
- Gesty rozpoznawane ale okno się nie przewija
- Błąd: "pyautogui not working"

#### Rozwiązanie:

**Krok 1: Sprawdź czy okno jest aktywne**
```python
# Dodaj debug:
print("Attempting scroll...")
import pyautogui
pyautogui.scroll(20)
```

**Krok 2: Spróbuj zmienić czułość**
```python
# W standalone.py:
GESTURE_SCROLL_DELAY = 1.0  # Zwiększ na 1 sekundę
SCROLL_PIXELS = 100          # Zwiększ na 100
```

**Krok 3: Testuj na stronach www**
```
1. Otwórz Chrome/Firefox
2. Wejdź na Wikipedia.org
3. Uruchom standalone.py
4. Spróbuj gestu
```

**Krok 4: Sprawdź uprawnienia pyautogui**
```
Windows: Mogą być wymagane uprawnienia administratora
Uruchom: python standalone.py (jako Administrator)
```

**Krok 5: Alternatywne bibilioteki**
```python
# Jeśli pyautogui nie działa, spróbuj:
import subprocess
subprocess.run(['scroll.exe'])  # Jeśli dostępne

# Lub zainstaluj:
pip install pynput
```

---

## 🔌 PROBLEM: "Content Script nie działa" (Chrome Extension)

#### Objaw:
- Gest się pokazuje ale strona się nie przewija
- Błąd w console: "Cannot read property 'scroll'"

#### Rozwiązanie:

**Krok 1: Sprawdź manifest.json**
```json
Upewnij się że masz:
"content_scripts": [
  {
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }
]
```

**Krok 2: Przeładuj wtyczkę**
```
1. chrome://extensions/
2. Wyłącz i włącz wtyczkę
3. Przeładuj stronę (Ctrl+Shift+R)
```

**Krok 3: Sprawdź konsolę strony**
```
1. Naciśnij F12
2. Przejdź na "Console"
3. Szukaj błędów związanych z wtyczką
4. Spróbuj ręcznego:
   window.scrollBy({top: 100});
```

**Krok 4: Usuń i zainstaluj od nowa**
```
1. chrome://extensions/
2. Kliknij "Usuń" przy wtyczce
3. Czekaj 5 sekund
4. Załaduj rozpakowane rozszerzenie znowu
```

---

## 📞 Debugowanie - Logowanie

### Chrome Extension

```javascript
// Dodaj do popup.js:
console.log("Wtyczka loaded!");

// W content.js:
console.log("Content script loaded!");

// Sprawdź konsole:
F12 → Console
```

### Wersja Standalone

```python
# Dodaj debugowanie:
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

logger.debug("Hand detected!")
logger.debug(f"Gesture: {gesture}")
logger.debug(f"Confidence: {result.handedness[0].score}")
```

---

## 🆘 Skontaktuj się z Pomocą

Jeśli żaden z powyższych kroków nie pomógł:

1. **Sprawdź czy sądzimy powinne być spełnione:**
   - [ ] Python 3.8+ (jeśli standalone)
   - [ ] Chrome zainstalowany (jeśli extension)
   - [ ] Kamera funkcjonuje
   - [ ] Internet (do pobrania modelu)

2. **Zbierz informacje o systemie:**
   ```
   - OS: Windows 10/11, Mac, Linux
   - Python version: python --version
   - Chrome version: chrome://version
   - Kamera: marka, model
   ```

3. **Sprawdź logi:**
   - Chrome: F12 → Console
   - Python: terminal output

4. **Dokumentacja:**
   - Przeczytaj INSTRUKCJA.md
   - Sprawdź config.json

---

## 💡 Porady Pro

### Zwiększenie wydajności
```python
# W standalone.py:
MIN_CONFIDENCE = 0.6         # Wyżej = szybciej
GESTURE_SCROLL_DELAY = 0.3  # Krócej = responsywniej
cap.set(cv2.CAP_PROP_FPS, 15)  # Zmniejsz FPS
```

### Lepsze rozpoznawanie
```python
# W standalone.py:
MIN_CONFIDENCE = 0.3         # Niżej = czułe
GESTURE_SCROLL_DELAY = 0.7   # Dłużej = stabilniej
```

### Testowanie
```python
# Dodaj wizualizację:
cv2.imshow("Landmarks", frame)
# Wciśnij klawisz aby spauzować

# Zrzuć klikę:
cv2.imwrite(f"frame_{i}.png", frame)
```

---

**Ostatnia aktualizacja:** 2 marzec 2026

Jeśli problem przycina dalej, spróbuj Fresh Install:
1. Usuń wszystko
2. Pobierz kopię
3. Zainstaluj od nowa

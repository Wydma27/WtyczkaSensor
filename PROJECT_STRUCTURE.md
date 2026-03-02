# 📁 Struktura Projektu - Wtyczka Sensor

## 📂 Organizacja Plików

```
WtyczkaSensor/
│
├── 📖 DOKUMENTACJA
│   ├── README.md                 ← Główny plik dokumentacji
│   ├── INSTRUKCJA.md             ← Pełna, szczegółowa instrukcja
│   ├── QUICKSTART.md             ← Szybki start (5 minut)
│   ├── PROJECT_STRUCTURE.md      ← Ten plik
│   └── config.json               ← Konfiguracja ustawień
│
├── 🔌 CHROME EXTENSION
│   ├── manifest.json             ← Konfiguracja wtyczki Chrome
│   ├── popup.html                ← UI wtyczki (interfejs)
│   ├── popup.js                  ← Logika detektowania dla Chrome
│   ├── content.js                ← Skrypt wykonywany na stronach www
│   └── background.js             ← Service Worker (komunikacja)
│
├── 🐍 PYTHON (Standalone)
│   ├── standalone.py             ← Główna aplikacja Python
│   ├── setup_helper.py           ← Helper do instalacji
│   └── requirements.txt           ← Lista pakietów Python
│
└── 🖼️ ASSETS (będą dodane później)
    └── images/
        ├── icon16.png
        ├── icon48.png
        └── icon128.png
```

---

## 📄 Opis Każdego Pliku

### 📖 Dokumentacja

#### `README.md`
- **Cel:** Główny plik dokumentacji projektu
- **Zawiera:** Ogólny opis, wymagania, instalacja, użytkowanie
- **Dla kogo:** Wszyscy użytkownicy

#### `INSTRUKCJA.md`
- **Cel:** Pełna, szczegółowa instrukcja
- **Zawiera:** 
  - Krok po kroku instalacja
  - Rozwiązywanie problemów
  - FAQ i porady
  - Porównanie wersji
- **Dla kogo:** Użytkownicy szukający szczegółów

#### `QUICKSTART.md`
- **Cel:** Szybki start dla niecierpliwych
- **Zawiera:** 
  - 5 minut do pierwszego użytku
  - Podstawowe gesty
  - Szybkie rozwiązania
- **Dla kogo:** Nowi użytkownicy

#### `PROJECT_STRUCTURE.md`
- **Cel:** Opis struktury projektu
- **Zawiera:** Przegląd wszystkich plików
- **Dla kogo:** Deweloperzy, osoby zainteresowane kodem

#### `config.json`
- **Cel:** Centralna konfiguracja
- **Zawiera:** 
  - Ustawienia detektowania
  - Konfiguracja gestów
  - Parametry UI i kamery
- **Format:** JSON
- **Dla kogo:** Zaawansowani użytkownicy

---

### 🔌 Chrome Extension

#### `manifest.json`
- **Cel:** Plik manifest wtyczki Chrome
- **Zawiera:** 
  - Metadane wtyczki (nazwa, wersja, autor)
  - Uprawnienia (camera, tabs, scripting)
  - Definicja popup.html
  - Content scripts
  - Background service worker
- **Format:** JSON
- **Wymagany:** Tak, musi być w folderze
- **Dla kogo:** Chrome, system

#### `popup.html`
- **Cel:** Interfejs użytkownika wtyczki
- **Zawiera:** 
  - Elementy UI (przyciski, slider, statystyki)
  - Podgląd kamery
  - Wyświetlacz gestu
  - Ustawienia czułości
- **Format:** HTML + CSS
- **Rozmiąr:** ~500px (stały rozmiar popup)
- **Dla kogo:** Użytkownicy Chrome Extension

#### `popup.js`
- **Cel:** Logika detektowania dla Chrome
- **Zawiera:** 
  - Inicjalizacja MediaPipe
  - Dostęp do kamery
  - Rozpoznawanie gestów
  - Komunikacja z content scripts
  - Renderowanie UI
- **Zależności:** MediaPipe (CDN)
- **Dla kogo:** Chrome Extension

#### `content.js`
- **Cel:** Skrypt bezpieczeństwa na każdej stronie www
- **Zawiera:** 
  - Nasłuchiwanie komunikatów z popup
  - Wykonanie przewijania
  - Animacja wskaźnika
- **Wykonywany:** Na każdej stronie www
- **Dla kogo:** Strony www (transparentnie)

#### `background.js`
- **Cel:** Service Worker (tło)
- **Zawiera:** 
  - Nasłuchiwanie zdarzeń rozszerzenia
  - Łączenie popup z content scripts
- **Wykonywany:** W tle wtyczki
- **Dla kogo:** System Chrome

---

### 🐍 Python (Wersja Standalone)

#### `standalone.py`
- **Cel:** Główna aplikacja Python
- **Zawiera:** 
  - Inicjalizacja OpenCV i MediaPipe
  - Pętla wideo z kamery
  - Rozpoznawanie gestów
  - Automatyczne przewijanie (pyautogui)
  - Statystyki
- **Wymaga:** Python 3.8+, pakiety z requirements.txt
- **Użytkowanie:** `python standalone.py`
- **Dla kogo:** Zaawansowani użytkownicy, alternatywa dla Chrome

#### `setup_helper.py`
- **Cel:** Helper do instalacji i konfiguracji
- **Zawiera:** 
  - Sprawdzenie wersji Python
  - Instalacja pakietów
  - Pobieranie modelu MediaPipe
  - Test kamery
  - Menu interaktywne
- **Użytkowanie:** `python setup_helper.py`
- **Dla kogo:** Użytkownicy szukający łatwej instalacji

#### `requirements.txt`
- **Cel:** Lista wszystkich pakietów Python
- **Zawiera:** 
  - opencv-python
  - mediapipe
  - pyautogui
- **Użytkowanie:** `pip install -r requirements.txt`
- **Dla kogo:** Pip (package manager)

---

## 🔄 Przepływ Danych

### Chrome Extension
```
Kamera
  ↓
popup.js (MediaPipe detection)
  ↓
Rozpoznanie gestu
  ↓
Wysłanie wiadomości do content.js
  ↓
content.js (otrzymanie wiadomości)
  ↓
window.scrollBy() - przewijanie strony
  ↓
Wyświetlanie wskaźnika
```

### Wersja Standalone
```
Kamera
  ↓
OpenCV (przechwycenie klatki)
  ↓
MediaPipe (detektowanie ręki)
  ↓
Rozpoznanie gestu (funkcja recognize_gesture)
  ↓
pyautogui.scroll() - przewijanie
  ↓
Wyświetlanie statystyk
```

---

## 🔧 Dependencje

### Chrome Extension
- **MediaPipe Web** (via CDN)
  - URL: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0`
- **Model hand_landmarker.task** (pobierany z Google)

### Wersja Standalone
- **Python 3.8+**
- **opencv-python** - Przechwycenie videa
- **mediapipe** - Rozpoznawanie gestów
- **pyautogui** - Automatyczne przewijanie

---

## 🎯 Ścieżki Użycia

### Scenariusz 1: Użytkownik Chrome Extension
```
1. Instalacja (chrome://extensions/)
2. Kliknięcie ikony wtyczki
3. Kliknięcie "Start"
4. Wykonanie gestu
5. Automatyczne przewijanie na otwartej stronie
```

### Scenariusz 2: Python Standalone
```
1. Instalacja Python
2. pip install -r requirements.txt
3. python standalone.py
4. Wykonanie gestu
5. Automatyczne przewijanie aktywnego okna
```

---

## 📊 Rozmiary Plików

| Plik | Rozmiar | Typ |
|------|---------|-----|
| manifest.json | ~500 B | JSON |
| popup.html | ~8 KB | HTML |
| popup.js | ~8 KB | JavaScript |
| content.js | ~2 KB | JavaScript |
| background.js | ~1 KB | JavaScript |
| standalone.py | ~12 KB | Python |
| setup_helper.py | ~8 KB | Python |
| config.json | ~4 KB | JSON |
| **Model** | **650 MB** | Binary |

---

## 🔐 Uprawnienia

### Chrome Extension
- `activeTab` - Dostęp do aktywnej karty
- `scripting` - Inwektowanie skryptów
- `tabs` - Odczyt informacji o kartach
- `<all_urls>` - Dostęp do wszystkich stron

### Wersja Standalone
- Dostęp do kamery (USB)
- Dostęp do systemu plików
- Dostęp do myszy/klawiatury

---

## ✅ Checklist Wdrażania

- [x] README.md - dokumentacja główna
- [x] INSTRUKCJA.md - pełna instrukcja
- [x] QUICKSTART.md - szybki start
- [x] PROJECT_STRUCTURE.md - opis struktury
- [x] manifest.json - konfiguracja Chrome
- [x] popup.html - UI Chrome Extension
- [x] popup.js - logika Chrome Extension
- [x] content.js - skrypt stron www
- [x] background.js - service worker
- [x] standalone.py - aplikacja Python
- [x] setup_helper.py - helper instalacji
- [x] requirements.txt - pakiety Python
- [x] config.json - konfiguracja
- [ ] images/ - ikony (do dodania)

---

## 🚀 Następne Kroki

1. **Dla Chrome Extension:**
   - Dodaj ikony (16x16, 48x48, 128x128 PNG)
   - Opublikuj na Chrome Web Store

2. **Dla Wersji Standalone:**
   - Zabezpieczenie modelu
   - Tworzenie exe installer'a

3. **Funkcje Zaawansowane:**
   - Gesty wielowarstwowe
   - Niestandardowe komendy
   - API websocket
   - Dashboard monitorowania

---

## 📝 Historia Zmian

### v1.0.0 (2 marzec 2026)
- Pierwsza wersja Chrome Extension
- Wersja Standalone Python
- Podstawowe gesty (Scroll Up/Down)
- Pełna dokumentacja

---

**Ostatnia aktualizacja:** 2 marzec 2026

**Autor:** WtyczkaSensor Project

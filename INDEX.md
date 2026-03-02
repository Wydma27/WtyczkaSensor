# 📚 Wtyczka Sensor - Index & Przewodnik

Witaj! 👋 Dzięki za zainteresowanie projektem **Wtyczka Sensor** - rozwiązanie do przewijania stron www za pomocą gestów rąk.

---

## 🎯 Zaczynasz? Wybierz Swoją Ścieżkę

### 🏃‍♂️ "Chcę to szybko zainstalować" (5 minut)
👉 Przeczytaj: [QUICKSTART.md](QUICKSTART.md)
- Szybka instalacja
- Podstawowe użytkowanie
- Pierwsze gesty

### 📖 "Chcę znać wszystkie szczegóły" (30 minut)
👉 Przeczytaj: [INSTRUKCJA.md](INSTRUKCJA.md)
- Pełna instalacja krok po kroku
- Wszystkie gesty
- Ustawienia zaawansowane
- FAQ i porady

### 💻 "Jestem deweloperem / Chcę edytować kod"
👉 Przeczytaj: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- Struktura kodu
- Opis każdego pliku
- Jak kod działa

### 🐛 "Coś nie działa / Mam problem"
👉 Przeczytaj: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Rozwiązywanie problemów
- FAQ
- Wskazówki debugowania

---

## 📁 Co znajdziesz w tym projekcie?

```
Wtyczka Sensor/
├── 🌐 WERSJA CHROME EXTENSION
│   ├── manifest.json          - Konfiguracja wtyczki
│   ├── popup.html             - Interfejs
│   ├── popup.js               - Logika detektowania
│   ├── content.js             - Przewijanie stron
│   └── background.js          - Service worker
│
├── 🐍 WERSJA STANDALONE (Python)
│   ├── standalone.py          - Główna aplikacja
│   ├── setup_helper.py        - Helper instalacji
│   └── requirements.txt        - Pakiety Python
│
├── 📖 DOKUMENTACJA
│   ├── README.md              - Główna dokumentacja
│   ├── INSTRUKCJA.md          - Pełna instrukcja
│   ├── QUICKSTART.md          - Szybki start
│   ├── PROJECT_STRUCTURE.md   - Struktura kodu
│   ├── TROUBLESHOOTING.md     - Rozwiązywanie problemów
│   └── INDEX.md               - Ten plik
│
└── ⚙️ KONFIGURACJA
    └── config.json            - Ustawienia zaawansowane
```

---

## 🚀 Szybki Start (3 Kroki)

### Opcja A: Chrome Extension (Zalecane)
```
1. Przejdź na chrome://extensions/
2. Włącz "Tryb dla programisty"
3. "Załaduj rozpakowane rozszerzenie" → Wybierz ten folder
```

### Opcja B: Python Standalone
```
1. pip install -r requirements.txt
2. python standalone.py
3. Gotowe! Pokaż rękę do kamery
```

---

## 📖 Mapy Ścieżek Czytania

### Dla Nowych Użytkowników
```
1. INDEX.md (ten plik) ← Jesteś tutaj
   ↓
2. QUICKSTART.md (5 minut)
   ↓
3. Zainstaluj i spróbuj!
   ↓
4. Jeśli coś nie działa → TROUBLESHOOTING.md
```

### Dla Zainteresowanych Szczegółami
```
1. README.md (ogólny opis)
   ↓
2. INSTRUKCJA.md (pełna informacja)
   ↓
3. Project_STRUCTURE.md (jak to działa)
   ↓
4. TROUBLESHOOTING.md (problemy)
```

### Dla Deweloperów
```
1. PROJECT_STRUCTURE.md (orientacja)
   ↓
2. config.json (ustawienia)
   ↓
3. Czytaj kod (popup.js, standalone.py)
   ↓
4. TROUBLESHOOTING.md (debugowanie)
```

---

## 🎮 Dostępne Gesty

| Gest | Działanie |
|------|-----------|
| 👆 Podnieś indeks | Scroll Up (przewijanie w górę) |
| 👉 Podnieś mały palec | Scroll Down (przewijanie w dół) |
| ✌️ Indeks + Środek | Rozpoznane (brak działania) |
| ✊ Pięść zamknięta | KAMIEŃ (brak działania) |
| ✋ Dłoń otwarta | PAPIER (brak działania) |

---

## ✅ Wymagania Systemowe

**Ogólne:**
- Kamera internetowa
- Dobre oświetlenie
- Windows/Mac/Linux

**Chrome Extension:**
- Chrome/Edge v90+
- Dostęp do kamery

**Wersja Standalone:**
- Python 3.8+
- Pakiety: opencv-python, mediapipe, pyautogui

---

## 🔗 Linki do Dokumentów

| Dokument | Cel | Do kogo |
|----------|-----|---------|
| [QUICKSTART.md](QUICKSTART.md) | Szybka instalacja | Wszyscy |
| [README.md](README.md) | Ogólny opis | Wszyscy |
| [INSTRUKCJA.md](INSTRUKCJA.md) | Szczegółowe kroki | Zainteresowani |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Struktura kodu | Deweloperzy |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Rozwiązywanie problemów | Gdy coś nie działa |
| [config.json](config.json) | Ustawienia | Zaawansowani |

---

## 🎯 Popularne Pytania

### P: Która wersja powinienem wybrać?

**Chrome Extension** - jeśli:
- Używasz Chrome/Edge
- Chcesz łatwej instalacji
- Nie chcesz instalować Pythona

**Wersja Standalone** - jeśli:
- Chcesz większą kontrolę
- Jesteś zainteresowany kodem
- Wolisz aplikacje desktopowe

### P: Czy mogę zmienić ustawienia?

Tak! Edytuj [config.json](config.json) aby zmienić:
- Próg detektowania
- Czułość przewijania
- Tempo gestu

### P: Czy to wysyła dane do internetu?

Nie! Wszystko dzieje się na Twoim komputerze. Żadne dane nie są wysyłane.

### P: Co jeśli nie potrafię zainstalować?

1. Przeczytaj [QUICKSTART.md](QUICKSTART.md)
2. Sprawdź [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. Uruchom `python setup_helper.py` aby autom. zainstalować

### P: Czy to działa na Macu/Linuxie?

Tak! Kod jest cross-platform. Wszystkie komponenty pracują na wszystkich systemach.

---

## 📊 Status Projektu

| Funkcja | Status |
|---------|--------|
| Chrome Extension | ✅ Gotowa |
| Wersja Standalone | ✅ Gotowa |
| Gesty Scroll Up/Down | ✅ Gotowa |
| Rozpoznawanie gestów | ✅ Gotowe |
| Dokumentacja | ✅ Kompletna |
| Helper instalacji | ✅ Gotowy |
| Statystyki | ✅ Gotowe |

---

## 🎓 Nauka

Jeśli chciałbyś nauczyć się jak to działa:

1. **MediaPipe Hand Tracking:**
   - Dokumentacja: https://google.github.io/mediapipe/
   - Co to robi: Rozpoznawanie pozycji ręki

2. **Chrome Extensions:**
   - Dokumentacja: https://developer.chrome.com/docs/extensions/
   - Co to robi: Rozszerzenia przeglądarki

3. **OpenCV:**
   - Dokumentacja: https://opencv.org/
   - Co to robi: Przetwarzanie wideo

---

## 🆘 Potrzebujesz Pomocy?

### Najpierw spróbuj:
1. Przeczytaj [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Uruchom `python setup_helper.py`
3. Sprawdź konsolę (F12 w Chrome)

### Jeśli dalej nie działa:
1. Sprawdź czy masz najnowszą wersję
2. Usuń i zainstaluj od nowa
3. Spróbuj innej przeglądarki (Edge zamiast Chrome)

---

## 🎉 Co Dalej?

Po zainstalowaniu:
1. ✅ Włączysz wtyczkę
2. ✅ Pokażesz rękę do kamery
3. ✅ Będziesz przewijać strony gestami!
4. ✅ Podzielisz się z przyjaciółmi 😄

---

## 📝 Informacje Projektu

- **Nazwa:** Wtyczka Sensor - Przewijaj Ręką
- **Wersja:** 1.0.0
- **Data:** 2 marzec 2026
- **Autor:** WtyczkaSensor Project
- **Licencja:** MIT

---

## 🚀 Czasami Ścieżka

```
Masz wtyczkę? ↓
Chcesz zainstalować? → QUICKSTART.md ↓
Chcesz szczegóły? → INSTRUKCJA.md ↓
Coś nie działa? → TROUBLESHOOTING.md ↓
Chcesz edytować kod? → PROJECT_STRUCTURE.md ↓
Gotowy do użycia! → ZAJEBIŚCIE! 🎉
```

---

## 💬 Ostatnie Słowo

Dzięki że wybrałeś Wtyczkę Sensor! Uważamy że kontrolowanie komputera gestami jest przyszłością. Mamy nadzieję że ci się spodoba!

Powodzenia! 🚀

---

**Zaczynaj od:** [QUICKSTART.md](QUICKSTART.md) (5 minut!)

**Lub czytaj:** [README.md](README.md) (całość)

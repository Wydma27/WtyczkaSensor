# 🎮 Wtyczka Sensor - Przewijaj Ręką

Wtyczka do przeglądarki Chrome, która umożliwia przewijanie stron internetowych za pomocą gestów rąk. Wykorzystuje to MediaPipe oraz kamerę internetową.

## ✨ Funkcionalności

- **Rozpoznawanie gestów rąk** - Detektowanie pozycji ręki w czasie rzeczywistym
- **Automatyczne przewijanie** - Przewijanie strony na podstawie gestu
- **Statystyki sesji** - Śledzenie ilosci detektowanych rąk i przewijań
- **Regulacja czułości** - Możliwość dostosowania progów detektowania
- **Wskaźnik wizualny** - Animacja pokazująca kierunek przewijania

## 📥 Instalacja

### 1. Przygotowanie plików

Upewnij się, że masz alle następujące pliki w folderze wtyczki:
- `manifest.json`
- `popup.html`
- `popup.js`
- `content.js`
- `background.js`

### 2. Załadowanie do Chrome

1. Przejdź do `chrome://extensions/`
2. Włącz **"Tryb dla programisty"** (przycisk w prawym górnym rogu)
3. Kliknij **"Załaduj rozpakowane rozszerzenie"**
4. Wybierz folder z plikami wtyczki
5. Gotowe! Wtyczka powinna pojawić się na liście

## 🎯 Jak używać

### Gesty dostępne:

| Gest | Działanie | Opis |
|------|----------|------|
| 👆 Indeks | Scroll Up | Podnoszenie tylko palca wskazującego |
| 👉 Mały palec | Scroll Down | Podnoszenie tylko małego palca |
| ✌️ Nożyce | Brak działania | Indeks + środek |
| ✊ Kamień | Brak działania | Wszystkie palce zamknięte |
| ✋ Papier | Brak działania | Wszystkie palce otwarte |

### Kroki:

1. Kliknij ikonę wtyczki w pasku Chrome
2. Kliknij przycisk **"Start"** aby włączyć kamerę
3. Powinna Ci się zobrazić podgląd z kamery
4. Pokaż swoją rękę do kamery
5. Podnieś palec wskazujący, aby przewinąć w górę
6. Podnieś mały palec, aby przewinąć w dół
7. Podczas przewijania zobaczysz animację na stronie

## ⚙️ Ustawienia

- **Próg detekcji ręki** (0.3 - 0.9) - Niska = bardziej czułe, Wysoka = mniej czułe
- **Czułość przewijania** (5 - 50 px) - Ilość pikseli przewijanego w jednym geście

## 🐛 Rozwiązywanie problemów

### Kamera się nie włącza
- Sprawdź, czy dałeś Chrome dostęp do kamery
- Przejdź do ustawień Chrome → Prywatność i bezpieczeństwo → Ustawienia witryn → Aparat
- Upewnij się, że lista dozwolonych witryn zawiera `chrome://extensions/`

### Gesty nie są rozpoznawane
- Zmniejsz próg detekcji (przesuń suwak w lewo)
- Upewnij się, że masz dobre oświetlenie
- Pokaż całą dłoń do kamery
- Spróbuj być bliżej kamery

### Przewijanie nie działa
- Upewnij się, że otworzyłeś jakąś stronę www
- Sprawdź konsolę przeglądarki (F12) czy nie ma błędów
- Czasem niektóre strony blokują przewijanie - to jest normalne

## 📊 Co oznaczają statystyki

- **FPS** - Liczba klatek na sekundę (analiza klatki wideo)
- **Detektowana ręka** - Czy wtyczka widzi Twoją rękę
- **Gesty (sesja)** - Liczba zrecognizowanych gestów
- **Przewijania** - Liczba wykonanych przewijań

## 🔧 Technologia

- **MediaPipe** - Google ML framework do rozpoznawania postury
- **WebRTC** - Dostęp do kamery
- **Chrome Extensions API** - Komunikacja między popup a stronami www

## 📝 Uwagi

- Wtyczka korzysta z modelu on-device (wszystko dzieje się na Twoim komputerze)
- Brak wysyłania danych do serwerów
- Wymaga pozwolenia na dostęp do kamery
- Działa tylko z przeglądarką Chrome/Edge

## 📄 Licencja

MIT License © 2026

## 👨‍💻 Autor

WtyczkaSensor Project

---

**Wersja**: 1.0.0
**Ostatnia aktualizacja**: 2 marzec 2026

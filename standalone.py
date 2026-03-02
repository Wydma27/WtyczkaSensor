"""
Wtyczka Sensor - Standalone Version
Przewijanie stron www za pomocą gestów rąk
Wersja samodzielna (bez Chrome extension)
"""

import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import time
import urllib.request
import os
import pyautogui
import sys

# Konfiguracja
MODEL_PATH = "hand_landmarker.task"
GESTURE_SCROLL_DELAY = 0.5  # sekundy pomiędzy przewijaniami
SCROLL_PIXELS = 50
MIN_CONFIDENCE = 0.5

# Pobierz model jeśli nie istnieje
if not os.path.exists(MODEL_PATH):
    print("📥 Pobieranie modelu hand_landmarker.task...")
    try:
        urllib.request.urlretrieve(
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
            MODEL_PATH
        )
        print("✓ Model pobrany pomyślnie!")
    except Exception as e:
        print(f"❌ Błąd pobrania modelu: {e}")
        sys.exit(1)

# Inicjalizacja MediaPipe
print("⏳ Ładowanie modelu MediaPipe...")
base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=2,
    min_hand_detection_confidence=MIN_CONFIDENCE,
    min_hand_presence_confidence=MIN_CONFIDENCE,
    min_tracking_confidence=MIN_CONFIDENCE,
    running_mode=vision.RunningMode.VIDEO
)
detector = vision.HandLandmarker.create_from_options(options)

print("\n" + "="*60)
print("✓ Detektor załadowany prawidłowo")
print(f"✓ Model: {MODEL_PATH}")
print(f"✓ Próg detektowania: {MIN_CONFIDENCE}")
print("✓ Uruchamianie kamery...")
print("="*60)
print("\n🎮 INSTRUKCJA UŻYCIA:")
print("  • Pokaż INDEKS - Przewijanie w GÓRĘ")
print("  • Pokaż MAŁY PALEC - Przewijanie w DÓŁ") 
print("  • Zamknięta pięść - KAMIEŃ")
print("  • Otwarta dłoń - PAPIER")
print("  • Indeks + Środek - NOŻYCE")
print("\n  Naciśnij ESC aby wyjść")
print("="*60 + "\n")

# Funkcje pomocnicze
def finger_up(lm, tip, pip):
    """Sprawdza czy palec jest uniesiony"""
    return lm[tip].y < lm[pip].y

def recognize_gesture(landmarks):
    """Rozpoznaje gesty ręki"""
    if not landmarks:
        return "Brak ręki"
    
    fingers = [
        finger_up(landmarks, 8, 6),   # Indeks
        finger_up(landmarks, 12, 10), # Środek
        finger_up(landmarks, 16, 14), # Serdeczny
        finger_up(landmarks, 20, 18)  # Mały
    ]
    
    # Gesty
    if not any(fingers):
        return "✊ KAMIEŃ"
    elif all(fingers):
        return "✋ PAPIER"
    elif fingers[0] and fingers[1] and not fingers[2] and not fingers[3]:
        return "✌️ NOŻYCE"
    elif fingers[0] and not fingers[1] and not fingers[2] and not fingers[3]:
        return "👆 SCROLL UP"
    elif not fingers[0] and not fingers[1] and not fingers[2] and fingers[3]:
        return "👉 SCROLL DOWN"
    else:
        return "❓ NIEZNANY"

def draw_landmarks_on_frame(frame, hand_landmarks_list):
    """Rysuje landmarki Hand Tracking na klatce"""
    h, w, _ = frame.shape
    
    # Definicja połączeń między punktami
    connections = [
        (0,1),(1,2),(2,3),(3,4),
        (0,5),(5,6),(6,7),(7,8),
        (0,9),(9,10),(10,11),(11,12),
        (0,13),(13,14),(14,15),(15,16),
        (0,17),(17,18),(18,19),(19,20),
        (5,9),(9,13),(13,17)
    ]
    
    for hand_landmarks in hand_landmarks_list:
        # Rysuj punkty
        for i, lm in enumerate(hand_landmarks):
            cx, cy = int(lm.x * w), int(lm.y * h)
            cv2.circle(frame, (cx, cy), 4, (0, 255, 0), -1)
            # ID palca
            if i in [0, 4, 8, 12, 16, 20]:
                cv2.putText(frame, str(i), (cx+5, cy-5), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)
        
        # Rysuj linie
        for a, b in connections:
            x1, y1 = int(hand_landmarks[a].x * w), int(hand_landmarks[a].y * h)
            x2, y2 = int(hand_landmarks[b].x * w), int(hand_landmarks[b].y * h)
            cv2.line(frame, (x1, y1), (x2, y2), (0, 200, 255), 2)

def scroll_page(direction):
    """Przewija stronę za pomocą pyautogui"""
    try:
        if direction == "up":
            pyautogui.scroll(SCROLL_PIXELS)
            print(f"⬆️ Przewijanie w górę ({SCROLL_PIXELS}px)")
        else:
            pyautogui.scroll(-SCROLL_PIXELS)
            print(f"⬇️ Przewijanie w dół ({SCROLL_PIXELS}px)")
    except Exception as e:
        print(f"⚠️ Błąd przewijania: {e}")

# Inicjalizacja kamery
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("❌ BŁĄD: Nie można otworzyć kamery!")
    sys.exit(1)
else:
    print("✓ Kamera otwarta pomyślnie")
    ret, test_frame = cap.read()
    if ret:
        print(f"✓ Wymiary klatki: {test_frame.shape}")

# Zmienne
p_time = 0
gesture = ""
frame_count = 0
detection_count = 0
last_scroll_time = 0

try:
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Konwersja BGR -> RGB
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        rgb = rgb.astype("uint8")

        # Detectowanie
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        
        try:
            result = detector.detect_async(mp_image, int(time.time() * 1000))
        except:
            # Fallback dla obsługi różnych wersji MediaPipe
            try:
                result = detector.detect(mp_image)
            except Exception as e:
                print(f"⚠️ Błąd detektowania: {e}")
                gesture = ""
                c_time = time.time()
                fps = 1 / (c_time - p_time) if c_time != p_time else 0
                p_time = c_time
                continue

        # Przetworzenie wyników
        if result.hand_landmarks:
            draw_landmarks_on_frame(frame, result.hand_landmarks)
            gesture = recognize_gesture(result.hand_landmarks[0])
            detection_count += 1
            
            # Automatyczne przewijanie
            current_time = time.time()
            if current_time - last_scroll_time > GESTURE_SCROLL_DELAY:
                if "SCROLL UP" in gesture:
                    scroll_page("up")
                    last_scroll_time = current_time
                elif "SCROLL DOWN" in gesture:
                    scroll_page("down")
                    last_scroll_time = current_time
            
            if frame_count % 30 == 0:
                print(f"✓ Detektowana ręka! Gesty: {detection_count}/{frame_count} | Gest: {gesture}")
        else:
            gesture = "Brak ręki"
            if frame_count % 60 == 0:
                print(f"⚠️ Brak detekcji ręki... ({frame_count} klatek)")
        
        frame_count += 1

        # Obliczenie FPS
        c_time = time.time()
        fps = 1 / (c_time - p_time) if c_time != p_time else 0
        p_time = c_time

        # Wyświetlanie informacji na klatce
        cv2.putText(frame, f'Gesture: {gesture}', (15, 50), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)
        cv2.putText(frame, f'FPS: {int(fps)}', (15, 100), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
        cv2.putText(frame, f'Detections: {detection_count}/{frame_count}', (15, 140),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 200, 255), 2)

        # Wyświetl klatę
        cv2.imshow("WtyczkaSensor - Hand Gesture Scrolling", frame)

        # ESC aby wyjść
        if cv2.waitKey(1) & 0xFF == 27:
            break

except KeyboardInterrupt:
    print("\n⏹ Przerwano przez użytkownika")
except Exception as e:
    print(f"\n❌ Błąd: {e}")
    import traceback
    traceback.print_exc()
finally:
    # Statystyka
    print("\n" + "="*60)
    print("📊 STATYSTYKA SESJI:")
    print(f"  Łączne klatki: {frame_count}")
    print(f"  Detektowane ręce: {detection_count}")
    if frame_count > 0:
        print(f"  Współczynnik detektowania: {(detection_count/frame_count)*100:.1f}%")
    print("="*60 + "\n")

    # Czyszczenie
    cap.release()
    cv2.destroyAllWindows()

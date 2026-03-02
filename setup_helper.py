"""
Setup helper script - ułatwia instalację i konfigurację
Uruchom: python setup_helper.py
"""

import os
import sys
import subprocess
import json

def print_header(text):
    """Wypisz nagłówek"""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")

def check_python_version():
    """Sprawdź wersję Python"""
    print("📌 Sprawdzanie wersji Pythona...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Wymagany Python 3.8+, posiadasz {version.major}.{version.minor}")
        return False
    print(f"✓ Python {version.major}.{version.minor}.{version.micro} - OK!")
    return True

def check_requirements():
    """Sprawdzić czy requirements.txt istnieje"""
    print("\n📌 Szukam pliku requirements.txt...")
    if os.path.exists("requirements.txt"):
        print("✓ Znaleziono requirements.txt")
        return True
    else:
        print("❌ Nie znaleziono requirements.txt!")
        return False

def install_dependencies():
    """Zainstaluj zależności"""
    print_header("INSTALACJA ZALEŻNOŚCI")
    
    if not os.path.exists("requirements.txt"):
        print("❌ Plik requirements.txt nie został znaleziony!")
        return False
    
    try:
        print("📥 Instalowanie pakietów...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✓ Pakiety zainstalowane pomyślnie!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Błąd instalacji: {e}")
        return False

def download_model():
    """Pobierz model MediaPipe"""
    print_header("POBIERANIE MODELU MEDIAPIPE")
    
    if os.path.exists("hand_landmarker.task"):
        print("✓ Model już istnieje (hand_landmarker.task)")
        return True
    
    try:
        import urllib.request
        model_url = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task"
        
        print("📥 Pobieranie modelu (może to trwać kilka minut)...")
        urllib.request.urlretrieve(model_url, "hand_landmarker.task")
        
        file_size = os.path.getsize("hand_landmarker.task") / (1024*1024)
        print(f"✓ Model pobrany pomyślnie! ({file_size:.1f} MB)")
        return True
    except Exception as e:
        print(f"❌ Błąd pobierania modelu: {e}")
        return False

def verify_installation():
    """Sprawdź czy wszystko zostało zainstalowane prawidłowo"""
    print_header("WERYFIKACJA INSTALACJI")
    
    checks = {
        "Python 3.8+": check_python_version,
        "requirements.txt": check_requirements,
        "Model MediaPipe": lambda: os.path.exists("hand_landmarker.task")
    }
    
    all_ok = True
    for check_name, check_func in checks.items():
        try:
            result = check_func()
            status = "✓" if result else "❌"
            print(f"{status} {check_name}")
            if not result:
                all_ok = False
        except Exception as e:
            print(f"❌ {check_name}: {e}")
            all_ok = False
    
    return all_ok

def show_menu():
    """Pokaż menu główne"""
    print_header("WTYCZKA SENSOR - SETUP HELPER")
    
    print("Wybierz opcję:")
    print("1. Sprawdź instalację")
    print("2. Zainstaluj zależności")
    print("3. Pobierz model MediaPipe")
    print("4. Pełna instalacja (wszystko)")
    print("5. Testuj kamerę")
    print("6. Wyjście")
    print()

def test_camera():
    """Testuj kamerę"""
    print_header("TEST KAMERY")
    
    try:
        import cv2
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("❌ Nie można otworzyć kamery!")
            return False
        
        print("✓ Kamera otwarta pomyślnie!")
        
        ret, frame = cap.read()
        if ret:
            print(f"✓ Format: {frame.shape}")
        else:
            print("⚠️ Nie można odczytać klatki")
        
        cap.release()
        return True
    except ImportError:
        print("❌ OpenCV nie jest zainstalowany. Zainstaluj zależności først!")
        return False
    except Exception as e:
        print(f"❌ Błąd: {e}")
        return False

def test_mediapipe():
    """Testuj MediaPipe"""
    print_header("TEST MEDIAPIPE")
    
    try:
        import mediapipe
        print(f"✓ MediaPipe {mediapipe.__version__} zainstalowany!")
        
        if os.path.exists("hand_landmarker.task"):
            print("✓ Model MediaPipe: hand_landmarker.task - znaleziony!")
        else:
            print("⚠️ Model nie znaleziony. Pobierz go!")
        
        return True
    except ImportError:
        print("❌ MediaPipe nie jest zainstalowany. Zainstaluj zależności!")
        return False

def main():
    """Główna funkcja"""
    while True:
        show_menu()
        choice = input("Wybór [1-6]: ").strip()
        
        if choice == "1":
            verify_installation()
        
        elif choice == "2":
            if check_python_version():
                install_dependencies()
            else:
                print("❌ Wymagany Python 3.8+")
        
        elif choice == "3":
            download_model()
        
        elif choice == "4":
            print_header("PEŁNA INSTALACJA")
            if check_python_version():
                if install_dependencies():
                    download_model()
                    verify_installation()
            print("\n✓ Instalacja zakończona!")
        
        elif choice == "5":
            test_camera()
            print("\nNacisłzej Enter aby powrócić do menu...")
            input()
        
        elif choice == "6":
            print("\n👋 Do widzenia!")
            break
        
        else:
            print("❌ Nieznana opcja!")
        
        print("\nNaciśnij Enter aby powrócić do menu...")
        input()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⏹ Przerwano przez użytkownika")
        sys.exit(0)

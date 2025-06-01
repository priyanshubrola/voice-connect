import speech_recognition as sr
import pyttsx3
import re
import nltk
from nltk.corpus import cmudict
import threading

nltk.download('cmudict')
cmu_dict = cmudict.dict()
recognizer = sr.Recognizer()


class VoiceProcessor:

    stop_listening_flag = False

    @staticmethod
    def clean_text(text):
        """Convert numbers to words and clean text"""
        text = re.sub(r'\b(\d+)\b', lambda m: VoiceProcessor.num_to_words(m.group(1)), text)
        return text.replace('Mr.', 'Mister')

    @staticmethod
    def num_to_words(num):
        num_map = {
            "1": "one", "2": "two", "3": "three", "4": "four", "5": "five",
            "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten"
        }
        return num_map.get(num, num)

    @staticmethod
    def text_to_speech(text):
        """Convert text to speech in background thread"""
        def speak():
            try:
                engine = pyttsx3.init()
                engine.setProperty('rate', 150)
                engine.setProperty('volume', 1.0)
                engine.say(text)
                engine.runAndWait()
            except Exception as e:
                print(f"Error in text-to-speech: {e}")

            threading.Thread(target=speak).start()

    @staticmethod
    def speech_to_text(timeout=5):
        
        """Convert speech to text with error handling"""
        try:
            with sr.Microphone() as source:
                recognizer.adjust_for_ambient_noise(source, duration=1)
                audio = recognizer.listen(source, timeout=timeout)
                text = recognizer.recognize_google(audio)
                return VoiceProcessor.clean_text(text)
        except sr.UnknownValueError:
            raise Exception("Could not understand audio")
        except sr.RequestError as e:
            raise Exception(f"Speech service error: {e}")

    
    @staticmethod
    def speech_to_text_continuous():
        """Continuously listen until stop_listening_flag is True"""
        result_text = ""
        with sr.Microphone() as source:
            recognizer.adjust_for_ambient_noise(source, duration=1)
            while not VoiceProcessor.stop_listening_flag:
                try:
                    print("Listening...")
                    audio = recognizer.listen(source, timeout=None, phrase_time_limit=None)
                    text = recognizer.recognize_google(audio)
                    text = VoiceProcessor.clean_text(text)
                    result_text += " " + text
                except sr.UnknownValueError:
                    # Ignore if not understood
                    pass
                except sr.RequestError as e:
                    # API error
                    break
        VoiceProcessor.stop_listening_flag = False  # Reset flag
        return result_text.strip()

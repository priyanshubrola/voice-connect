from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .voice_utils import VoiceProcessor
import json
import threading

# views.py additions (near your imports)
def normalize_voice_text(text):
    # Replace spoken words with symbols
    replacements = {
        r'\bdot\b': '.',
        r'\bat\b': '@',
        r'\bdash\b': '-',
        r'\bunderscore\b': '_',
        r'\bcomma\b': ',',
        r'\bspace\b': '',  # Remove spaces explicitly
        r'\bexclamation point\b': '!',
        r'\bquestion mark\b': '?',
        r'\bhash\b': '#',
        r'\bdollar sign\b': '$',
        r'\bpercent\b': '%',
        r'\bplus\b': '+',
        r'\bminus\b': '-',
        r'\basterisk\b': '*',
        r'\band\b': '',  # Remove the word 'and' often spoken
    }

    import re
    text = text.lower()
    for pattern, replacement in replacements.items():
        text = re.sub(pattern, replacement, text)
    # Remove ALL whitespace characters (spaces, tabs, newlines) for username/password input
    text = re.sub(r'\s+', '', text)
    return text

# Global background thread and text storage
listening_thread = None
recognized_text = ""
listening = False

@csrf_exempt
@require_http_methods(["POST"])
def start_listening(request):
    global listening_thread, listening, recognized_text
    if listening:
        return JsonResponse({'status': 'error', 'message': 'Already listening'})
    recognized_text = ""
    listening = True

    def background_listen():
        global recognized_text, listening
        try:
            recognized_text = VoiceProcessor.speech_to_text_continuous()
        finally:
            listening = False

    listening_thread = threading.Thread(target=background_listen)
    listening_thread.start()

    return JsonResponse({'status': 'listening_started'})

@csrf_exempt
@require_http_methods(["POST"])
def stop_listening(request):
    global listening_thread, listening, recognized_text
    if not listening:
        return JsonResponse({'status': 'error', 'message': 'Not currently listening'})
    # Signal VoiceProcessor to stop listening
    VoiceProcessor.stop_listening_flag = True

    listening_thread.join()  # Wait for thread to finish


    result = normalize_voice_text(recognized_text)
    recognized_text = ""
    return JsonResponse({'status': 'success', 'text': result})



@csrf_exempt
@require_http_methods(["GET", "POST"])
def voice_status(request):
    return JsonResponse({
        'status': 'active',
        'services': ['speech-to-text', 'text-to-speech']
    })

@csrf_exempt
@require_http_methods(["POST"])
def convert_speech(request):
    try:
        data = json.loads(request.body)
        text = data.get('text', '')
        VoiceProcessor.text_to_speech(text)
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def recognize_speech(request):
    try:
        raw_text = VoiceProcessor.speech_to_text()
        return JsonResponse({
            'status': 'success',
            'text': raw_text,
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)



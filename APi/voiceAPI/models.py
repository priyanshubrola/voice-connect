# chatAPI/voiceAPI/models.py
from django.db import models

class VoiceLog(models.Model):
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_command = models.BooleanField(default=False)

    class Meta:
        app_label = 'voiceAPI'  # Explicit app label
# voice-connect
- [MOTIVATION](#motivation)
- [FEATURES](#features)
- [TECH-STACK](#tech-stack)
- [TESTING](#testing)
- [PERFORMANCE-MATRICES](#perfromance-metrices)
- [KNOWN-LIMITATIONS](#known-limitations)
## MOTIVATION
-Existing apps like WhatsApp or Telegram offer voice messages but lack systemic voice control.
-VoiceConnect emerges as a design choice that inadvertently marginalizes millions with visual or motor impairments.
## FEATURES
-Voice-Driven UI navigation
-Real-Time Messaging
-Accessibility
## TESTING
-Unit testing for each elemental functinality.
-Integrated testing for overall user satisfaction.
## TECH STACK
-React Native
-Custom voice component library
-Django 4.2 with ASGI
-PostgreSQL full-text search for message history
## PERFROMANCE METRICES 
-High sucess rates for pre defined commands.
-Less than 5% CPU usage during continuous voice listening.
## KNOWN LIMITATIONS 
-Language Support: Initial release limited to English .
-Network Dependency
-Hardware Requirements: Noise cancellation needs dual-mic Android devices or iPhone 7+.
import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import Video from 'react-native-video';
import Tts from 'react-native-tts';
import { useNavigation } from '@react-navigation/native';
import useGlobal from '../core/global';

const SplashScreen = () => {
  const navigation = useNavigation();
  const authenticated = useGlobal(state => state.authenticated);
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [spoken, setSpoken] = useState(false);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.seek(0);
      }
    };
  }, []);

  const handleNavigation = () => {
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: authenticated ? 'Micc' : 'Mic' }],
      });
    }, 10);
  };

  const speakWelcome = () => {
    if (!spoken) {
      Tts.stop();
      Tts.setDefaultRate(0.5);
      Tts.setDefaultPitch(1.1);
      Tts.speak('Welcome to Voice Connect');
      setSpoken(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <Video
        ref={videoRef}
        source={require('../assets/IntroVoiceConnect.mp4')}
        style={styles.video}
        muted
        repeat={false}
        resizeMode="cover"
        rate={1.5} // ✅ 1.5x playback speed
        onEnd={handleNavigation}
        onReadyForDisplay={() => {
          setVideoReady(true);
          speakWelcome(); // ✅ triggers at the perfect moment
        }}
        onError={(error) => {
          console.log('Video error:', error);
          handleNavigation();
        }}
      />

      {!videoReady && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}

      <View style={styles.overlay}>
        <Text style={styles.appName}>VoiceConnect</Text>
      </View>
    </View>
  );
};

// styles unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 27,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: '#E0B0FF',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    marginTop: 135,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
});

export default SplashScreen;

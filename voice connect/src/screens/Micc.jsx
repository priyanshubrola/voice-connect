import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableWithoutFeedback,
  StatusBar,
  Animated,
  Dimensions,
  Image,
  Text
} from 'react-native';
import api from '../core/api'; // Import both the instance and URL

import { useNavigation } from '@react-navigation/native'; // ✅ Import navigation hook
import useGlobal from '../core/global';




const { width, height } = Dimensions.get('window');

const Micc = () => {
  const [isActive, setIsActive] = useState(false);
  const [resultText, setResultText] = useState('');
  const scaleAnim = useRef(new Animated.Value(1)).current;
    const navigation = useNavigation(); // ✅ Get navigation object
    const authenticated = useGlobal(state => state.authenticated);

    const socketConnect = useGlobal(state => state.socketConnect)
	const socketClose = useGlobal(state => state.socketClose)

  useLayoutEffect(() => {
      navigation.setOptions({
        headerShown: false
      })
    }, [])
  
    useEffect(() => {
      socketConnect()
      return () => {
        socketClose()
      }
    }, [])


  

  const handlePressIn = async () => {
    setIsActive(true);
    setResultText(''); // Clear previous result
    startPulseAnimation();

    try  {
      const response = await api.post('/voice/listen/');

      if (response.data.status === 'success' && response.data.text) {
        const spokenText = response.data.text.toLowerCase().trim();
        setResultText(spokenText);


        // ✅ Navigate based on detected voice command
        
  
        if (spokenText.includes('profile')){
          navigation.navigate('Profile'); // route name in your navigator
        }
        if (spokenText.includes('request' || 'requests')){
          navigation.navigate('Request'); // route name in your navigator
        }
        if (spokenText.includes('friend' || 'friends')){
          navigation.navigate('Friend'); // route name in your navigator
        }
        if (spokenText.includes('home') && authenticated) {
          navigation.navigate('Home');
        }
        if (spokenText.includes('search')) {
          navigation.navigate('Search');
        }


      } else {
        setResultText('No text detected');
      }
    } catch (error) {
      console.error('Voice recognition error:', error);
      setResultText('Error detecting speech');
    }
  };

  const handlePressOut = async () => {
    stopPulseAnimation();
    setIsActive(false);
    
    };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    scaleAnim.stopAnimation();
    scaleAnim.setValue(1);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.touchArea, { transform: [{ scale: scaleAnim }] }]}>
          <Image
            source={require('../assets/micc.png')}
            style={[
              styles.micImage,
              isActive && styles.micActive
            ]}
          />
        </Animated.View>
      </TouchableWithoutFeedback>
      
      {/* Result Text Display */}
      {resultText ? (
        <Text style={[
          styles.resultText,
          resultText === 'No text detected' && styles.noTextDetected
        ]}>
          {resultText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black'
  },
  touchArea: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center'
  },
  micImage: {
    width: 200,
    height: 200,
  },
  resultText: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    textAlign: 'center',
    color: '#E0B0FF',
    fontSize: 18,
    paddingHorizontal: 20
  },
  noTextDetected: {
    color: '#FF5555' // Red color for "No text detected" message
  }
});

export default Micc;

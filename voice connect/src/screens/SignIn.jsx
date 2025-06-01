import { useLayoutEffect, useState, useRef } from "react"
import { 
  KeyboardAvoidingView,
  SafeAreaView, 
  Text, 
  TouchableOpacity, 
  View,
  Image,
  Dimensions,
  FlatList,
} from "react-native"

import Title from "../common/Title"
import Input from "../common/Input"
import Button from "../common/Button"
import api from "../core/api"
import utils from "../core/utils"
import useGlobal from "../core/global"

function SignInScreen({ navigation }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const login = useGlobal(state => state.login)
  const [micSize, setMicSize] = useState(60)

    // Track active field, initialize to 'username'
  const [activeField, setActiveField] = useState('username')

  // To prevent handleScrollEnd from overwriting activeField if user focused input manually,
  // track if user focused input recently.
  const userFocusedInput = useRef(false)

  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const TOP_SECTION_HEIGHT = screenHeight * 0.25 + screenHeight * 0.14; // Total height of mic + title
  const BOTTOM_SECTION_HEIGHT = screenHeight - TOP_SECTION_HEIGHT;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    })
  }, [])

  async function startListening() {
  try {
    await api.post('/voice/start/');
    utils.log('Started listening...');
  } catch (e) {
    console.error('Error starting listening:', e);
  }
}

async function stopListening() {
  try {
    const response = await api.post('/voice/stop/');
    if (response.data.status === 'success' && response.data.text) {
      const text = response.data.text;
      if (activeField === 'username') {
        setUsername(text);
        setUsernameError('');
      } else if (activeField === 'password') {
        setPassword(text);
        setPasswordError('');
      }
      utils.log('Recognized text:', text);
    }
  } catch (e) {
    console.error('Error stopping listening:', e);
  }
}


  async function recognizeSpeech() {
    try {
      // Call your backend speech recognition endpoint
      const response = await api.post('/voice/listen/');
      const data = response.data

      if (data.status === 'success' && data.text) {
        if (activeField === 'username') {
          setUsername(data.text)
          setUsernameError('')
        } else if (activeField === 'password') {
          setPassword(data.text)
          setPasswordError('')
        }
        utils.log('Recognized text:', data.text)
      } else {
        utils.log('Speech recognition failed or no text recognized')
      }
    } catch (error) {
      console.error("Speech recognition error:", error)
    }
  }

  async function onSignIn() {
  utils.log('onSignIn:', username, password)

  let failUsername = !username
  let failPassword = !password

  if (failUsername) setUsernameError('Username not provided')
  if (failPassword) setPasswordError('Password not provided')

  if (failUsername || failPassword) return

  try {
    const response = await api({
      method: 'POST',
      url: '/chatAPI/signin/',  
      data: {
        username: username,
        password: password
      }
    });

    utils.log('Sign In:', response.data)

    // Call the login function from your global state
    login({
      username: username,
      password: password
    }, response.data.user, response.data.tokens);

    // Navigate to Home screen after successful login
    navigation.navigate("Micc");
    
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
      
      // Handle specific error cases
      if (error.response.status === 401) {
        setPasswordError('Invalid username or password');
      }
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log('Error', error.message);
    }
    console.log(error.config);
  }
}

  const swipeData = [
    {
      key: '1',
      component: (
        <Input
          title='USERNAME'
          value={username}
          error={usernameError}
          setValue={setUsername}
          setError={setUsernameError}
          secureTextEntry={false}
          onFocus={() => setActiveField('username')}
        />
      )
    },
    {
      key: '2',
      component: (
        <Input
          title='PASSWORD'
          value={password}
          error={passwordError}
          setValue={setPassword}
          setError={setPasswordError}
          secureTextEntry={true}
          onFocus={() => setActiveField('password')}
        />
      )
    },
    {
      key: '3',
      component: (
        <View style={{ width: '100%' }}>
          <Button title='SIGN IN' onPress={onSignIn} />
        </View>
      )
    },
    {
      key: '4',
      component: (
        <View style={{ width: '100%' }}>
          <Button title='Create Account SIGN UP' onPress={() => navigation.navigate('SignUp')} />
        </View>
      )
    }
  ];

  // Map swipeData keys to input fields for activeField tracking
  const keyToFieldMap = {
    '1': 'username',
    '2': 'password',
  }

  // When user focuses input, update activeField and mark userFocusedInput true
  function onInputFocus(fieldName) {
    setActiveField(fieldName)
    userFocusedInput.current = true

    // After short delay reset userFocusedInput so swipe can update activeField again
    setTimeout(() => {
      userFocusedInput.current = false
    }, 500) // 1 second delay, adjust if needed
  }

  // Handle FlatList scroll end to update activeField based on visible page
  // Handle swipe scrolling: update activeField only if user didn't recently focus input
  const handleScrollEnd = (event) => {
    if (userFocusedInput.current) return // ignore swipe updates shortly after input focus

    const offsetX = event.nativeEvent.contentOffset.x
    const pageIndex = Math.round(offsetX / screenWidth)
    const visibleKey = swipeData[pageIndex]?.key
    const field = keyToFieldMap[visibleKey]

    if (field) setActiveField(field)
  }

  
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {/* Top 30% Mic Button with Heading */}
          <View
            style={{
              height: screenHeight * 0.30,
              backgroundColor: 'black',
            }}
          >
            <TouchableOpacity
				activeOpacity={1}
				onPressIn={() => {
					setMicSize(150);
					startListening();
				}}
				onPressOut={() => {
					setMicSize(190);
					stopListening();
				}}
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					width: '100%',
					height: '100%',
				}}
				>
				<Image
					source={require('../assets/mic.png')}
					style={{
					width: micSize,
					height: micSize,
					resizeMode: 'contain',
					}}
				/>
				</TouchableOpacity>
          </View>

          {/* 5% - Heading */}
          <View
            style={{
              height: screenHeight * 0.14,
              backgroundColor: 'black',
              justifyContent: 'center',
              alignItems: 'center', // centers horizontally
            }}
          >
            <Text
              style={{
                color: '#E0B0FF',
                fontSize: 25,
                fontFamily: 'serif',
                textAlign: 'center',
                backgroundColor: 'black',
              }}
            >
              VoiceConnect
            </Text>
          </View>

          {/* Rest of the login screen */}
          <View style={{ height: BOTTOM_SECTION_HEIGHT }}>
            <FlatList
              data={swipeData}
              keyExtractor={item => item.key}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View
                  style={{
                    width: screenWidth,
                    height: BOTTOM_SECTION_HEIGHT,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                  }}
                >
                  {item.component}
                </View>
              )}
              onMomentumScrollEnd={handleScrollEnd}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default SignInScreen

import { useLayoutEffect, useState , useRef} from "react"
import {
	KeyboardAvoidingView,
	SafeAreaView,
	Text,
	View,
	Image,
	TouchableOpacity,
	Dimensions,
	FlatList,
} from "react-native"

import Input from "../common/Input"
import Button from "../common/Button"
import api from "../core/api"
import utils from "../core/utils"
import useGlobal from "../core/global"

function SignUpScreen({ navigation }) {
	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const [usernameError, setUsernameError] = useState('')
	const [emailError, setEmailError] = useState('')
	const [passwordError, setPasswordError] = useState('')
	const [confirmPasswordError, setConfirmPasswordError] = useState('')

	const login = useGlobal(state => state.login)
	const [micSize, setMicSize] = useState(60)

	// Track active field, initialize to 'username'
	  const [activeField, setActiveField] = useState('username')
	
	
	  // To prevent handleScrollEnd from overwriting activeField if user focused input manually,
	  // track if user focused input recently.
	  const userFocusedInput = useRef(false)
	

	const screenHeight = Dimensions.get('window').height;
	const screenWidth = Dimensions.get('window').width;
	const TOP_SECTION_HEIGHT = screenHeight * 0.25 + screenHeight * 0.14;
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
      } else if (activeField === 'email') {
        setEmail(text);
        setEmailError('');
      }
	  else if (activeField === 'password') {
        setPassword(text);
        setPasswordError('');
      }
	  else if (activeField === 'confirmPassword') {
		setConfirmPassword(text);
		setConfirmPasswordError('');
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
        } 
		else if (activeField === 'email') {
			setEmail(data.text);
			setEmailError('');
			}
		 else if (activeField === 'password') {
			setPassword(data.text);
			setPasswordError('');
			} 
		else if (activeField === 'confirmPassword') {
			setConfirmPassword(data.text);
			setConfirmPasswordError('');
			}

        utils.log('Recognized text:', data.text)
      } else {
        utils.log('Speech recognition failed or no text recognized')
      }
    } catch (error) {
      console.error("Speech recognition error:", error)
    }
  }


	function onSignUp() {
		let hasError = false

		if (!username) {
			setUsernameError("Username required")
			hasError = true
		}
		if (!email) {
			setEmailError("Email required")
			hasError = true
		}
		if (!password) {
			setPasswordError("Password required")
			hasError = true
		}
		if (!confirmPassword) {
			setConfirmPasswordError("Please confirm your password")
			hasError = true
			} 
		else if (password !== confirmPassword) {
			setConfirmPasswordError("Passwords do not match")
			hasError = true
			}

		if (hasError) return

		api({
			method: 'POST',
			url: '/chatAPI/signup/',
			data: {
				username,
				email,
				password
			}
		})
			.then(response => {
				utils.log('Sign Up:', response.data)

				const credentials = {
					username: username,
					password: password
				}
				login(
					credentials,
					response.data.user,
					response.data.tokens
				)
			})
			.catch(error => {
				console.log(error.response?.data || error.message)
			})
	}

	const swipeData = [
		{
			key: '1',
			component: (
				<Input
					title="USERNAME"
					value={username}
					error={usernameError}
					setValue={setUsername}
					setError={setUsernameError}
					onFocus={() => setActiveField('username')}
				/>
			),
		},
		{
			key: '2',
			component: (
				<Input
					title="EMAIL"
					value={email}
					error={emailError}
					setValue={setEmail}
					setError={setEmailError}
					onFocus={() => setActiveField('email')}
				/>
			),
		},
		{
			key: '3',
			component: (
				<Input
					title="PASSWORD"
					value={password}
					error={passwordError}
					setValue={setPassword}
					setError={setPasswordError}
					secureTextEntry={true}
					onFocus={() => setActiveField('password')}
				/>
			),
		},
		{
			key: '4',
			component: (
				<Input
					title="CONFIRM PASSWORD"
					value={confirmPassword}
					error={confirmPasswordError}
					setValue={setConfirmPassword}
					setError={setConfirmPasswordError}
					secureTextEntry={true}
					onFocus={() => setActiveField('confirmPassword')}
				/>
			),
		},
		{
			key: '5',
			component: (
				<View style={{ width: '100%' }}>
					<Button title="SIGN UP" onPress={onSignUp} />
				</View>
			),
		},
		{
			key: '6',
			component: (
				<View style={{ width: '100%' }}>
					<Button title="DIRECT TO SIGN IN" onPress={() => navigation.navigate('SignIn')} />
				</View>
			),
		},
	];

	// Map swipeData keys to input fields for activeField tracking
  const keyToFieldMap = {
    '1': 'username',
    '2': 'email',
	'3': 'password',
	'4': 'confirmPassword'
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
					
					{/* Mic Section */}
					<View style={{
						height: screenHeight * 0.30,
						backgroundColor: 'black',
					}}>
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
							}}>
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

					{/* Heading Section */}
					<View style={{
						flex: screenHeight * 0.14,
						backgroundColor: 'black',
						justifyContent: 'center',
						alignItems: 'center',
					}}>
						<Text style={{
							color: '#E0B0FF',
							fontSize: 25,
							fontFamily: 'serif',
							textAlign: 'center',
							backgroundColor: 'black',
						}}>
							VoiceConnect
						</Text>
					</View>

					{/* Swipeable Input Section */}
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
										width: Dimensions.get('window').width,
										height: BOTTOM_SECTION_HEIGHT,
										justifyContent: 'center',
										alignItems: 'center',
										paddingHorizontal: 20,
									}}>
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

export default SignUpScreen

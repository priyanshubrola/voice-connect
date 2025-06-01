import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import { useEffect, useState, useRef } from "react"
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView
} from "react-native"
import { launchImageLibrary } from 'react-native-image-picker'
import useGlobal from "../core/global"
import utils from "../core/utils"
import Thumbnail from "../common/Thumbnail"
import api from "../core/api"

function ProfileImage() {
  const uploadThumbnail = useGlobal(state => state.uploadThumbnail)
  const user = useGlobal(state => state.user)

  return (
    <TouchableOpacity 
      style={{ marginBottom: 20 }}
      onPress={() => {
        launchImageLibrary({ includeBase64: true }, (response) => {
          if (response.didCancel) return
          const file = response.assets[0]
          uploadThumbnail(file)
        })
      }}
    >
      <Thumbnail
        url={user.thumbnail}
        size={180}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          backgroundColor: '#202020',
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: 'white'
        }}
      >
        <FontAwesomeIcon
          icon='pencil'
          size={15}
          color='#d0d0d0'
        />
      </View>
    </TouchableOpacity>
  )
}

function ProfileLogout() {
  const logout = useGlobal(state => state.logout)

  return (
    <TouchableOpacity
      onPress={logout}
      style={{
        flexDirection: 'row',
        height: 200,
		width: 300,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 26,
        backgroundColor: '#8f09b8',
        marginTop: 20,
        marginBottom: 40
      }}
    >
      <FontAwesomeIcon
        icon='right-from-bracket'
        size={20}
        color='#d0d0d0'
        style={{ marginRight: 12}}
      />
      <Text
        style={{
          fontWeight: 'bold',
          color: '#d0d0d0'
        }}
      >
        Logout
      </Text>
    </TouchableOpacity>
  )
}

function ProfileScreen({ navigation }) {
  const [micSize, setMicSize] = useState(60)
  const user = useGlobal(state => state.user)
  
  const screenHeight = Dimensions.get('window').height
  const screenWidth = Dimensions.get('window').width
  const TOP_SECTION_HEIGHT = screenHeight * 0.25 + screenHeight * 0.14
  const BOTTOM_SECTION_HEIGHT = screenHeight - TOP_SECTION_HEIGHT

  async function startListening() {
    try {
      await api.post('/voice/start/')
      utils.log('Started listening...')
    } catch (e) {
      console.error('Error starting listening:', e)
    }
  }

  async function stopListening() {
    try {
      const response = await api.post('/voice/stop/')
      if (response.data.status === 'success' && response.data.text) {
        const command = response.data.text.toLowerCase()
        handleVoiceCommand(command)
        utils.log('Recognized text:', command)
      }
    } catch (e) {
      console.error('Error stopping listening:', e)
    }
  }

  function handleVoiceCommand(command) {
    const lowerCommand = command.toLowerCase()
    
    if (lowerCommand.includes('request')) {
      navigation.navigate('Request')
    }
    else if (lowerCommand.includes('friend')) {
      navigation.navigate('Friend')
    }
    else if (lowerCommand.includes('search')) {
      navigation.navigate('Search')
    }
    else if (lowerCommand.includes('logout') || lowerCommand.includes('sign out')) {
      logout()
      navigation.navigate('Mic')
    }
    else if (lowerCommand.includes('home') || lowerCommand.includes('mic')) {
      navigation.navigate('Micc')
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Top Mic Button with Heading */}
        <View style={{ height: screenHeight * 0.30, backgroundColor: 'black' }}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => {
              setMicSize(150)
              startListening()
            }}
            onPressOut={() => {
              setMicSize(190)
              stopListening()
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

        {/* Heading */}
        <View style={{
          height: screenHeight * 0.14,
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

        {/* Scrollable Profile Content */}
        <ScrollView contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 40,
          alignItems: 'center',
          minHeight: BOTTOM_SECTION_HEIGHT,
        }}>
          

          <Text style={{
            textAlign: 'center',
            color: '#303030',
            fontSize: 30,
            fontWeight: 'bold',
            marginBottom: 6
          }}>
            {user.name}
          </Text>
          <Text style={{
            textAlign: 'center',
            color: '#606060',
            fontSize: 20
          }}>
            @{user.username}
          </Text>

          <ProfileLogout />
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}

export default ProfileScreen
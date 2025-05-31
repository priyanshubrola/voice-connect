import { 
  ActivityIndicator, 
  FlatList, 
  SafeAreaView, 
  Text, 
  TouchableOpacity, 
  View,
  Image,
  Dimensions,
} from "react-native"
import Cell from "../common/Cell"
import Empty from "../common/Empty"
import useGlobal from "../core/global"
import Thumbnail from "../common/Thumbnail"
import utils from "../core/utils"
import api from "../core/api"
import { useState, useRef } from "react"

function FriendRow({ navigation, item }) {
  return (
    <TouchableOpacity onPress={() => {
      navigation.navigate('Messages', item)
    }}>
      <Cell>
        <Thumbnail
          url={item.friend.thumbnail}
          size={76}
        />
        <View
          style={{
            flex: 1,
            paddingHorizontal: 16
          }}
        >
          <Text
            style={{
              fontWeight: 'bold',
              color: '#202020',
              marginBottom: 4
            }}
          >
            {item.friend.name}
          </Text>
          <Text
            style={{
              color: '#606060',
            }}
          >
            {item.preview} <Text style={{ color: '#909090', fontSize: 13 }}>
              {utils.formatTime(item.updated)}
            </Text>
          </Text>
        </View>
      </Cell>
    </TouchableOpacity>
  )
}

function FriendsScreen({ navigation }) {
  const friendList = useGlobal(state => state.friendList)
  const [micSize, setMicSize] = useState(60)
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
	// Convert command to lowercase for case-insensitive comparison
	const lowerCommand = command.toLowerCase()
	
	// Handle navigation commands
	if (lowerCommand.includes('profile')) {
		navigation.navigate('Profile')
	} 
	else if (lowerCommand.includes('search')) {
		navigation.navigate('Search')
	}
	else if (lowerCommand.includes('request')) {
		navigation.navigate('Requests')
	}
	// Handle opening specific friend's chat
	else if (lowerCommand.includes('open') || lowerCommand.includes('message')) {
		// Extract the name from the command
		const nameFromCommand = lowerCommand.replace(/open|message/gi, '').trim()
		
		// Special case for "Voice Connect"
		if (nameFromCommand === 'voice connect' || nameFromCommand === 'voiceconnect') {
		const voiceConnectFriend = friendList.find(f => 
			f.friend.name.toLowerCase() === 'voice connect' || 
			f.friend.name.toLowerCase() === 'voiceconnect'
		)
		if (voiceConnectFriend) {
			navigation.navigate('Messages', voiceConnectFriend)
			return
		}
		}
		
		// General case for other friends
		const friend = friendList.find(f => 
		f.friend.name.toLowerCase().includes(nameFromCommand)
		)
		if (friend) {
		navigation.navigate('Messages', friend)
		}
	}
	}

  // Show loading indicator
  if (friendList === null) {
    return (
      <ActivityIndicator style={{ flex: 1 }} />
    )
  }

  // Show empty if no requests
  if (friendList.length === 0) {
    return (
      <Empty icon='inbox' message='No messages yet' />
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
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
        <View
          style={{
            height: screenHeight * 0.14,
            backgroundColor: 'black',
            justifyContent: 'center',
            alignItems: 'center',
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

        {/* Friends List */}
        <View style={{ height: BOTTOM_SECTION_HEIGHT }}>
          <FlatList
            data={friendList}
            renderItem={({ item }) => (
              <FriendRow navigation={navigation} item={item} />
            )}
            keyExtractor={item => item.id}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

export default FriendsScreen
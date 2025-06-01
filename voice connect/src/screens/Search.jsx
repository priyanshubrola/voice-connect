import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome"
import { useEffect, useState, useRef, useLayoutEffect } from "react"
import { 
  FlatList,
  SafeAreaView, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  Image,
  Dimensions,
} from "react-native"
import Empty from "../common/Empty"
import Thumbnail from "../common/Thumbnail"
import useGlobal from "../core/global"
import Cell from "../common/Cell"
import api from "../core/api"
import utils from "../core/utils"

function SearchButton({ user }) {
  // ... (keep existing SearchButton implementation)
}

function SearchRow({ user, navigation }) {
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Messages', { friend: user })}>
      <Cell>
        <Thumbnail
          url={user.thumbnail}
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
            {user.name}
          </Text>
          <Text
            style={{
              color: '#606060',
            }}
          >
            {user.username}
          </Text>
        </View>
        <SearchButton user={user} />
      </Cell>
    </TouchableOpacity>
  )
}

function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('')
  const [micSize, setMicSize] = useState(60)
  const searchList = useGlobal(state => state.searchList)
  const searchUsers = useGlobal(state => state.searchUsers)
  
  const screenHeight = Dimensions.get('window').height
  const screenWidth = Dimensions.get('window').width
  const TOP_SECTION_HEIGHT = screenHeight * 0.25 + screenHeight * 0.14
  const BOTTOM_SECTION_HEIGHT = screenHeight - TOP_SECTION_HEIGHT

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false
    })
  }, [navigation])

  useEffect(() => {
    searchUsers(query)
  }, [query])

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
    
    // Navigation commands
    if (lowerCommand.includes('profile')) {
      navigation.navigate('Profile')
    } 
    else if (lowerCommand.includes('request')) {
      navigation.navigate('Request')
    }
    else if (lowerCommand.includes('friend')) {
      navigation.navigate('Friend')
    }
    // Search for user
    else if (lowerCommand.includes('search')) {
      const searchTerm = lowerCommand.replace('search', '').trim()
      if (searchTerm) {
        setQuery(searchTerm)
      }
    }
    // Open message with specific user
    else if (lowerCommand.includes('message') || lowerCommand.includes('open')) {
      const username = lowerCommand.replace(/message|open/gi, '').trim()
      const user = searchList.find(u => 
        u.username.toLowerCase().includes(username) || 
        u.name.toLowerCase().includes(username)
      )
      if (user) {
        navigation.navigate('Messages', { friend: user })
      }
    }
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

        {/* Search Content */}
        <View style={{ height: BOTTOM_SECTION_HEIGHT }}>
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderColor: '#f0f0f0'
            }}
          >
            <View>
              <TextInput
                style={{
                  backgroundColor: '#e1e2e4',
                  height: 52,
                  borderRadius: 26,
                  padding: 16,
                  fontSize: 16,
                  paddingLeft: 50
                }}
                value={query}
                onChangeText={setQuery}
                placeholder='Search...'
                placeholderTextColor='#b0b0b0'
              />
              <FontAwesomeIcon
                icon='magnifying-glass'
                size={20}
                color='#505050'
                style={{
                  position: 'absolute',
                  left: 18,
                  top: 17
                }}
              />
            </View>
          </View>

          {searchList === null ? (
            <View style={{ marginTop: -60 }}>  
				<Empty
				icon='magnifying-glass'
				message='Search for friends'
				centered={false}
				/>
			</View>
          ) : searchList.length === 0 ? (
            <Empty
              icon='triangle-exclamation'
              message={'No users found for "' + query + '"'}
              centered={false}
            />
          ) : (
            <FlatList
              data={searchList}
              renderItem={({ item }) => (
                <SearchRow user={item} navigation={navigation} />
              )}
              keyExtractor={item => item.username}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

export default SearchScreen
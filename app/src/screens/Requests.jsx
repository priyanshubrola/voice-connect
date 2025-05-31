import { 
  ActivityIndicator, 
  FlatList, 
  View, 
  Text, 
  TouchableOpacity,
  Dimensions,
  Image,
  SafeAreaView,
  StyleSheet,
  Animated
} from "react-native"
import useGlobal from "../core/global"
import Empty from "../common/Empty"
import Cell from "../common/Cell"
import Thumbnail from "../common/Thumbnail"
import utils from "../core/utils"
import { useState, useRef } from "react"
import api from "../core/api"

function RequestsScreen({ navigation }) {
  const requestList = useGlobal(state => state.requestList)
  const [micSize, setMicSize] = useState(60)
  const [isListening, setIsListening] = useState(false)
  const scrollX = useRef(new Animated.Value(0)).current
  
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const TOP_SECTION_HEIGHT = screenHeight * 0.30;
  const BOTTOM_SECTION_HEIGHT = screenHeight - TOP_SECTION_HEIGHT - (screenHeight * 0.14);

  async function startListening() {
    try {
      setIsListening(true)
      await api.post('/voice/start/');
      utils.log('Started listening...');
    } catch (e) {
      console.error('Error starting listening:', e);
      setIsListening(false)
    }
  }

  async function stopListening() {
    try {
      setIsListening(false)
      const response = await api.post('/voice/stop/');
      if (response.data.status === 'success' && response.data.text) {
        const command = response.data.text.toLowerCase().trim();
        handleVoiceCommand(command);
      }
    } catch (e) {
      console.error('Error stopping listening:', e);
    }
  }

  function handleVoiceCommand(command) {
    // Check for navigation commands first
    if (command.includes('friend') || command.includes('friends')) {
      navigation.navigate('Friend');
      return;
    }
    
    if (command.includes('profile')) {
      navigation.navigate('Profile');
      return;
    }
    
    if (command.includes('search')) {
      navigation.navigate('Search');
      return;
    }
    
    // Check if command matches any username in requests
    if (requestList && requestList.length > 0) {
      const matchedRequest = requestList.find(request => 
        request.sender.username.toLowerCase().includes(command) ||
        request.sender.name.toLowerCase().includes(command)
      );
      
      if (matchedRequest) {
        utils.showToast(`Request found from ${matchedRequest.sender.name}`);
      } else {
        utils.showToast(`No request from ${command}`);
      }
    } else {
      utils.showToast('No requests available');
    }
  }

  // Show loading indicator
  if (requestList === null) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ height: TOP_SECTION_HEIGHT, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => {
              setMicSize(150);
              startListening();
            }}
            onPressOut={() => {
              setMicSize(60);
              stopListening();
            }}
            style={{
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
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    )
  }

  // Prepare data for horizontal FlatList including the "No more requests" card
  const swipeData = [
    ...requestList.map((item, index) => ({
      key: `request-${index}`,
      type: 'request',
      data: item
    })),
    {
      key: 'no-more-requests',
      type: 'message',
      data: {
        message: 'No more requests'
      }
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Mic Button Section */}
      <View style={{ height: TOP_SECTION_HEIGHT, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => {
            setMicSize(150);
            startListening();
          }}
          onPressOut={() => {
            setMicSize(60);
            stopListening();
          }}
          style={{
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
      
      {/* Title Section */}
      <View style={{ height: screenHeight * 0.14, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#E0B0FF', fontSize: 25, fontFamily: 'serif', textAlign: 'center' }}>
          VoiceConnect
        </Text>
      </View>
      
      {/* Swipeable Requests List */}
      {requestList.length > 0 ? (
        <View style={{ 
          height: BOTTOM_SECTION_HEIGHT,
          justifyContent: 'center',
		  width: '100%',
            backgroundColor: '#f5f5f5',
          alignItems: 'center'
        }}>
          <Animated.FlatList
            data={swipeData}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            renderItem={({ item }) => {
              if (item.type === 'request') {
                return (
                  <View style={{ 
                    width: screenWidth, 
                    paddingHorizontal: 20,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <RequestRow item={item.data} />
                  </View>
                );
              } else {
                return (
                  <View style={[styles.noMoreContainer, { width: screenWidth }]}>
                    <Text style={styles.noMoreText}>{item.data.message}</Text>
                  </View>
                );
              }
            }}
            keyExtractor={item => item.key}
          />
        </View>
      ) : (
        <View style={{ 
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={styles.noMoreText}>No requests</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  noMoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  noMoreText: {
    fontSize: 18,
    color: '#606060',
    textAlign: 'center'
  },
  requestContainer: {
    width: '100%',
    paddingHorizontal: 20
  }
});

// Keep your existing RequestRow and RequestAccept components unchanged
function RequestRow({ item }) {
  return (
    <View style={{ marginBottom: 30, flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'flex-start' }}>
        <Cell
          style={{
            paddingVertical: 10,
            paddingHorizontal: 50,
            marginBottom: 1 // Added margin to separate from the button
          }}
        >
          <Text
            style={{
              fontWeight: 'bold',
              color: '#202020',
              margin: 4,
              fontSize: 30,
			  paddingRight: 15
            }}
          >
            {item.sender.name}
          </Text>
          <Text
            style={{
              color: '#909090',
              fontSize: 20
            }}
          >
            {utils.formatTime(item.created)}
          </Text>
        </Cell>
      </View>
      
      <View>
        <RequestAccept item={item} />
      </View>
    </View>
  )
}

function RequestAccept({ item }) {
  const requestAccept = useGlobal(state => state.requestAccept)

  return (
    <TouchableOpacity
      style={{
        backgroundColor: '#87059c',
        paddingHorizontal: 10,
        height: 230,
		width: 330,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={() => requestAccept(item.sender.username)}
    >
      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 30 }}>ACCEPT</Text>
    </TouchableOpacity>
  )
}

export default RequestsScreen
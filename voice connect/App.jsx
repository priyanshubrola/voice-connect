import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/Splash';
import SignInScreen from './src/screens/SignIn';
import SignUpScreen from './src/screens/SignUp';
import HomeScreen from './src/screens/Home';
import SearchScreen from './src/screens/Search';
import MessagesScreen from './src/screens/Message';
import useGlobal from './src/core/global';
import Mic from './src/screens/Mic'; // adjust path if needed
import Micc from './src/screens/Micc';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ProfileScreen from './src/screens/Profile';
import RequestsScreen from './src/screens/Requests';
import FriendsScreen from './src/screens/Friends';

import './src/core/fontawesome'


const Stack = createNativeStackNavigator();

function App() {
  // Use separate selectors to prevent unnecessary re-renders
  const initialized = useGlobal(state => state.initialized);
  const authenticated = useGlobal(state => state.authenticated);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          animation: 'fade', // Smooth transition between screens
        }}
      >
        {/* Splash Screen - Always first */}
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen 
            name="Mic" 
            component={Mic} 
            options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Micc" 
          component={Micc} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SignIn" 
          component={SignInScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Request" 
          component={RequestsScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Friend" 
          component={FriendsScreen} 
          options={{ headerShown: false }}
        />
        

        {/* Auth Screens */}
        {initialized && !authenticated && (
          <>
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{ 
                headerShown: false,
                animationTypeForReplace: 'pop' // Better back navigation
              }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Request" 
          component={RequestsScreen} 
          options={{ headerShown: false }}
        />
        
          </>
        )}

        {/* Main App Screens */}
        {authenticated && (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{
                headerTitle: '',
                headerBackTitleVisible: false,
                headerShadowVisible: false
              }}
            />
            <Stack.Screen
              name="Messages"
              component={MessagesScreen}
              options={({ route }) => ({
                title: route.params.friend.name,
                headerBackTitleVisible: false,
                headerTitleStyle: {
                  fontWeight: 'bold',
                  fontSize: 18
                }
              })}
            />
          </>
        )}

    
      </Stack.Navigator>
    </NavigationContainer>
    </GestureHandlerRootView>
    
  );

  
}



export default App;
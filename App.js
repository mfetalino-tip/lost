import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Signup from './components/SignUpScreen';
import Login from './components/Login';
import NewAccount from './components/NewAccount';
import MainTab from './components/MainTab';
import MainTabTwo from './components/MainTabTwo';
import Tab2 from './components/Tab2';

import Tab5 from './components/Tab5';
import CreatePost from './components/CreatePost';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="NewAccount" component={NewAccount} />
        <Stack.Screen name="MainTab" component={MainTab} />
        <Stack.Screen name="MainTabTwo" component={MainTabTwo} />
        <Stack.Screen name="CreatePost" component={CreatePost} />
      
        
        <Stack.Screen name="Tab5" component={Tab5} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

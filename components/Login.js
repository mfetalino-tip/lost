import React, { useState } from 'react';
import { StyleSheet, Image, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { auth } from '../src/firebase'; // Import Firebase auth
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase signInWithEmailAndPassword

export default function Login({ navigation }) {
  const [studentNumber, setStudentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginSuccess(true);
      setTimeout(() => {
        navigation.navigate('MainTab');
      }, 2000);
    } catch (error) { 
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('./pictures/TIP.png')}
          style={styles.image}
        />
        <View>
          <Text style={styles.imageText}>Lost and Found Tracker</Text>
        </View>
      </View>
      <View style={styles.inputborder}>
        <TextInput
          placeholder="*Student Number"
          style={styles.inputtext}
          placeholderTextColor="#E9D735"
          value={studentNumber}
          onChangeText={(text) => setStudentNumber(text)}
        />
      </View>
      <View style={styles.inputborder}>
        <TextInput
          placeholder="*TIP Email"
          style={styles.inputtext}
          placeholderTextColor="#E9D735"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
      </View>
      <View style={[styles.inputborder, { marginBottom: 50 }]}>
        <TextInput
          placeholder="*Password"
          style={styles.inputtext}
          placeholderTextColor="#E9D735"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <TouchableOpacity
        style={[styles.buttonContainer, { width: 200, borderRadius: 10 }]} // Corrected the style object
        onPress={handleLogin}
      >
        <Text style={styles.buttontext}>LOGIN</Text>
      </TouchableOpacity>
      <View>
        <Text style={styles.acctext}>Don’t have an account?{' '}
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signtext}>Sign up</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#394B58',
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 25,
    color: 'white',
    paddingBottom: 20,
  },
  inputtext: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#E9D735',
    paddingBottom: 20,
    paddingTop: 15,
  },
  inputborder: {
    borderBottomColor: 'white',
    borderBottomWidth: 1,
    width: 240,
    marginBottom: 25,
  },
  buttonContainer: {
    backgroundColor: '#E9D735',
    paddingVertical: 7,
    alignItems: 'center',
  },
  buttontext: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  acctext: {
    marginTop: 15,
    fontSize: 15,
    color: 'white',
    fontWeight: 'bold',
  },
  signtext: {
    marginTop: 15,
    fontSize: 15,
    color: '#E9D735',
    fontWeight: 'bold',
  },
});


import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import { auth } from '../src/firebase'; // Import Firebase auth
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'; // Import Firebase createUserWithEmailAndPassword
import { getDatabase, ref, set } from "firebase/database";

export default function SignUpScreen({ navigation }) {
  const [studentNumber, setStudentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const db = getDatabase();

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!email.toLowerCase().endsWith("@tip.edu.ph")) {
      alert("Invalid Email");
      return;
    }

    if (!/^\d{7}$/.test(studentNumber)) {
      alert("Invalid Student Number");
      return;
    }

    if (password.length < 8) {
      alert("Weak password. Please use at least 8 characters.");
      return;
    }

    try {
      // Create user in Authentication
      const authUser = await createUserWithEmailAndPassword(auth, email, password);

      // Update user profile in Authentication (displayName)
      await updateProfile(authUser.user, { displayName: studentNumber });

      // Update Realtime Database
      const userId = authUser.user.uid;
      await set(ref(db, `users/${userId}`), {
        email: email,
        studentNumber: studentNumber,
      });

      setSignupSuccess(true);
      setTimeout(() => {
        navigation.navigate('NewAccount');
      }, 2000);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('./pictures/profile.png')}
          style={styles.image}
        />
        <View>
          <Text style={styles.title}>CREATE AN ACCOUNT</Text>
        </View>
      </View>
      <View> 
        <Text style={[styles.phrase, { marginBottom: 50 }]}>Don't wait, start finding your lost items - Sign up today!</Text>
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
      <View style={styles.inputborder}>
        <TextInput
          placeholder="*Password"
          style={styles.inputtext}
          placeholderTextColor="#E9D735"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
      </View>
      <View style={styles.inputborder}> 
        <TextInput
          placeholder="*Confirm Password"
          style={styles.inputtext}
          placeholderTextColor="#E9D735"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
        />
      </View>
      <TouchableOpacity
        style={[styles.buttonContainer, { width: 200, borderRadius: 10 }]}
        onPress={handleSignup}
      >
        <Text style={styles.buttontext}>SIGNUP</Text>
      </TouchableOpacity>
      <View>
        <Text style={styles.acctext}>Don’t have an account?{' '}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signtext}>Login</Text>
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
    width: 80,
    height: 80,
    marginTop: 30,
    resizeMode: 'contain',
    paddingBottom: 110,
  },
  title: {
    fontSize: 20,
    color: 'white',
    paddingBottom: 10,
    fontWeight: 'bold',
  },
  phrase: {
    fontSize: 14,
    color: 'white',
    paddingTop: 5,
    alignContent: 'center',
  },
  inputborder: {
    borderBottomColor: 'white',
    borderBottomWidth: 1,
    width: 240,
    marginBottom: 35,
  },
  inputtext: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#E9D735',
    paddingBottom: 18,
    paddingTop: 10,
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


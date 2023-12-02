import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { auth, userSignOut, updateUserProfile } from '../src/firebase';
import { getDatabase, ref, get, set } from 'firebase/database';
import { updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { AntDesign, MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';

const YourImage = require('./pictures/profile.png');

export default function ProfileSetting({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  const db = getDatabase();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;

        if (user) {
          const userId = user.uid;
          const userRef = ref(db, `users/${userId}`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const userData = snapshot.val();
            setName(userData.displayName || ''); 
            setEmail(userData.email || '');
            setStudentNumber(userData.studentNumber || '');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

    
      const userId = user.uid;
      await set(ref(db, `users/${userId}`), {
        displayName: name,
        email: newEmail || email,
        studentNumber: studentNumber,
      });

      if (newEmail && newEmail !== email) {
      
        await updateEmail(user, newEmail);
      }

        await updateUserProfile(user, { displayName: name });

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
      console.error('Error updating profile:', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await userSignOut(auth);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Settings</Text>
      <View style={styles.profileHeader}>
        <Image source={YourImage} style={styles.profileimage} />
        <TouchableOpacity onPress={handleEdit} style={styles.editIcon}>
          <FontAwesome name="pencil-square-o" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          Name:
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputtext}
            value={name}
            onChangeText={setName}
            editable={isEditing}
          />
          <FontAwesome name="user" size={24} color="#485E6E" style={styles.icon} />
        </View>
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          Email:
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputtext}
            value={isEditing ? newEmail : email}
            onChangeText={(text) => setNewEmail(text)}
            editable={isEditing}
          />
          <FontAwesome name="envelope-o" size={24} color="#485E6E" style={styles.icon} />
        </View>
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          Student ID:
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputtext}
            value={studentNumber}
            onChangeText={setStudentNumber}
            editable={isEditing}
          />
          <FontAwesome name="id-card-o" size={24} color="#485E6E" style={styles.icon} />
        </View>
      </View>
  
      {isEditing && (
        <View>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>
              Current Password:
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.inputtext}
                placeholder="Enter current password"
                placeholderTextColor="#485E6E"
                secureTextEntry={true}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <FontAwesome name="lock" size={24} color="#485E6E" style={styles.icon} />
            </View>
          </View>
  
          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.buttontext}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
  
      {/* Logout Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.buttontext}>Logout</Text>
        </TouchableOpacity>
      </View>
  
      {/* Navigation Icons */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>
          <MaterialIcons name="post-add" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MainTab')}>
          <AntDesign name="home" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('NewPostsTab')}>
          <Feather name="bell" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Tab5')}>
          <Feather name="user" size={32} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'top',
    paddingTop: 95,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#485E6E',
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileimage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  editIcon: {
    marginTop: 10, 
  },
  labelContainer: {
    width: '80%', 
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#F5F5F5',
    borderBottomColor: '#485E6E',
    borderBottomWidth: 1,
    paddingVertical: 10, 
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#485E6E',
  },
  inputtext: {
    flex: 1,
    fontSize: 15,
    color: '#485E6E',
  },
  buttonContainer: {
    backgroundColor: '#FFD700', 
    paddingVertical: 10,
    paddingHorizontal: 20, 
    borderRadius: 10,
    marginVertical: 10,
    alignSelf: 'center',
  },
  buttontext: {
    color: '#000', 
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#485E6E',
    height: 60,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

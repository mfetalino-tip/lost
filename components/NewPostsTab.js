import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { MaterialIcons, AntDesign, Feather } from '@expo/vector-icons'; // Added imports for navigation icons

export default function NewPostsTab({ navigation }) {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [clickedPosts, setClickedPosts] = useState([]);
  const [newPostsTabActive, setNewPostsTabActive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase();
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    const itemsRef = ref(db, 'items');

    const unsubscribe = onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const itemsArray = Object.values(data);
        setItems(itemsArray.reverse());
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = items.filter(
      (item) =>
        item.category &&
        item.category.toLowerCase().includes('')
    );
    setFilteredItems(filtered);
  }, [items, clickedPosts]);

  const handleTabSwitch = (tabName) => {
    if (tabName === 'NewPostsTab') {
      setNewPostsTabActive(true);
    } else {
      setNewPostsTabActive(false);
      navigation.navigate(tabName);
    }
  };

  const isPostClicked = (postId) => {
    return clickedPosts.includes(postId);
  };

  const handlePostClick = (postId) => {
    const db = getDatabase();
    const itemRef = ref(db, `items/${postId}`);
    setClickedPosts((prevClickedPosts) =>
      prevClickedPosts.includes(postId)
        ? prevClickedPosts.filter((id) => id !== postId)
        : [...prevClickedPosts, postId]
    );
    update(itemRef, { clicked: !isPostClicked(postId) });
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, newPostsTabActive && styles.activeTab]}
          onPress={() => handleTabSwitch('NewPostsTab')}
        >
          <Text style={[styles.tabText, newPostsTabActive && styles.activeTabText]}>
            Notifications
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#4267B2" />
      ) : (
        <ScrollView style={styles.scrollContainer}>
          {filteredItems.map((item) => (
            <TouchableOpacity
              key={`${item.timestamp}-${item.postId}`}
              onPress={() => {
                handlePostClick(item.postId);
                navigation.navigate('MainTab', { userId: item.userEmail });
              }}
            >
              <View style={[
                styles.postContainer,
                isPostClicked(item.postId) ? styles.clickedPost : styles.notClickedPost,
              ]}>
                <Text style={styles.postUser}>{item.userEmail} posted a new item</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

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
    paddingHorizontal: 10,
    paddingTop: 50,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
    paddingBottom: 10,
    marginBottom: 10,
  },
  tab: {
    paddingHorizontal: 40,
    paddingVertical: 10,
    backgroundColor: '#EFEFEF',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#4267B2',
    borderRadius: 5,
  },
  activeTabText: {
    color: 'white',
  },
  tabText: {
    fontSize: 18,
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
  },
  postContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
    borderRadius: 10,
    marginVertical: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  postUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clickedPost: {
    backgroundColor: '#D3E3FC',
  },
  notClickedPost: {
    backgroundColor: 'lightblue',
  },
  loader: {
    marginTop: 20,
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

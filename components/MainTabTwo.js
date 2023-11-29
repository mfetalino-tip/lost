import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, TextInput, Modal, Pressable, KeyboardAvoidingView, Platform, } from 'react-native';
import { Ionicons, AntDesign, MaterialIcons, Feather } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged, } from 'firebase/auth';
import { getDatabase, ref, set, push, onValue, } from 'firebase/database';
import { query, orderByChild, equalTo } from 'firebase/database';

export default function MainTabTwo({ navigation }) {
  
  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [currentPost, setCurrentPost] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [filteredUserPosts, setFilteredUserPosts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    const db = getDatabase();
    const postsRef = ref(db, 'items');
    
    // Fetch posts only for the authenticated user
    if (user) {
      const userPostsQuery = onValue(
        query(postsRef, orderByChild('userEmail'), equalTo(user.email)),
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const userPostsArray = Object.values(data);
            setUserPosts(userPostsArray.reverse());
          }
        }
      );

      return () => {
        userPostsQuery();
      };
    }

    return () => {
      unsubscribeAuth();
    };
  }, [user]);

  useEffect(() => {
    if (currentPost && currentPost.comments) {
      const commentsArray = Array.isArray(currentPost.comments)
        ? currentPost.comments
        : Object.values(currentPost.comments);
      setPostComments(commentsArray);
    } else {
      setPostComments([]);
    }
  }, [currentPost]);

  useEffect(() => {
    const filtered = userPosts.filter(
      (item) =>
        item.category &&
        item.category.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredUserPosts(filtered);
  }, [userPosts, searchText]);

  const handleSearch = () => {
    setFilteredUserPosts(
      userPosts.filter(
        (item) =>
          item.category &&
          item.category.toLowerCase().includes(searchText.toLowerCase())
      )
    );
  };

  const handleCommentButton = (post) => {
    toggleCommentModal(post);
  };

  const toggleCommentModal = (post) => {
    setCurrentPost(post);
    setCommentModalVisible(!isCommentModalVisible);
    setReplyTo(null); // Reset replyTo when opening the comment modal
  };

  const handleReply = (userEmail) => { 
    setReplyTo(userEmail);
    setComment(`@${userEmail} `);
  };

  const handleComment = async () => {
    if (comment.trim() !== '' && currentPost && currentPost.postId && user) {
      try {
        const db = getDatabase();
        const commentsRef = ref(
          db,
          `items/${currentPost.postId}/comments`
        );
        const newCommentRef = push(commentsRef);

        await set(newCommentRef, {
          userEmail: user.email,
          text: comment,
        });

        setComment('');

        const updatedComments = [
          ...postComments,
          { userEmail: user.email, text: comment },
        ];
        setPostComments(updatedComments);
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Lost & Found</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="search" style={styles.searchIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate('MainTab')}
        >
          <Text style={styles.tabText}>FOR YOU</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => navigation.navigate('MainTabTwo')}
        >
          <Text style={styles.tabText}>YOUR POSTS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {filteredUserPosts.map((item) => (
          <View key={`${item.timestamp}-${item.postId}`} style={styles.postContainer}>
            <View style={styles.postHeader}>
              <Text style={styles.postUser}>{item.userEmail}</Text>
              <Text style={styles.postDate}>{formatDate(item.timestamp)}</Text>
            </View>

            <Text style={styles.postText}>{item.text}</Text>
            <Text style={styles.postDetail}>Location: {item.location}</Text>
            <Text style={styles.postDetail}>Color: {item.color}</Text>
            <Text style={styles.postDetail}>Item: {item.category}</Text>

            {item.image && (
              <Image
                source={{ uri: item.image }}
                style={styles.imagePreview}
              />
            )}

            <TouchableOpacity
              style={styles.commentButton}
              onPress={() => handleCommentButton(item)}
            >
              <Text style={styles.commentButtonText}>Comment</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal animationType="slide" transparent={false} visible={isCommentModalVisible}>
        {isCommentModalVisible && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.commentModalContainer}
          >
            <View style={styles.commentHeader}>
              <Pressable style={styles.backButton} onPress={() => toggleCommentModal(null)}>
                <Ionicons name="arrow-back" style={styles.backIcon} />
                <Text style={styles.commentHeaderText}>Comments</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.commentListContainer}>
              {Array.isArray(postComments) && postComments.map((comment, index) => (
                <View key={`${comment.userEmail}-${index}`} style={styles.commentContainer}>
                  <TouchableOpacity onPress={() => handleReply(comment.userEmail)}>
                    <Text style={styles.commentUser}>{comment.userEmail}</Text>
                  </TouchableOpacity>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))}
            </ScrollView>

            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={comment}
              onChangeText={(text) => setComment(text)}
              multiline
            />

            <Pressable style={styles.commentButton} onPress={handleComment}>
              <Text style={styles.commentButtonText}>Comment</Text>
            </Pressable>
          </KeyboardAvoidingView>
        )}
      </Modal>

      <View style={styles.bottomNavigation}>
        <TouchableOpacity onPress={() => navigation.navigate('CreatePost')}>  
          <MaterialIcons name="post-add" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MainTab')}>
          <AntDesign name="home" size={32} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Tab5')}>
          <Feather name="user" size={32} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: 'white',
    padding: 15,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  logo: {
    color: 'black',
    marginTop: 25,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  searchContainer: {
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: '#D9D9D9',
    borderRadius: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  searchIcon: {
    fontSize: 24,
    color: '#485E6E',
    marginLeft: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  tab: {
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Verdana',
    color: '#485E6E',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  postContainer: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postUser: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Georgia',
    color: '#333',
  },
  postDate: {
    fontSize: 13,
    color: '#888',
  },
  postText: {
    fontSize: 16,
    marginTop: 10,
  },
  postDetail: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  commentButton: {
    backgroundColor: '#485E6E',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
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
  commentModalContainer: {
    flex: 1,
    padding: 20,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 30,
    marginRight: 95,
    marginTop: 30,
  },
  commentHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Verdana',
    color: '#485E6E',
    marginTop: 30,
  },
  commentListContainer: {
    flex: 1,
    marginTop: 10,
  },
  commentContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
    marginBottom: 10,
  },
  commentUser: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Arial',
    color: '#485E6E',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  commentInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  commentButton: {
    backgroundColor: '#485E6E',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  commentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { getDatabase, ref, onValue, push, set } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

const PostDetail = ({ route, user }) => {
  const { postId } = route.params;
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isCommentModalVisible, setCommentModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [postComments, setPostComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const db = getDatabase();
        const postRef = ref(db, `items/${postId}`);

        onValue(postRef, (snapshot) => {
          const data = snapshot.val();
          setPostDetails(data);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error fetching post details:', error);
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  useEffect(() => {
    if (postDetails && postDetails.comments) {
      const commentsArray = Array.isArray(postDetails.comments)
        ? postDetails.comments
        : Object.values(postDetails.comments);
      setPostComments(commentsArray);
    } else {
      setPostComments([]);
    }
  }, [postDetails]);

  const toggleCommentModal = () => {
    setCommentModalVisible(!isCommentModalVisible);
    setReplyTo(null);
  };

  const handleReply = (userEmail) => {
    setReplyTo(userEmail);
    setComment(`@${userEmail} `);
  };

  const handleComment = async () => {
    if (comment.trim() !== '' && postDetails && postDetails.postId) {
      try {
        const db = getDatabase();
        const commentsRef = ref(db, `items/${postDetails.postId}/comments`);
        const newCommentRef = push(commentsRef);

        await set(newCommentRef, {
          userEmail: user ? user.email : 'Anonymous',
          text: comment,
        });

        setComment('');

        const updatedComments = [
          ...postComments,
          { userEmail: user ? user.email : 'Anonymous', text: comment },
        ];
        setPostComments(updatedComments);
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />;
  }

  if (!postDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Unable to fetch post details</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.postContainer}>
        <Text style={styles.userEmail}>{postDetails.userEmail}</Text>
        <Text style={styles.timestamp}>{postDetails.timestamp}</Text>

        <Text style={styles.postText}>{postDetails.text}</Text>

        {postDetails.image && (
          <Image source={{ uri: postDetails.image }} style={styles.postImage} />
        )}

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Location: {postDetails.location}</Text>
          <Text style={styles.infoText}>Color: {postDetails.color}</Text>
          <Text style={styles.infoText}>Category: {postDetails.category}</Text>
        </View>

        {postDetails.comments && postDetails.comments.length > 0 && (
          <View style={styles.commentsContainer}>
            <Text style={styles.commentsHeader}>Comments:</Text>
            {postDetails.comments.map((comment, index) => (
              <View key={index} style={styles.comment}>
                <Text style={styles.commentUser}>{comment.userEmail}:</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.commentButton} onPress={toggleCommentModal}>
          <Text style={styles.commentButtonText}>Comment</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={false}
        visible={isCommentModalVisible}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.commentModalContainer}
        >
          <View style={styles.commentHeader}>
            <Pressable onPress={toggleCommentModal}>
              <Ionicons name="arrow-back" style={styles.backIcon} />
            </Pressable>
            <Text style={styles.commentHeaderText}>Comments</Text>
          </View>

          <ScrollView style={styles.commentListContainer}>
            {Array.isArray(postComments) &&
              postComments.map((comment, index) => (
                <View
                  key={`${comment.userEmail}-${index}`}
                  style={styles.commentContainer}
                >
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
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#F5F5F5',
  },
  postContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  userEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  timestamp: {
    color: '#777',
    marginBottom: 10,
  },
  postText: {
    fontSize: 18,
    marginBottom: 15,
    color: '#333',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  infoContainer: {
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
  },
  commentsContainer: {
    marginTop: 15,
  },
  commentsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  commentUser: {
    fontWeight: 'bold',
    marginRight: 5,
    color: '#333',
  },
  commentText: {
    fontSize: 14,
    color: '#555',
  },
  commentModalContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#F5F5F5',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backIcon: {
    fontSize: 24,
    marginRight: 10,
    color: '#333',
  },
  commentHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  commentListContainer: {
    flex: 1,
    marginBottom: 20,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  commentInput: {
    height: 80,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  commentButton: {
    backgroundColor: '#485E6E',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  commentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
});

export default PostDetail;

import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';


export default function Tab2({ navigation }) {
return (
    <View style={styles.container}> 
        <ScrollView style={styles.scrollcontainer}>
            <Text style={styles.example}>Nice</Text>
        </ScrollView>
 
        <View style={styles.rectangle}>
            <TouchableOpacity onPress={() => navigation.navigate('MainTab')}>
                <AntDesign name="tagso" size={40} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Tab2')}>
                <MaterialIcons name="post-add" size={40} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Tab3')}>
            <AntDesign name="home" size={40} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Tab4')}>
                <Feather name="bell" size={40} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Tab5')}>
                <Feather name="user" size={40} color="black" />
            </TouchableOpacity>
        </View>
    </View>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollcontainer: {
        backgroundColor: 'white',
        height: 900,
    },
    rectangle: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#485E6E',
        height: 70,
        paddingHorizontal: 20,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    
});
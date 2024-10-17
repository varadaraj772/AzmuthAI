import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import OpenAI from 'openai';
import { Button, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

const App = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Hello! How can I assist you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (input.trim() === '') {
      return;
    }

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const completion = await openai.chat.completions.create({
        model: 'nvidia/llama-3.1-nemotron-70b-instruct',
        messages: newMessages,
        temperature: 0.9,
        max_tokens: 1024,
        stream: false,
      });

      const reply =
        completion.choices[0]?.message?.content?.replace(/\*/g, '') ||
        'No response from model.';
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: reply },
      ]);
      saveConversation(newMessages.concat({ role: 'assistant', content: reply }));
    } catch (error) {
      Alert.alert('Sorry!', 'There seems to be an error. Please restart the app and try again.');
      console.error('Error fetching response:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConversation = async (conversation) => {
    try {
      const savedConversations = await AsyncStorage.getItem('conversations');
      const updatedConversations = savedConversations
        ? JSON.parse(savedConversations)
        : [];
      updatedConversations.push(conversation);
      await AsyncStorage.setItem('conversations', JSON.stringify(updatedConversations));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const clear = () => {
    setMessages([{ role: 'assistant', content: '👋 Hello! How can I assist you today?' }]);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: 20,
        paddingHorizontal: 0.3,
        backgroundColor: '#f6fcf2',
      }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, marginBottom: 10 }}
        contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.map((message, index) => (
          <View
            key={index}
            style={{
              marginBottom: 10,
              padding: 10,
              backgroundColor: message.role === 'user' ? '#d9ffbf' : '#368700',
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              borderTopRightRadius: message.role === 'user' ? 0 : 50,
              borderBottomRightRadius: message.role === 'user' ? 0 : 50,
              borderTopLeftRadius: message.role === 'user' ? 50 : 0,
              borderBottomLeftRadius: message.role === 'user' ? 50 : 0,
              maxWidth: '80%',
            }}>
            <Text
              style={{
                color: message.role === 'user' ? '#000' : '#fff',
                fontSize: 14,
                fontWeight: 'bold',
                fontFamily: 'notoserif',
              }}>
              {message.content}
            </Text>
          </View>
        ))}
        {loading && <ActivityIndicator size="large" color="#368700" />}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        <Button
          onPress={clear}
          disabled={loading}
          mode="elevated"
          textColor="#fff"
          buttonColor="#990000">
          CLEAR
        </Button>
        <TextInput
          mode="outlined"
          style={{
            marginHorizontal: 10,
            backgroundColor: 'transparent',
            height: 40,
            width: '50%',
          }}
          outlineColor="#368700"
          activeOutlineColor="#368700"
          outlineStyle={{ borderRadius: 50 }}
          label="   Ask me anything..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
        />
        <Button
          onPress={sendMessage}
          disabled={loading}
          mode="elevated"
          textColor="#fff"
          buttonColor="#368700">
          SEND
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default App;

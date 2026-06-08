import React, { useState } from 'react';
import { View, Text, Image, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import { mockChatSessions, mockChatMessages, currentUser } from '@/data/mockData';
import type { ChatSession, ChatMessage } from '@/types';
import dayjs from 'dayjs';

type TabType = 'activity' | 'private';

const ChatPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('activity');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);

  const filteredSessions = mockChatSessions.filter(s => s.type === activeTab);

  const handleSessionClick = (session: ChatSession) => {
    console.log('[Chat] 打开会话:', session.id);
    setSelectedSession(session);
    Taro.setNavigationBarTitle({ title: session.title });
  };

  const handleBack = () => {
    setSelectedSession(null);
    Taro.setNavigationBarTitle({ title: '消息' });
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: `m_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.nickname,
      senderAvatar: currentUser.avatar,
      type: 'text',
      content: inputText,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    console.log('[Chat] 发送消息:', inputText);
  };

  const handleVote = (optionIndex: number) => {
    console.log('[Chat] 投票选项:', optionIndex);
    Taro.showToast({ title: '投票成功', icon: 'success' });
  };

  const handleLocationShare = () => {
    console.log('[Chat] 发送位置');
    Taro.chooseLocation({
      success: (res) => {
        const newMessage: ChatMessage = {
          id: `m_${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.nickname,
          senderAvatar: currentUser.avatar,
          type: 'location',
          content: res.name || '我的位置',
          timestamp: new Date().toISOString(),
          location: {
            latitude: res.latitude,
            longitude: res.longitude,
            address: res.address || '',
          },
        };
        setMessages(prev => [...prev, newMessage]);
      },
      fail: (err) => {
        console.error('[Chat] 选择位置失败:', err);
      },
    });
  };

  const handlePoll = () => {
    console.log('[Chat] 发起投票');
    Taro.showToast({ title: '投票功能开发中', icon: 'none' });
  };

  const formatTime = (time: string) => {
    return dayjs(time).format('HH:mm');
  };

  const formatDate = (time: string) => {
    const now = dayjs();
    const msgTime = dayjs(time);
    if (now.isSame(msgTime, 'day')) {
      return '今天 ' + formatTime(time);
    } else if (now.diff(msgTime, 'day') === 1) {
      return '昨天 ' + formatTime(time);
    } else {
      return msgTime.format('MM-DD HH:mm');
    }
  };

  if (selectedSession) {
    return (
      <View className={styles.chatDetailContainer}>
        <View className={styles.chatHeader}>
          <Text className={styles.backBtn} onClick={handleBack}>←</Text>
          <Text className={styles.chatTitle}>{selectedSession.title}</Text>
          <Text className={styles.chatMore}>⋯</Text>
        </View>

        <ScrollView className={styles.chatMessages} scrollY scrollWithAnimation scrollIntoView="msg_bottom">
          {messages.map((msg, index) => {
            const isSelf = msg.senderId === currentUser.id;
            const isSystem = msg.type === 'system';
            const showTime = index === 0 || dayjs(msg.timestamp).diff(dayjs(messages[index - 1].timestamp), 'minute') > 5;

            if (isSystem) {
              return (
                <View key={msg.id}>
                  {showTime && <View className={styles.messageTime}>{formatDate(msg.timestamp)}</View>}
                  <View className={styles.messageSystem}>
                    <Text className={styles.systemText}>{msg.content}</Text>
                  </View>
                  {msg.voteOptions && (
                    <View className={styles.voteCard}>
                      <Text className={styles.voteTitle}>{msg.content}</Text>
                      {msg.voteOptions.map((option, idx) => (
                        <View
                          key={idx}
                          className={styles.voteOption}
                          onClick={() => handleVote(idx)}
                        >
                          <Text className={styles.voteOptionText}>{option}</Text>
                          <Text className={styles.voteOptionCount}>
                            {msg.voteResults?.[idx] || 0}票
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            }

            return (
              <View key={msg.id}>
                {showTime && <View className={styles.messageTime}>{formatDate(msg.timestamp)}</View>}
                <View className={classNames(styles.messageItem, isSelf && styles.messageSelf)}>
                  <Image
                    className={styles.messageAvatar}
                    src={isSelf ? currentUser.avatar : msg.senderAvatar}
                    mode="aspectFill"
                  />
                  <View className={classNames(styles.messageBubble, isSelf && styles.messageSelfBubble)}>
                    {msg.type === 'text' && (
                      <Text className={styles.messageText}>{msg.content}</Text>
                    )}
                    {msg.type === 'location' && msg.location && (
                      <View className={styles.locationCard}>
                        <View className={styles.locationIcon}>
                          <Text>📍</Text>
                        </View>
                        <View className={styles.locationInfo}>
                          <Text className={styles.locationName}>{msg.content}</Text>
                          <Text className={styles.locationAddr}>{msg.location.address}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
          <View id="msg_bottom" />
        </ScrollView>

        <View className={styles.chatInputBar}>
          <Text className={styles.inputTool} onClick={handleLocationShare}>📍</Text>
          <Text className={styles.inputTool} onClick={handlePoll}>📊</Text>
          <View className={styles.inputBox}>
            <Input
              className={styles.chatInput}
              placeholder="输入消息..."
              value={inputText}
              onInput={(e) => setInputText(e.detail.value)}
              onConfirm={handleSendMessage}
              confirmType="send"
            />
          </View>
          <button
            className={styles.sendBtn}
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
          >
            发送
          </button>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.tabTabs}>
        <View
          className={classNames(styles.tabItem, activeTab === 'activity' && styles.tabItemActive)}
          onClick={() => setActiveTab('activity')}
        >
          <Text>活动群聊</Text>
          {activeTab === 'activity' && <View className={styles.tabIndicator} />}
        </View>
        <View
          className={classNames(styles.tabItem, activeTab === 'private' && styles.tabItemActive)}
          onClick={() => setActiveTab('private')}
        >
          <Text>私聊</Text>
          {activeTab === 'private' && <View className={styles.tabIndicator} />}
        </View>
      </View>

      <View className={styles.noticeSection}>
        <View className={styles.noticeItem} onClick={() => Taro.showToast({ title: '系统通知', icon: 'none' })}>
          <View className={styles.noticeIcon}>
            <Text>🔔</Text>
          </View>
          <View className={styles.noticeInfo}>
            <Text className={styles.noticeTitle}>系统通知</Text>
            <Text className={styles.noticeDesc}>您报名的活动明天开始啦</Text>
          </View>
          <View className={styles.noticeBadge}>3</View>
        </View>
        <View className={styles.noticeItem} onClick={() => Taro.showToast({ title: '报名通知', icon: 'none' })}>
          <View className={styles.noticeIcon}>
            <Text>📋</Text>
          </View>
          <View className={styles.noticeInfo}>
            <Text className={styles.noticeTitle}>报名通知</Text>
            <Text className={styles.noticeDesc}>恭喜您，报名成功！</Text>
          </View>
        </View>
      </View>

      {filteredSessions.length > 0 ? (
        <ScrollView className={styles.sessionList} scrollY>
          {filteredSessions.map(session => (
            <View
              key={session.id}
              className={styles.sessionItem}
              onClick={() => handleSessionClick(session)}
            >
              <View className={styles.sessionAvatarWrap}>
                {session.type === 'activity' ? (
                  <View className={styles.groupAvatar}>
                    <Text>👥</Text>
                  </View>
                ) : (
                  <Image
                    className={styles.sessionAvatar}
                    src={session.avatar}
                    mode="aspectFill"
                  />
                )}
                {session.unreadCount > 0 && (
                  <View className={styles.unreadBadge}>
                    {session.unreadCount > 99 ? '99+' : session.unreadCount}
                  </View>
                )}
              </View>
              <View className={styles.sessionContent}>
                <View className={styles.sessionTop}>
                  <Text className={styles.sessionTitle}>{session.title}</Text>
                  <Text className={styles.sessionTime}>
                    {formatTime(session.lastMessageTime)}
                  </Text>
                </View>
                <View className={styles.sessionBottom}>
                  <Text className={styles.sessionLastMsg}>{session.lastMessage}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>💬</Text>
          <Text className={styles.emptyText}>
            暂无{activeTab === 'activity' ? '活动群聊' : '私聊消息'}
          </Text>
          <button
            className={styles.emptyBtn}
            onClick={() => Taro.switchTab({ url: '/pages/recommend/index' })}
          >
            去发现活动
          </button>
        </View>
      )}
    </View>
  );
};

export default ChatPage;

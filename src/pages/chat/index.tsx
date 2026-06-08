import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import { mockChatSessions } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import type { ChatSession, ChatMessage, VoteData } from '@/types';
import dayjs from 'dayjs';

type TabType = 'activity' | 'private';

const ChatPage: React.FC = () => {
  const currentUser = useAppStore(state => state.currentUser);
  const chatMessages = useAppStore(state => state.chatMessages);
  const activities = useAppStore(state => state.activities);
  const addChatMessage = useAppStore(state => state.addChatMessage);
  const vote = useAppStore(state => state.vote);
  const adoptVoteTime = useAppStore(state => state.adoptVoteTime);

  const [activeTab, setActiveTab] = useState<TabType>('activity');
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollTitle, setPollTitle] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [newOptionText, setNewOptionText] = useState('');

  const messages = useMemo(() => {
    if (!selectedSession) return [];
    return chatMessages[selectedSession.id] || [];
  }, [selectedSession, chatMessages]);

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
    if (!inputText.trim() || !selectedSession) return;

    const newMessage: ChatMessage = {
      id: `m_${Date.now()}`,
      sessionId: selectedSession.id,
      senderId: currentUser.id,
      senderName: currentUser.nickname,
      senderAvatar: currentUser.avatar,
      type: 'text',
      content: inputText,
      timestamp: new Date().toISOString(),
    };

    addChatMessage(selectedSession.id, newMessage);
    setInputText('');
  };

  const handleVote = (messageId: string, optionIndex: number) => {
    if (!selectedSession) return;
    vote(selectedSession.id, messageId, optionIndex, currentUser.id);
    Taro.vibrateShort({ type: 'light' });
  };

  const isOrganizer = () => {
    if (!selectedSession?.activityId) return false;
    const activity = activities.find(a => a.id === selectedSession.activityId);
    return activity?.organizer.id === currentUser.id;
  };

  const handleAdoptVote = (messageId: string, optionIndex: number, optionText: string) => {
    if (!selectedSession?.activityId) return;

    Taro.showModal({
      title: '采用投票结果',
      content: `确定采用「${optionText}」作为新的活动时间吗？`,
      success: (res) => {
        if (res.confirm) {
          const timeMatch = optionText.match(/(\d{1,2}):(\d{2})|(\d{1,2})点|上午(\d+)|下午(\d+)/);
          let newTime = '09:00';
          if (timeMatch) {
            if (timeMatch[1] && timeMatch[2]) {
              newTime = `${timeMatch[1]}:${timeMatch[2]}`;
            } else if (timeMatch[3]) {
              newTime = `${timeMatch[3].padStart(2, '0')}:00`;
            } else if (timeMatch[4]) {
              newTime = `${timeMatch[4].padStart(2, '0')}:00`;
            } else if (timeMatch[5]) {
              newTime = `${Number(timeMatch[5]) + 12}:00`;
            }
          }

          adoptVoteTime(
            selectedSession.activityId!,
            selectedSession.id,
            messageId,
            optionIndex,
            newTime
          );

          Taro.showToast({ title: '已采用', icon: 'success' });
        }
      },
    });
  };

  const handleLocationShare = () => {
    if (!selectedSession) return;
    console.log('[Chat] 发送位置');
    Taro.chooseLocation({
      success: (res) => {
        const newMessage: ChatMessage = {
          id: `m_${Date.now()}`,
          sessionId: selectedSession.id,
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
        addChatMessage(selectedSession.id, newMessage);
      },
      fail: (err) => {
        console.error('[Chat] 选择位置失败:', err);
      },
    });
  };

  const handlePoll = () => {
    setShowPollModal(true);
    setPollTitle('活动改期投票');
    setPollOptions(['周六下午3点', '周日上午9点']);
    setNewOptionText('');
  };

  const handleAddOption = () => {
    const trimmed = newOptionText.trim();
    if (!trimmed) return;
    if (pollOptions.length >= 6) {
      Taro.showToast({ title: '最多6个选项', icon: 'none' });
      return;
    }
    setPollOptions([...pollOptions, trimmed]);
    setNewOptionText('');
  };

  const handleRemoveOption = (index: number) => {
    if (pollOptions.length <= 2) {
      Taro.showToast({ title: '至少2个选项', icon: 'none' });
      return;
    }
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleSendPoll = () => {
    if (!selectedSession) return;
    const trimmedTitle = pollTitle.trim();
    const validOptions = pollOptions.filter(o => o.trim());
    if (!trimmedTitle) {
      Taro.showToast({ title: '请输入投票主题', icon: 'none' });
      return;
    }
    if (validOptions.length < 2) {
      Taro.showToast({ title: '至少2个选项', icon: 'none' });
      return;
    }

    const voteData: VoteData = {
      title: trimmedTitle,
      options: validOptions,
      results: validOptions.map(() => 0),
      userVotes: {},
      creatorId: currentUser.id,
      creatorName: currentUser.nickname,
    };

    const newMessage: ChatMessage = {
      id: `m_${Date.now()}`,
      sessionId: selectedSession.id,
      senderId: currentUser.id,
      senderName: currentUser.nickname,
      senderAvatar: currentUser.avatar,
      type: 'vote',
      content: trimmedTitle,
      timestamp: new Date().toISOString(),
      voteData,
    };

    addChatMessage(selectedSession.id, newMessage);
    setShowPollModal(false);
    setPollTitle('');
    setPollOptions(['', '']);
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

  const getTotalVotes = (voteData?: VoteData) => {
    if (!voteData?.results) return 0;
    return voteData.results.reduce((sum, n) => sum + n, 0);
  };

  const getUserVoteIndex = (voteData?: VoteData) => {
    if (!voteData?.userVotes) return -1;
    return voteData.userVotes[currentUser.id] ?? -1;
  };

  if (selectedSession) {
    return (
      <View className={styles.chatDetailContainer}>
        <View className={styles.chatHeader}>
          <Text className={styles.backBtn} onClick={handleBack}>←</Text>
          <Text className={styles.chatTitle}>{selectedSession.title}</Text>
          <Text className={styles.chatMore}>⋯</Text>
        </View>

        <ScrollView
          className={styles.chatMessages}
          scrollY
          scrollWithAnimation
          scrollIntoView="msg_bottom"
        >
          {messages.map((msg, index) => {
            const isSelf = msg.senderId === currentUser.id;
            const isVote = msg.type === 'vote';
            const showTime =
              index === 0 ||
              dayjs(msg.timestamp).diff(dayjs(messages[index - 1].timestamp), 'minute') > 5;

            const voteData = msg.voteData;
            const totalVotes = getTotalVotes(voteData);
            const userVotedIndex = getUserVoteIndex(voteData);

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
                    {!isVote && (
                      <View>
                        <Text className={styles.senderName}>{msg.senderName}</Text>
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
                    )}

                    {isVote && voteData && (
                      <View className={styles.voteCard}>
                        <View className={styles.voteCardHeader}>
                          <Text className={styles.voteTitleIcon}>📊</Text>
                          <View style={{ flex: 1 }}>
                            <Text className={styles.voteTitle}>{voteData.title}</Text>
                            <Text className={styles.voteSubtitle}>
                              {voteData.creatorName} 发起 · 共 {totalVotes} 票
                            </Text>
                          </View>
                        </View>

                        <View className={styles.voteOptions}>
                          {voteData.options.map((option, idx) => {
                            const count = voteData.results?.[idx] || 0;
                            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                            const isVoted = userVotedIndex === idx;

                            return (
                              <View
                                key={idx}
                                className={classNames(
                                  styles.voteOption,
                                  isVoted && styles.voteOptionVoted
                                )}
                                onClick={() => handleVote(msg.id, idx)}
                              >
                                <View className={styles.voteOptionProgress}>
                                  <View
                                    className={styles.voteOptionBar}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </View>
                                <View className={styles.voteOptionContent}>
                                  <Text
                                    className={classNames(
                                      styles.voteOptionText,
                                      isVoted && styles.voteOptionTextVoted
                                    )}
                                  >
                                    {isVoted && '✓ '}{option}
                                  </Text>
                                  <Text className={styles.voteOptionCount}>
                                    {count}票
                                  </Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>

                        <Text className={styles.voteTip}>
                          {userVotedIndex >= 0 ? '你已投票，可更改选择' : '点击选项参与投票'}
                        </Text>

                        {isOrganizer() && (
                          <View className={styles.voteAdoptSection}>
                            <Text className={styles.voteAdoptTip}>群主可采用投票结果更新活动时间</Text>
                            <View className={styles.voteAdoptBtns}>
                              {voteData.options.map((option, idx) => (
                                <View
                                  key={idx}
                                  className={styles.voteAdoptBtn}
                                  onClick={() => handleAdoptVote(msg.id, idx, option)}
                                >
                                  <Text className={styles.voteAdoptBtnText}>采用「{option}」</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
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

        {showPollModal && (
          <View className={styles.modalOverlay} onClick={() => setShowPollModal(false)}>
            <View className={styles.pollModal} onClick={(e) => e.stopPropagation && e.stopPropagation()}>
              <View className={styles.pollModalHeader}>
                <Text className={styles.pollModalTitle}>发起投票</Text>
                <Text className={styles.pollModalClose} onClick={() => setShowPollModal(false)}>
                  ✕
                </Text>
              </View>

              <ScrollView className={styles.pollModalContent} scrollY>
                <View className={styles.pollFormItem}>
                  <Text className={styles.pollFormLabel}>投票主题</Text>
                  <Input
                    className={styles.pollFormInput}
                    placeholder="请输入投票主题，如：活动改期投票"
                    value={pollTitle}
                    onInput={(e) => setPollTitle(e.detail.value)}
                    maxlength={30}
                  />
                </View>

                <View className={styles.pollFormItem}>
                  <View className={styles.pollFormLabelRow}>
                    <Text className={styles.pollFormLabel}>时间选项</Text>
                    <Text className={styles.pollFormHint}>{pollOptions.length}/6</Text>
                  </View>

                  {pollOptions.map((option, idx) => (
                    <View key={idx} className={styles.pollOptionRow}>
                      <Text className={styles.pollOptionIndex}>{idx + 1}</Text>
                      <Input
                        className={styles.pollOptionInput}
                        placeholder={`请输入第${idx + 1}个选项`}
                        value={option}
                        onInput={(e) => handleUpdateOption(idx, e.detail.value)}
                        maxlength={20}
                      />
                      <Text
                        className={classNames(
                          styles.pollOptionRemove,
                          pollOptions.length <= 2 && styles.pollOptionRemoveDisabled
                        )}
                        onClick={() => handleRemoveOption(idx)}
                      >
                        ✕
                      </Text>
                    </View>
                  ))}

                  {pollOptions.length < 6 && (
                    <View className={styles.pollAddRow}>
                      <View className={styles.pollAddInputWrap}>
                        <Text className={styles.pollOptionIndex}>+</Text>
                        <Input
                          className={styles.pollAddInput}
                          placeholder="添加新选项"
                          value={newOptionText}
                          onInput={(e) => setNewOptionText(e.detail.value)}
                          onConfirm={handleAddOption}
                          maxlength={20}
                        />
                      </View>
                      <button className={styles.pollAddBtn} onClick={handleAddOption}>
                        添加
                      </button>
                    </View>
                  )}
                </View>
              </ScrollView>

              <View className={styles.pollModalFooter}>
                <button
                  className={styles.pollCancelBtn}
                  onClick={() => setShowPollModal(false)}
                >
                  取消
                </button>
                <button className={styles.pollSendBtn} onClick={handleSendPoll}>
                  发送投票
                </button>
              </View>
            </View>
          </View>
        )}
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

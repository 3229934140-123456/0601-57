import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import { currentUser, mockVenues, sportTypeConfigs } from '@/data/mockData';

const ProfilePage: React.FC = () => {
  const [messageNotify, setMessageNotify] = useState(true);
  const [activityRemind, setActivityRemind] = useState(true);
  const [privateChat, setPrivateChat] = useState(false);

  const handleEditProfile = () => {
    console.log('[Profile] 编辑个人资料');
    Taro.showToast({ title: '编辑功能开发中', icon: 'none' });
  };

  const handleCreditClick = () => {
    console.log('[Profile] 查看信用页');
    Taro.navigateTo({ url: '/pages/credit/index' });
  };

  const handleMyActivities = (type: string) => {
    console.log('[Profile] 我的活动:', type);
    if (type === 'joined') {
      Taro.navigateTo({ url: '/pages/signup/index' });
    } else {
      Taro.showToast({ title: '我的发布', icon: 'none' });
    }
  };

  const handleEquipment = () => {
    console.log('[Profile] 装备偏好');
    Taro.showToast({ title: '装备偏好设置', icon: 'none' });
  };

  const handleVenues = () => {
    console.log('[Profile] 常去场馆');
    Taro.showToast({ title: '常去场馆', icon: 'none' });
  };

  const handlePrivacy = () => {
    console.log('[Profile] 隐私设置');
    Taro.showToast({ title: '隐私设置', icon: 'none' });
  };

  const toggleMessageNotify = () => {
    setMessageNotify(!messageNotify);
    console.log('[Profile] 消息通知:', !messageNotify);
  };

  const toggleActivityRemind = () => {
    setActivityRemind(!activityRemind);
    console.log('[Profile] 活动提醒:', !activityRemind);
  };

  const togglePrivateChat = () => {
    setPrivateChat(!privateChat);
    console.log('[Profile] 接受私聊:', !privateChat);
  };

  const equipmentItems = [
    { icon: '👟', text: '跑鞋' },
    { icon: '🎽', text: '运动服' },
    { icon: '🧢', text: '运动手环' },
    { icon: '🥤', text: '水杯' },
    { icon: '🧴', text: '防晒霜' },
    { icon: '📱', text: '手机臂包' },
  ];

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image
            className={styles.avatar}
            src={currentUser.avatar}
            mode="aspectFill"
          />
          <View className={styles.userDetails}>
            <Text className={styles.userName}>{currentUser.nickname}</Text>
            <Text className={styles.userSignature}>
              {currentUser.signature || '这个人很懒，什么都没写'}
            </Text>
          </View>
          <View className={styles.editBtn} onClick={handleEditProfile}>
            编辑
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>28</Text>
            <Text className={styles.statLabel}>参与活动</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>12</Text>
            <Text className={styles.statLabel}>发起活动</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>56</Text>
            <Text className={styles.statLabel}>运动搭子</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{currentUser.keepPromiseRate}%</Text>
            <Text className={styles.statLabel}>守约率</Text>
          </View>
        </View>
      </View>

      <View className={styles.creditEntry} onClick={handleCreditClick}>
        <View className={styles.creditLeft}>
          <View className={styles.creditIcon}>
            <Text>⭐</Text>
          </View>
          <View className={styles.creditInfo}>
            <Text className={styles.creditTitle}>我的信用</Text>
            <Text className={styles.creditDesc}>守约率、评价、黑名单</Text>
          </View>
        </View>
        <Text className={styles.creditScore}>{currentUser.creditScore}</Text>
        <Text className={styles.creditArrow}>›</Text>
      </View>

      <Text className={styles.sectionTitle} style={{ paddingTop: 24, paddingLeft: 48 }}>
        我的活动
      </Text>
      <View className={styles.menuSection}>
        <View className={styles.menuItem} onClick={() => handleMyActivities('joined')}>
          <Text className={styles.menuIcon}>📝</Text>
          <Text className={styles.menuText}>我报名的</Text>
          <View className={styles.menuBadge}>3</View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMyActivities('published')}>
          <Text className={styles.menuIcon}>📢</Text>
          <Text className={styles.menuText}>我发布的</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMyActivities('favorites')}>
          <Text className={styles.menuIcon}>❤️</Text>
          <Text className={styles.menuText}>我收藏的</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMyActivities('history')}>
          <Text className={styles.menuIcon}>📅</Text>
          <Text className={styles.menuText}>历史记录</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.equipmentSection}>
        <View className={styles.equipmentHeader}>
          <Text className={styles.equipmentTitle}>装备偏好</Text>
          <Text className={styles.equipmentEdit} onClick={handleEquipment}>
            编辑
          </Text>
        </View>
        <View className={styles.equipmentTags}>
          {equipmentItems.map((item, index) => (
            <View key={index} className={styles.equipmentTag}>
              <Text>{item.icon} {item.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.venuesSection}>
        <View className={styles.venuesHeader}>
          <Text className={styles.venuesTitle}>常去场馆</Text>
          <Text className={styles.venuesMore} onClick={handleVenues}>
            查看全部 ›
          </Text>
        </View>
        {mockVenues.slice(0, 3).map(venue => (
          <View key={venue.id} className={styles.venueItem}>
            <View className={styles.venueIcon}>
              <Text>{sportTypeConfigs.find(s => venue.sportTypes.includes(s.key))?.icon || '🏟️'}</Text>
            </View>
            <View className={styles.venueInfo}>
              <Text className={styles.venueName}>{venue.name}</Text>
              <Text className={styles.venueAddr}>{venue.address}</Text>
            </View>
            <Text className={styles.venueDistance}>{venue.distance}km</Text>
          </View>
        ))}
      </View>

      <Text className={styles.sectionTitle} style={{ paddingTop: 24, paddingLeft: 48 }}>
        设置
      </Text>
      <View className={styles.settingsSection}>
        <View className={styles.settingRow}>
          <View className={styles.settingLeft} onClick={toggleMessageNotify}>
            <Text className={styles.settingIcon}>🔔</Text>
            <Text className={styles.settingText}>消息通知</Text>
          </View>
          <View
            className={classNames(styles.switch, messageNotify && styles.switchActive)}
            onClick={toggleMessageNotify}
          >
            <View className={styles.switchDot} />
          </View>
        </View>
        <View className={styles.settingRow}>
          <View className={styles.settingLeft} onClick={toggleActivityRemind}>
            <Text className={styles.settingIcon}>⏰</Text>
            <Text className={styles.settingText}>活动提醒</Text>
          </View>
          <View
            className={classNames(styles.switch, activityRemind && styles.switchActive)}
            onClick={toggleActivityRemind}
          >
            <View className={styles.switchDot} />
          </View>
        </View>
        <View className={styles.settingRow}>
          <View className={styles.settingLeft} onClick={togglePrivateChat}>
            <Text className={styles.settingIcon}>💬</Text>
            <Text className={styles.settingText}>接受陌生人私聊</Text>
          </View>
          <View
            className={classNames(styles.switch, privateChat && styles.switchActive)}
            onClick={togglePrivateChat}
          >
            <View className={styles.switchDot} />
          </View>
        </View>
        <View className={styles.settingRow} onClick={handlePrivacy}>
          <View className={styles.settingLeft}>
            <Text className={styles.settingIcon}>🔒</Text>
            <Text className={styles.settingText}>隐私设置</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfilePage;

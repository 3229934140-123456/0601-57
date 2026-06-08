import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';
import { sportTypeConfigs, skillLevelConfigs } from '@/data/mockData';
import type { Activity } from '@/types';
import dayjs from 'dayjs';

type TabType = 'joined' | 'published';

const MyActivitiesPage: React.FC = () => {
  const router = useRouter();
  const activities = useAppStore(state => state.activities);
  const currentUser = useAppStore(state => state.currentUser);
  const joinedActivities = useAppStore(state => state.joinedActivities);
  const waitlistActivities = useAppStore(state => state.waitlistActivities);
  const checkedInActivities = useAppStore(state => state.checkedInActivities);
  const paidActivities = useAppStore(state => state.paidActivities);
  const publishedActivities = useAppStore(state => state.publishedActivities);
  const cancelJoin = useAppStore(state => state.cancelJoin);
  const cancelWaitlist = useAppStore(state => state.cancelWaitlist);
  const checkIn = useAppStore(state => state.checkIn);
  const payAA = useAppStore(state => state.payAA);

  const [activeTab, setActiveTab] = useState<TabType>('joined');

  useEffect(() => {
    const tab = router.params.tab as TabType;
    if (tab === 'joined' || tab === 'published') {
      setActiveTab(tab);
    }
  }, [router.params.tab]);

  const joinedList = useMemo(() => {
    return activities.filter(a => joinedActivities.includes(a.id));
  }, [activities, joinedActivities]);

  const waitlistList = useMemo(() => {
    return activities.filter(a => waitlistActivities.includes(a.id));
  }, [activities, waitlistActivities]);

  const publishedList = useMemo(() => {
    return activities.filter(a => publishedActivities.includes(a.id));
  }, [activities, publishedActivities]);

  const upcomingJoined = useMemo(() => {
    return joinedList.filter(a => dayjs(a.startTime).isAfter(dayjs()));
  }, [joinedList]);

  const endedJoined = useMemo(() => {
    return joinedList.filter(a => dayjs(a.endTime).isBefore(dayjs()));
  }, [joinedList]);

  const recruitingPublished = useMemo(() => {
    return publishedList.filter(a => a.status === 'recruiting' || a.status === 'full');
  }, [publishedList]);

  const ongoingPublished = useMemo(() => {
    return publishedList.filter(a => a.status === 'ongoing');
  }, [publishedList]);

  const endedPublished = useMemo(() => {
    return publishedList.filter(a => a.status === 'completed' || a.status === 'cancelled');
  }, [publishedList]);

  const getSportConfig = (sportType: string) => {
    return sportTypeConfigs.find(s => s.key === sportType);
  };

  const getLevelConfig = (level: string) => {
    return skillLevelConfigs.find(l => l.key === level);
  };

  const handleActivityClick = (activityId: string) => {
    Taro.navigateTo({ url: `/pages/signup/index?id=${activityId}` });
  };

  const handleCancelJoin = (e: any, activityId: string) => {
    e.stopPropagation();
    Taro.showModal({
      title: '取消报名',
      content: '确定要取消报名吗？',
      success: (res) => {
        if (res.confirm) {
          cancelJoin(activityId);
          Taro.showToast({ title: '已取消', icon: 'success' });
        }
      },
    });
  };

  const handleCancelWaitlist = (e: any, activityId: string) => {
    e.stopPropagation();
    Taro.showModal({
      title: '取消候补',
      content: '确定要取消候补吗？',
      success: (res) => {
        if (res.confirm) {
          cancelWaitlist(activityId);
          Taro.showToast({ title: '已取消', icon: 'success' });
        }
      },
    });
  };

  const handleCheckIn = (e: any, activityId: string) => {
    e.stopPropagation();
    Taro.showModal({
      title: '签到确认',
      content: '确认到达活动地点并签到？',
      success: (res) => {
        if (res.confirm) {
          checkIn(activityId, currentUser.id);
          Taro.showToast({ title: '签到成功', icon: 'success' });
        }
      },
    });
  };

  const handleChat = (e: any, activity?: Activity) => {
    e.stopPropagation();
    if (activity?.groupChatId) {
      Taro.navigateTo({ url: `/pages/chat/index?activityId=${activity.id}` });
    } else {
      Taro.switchTab({ url: '/pages/chat/index' });
    }
  };

  const handlePayAA = (e: any, activity: Activity) => {
    e.stopPropagation();
    Taro.showModal({
      title: '确认付款',
      content: `确认支付 AA ￥${activity.fee} 元？`,
      confirmText: '确认付款',
      success: (res) => {
        if (res.confirm) {
          payAA(activity.id, currentUser.id);
          Taro.showToast({ title: '付款成功', icon: 'success' });
        }
      },
    });
  };

  const isOngoing = (activity: Activity) => {
    return dayjs().isAfter(dayjs(activity.startTime).subtract(30, 'minute'));
  };

  const isCheckedIn = (activityId: string) => {
    return checkedInActivities.includes(activityId);
  };

  const getWaitlistRank = (activityId: string) => {
    const idx = waitlistActivities.indexOf(activityId);
    return idx >= 0 ? idx + 1 : 0;
  };

  const renderActivityCard = (activity: Activity, type: 'joined' | 'waitlist' | 'published') => {
    const sportConfig = getSportConfig(activity.sportType);
    const levelConfig = getLevelConfig(activity.skillLevel);
    const isOngoingNow = isOngoing(activity);
    const checked = isCheckedIn(activity.id);
    const isPaid = paidActivities.includes(activity.id);
    const needPay = activity.feeType === 'aa' && activity.fee > 0 && !isPaid;

    return (
      <View
        key={activity.id}
        className={styles.activityCard}
        onClick={() => handleActivityClick(activity.id)}
      >
        <View className={styles.cardHeader}>
          <View
            className={styles.typeTag}
            style={{ backgroundColor: `${sportConfig?.color}15` }}
          >
            <Text>{sportConfig?.icon}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text className={styles.cardTitle}>{activity.title}</Text>
            <View className={styles.cardMeta}>
              <Text className={styles.levelTag}>{levelConfig?.label}</Text>
              {type === 'waitlist' && (
                <View className={styles.waitlistBadge}>
                  候补第{getWaitlistRank(activity.id)}位
                </View>
              )}
              {type === 'joined' && checked && (
                <View className={styles.checkedBadge}>已签到</View>
              )}
              {type === 'joined' && !checked && isOngoingNow && (
                <View className={styles.canCheckInBadge}>可签到</View>
              )}
              {type === 'joined' && needPay && (
                <View className={styles.needPayBadge}>待付款</View>
              )}
              {type === 'joined' && isPaid && activity.feeType === 'aa' && (
                <View className={styles.paidBadge}>已付款</View>
              )}
            </View>
          </View>
        </View>

        <View className={styles.cardBody}>
          <View className={styles.infoRow}>
            <Text className={styles.infoIcon}>📍</Text>
            <Text className={styles.infoText}>{activity.location.name}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoIcon}>🕐</Text>
            <Text className={styles.infoText}>
              {dayjs(activity.startTime).format('MM-DD HH:mm')} - {dayjs(activity.endTime).format('HH:mm')}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoIcon}>👥</Text>
            <Text className={styles.infoText}>
              {activity.currentParticipants}/{activity.maxParticipants}人
              {activity.waitlistCount > 0 && `（候补${activity.waitlistCount}人）`}
            </Text>
          </View>
        </View>

        <View className={styles.cardActions}>
          {type === 'joined' && isOngoingNow && !checked && (
            <View
              className={classNames(styles.actionBtn, styles.primaryActionBtn)}
              onClick={(e) => handleCheckIn(e, activity.id)}
            >
              <Text>签到</Text>
            </View>
          )}
          {type === 'joined' && !isOngoingNow && dayjs(activity.startTime).isAfter(dayjs()) && (
            <View
              className={classNames(styles.actionBtn, styles.dangerActionBtn)}
              onClick={(e) => handleCancelJoin(e, activity.id)}
            >
              <Text>取消报名</Text>
            </View>
          )}
          {type === 'waitlist' && (
            <View
              className={classNames(styles.actionBtn, styles.dangerActionBtn)}
              onClick={(e) => handleCancelWaitlist(e, activity.id)}
            >
              <Text>取消候补</Text>
            </View>
          )}
          {type === 'joined' && needPay && (
            <View
              className={classNames(styles.actionBtn, styles.payActionBtn)}
              onClick={(e) => handlePayAA(e, activity)}
            >
              <Text>付款</Text>
            </View>
          )}
          <View className={styles.actionBtn} onClick={(e) => handleChat(e, activity)}>
            <Text>群聊</Text>
          </View>
          <View
            className={classNames(styles.actionBtn, styles.primaryActionBtn)}
            onClick={() => handleActivityClick(activity.id)}
          >
            <Text>详情</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSection = (title: string, list: Activity[], type: 'joined' | 'waitlist' | 'published') => {
    if (list.length === 0) return null;
    return (
      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>{title}</Text>
          <Text className={styles.sectionCount}>{list.length} 个</Text>
        </View>
        <View className={styles.activityList}>
          {list.map(activity => renderActivityCard(activity, type))}
        </View>
      </View>
    );
  };

  const renderEmpty = (text: string) => (
    <View className={styles.emptyState}>
      <Text className={styles.emptyIcon}>📭</Text>
      <Text className={styles.emptyText}>{text}</Text>
    </View>
  );

  const hasJoinedContent = upcomingJoined.length > 0 || waitlistList.length > 0 || endedJoined.length > 0;
  const hasPublishedContent = recruitingPublished.length > 0 || ongoingPublished.length > 0 || endedPublished.length > 0;

  return (
    <View className={styles.pageContainer}>
      <View className={styles.tabBar}>
        <View
          className={classNames(styles.tabItem, activeTab === 'joined' && styles.tabItemActive)}
          onClick={() => setActiveTab('joined')}
        >
          <Text className={classNames(styles.tabText, activeTab === 'joined' && styles.tabTextActive)}>
            我报名的
          </Text>
        </View>
        <View
          className={classNames(styles.tabItem, activeTab === 'published' && styles.tabItemActive)}
          onClick={() => setActiveTab('published')}
        >
          <Text className={classNames(styles.tabText, activeTab === 'published' && styles.tabTextActive)}>
            我发布的
          </Text>
        </View>
      </View>

      <ScrollView className={styles.scrollContent} scrollY>
        {activeTab === 'joined' && (
          <View>
            {hasJoinedContent ? (
              <>
                {renderSection('即将开始', upcomingJoined, 'joined')}
                {renderSection('候补中', waitlistList, 'waitlist')}
                {renderSection('已结束', endedJoined, 'joined')}
              </>
            ) : (
              renderEmpty('还没有报名任何活动')
            )}
          </View>
        )}

        {activeTab === 'published' && (
          <View>
            {hasPublishedContent ? (
              <>
                {renderSection('报名中', recruitingPublished, 'published')}
                {renderSection('进行中', ongoingPublished, 'published')}
                {renderSection('已结束', endedPublished, 'published')}
              </>
            ) : (
              renderEmpty('还没有发布任何活动')
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default MyActivitiesPage;

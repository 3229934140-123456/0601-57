import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import { currentUser, mockReviews, mockBlacklist } from '@/data/mockData';
import dayjs from 'dayjs';

type TabType = 'reviews' | 'blacklist' | 'info';

const CreditPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('reviews');

  const getCreditLevel = (score: number) => {
    if (score >= 95) return '信用极好';
    if (score >= 85) return '信用优秀';
    if (score >= 70) return '信用良好';
    if (score >= 60) return '信用一般';
    return '信用较差';
  };

  const handleRemoveBlacklist = (id: string) => {
    console.log('[Credit] 移除黑名单:', id);
    Taro.showModal({
      title: '提示',
      content: '确定要将该用户移出黑名单吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已移出黑名单', icon: 'success' });
        }
      },
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text
          key={i}
          className={classNames(styles.star, i <= rating && styles.starActive)}
        >
          ★
        </Text>
      );
    }
    return stars;
  };

  const formatDate = (date: string) => {
    return dayjs(date).format('YYYY-MM-DD');
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.creditScore}>{currentUser.creditScore}</Text>
        <Text className={styles.creditLabel}>信用分</Text>
        <View className={styles.creditLevel}>
          {getCreditLevel(currentUser.creditScore)}
        </View>
      </View>

      <View className={styles.statsGrid}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{currentUser.keepPromiseRate}%</Text>
          <Text className={styles.statLabel}>守约率</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{mockReviews.length}</Text>
          <Text className={styles.statLabel}>收到评价</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>28</Text>
          <Text className={styles.statLabel}>参与活动</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{mockBlacklist.length}</Text>
          <Text className={styles.statLabel}>黑名单</Text>
        </View>
      </View>

      <View className={styles.tabTabs}>
        <View
          className={classNames(styles.tabItem, activeTab === 'reviews' && styles.tabItemActive)}
          onClick={() => setActiveTab('reviews')}
        >
          <Text>我的评价</Text>
          {activeTab === 'reviews' && <View className={styles.tabIndicator} />}
        </View>
        <View
          className={classNames(styles.tabItem, activeTab === 'blacklist' && styles.tabItemActive)}
          onClick={() => setActiveTab('blacklist')}
        >
          <Text>黑名单</Text>
          {activeTab === 'blacklist' && <View className={styles.tabIndicator} />}
        </View>
        <View
          className={classNames(styles.tabItem, activeTab === 'info' && styles.tabItemActive)}
          onClick={() => setActiveTab('info')}
        >
          <Text>信用说明</Text>
          {activeTab === 'info' && <View className={styles.tabIndicator} />}
        </View>
      </View>

      {activeTab === 'reviews' && (
        <ScrollView className={styles.reviewList} scrollY style={{ height: 'calc(100vh - 400rpx)' }}>
          {mockReviews.length > 0 ? (
            mockReviews.map(review => (
              <View key={review.id} className={styles.reviewItem}>
                <View className={styles.reviewHeader}>
                  <Image
                    className={styles.reviewerAvatar}
                    src={review.userAvatar}
                    mode="aspectFill"
                  />
                  <View className={styles.reviewerInfo}>
                    <Text className={styles.reviewerName}>{review.userName}</Text>
                    <Text className={styles.reviewActivity}>{review.activityTitle}</Text>
                  </View>
                  <View className={styles.reviewRating}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                <Text className={styles.reviewContent}>{review.content}</Text>
                <Text className={styles.reviewTime}>{formatDate(review.createdAt)}</Text>
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📝</Text>
              <Text className={styles.emptyText}>暂无评价</Text>
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'blacklist' && (
        <ScrollView className={styles.blacklistSection} scrollY style={{ height: 'calc(100vh - 400rpx)' }}>
          {mockBlacklist.length > 0 ? (
            mockBlacklist.map(item => (
              <View key={item.id} className={styles.blacklistItem}>
                <Image
                  className={styles.blacklistAvatar}
                  src={item.user.avatar}
                  mode="aspectFill"
                />
                <View className={styles.blacklistInfo}>
                  <Text className={styles.blacklistName}>{item.user.nickname}</Text>
                  <Text className={styles.blacklistReason}>拉黑原因：{item.reason}</Text>
                </View>
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemoveBlacklist(item.id)}
                >
                  移除
                </button>
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🚫</Text>
              <Text className={styles.emptyText}>黑名单为空</Text>
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'info' && (
        <ScrollView scrollY style={{ height: 'calc(100vh - 400rpx)' }}>
          <View className={styles.creditInfo}>
            <Text className={styles.creditInfoTitle}>信用分计算规则</Text>
            <View className={styles.creditInfoItem}>
              <Text className={styles.creditInfoIcon}>✓</Text>
              <Text className={styles.creditInfoText}>
                每次按时参加活动 +5 分
              </Text>
            </View>
            <View className={styles.creditInfoItem}>
              <Text className={styles.creditInfoIcon}>✓</Text>
              <Text className={styles.creditInfoText}>
                活动结束后收到好评 +2 分
              </Text>
            </View>
            <View className={styles.creditInfoItem}>
              <Text className={styles.creditInfoIcon}>✗</Text>
              <Text className={styles.creditInfoText}>
                活动开始前24小时内取消 -5 分
              </Text>
            </View>
            <View className={styles.creditInfoItem}>
              <Text className={styles.creditInfoIcon}>✗</Text>
              <Text className={styles.creditInfoText}>
                活动缺席（放鸽子）-10 分
              </Text>
            </View>
            <View className={styles.creditInfoItem}>
              <Text className={styles.creditInfoIcon}>✗</Text>
              <Text className={styles.creditInfoText}>
                收到差评 -3 分
              </Text>
            </View>
          </View>

          <View className={styles.creditInfo}>
            <Text className={styles.creditInfoTitle}>信用等级说明</Text>
            <View className={styles.creditInfoItem}>
              <Text className={styles.creditInfoIcon}>🏆</Text>
              <Text className={styles.creditInfoText}>
                95分以上：信用极好，享受优先报名权
              </Text>
            </View>
            <View className={styles.creditInfoItem}>
              <Text className={styles.creditInfoIcon}>🥇</Text>
              <Text className={styles.creditInfoText}>
                85-94分：信用优秀，可发布热门活动
              </Text>
            </View>
            <View className={styles.creditInfoItem}>
              <Text className={styles.creditInfoIcon}>🥈</Text>
              <Text className={styles.creditInfoText}>
                70-84分：信用良好，正常使用
              </Text>
            </View>
            <View className={styles.creditInfoItem}>
              <Text className={styles.creditInfoIcon}>🥉</Text>
              <Text className={styles.creditInfoText}>
                60-69分：信用一般，部分功能受限
              </Text>
            </View>
            <View className={styles.creditInfoItem}>
              <Text className={styles.creditInfoIcon}>⚠️</Text>
              <Text className={styles.creditInfoText}>
                60分以下：信用较差，无法发布活动
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default CreditPage;

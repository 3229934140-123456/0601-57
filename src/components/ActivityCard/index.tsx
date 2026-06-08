import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import type { Activity } from '@/types';
import { sportTypeConfigs, skillLevelConfigs } from '@/data/mockData';
import dayjs from 'dayjs';

interface ActivityCardProps {
  activity: Activity;
  onClick?: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
  const sportConfig = sportTypeConfigs.find(s => s.key === activity.sportType);
  const levelConfig = skillLevelConfigs.find(l => l.key === activity.skillLevel);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/signup/index?id=${activity.id}`,
      });
    }
  };

  const getStatusClass = () => {
    switch (activity.status) {
      case 'recruiting':
        return styles.statusRecruiting;
      case 'full':
        return styles.statusFull;
      case 'ongoing':
        return styles.statusOngoing;
      default:
        return styles.statusRecruiting;
    }
  };

  const getStatusText = () => {
    switch (activity.status) {
      case 'recruiting':
        return '报名中';
      case 'full':
        return '已满员';
      case 'ongoing':
        return '进行中';
      case 'completed':
        return '已结束';
      case 'cancelled':
        return '已取消';
      default:
        return '报名中';
    }
  };

  const formatTime = (time: string) => {
    return dayjs(time).format('MM-DD HH:mm');
  };

  return (
    <View className={styles.activityCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View
          className={styles.typeTag}
          style={{ backgroundColor: `${sportConfig?.color}15` }}
        >
          <Text>{sportConfig?.icon}</Text>
        </View>
        <View className={styles.cardTitleBox}>
          <Text className={styles.cardTitle}>{activity.title}</Text>
          <View className={styles.cardMeta}>
            <View className={styles.levelTag}>{levelConfig?.label}</View>
            <Text className={styles.distanceTag}>
              {activity.distance ? `${activity.distance}km` : ''}
            </Text>
            <View className={classNames(styles.statusTag, getStatusClass())}>
              {getStatusText()}
            </View>
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
            {formatTime(activity.startTime)} - {formatTime(activity.endTime).split(' ')[1]}
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

      <View className={styles.cardFooter}>
        <View className={styles.organizer}>
          <Image
            className={styles.organizerAvatar}
            src={activity.organizer.avatar}
            mode="aspectFill"
          />
          <Text className={styles.organizerName}>{activity.organizer.nickname}</Text>
        </View>
        {activity.feeType === 'free' ? (
          <Text className={styles.freeText}>免费</Text>
        ) : (
          <View className={styles.feeBox}>
            <Text className={styles.feeAmount}>¥{activity.fee}</Text>
            <Text className={styles.feeUnit}>/人</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ActivityCard;

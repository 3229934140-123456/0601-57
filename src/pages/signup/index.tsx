import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import { mockActivities, mockAARecords, sportTypeConfigs, skillLevelConfigs, currentUser } from '@/data/mockData';
import type { Activity } from '@/types';
import { useRouter } from '@tarojs/taro';

const SignupPage: React.FC = () => {
  const router = useRouter();
  const activityId = router.params.id || 'a1';

  const activity = useMemo<Activity>(() => {
    return mockActivities.find(a => a.id === activityId) || mockActivities[0];
  }, [activityId]);

  const [isJoined, setIsJoined] = useState(false);
  const [isWaitlist, setIsWaitlist] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [showAADetail, setShowAADetail] = useState(false);

  const sportConfig = sportTypeConfigs.find(s => s.key === activity.sportType);
  const levelConfig = skillLevelConfigs.find(l => l.key === activity.skillLevel);
  const aaRecord = mockAARecords.find(r => r.activityId === activity.id);

  const isOrganizer = activity.organizer.id === currentUser.id;
  const canSignup = activity.status === 'recruiting';
  const isFull = activity.status === 'full' || activity.currentParticipants >= activity.maxParticipants;

  const handleJoin = () => {
    if (isFull) {
      Taro.showModal({
        title: '活动已满员',
        content: '是否加入候补名单？有用户取消时会按候补顺序递补。',
        confirmText: '加入候补',
        success: (res) => {
          if (res.confirm) {
            setIsWaitlist(true);
            Taro.showToast({ title: '已加入候补', icon: 'success' });
            console.log('[Signup] 加入候补列表');
          }
        },
      });
      return;
    }

    Taro.showModal({
      title: '确认报名',
      content: `确定要报名「${activity.title}」吗？`,
      success: (res) => {
        if (res.confirm) {
          setIsJoined(true);
          Taro.showToast({ title: '报名成功', icon: 'success' });
          console.log('[Signup] 报名成功:', activity.title);
        }
      },
    });
  };

  const handleCancel = () => {
    Taro.showModal({
      title: '取消报名',
      content: '确定要取消报名吗？活动开始前24小时内取消会影响信用分。',
      confirmText: '确定取消',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          setIsJoined(false);
          setIsWaitlist(false);
          Taro.showToast({ title: '已取消报名', icon: 'success' });
          console.log('[Signup] 取消报名');
        }
      },
    });
  };

  const handleCheckIn = () => {
    Taro.showModal({
      title: '签到确认',
      content: '确认到达活动地点并签到？',
      success: (res) => {
        if (res.confirm) {
          setIsCheckedIn(true);
          Taro.showToast({ title: '签到成功', icon: 'success' });
          console.log('[Signup] 签到成功');
        }
      },
    });
  };

  const handleChat = () => {
    console.log('[Signup] 进入活动群聊');
    Taro.switchTab({ url: '/pages/chat/index' });
  };

  const handleShare = () => {
    console.log('[Signup] 分享活动');
    Taro.showShareMenu({ withShareTicket: true });
  };

  const handleViewMap = () => {
    console.log('[Signup] 查看地图');
    Taro.openLocation({
      latitude: activity.location.latitude,
      longitude: activity.location.longitude,
      name: activity.location.name,
      address: activity.location.address,
    });
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
      default:
        return '报名中';
    }
  };

  const formatDate = (time: string) => {
    const date = new Date(time);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[date.getDay()];
    return `${month}月${day}日 ${weekDay} ${hour}:${minute}`;
  };

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.headerCard}>
        <View className={styles.activityType}>
          <Text className={styles.typeIcon}>{sportConfig?.icon}</Text>
          <Text>{sportConfig?.label}</Text>
        </View>
        <Text className={styles.activityTitle}>{activity.title}</Text>
        <View className={styles.activityTags}>
          <View className={styles.activityTag}>
            <Text>{levelConfig?.label}</Text>
          </View>
          <View className={classNames(styles.statusBadge, getStatusClass())}>
            {getStatusText()}
          </View>
          {activity.distance && (
            <View className={styles.activityTag}>
              <Text>📍 {activity.distance}km</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>活动信息</Text>

        <View className={styles.infoItem} onClick={handleViewMap}>
          <Text className={styles.infoIcon}>📍</Text>
          <View className={styles.infoContent}>
            <Text className={styles.infoLabel}>集合地点</Text>
            <Text className={styles.infoValue}>{activity.location.name}</Text>
            <Text className={styles.infoLabel} style={{ marginTop: 8 }}>
              {activity.location.address}
            </Text>
          </View>
        </View>

        <View className={styles.infoItem}>
          <Text className={styles.infoIcon}>🕐</Text>
          <View className={styles.infoContent}>
            <Text className={styles.infoLabel}>活动时间</Text>
            <Text className={styles.infoValue}>
              {formatDate(activity.startTime)} - {formatDate(activity.endTime).split(' ')[2]}
            </Text>
          </View>
        </View>

        <View className={styles.infoItem}>
          <Text className={styles.infoIcon}>💰</Text>
          <View className={styles.infoContent}>
            <Text className={styles.infoLabel}>费用</Text>
            <Text className={styles.infoValue}>
              {activity.feeType === 'free' ? '免费' : `¥${activity.fee}/人（${activity.feeType === 'aa' ? 'AA制' : '主办方承担'}）`}
            </Text>
          </View>
        </View>

        <View className={styles.infoItem}>
          <Text className={styles.infoIcon}>👤</Text>
          <View className={styles.infoContent}>
            <Text className={styles.infoLabel}>发起者</Text>
            <View style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
              <Image
                src={activity.organizer.avatar}
                style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }}
                mode="aspectFill"
              />
              <View>
                <Text style={{ fontSize: 28, color: '#1D2129', fontWeight: 500 }}>
                  {activity.organizer.nickname}
                </Text>
                <Text style={{ fontSize: 22, color: '#86909C' }}>
                  守约率 {activity.organizer.keepPromiseRate}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {activity.weather && (
          <View className={styles.weatherInfo}>
            <Text className={styles.weatherIcon}>{activity.weather.icon}</Text>
            <Text className={styles.weatherText}>
              {activity.weather.condition} {activity.weather.temperature}°C · 适合运动
            </Text>
          </View>
        )}

        {activity.routeInfo && (
          <View className={styles.routeInfo}>
            <View className={styles.routeItem}>
              <Text className={styles.routeValue}>{activity.routeInfo.distance}km</Text>
              <Text className={styles.routeLabel}>总距离</Text>
            </View>
            <View style={{ width: 1, height: 48, background: '#E5E6EB' }} />
            <View className={styles.routeItem}>
              <Text className={styles.routeValue}>{activity.routeInfo.duration}</Text>
              <Text className={styles.routeLabel}>预计时长</Text>
            </View>
          </View>
        )}
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>活动描述</Text>
        <Text className={styles.description}>{activity.description}</Text>
      </View>

      <View className={styles.participantsSection}>
        <View className={styles.participantsHeader}>
          <Text className={styles.sectionTitle}>参与成员</Text>
          <View className={styles.participantsCount}>
            <strong>{activity.currentParticipants}</strong>/{activity.maxParticipants}人
          </View>
        </View>
        <View className={styles.participantList}>
          {activity.participants?.slice(0, 8).map(user => (
            <View key={user.id} className={styles.participantItem}>
              <Image
                className={styles.participantAvatar}
                src={user.avatar}
                mode="aspectFill"
              />
              <Text className={styles.participantName}>{user.nickname.slice(0, 4)}</Text>
            </View>
          ))}
          {activity.currentParticipants > 8 && (
            <View className={styles.participantItem}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  background: '#F2F3F5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                  fontSize: 24,
                  color: '#86909C',
                }}
              >
                +{activity.currentParticipants - 8}
              </View>
            </View>
          )}
        </View>
      </View>

      {activity.waitlistCount > 0 && (
        <View className={styles.waitlistSection}>
          <View className={styles.waitlistHeader}>
            <Text className={styles.sectionTitle}>候补名单</Text>
            <Text className={styles.waitlistCount}>{activity.waitlistCount}人</Text>
          </View>
          <View className={styles.waitlistItem}>
            <View className={styles.waitlistRank}>1</View>
            <Image
              className={styles.waitlistAvatar}
              src="https://picsum.photos/id/1025/200/200"
              mode="aspectFill"
            />
            <Text className={styles.waitlistName}>等待中的用户...</Text>
          </View>
        </View>
      )}

      {aaRecord && isJoined && (
        <View className={styles.aaSection}>
          <View className={styles.aaHeader}>
            <Text className={styles.sectionTitle}>AA费用</Text>
            <View className={styles.aaTotal}>
              人均 <strong>¥{aaRecord.perPerson}</strong>
            </View>
          </View>
          <View className={styles.aaList}>
            {aaRecord.participants.map(p => (
              <View key={p.userId} className={styles.aaItem}>
                <Image
                  className={styles.aaAvatar}
                  src={p.userAvatar}
                  mode="aspectFill"
                />
                <Text className={styles.aaName}>{p.userName}</Text>
                <View
                  className={classNames(
                    styles.aaStatus,
                    p.hasPaid ? styles.aaPaid : styles.aaUnpaid
                  )}
                >
                  {p.hasPaid ? '已付款' : '待付款'}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.footer}>
        <button className={styles.secondaryBtn} onClick={handleChat}>
          群聊
        </button>
        {isOrganizer ? (
          <button
            className={styles.primaryBtn}
            onClick={() => Taro.showToast({ title: '管理活动', icon: 'none' })}
          >
            管理活动
          </button>
        ) : isJoined ? (
          <>
            {activity.status === 'ongoing' && (
              <button
                className={styles.signInBtn}
                onClick={handleCheckIn}
                disabled={isCheckedIn}
              >
                {isCheckedIn ? '已签到' : '签到'}
              </button>
            )}
            <button
              className={styles.primaryBtn}
              onClick={handleCancel}
              style={{ flex: 1 }}
            >
              取消报名
            </button>
          </>
        ) : isWaitlist ? (
          <button className={styles.primaryBtn} onClick={handleCancel}>
            取消候补
          </button>
        ) : (
          <button
            className={styles.primaryBtn}
            onClick={handleJoin}
            disabled={!canSignup && !isFull}
          >
            {isFull ? '加入候补' : '立即报名'}
          </button>
        )}
      </View>
    </ScrollView>
  );
};

export default SignupPage;

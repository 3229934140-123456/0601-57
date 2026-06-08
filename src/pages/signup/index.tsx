import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import { mockAARecords, sportTypeConfigs, skillLevelConfigs } from '@/data/mockData';
import type { Activity } from '@/types';
import { useRouter } from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import dayjs from 'dayjs';

const SignupPage: React.FC = () => {
  const router = useRouter();
  const activityId = router.params.id || 'a1';

  const activities = useAppStore(state => state.activities);
  const currentUser = useAppStore(state => state.currentUser);
  const joinedActivities = useAppStore(state => state.joinedActivities);
  const waitlistActivities = useAppStore(state => state.waitlistActivities);
  const checkedInActivities = useAppStore(state => state.checkedInActivities);
  const paidActivities = useAppStore(state => state.paidActivities);
  const joinActivity = useAppStore(state => state.joinActivity);
  const cancelJoin = useAppStore(state => state.cancelJoin);
  const joinWaitlist = useAppStore(state => state.joinWaitlist);
  const cancelWaitlist = useAppStore(state => state.cancelWaitlist);
  const checkIn = useAppStore(state => state.checkIn);
  const payAA = useAppStore(state => state.payAA);
  const setTargetActivityChat = useAppStore(state => state.setTargetActivityChat);

  const activity = useMemo<Activity | undefined>(() => {
    return activities.find(a => a.id === activityId);
  }, [activities, activityId]);

  const [showAADetail, setShowAADetail] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const isJoined = joinedActivities.includes(activityId);
  const isWaitlist = waitlistActivities.includes(activityId);
  const isCheckedIn = checkedInActivities.includes(activityId);
  const isPaid = activity ? (activity.paidUserIds || []).includes(currentUser.id) : false;

  const sportConfig = activity ? sportTypeConfigs.find(s => s.key === activity.sportType) : null;
  const levelConfig = activity ? skillLevelConfigs.find(l => l.key === activity.skillLevel) : null;
  const aaRecord = activity ? mockAARecords.find(r => r.activityId === activity.id) : null;

  if (!activity) {
    return (
      <View className={styles.emptyState}>
        <Text>活动不存在</Text>
      </View>
    );
  }

  const isOrganizer = activity.organizer.id === currentUser.id;
  const canSignup = activity.status === 'recruiting';
  const isFull = activity.status === 'full' || activity.currentParticipants >= activity.maxParticipants;
  const isOngoing = activity.status === 'ongoing' || dayjs().isAfter(dayjs(activity.startTime).subtract(30, 'minute'));

  const handleJoin = () => {
    if (isFull) {
      Taro.showModal({
        title: '活动已满员',
        content: '是否加入候补名单？有用户取消时会按候补顺序递补。',
        confirmText: '加入候补',
        success: (res) => {
          if (res.confirm) {
            joinWaitlist(activity.id);
            Taro.showToast({ title: '已加入候补', icon: 'success' });
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
          joinActivity(activity.id);
          Taro.showToast({ title: '报名成功', icon: 'success' });
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
          cancelJoin(activity.id);
          Taro.showToast({ title: '已取消报名', icon: 'success' });
        }
      },
    });
  };

  const handleCancelWaitlist = () => {
    Taro.showModal({
      title: '取消候补',
      content: '确定要取消候补吗？',
      confirmText: '确定取消',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          cancelWaitlist(activity.id);
          Taro.showToast({ title: '已取消候补', icon: 'success' });
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
          checkIn(activity.id, currentUser.id);
          Taro.showToast({ title: '签到成功', icon: 'success' });
          Taro.vibrateShort({ type: 'medium' });
        }
      },
    });
  };

  const handleChat = () => {
    console.log('[Signup] 进入活动群聊');
    if (activity) {
      setTargetActivityChat(activity.id);
      Taro.switchTab({ url: '/pages/chat/index' });
    }
  };

  const handlePayAA = () => {
    Taro.showModal({
      title: '确认付款',
      content: `确认支付 AA ￥${activity?.fee || 0} 元？`,
      confirmText: '确认付款',
      success: (res) => {
        if (res.confirm) {
          payAA(activity!.id, currentUser.id);
          Taro.showToast({ title: '付款成功', icon: 'success' });
        }
      },
    });
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
    const date = dayjs(time);
    const month = date.month() + 1;
    const day = date.date();
    const hour = date.format('HH:mm');
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[date.day()];
    return `${month}月${day}日 ${weekDay} ${hour}`;
  };

  const getWaitlistCount = () => {
    return activity.waitlistUsers?.length || 0;
  };

  const getMyWaitlistRank = () => {
    if (!isWaitlist) return 0;
    const waitlistUsers = activity.waitlistUsers || [];
    const myIndex = waitlistUsers.findIndex(u => u.id === currentUser.id);
    return myIndex >= 0 ? myIndex + 1 : waitlistUsers.length + 1;
  };

  const getCheckInTime = () => {
    if (!activity.checkInTimes || !activity.checkInTimes[currentUser.id]) return null;
    return activity.checkInTimes[currentUser.id];
  };

  const getProgressSteps = () => {
    const steps = [
      { key: 'signup', label: '报名', done: isJoined, active: isJoined },
      { key: 'checkin', label: '签到', done: isCheckedIn, active: isOngoing && isJoined },
    ];
    if (activity.feeType === 'aa' && isJoined) {
      steps.push({ key: 'aa', label: 'AA付款', done: isPaid, active: isOngoing && isJoined });
    }
    return steps;
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
              {formatDate(activity.startTime)} - {dayjs(activity.endTime).format('HH:mm')}
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
            {activity.routeInfo.waypoints && activity.routeInfo.waypoints.length > 0 && (
              <View style={{ width: 1, height: 48, background: '#E5E6EB' }} />
            )}
            {activity.routeInfo.waypoints && activity.routeInfo.waypoints.length > 0 && (
              <View className={styles.routeItem}>
                <Text className={styles.routeValue}>{activity.routeInfo.waypoints.length}</Text>
                <Text className={styles.routeLabel}>途经点</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>活动描述</Text>
        <Text className={styles.description}>{activity.description}</Text>
      </View>

      <View className={styles.progressSection}>
        <Text className={styles.sectionTitle}>约局进度</Text>
        <View className={styles.progressSteps}>
          {getProgressSteps().map((step, idx, arr) => (
            <View key={step.key} className={styles.progressStep}>
              <View
                className={classNames(
                  styles.stepDot,
                  step.done && styles.stepDotDone,
                  step.active && !step.done && styles.stepDotActive
                )}
              >
                {step.done ? (
                  <Text className={styles.stepCheck}>✓</Text>
                ) : (
                  <Text className={styles.stepNum}>{idx + 1}</Text>
                )}
              </View>
              <Text
                className={classNames(
                  styles.stepLabel,
                  step.done && styles.stepLabelDone
                )}
              >
                {step.label}
              </Text>
              {idx < arr.length - 1 && (
                <View
                  className={classNames(
                    styles.stepLine,
                    step.done && styles.stepLineDone
                  )}
                />
              )}
            </View>
          ))}
        </View>

        {isJoined && (
          <View className={styles.myStatusCard}>
            <View className={styles.myStatusItem}>
              <Text className={styles.myStatusLabel}>报名状态</Text>
              <Text className={styles.myStatusValue}>已报名</Text>
            </View>
            {isCheckedIn && getCheckInTime() && (
              <View className={styles.myStatusItem}>
                <Text className={styles.myStatusLabel}>签到时间</Text>
                <Text className={styles.myStatusValue}>
                  {dayjs(getCheckInTime()).format('MM-DD HH:mm')}
                </Text>
              </View>
            )}
            {!isCheckedIn && isOngoing && (
              <View className={styles.myStatusItem}>
                <Text className={styles.myStatusLabel}>签到状态</Text>
                <Text className={styles.myStatusValue}>可签到</Text>
              </View>
            )}
            {!isCheckedIn && !isOngoing && (
              <View className={styles.myStatusItem}>
                <Text className={styles.myStatusLabel}>签到状态</Text>
                <Text className={styles.myStatusValue}>未开始</Text>
              </View>
            )}
            {activity.feeType === 'aa' && (
              <View className={styles.myStatusItem}>
                <Text className={styles.myStatusLabel}>AA付款</Text>
                <Text className={classNames(styles.myStatusValue, isPaid && styles.myStatusSuccess)}>
                  {isPaid ? '已付款' : '待付款'}
                </Text>
              </View>
            )}
          </View>
        )}

        {isWaitlist && (
          <View className={styles.myStatusCard}>
            <View className={styles.myStatusItem}>
              <Text className={styles.myStatusLabel}>候补状态</Text>
              <Text className={styles.myStatusValue}>候补中</Text>
            </View>
            <View className={styles.myStatusItem}>
              <Text className={styles.myStatusLabel}>我的排位</Text>
              <Text className={styles.myStatusValue}>第 {getMyWaitlistRank()} 位</Text>
            </View>
            <View className={styles.myStatusItem}>
              <Text className={styles.myStatusLabel}>候补人数</Text>
              <Text className={styles.myStatusValue}>{getWaitlistCount()} 人</Text>
            </View>
          </View>
        )}
      </View>

      <View className={styles.participantsSection}>
        <View className={styles.participantsHeader}>
          <Text className={styles.sectionTitle}>参与成员</Text>
          <View className={styles.participantsCount}>
            <strong>{activity.participants?.length || 0}</strong>/{activity.maxParticipants}人
          </View>
        </View>
        <View className={styles.participantList}>
          {(activity.participants || []).slice(0, 8).map(user => {
            const isMe = user.id === currentUser.id;
            return (
              <View key={user.id} className={styles.participantItem}>
                <View style={{ position: 'relative' }}>
                  <Image
                    className={styles.participantAvatar}
                    src={user.avatar}
                    mode="aspectFill"
                  />
                  {isMe && (
                    <View className={styles.meBadge}>
                      <Text className={styles.meBadgeText}>我</Text>
                    </View>
                  )}
                </View>
                <Text className={styles.participantName}>
                  {isMe ? '我' : user.nickname.slice(0, 4)}
                </Text>
              </View>
            );
          })}
          {(activity.participants?.length || 0) > 8 && (
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
                +{(activity.participants?.length || 0) - 8}
              </View>
            </View>
          )}
        </View>
      </View>

      {getWaitlistCount() > 0 && (
        <View className={styles.waitlistSection}>
          <View className={styles.waitlistHeader}>
            <Text className={styles.sectionTitle}>候补名单</Text>
            <Text className={styles.waitlistCount}>{getWaitlistCount()}人</Text>
          </View>
          {isWaitlist && (
            <View className={styles.myWaitlistItem}>
              <View className={styles.myWaitlistBadge}>我在候补</View>
              <Text className={styles.myWaitlistRank}>第 {getMyWaitlistRank()} 位</Text>
            </View>
          )}
          <View className={styles.waitlistList}>
            {(activity.waitlistUsers || []).filter(u => u && u.id).map((user, idx) => {
              const isMe = user.id === currentUser.id;
              return (
                <View key={user.id} className={styles.waitlistItem}>
                  <View className={styles.waitlistRank}>{idx + 1}</View>
                  <Image
                    className={styles.waitlistAvatar}
                    src={user.avatar}
                    mode="aspectFill"
                  />
                  <Text className={styles.waitlistName}>
                    {isMe ? '我' : user.nickname}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {isWaitlist && getWaitlistCount() === 0 && (
        <View className={styles.waitlistSection}>
          <View className={styles.waitlistHeader}>
            <Text className={styles.sectionTitle}>候补名单</Text>
            <Text className={styles.waitlistCount}>1人</Text>
          </View>
          <View className={styles.myWaitlistItem}>
            <View className={styles.myWaitlistBadge}>我在候补</View>
            <Text className={styles.myWaitlistRank}>第 1 位</Text>
          </View>
        </View>
      )}

      {activity.feeType === 'aa' && activity.fee > 0 && isJoined && (
        <View className={styles.aaSection}>
          <View className={styles.aaHeader}>
            <Text className={styles.sectionTitle}>AA费用</Text>
            <View className={styles.aaTotal}>
              人均 <strong>¥{activity.fee}</strong>
            </View>
          </View>
          <View className={styles.aaSummary}>
            <Text className={styles.aaPaidCount}>
              已付 {activity.paidUserIds?.length || 0}/{activity.participants?.length || 0} 人
            </Text>
          </View>
          <View className={styles.aaList}>
            {(activity.participants || []).filter(u => u && u.id).map(user => {
              const hasPaid = (activity.paidUserIds || []).includes(user.id);
              const isMe = user.id === currentUser.id;
              return (
                <View key={user.id} className={styles.aaItem}>
                  <Image
                    className={styles.aaAvatar}
                    src={user.avatar}
                    mode="aspectFill"
                  />
                  <Text className={styles.aaName}>
                    {isMe ? '我' : user.nickname}
                  </Text>
                  <View
                    className={classNames(
                      styles.aaStatus,
                      hasPaid ? styles.aaPaid : styles.aaUnpaid
                    )}
                  >
                    {hasPaid ? '已付款' : '待付款'}
                  </View>
                </View>
              );
            })}
          </View>
          {isJoined && !isPaid && (
            <View className={styles.aaPayBtn} onClick={handlePayAA}>
              <Text className={styles.aaPayBtnText}>确认付款 ¥{activity.fee}</Text>
            </View>
          )}
          {isJoined && isPaid && (
            <View className={styles.aaPaidTip}>
              <Text className={styles.aaPaidTipText}>✓ 你已完成付款</Text>
            </View>
          )}
        </View>
      )}

      <View className={styles.footer}>
        <button className={styles.secondaryBtn} onClick={handleChat}>
          群聊
        </button>
        {isOrganizer ? (
          <button
            className={styles.primaryBtn}
            onClick={() => setShowAdminPanel(true)}
          >
            管理活动
          </button>
        ) : isJoined ? (
          <>
            {isOngoing && (
              <button
                className={classNames(styles.signInBtn, isCheckedIn && styles.signInBtnDone)}
                onClick={handleCheckIn}
                disabled={isCheckedIn}
              >
                {isCheckedIn ? '✓ 已签到' : '签到'}
              </button>
            )}
            {activity.feeType === 'aa' && !isPaid && (
              <button className={styles.payBtn} onClick={handlePayAA}>
                AA付款
              </button>
            )}
            <button
              className={styles.cancelBtn}
              onClick={handleCancel}
              style={isOngoing ? { flex: 1 } : { flex: 2 }}
            >
              取消报名
            </button>
          </>
        ) : isWaitlist ? (
          <button className={styles.cancelBtn} onClick={handleCancelWaitlist}>
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

      {showAdminPanel && (
        <View className={styles.adminModal} onClick={() => setShowAdminPanel(false)}>
          <View className={styles.adminModalContent} onClick={e => e.stopPropagation()}>
            <View className={styles.adminModalHeader}>
              <Text className={styles.adminModalTitle}>活动管理</Text>
              <Text className={styles.adminClose} onClick={() => setShowAdminPanel(false)}>✕</Text>
            </View>

            <ScrollView className={styles.adminModalBody} scrollY>
              <View className={styles.adminSection}>
                <View className={styles.adminSectionHeader}>
                  <Text className={styles.adminSectionTitle}>报名成员</Text>
                  <Text className={styles.adminSectionCount}>{activity.participants?.length || 0}/{activity.maxParticipants}人</Text>
                </View>
                <View className={styles.adminUserList}>
                  {(activity.participants || []).filter(u => u && u.id).map(user => {
                    const hasCheckedIn = activity.checkInTimes?.[user.id];
                    const hasPaid = (activity.paidUserIds || []).includes(user.id);
                    return (
                      <View key={user.id} className={styles.adminUserItem}>
                        <Image
                          className={styles.adminUserAvatar}
                          src={user.avatar}
                          mode="aspectFill"
                        />
                        <View className={styles.adminUserInfo}>
                          <Text className={styles.adminUserName}>{user.nickname}</Text>
                          <View className={styles.adminUserTags}>
                            {hasCheckedIn && (
                              <View className={styles.adminTagSuccess}>已签到</View>
                            )}
                            {activity.feeType === 'aa' && (
                              <View className={classNames(
                                styles.adminTag,
                                hasPaid ? styles.adminTagSuccess : styles.adminTagWarning
                              )}>
                                {hasPaid ? '已付款' : '待付款'}
                              </View>
                            )}
                          </View>
                        </View>
                        {hasCheckedIn && (
                          <Text className={styles.adminCheckInTime}>
                            {dayjs(hasCheckedIn).format('HH:mm')}
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>

              {activity.waitlistUsers && activity.waitlistUsers.filter(u => u && u.id).length > 0 && (
                <View className={styles.adminSection}>
                  <View className={styles.adminSectionHeader}>
                    <Text className={styles.adminSectionTitle}>候补名单</Text>
                    <Text className={styles.adminSectionCount}>{activity.waitlistUsers.filter(u => u && u.id).length}人</Text>
                  </View>
                  <View className={styles.adminUserList}>
                    {activity.waitlistUsers.filter(u => u && u.id).map((user, idx) => (
                      <View key={user.id} className={styles.adminUserItem}>
                        <View className={styles.adminWaitlistRank}>{idx + 1}</View>
                        <Image
                          className={styles.adminUserAvatar}
                          src={user.avatar}
                          mode="aspectFill"
                        />
                        <View className={styles.adminUserInfo}>
                          <Text className={styles.adminUserName}>{user.nickname}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View className={styles.adminSection}>
                <View className={styles.adminSectionHeader}>
                  <Text className={styles.adminSectionTitle}>签到统计</Text>
                </View>
                <View className={styles.adminStatsRow}>
                  <View className={styles.adminStatItem}>
                    <Text className={styles.adminStatNum}>{Object.keys(activity.checkInTimes || {}).length}</Text>
                    <Text className={styles.adminStatLabel}>已签到</Text>
                  </View>
                  <View className={styles.adminStatItem}>
                    <Text className={styles.adminStatNum}>{Math.max(0, (activity.participants?.length || 0) - Object.keys(activity.checkInTimes || {}).length)}</Text>
                    <Text className={styles.adminStatLabel}>未签到</Text>
                  </View>
                </View>
              </View>

              {activity.feeType === 'aa' && activity.fee > 0 && (
                <View className={styles.adminSection}>
                  <View className={styles.adminSectionHeader}>
                    <Text className={styles.adminSectionTitle}>AA付款统计</Text>
                  </View>
                  <View className={styles.adminStatsRow}>
                    <View className={styles.adminStatItem}>
                      <Text className={styles.adminStatNum}>{activity.paidUserIds?.length || 0}</Text>
                      <Text className={styles.adminStatLabel}>已付款</Text>
                    </View>
                    <View className={styles.adminStatItem}>
                      <Text className={styles.adminStatNum}>¥{((activity.paidUserIds?.length || 0) * activity.fee)}</Text>
                      <Text className={styles.adminStatLabel}>已收金额</Text>
                    </View>
                    <View className={styles.adminStatItem}>
                      <Text className={styles.adminStatNum}>¥{Math.max(0, ((activity.participants?.length || 0) * activity.fee) - ((activity.paidUserIds?.length || 0) * activity.fee))}</Text>
                      <Text className={styles.adminStatLabel}>待收金额</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default SignupPage;

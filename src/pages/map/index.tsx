import React, { useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import { sportTypeConfigs } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import type { Activity } from '@/types';
import dayjs from 'dayjs';

const MapPage: React.FC = () => {
  const activities = useAppStore(state => state.activities);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showRouteDetail, setShowRouteDetail] = useState(false);

  const selectedActivity = activities.find(a => a.id === selectedId);

  const getMarkerPosition = (activity: Activity) => {
    const baseLat = activity.location.latitude;
    const baseLng = activity.location.longitude;
    const x = ((baseLng - 116.2) / 0.6) * 100;
    const y = ((40.3 - baseLat) / 0.5) * 100;
    return { x: Math.max(10, Math.min(90, x)), y: Math.max(15, Math.min(85, y)) };
  };

  const getSportConfig = (sportType: string) => {
    return sportTypeConfigs.find(s => s.key === sportType);
  };

  const handleMarkerClick = (id: string) => {
    setSelectedId(id);
    setShowRouteDetail(true);
  };

  const handleCardClick = (id: string) => {
    setSelectedId(id);
    setShowRouteDetail(true);
  };

  const handleViewDetail = () => {
    if (selectedId) {
      Taro.navigateTo({
        url: `/pages/signup/index?id=${selectedId}`,
      });
    }
  };

  const handleLocate = () => {
    Taro.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('[Map] 当前位置:', res.latitude, res.longitude);
        Taro.showToast({ title: '定位成功', icon: 'success' });
      },
      fail: (err) => {
        console.error('[Map] 定位失败:', err);
        Taro.showToast({ title: '定位失败', icon: 'none' });
      },
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'recruiting':
        return styles.miniStatusRecruiting;
      case 'full':
        return styles.miniStatusFull;
      default:
        return styles.miniStatusRecruiting;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'recruiting':
        return '报名中';
      case 'full':
        return '已满员';
      case 'ongoing':
        return '进行中';
      default:
        return '报名中';
    }
  };

  const hasRouteTypes = ['run', 'cycling', 'hiking'];
  const hasRoute = selectedActivity?.routeInfo || (selectedActivity && hasRouteTypes.includes(selectedActivity.sportType));

  return (
    <View className={styles.pageContainer}>
      <View className={styles.mapContainer}>
        <View className={styles.mapBackground}>
          <View className={styles.mapGrid} />

          <View className={styles.roadLines}>
            <View className={styles.roadH} style={{ top: '30%', left: 0, right: 0 }} />
            <View className={styles.roadH} style={{ top: '60%', left: 0, right: 0 }} />
            <View className={styles.roadV} style={{ left: '25%', top: 0, bottom: 0 }} />
            <View className={styles.roadV} style={{ left: '65%', top: 0, bottom: 0 }} />
          </View>

          {selectedActivity && showRouteDetail && hasRoute && (
            <View className={styles.routeLine}>
              <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                <path
                  d={`M 30% 40% Q 50% 20%, 70% 50% T 85% 65%`}
                  stroke={getSportConfig(selectedActivity.sportType)?.color || '#FF6B35'}
                  strokeWidth="4"
                  strokeDasharray="8,8"
                  fill="none"
                  opacity="0.6"
                />
              </svg>
            </View>
          )}

          {activities.map(activity => {
            const pos = getMarkerPosition(activity);
            const sportConfig = getSportConfig(activity.sportType);
            const isSelected = selectedId === activity.id;
            return (
              <View
                key={activity.id}
                className={classNames(styles.mapMarker, isSelected && styles.mapMarkerActive)}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => handleMarkerClick(activity.id)}
              >
                <View
                  className={classNames(styles.markerPin, isSelected && styles.markerPinActive)}
                  style={{ background: sportConfig?.color }}
                >
                  <Text>{sportConfig?.icon}</Text>
                </View>
                <Text className={classNames(styles.markerLabel, isSelected && styles.markerLabelActive)}>
                  {activity.title.length > 10 ? activity.title.slice(0, 10) + '...' : activity.title}
                </Text>
              </View>
            );
          })}
        </View>

        <View className={styles.weatherWidget}>
          <View className={styles.weatherContent}>
            <View className={styles.weatherLeft}>
              <Text className={styles.weatherIcon}>☀️</Text>
              <View className={styles.weatherInfo}>
                <Text className={styles.weatherTemp}>26°C</Text>
                <Text className={styles.weatherDesc}>晴 · 适合户外运动</Text>
              </View>
            </View>
            <View className={styles.weatherRight}>
              <Text className={styles.weatherItem}>💨 风力 2级</Text>
              <Text className={styles.weatherItem}>💧 湿度 45%</Text>
              <Text className={styles.weatherItem}>🌡️ 体感 25°C</Text>
            </View>
          </View>
        </View>

        <View className={styles.myLocation} onClick={handleLocate}>
          <Text>📍</Text>
        </View>
      </View>

      {showRouteDetail && selectedActivity ? (
        <View className={styles.routeDetailPanel}>
          <View className={styles.panelHandle} onClick={() => setShowRouteDetail(false)} />
          <View className={styles.routeDetailHeader}>
            <View style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <View
                className={styles.routeTypeIcon}
                style={{ backgroundColor: `${getSportConfig(selectedActivity.sportType)?.color}15` }}
              >
                <Text>{getSportConfig(selectedActivity.sportType)?.icon}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text className={styles.routeTitle}>{selectedActivity.title}</Text>
                <Text className={styles.routeSubtitle}>
                  {dayjs(selectedActivity.startTime).format('MM-DD HH:mm')} 开始
                </Text>
              </View>
            </View>
            <View className={classNames(styles.miniStatus, getStatusClass(selectedActivity.status))}>
              {getStatusText(selectedActivity.status)}
            </View>
          </View>

          {hasRoute ? (
            <View className={styles.routeInfoCard}>
              <View className={styles.routeInfoItem}>
                <Text className={styles.routeInfoValue}>
                  {selectedActivity.routeInfo?.distance || 8}
                </Text>
                <Text className={styles.routeInfoLabel}>公里</Text>
              </View>
              <View className={styles.routeDivider} />
              <View className={styles.routeInfoItem}>
                <Text className={styles.routeInfoValue}>
                  {selectedActivity.routeInfo?.duration || '约1小时'}
                </Text>
                <Text className={styles.routeInfoLabel}>预计时长</Text>
              </View>
              <View className={styles.routeDivider} />
              <View className={styles.routeInfoItem}>
                <Text className={styles.routeInfoValue}>
                  {selectedActivity.currentParticipants}
                </Text>
                <Text className={styles.routeInfoLabel}>已报名</Text>
              </View>
            </View>
          ) : (
            <View className={styles.noRouteHint}>
              <Text className={styles.noRouteIcon}>🏟️</Text>
              <Text className={styles.noRouteText}>该活动为场馆活动，无路线信息</Text>
              <Text className={styles.noRouteDesc}>在集合地点集合开展活动</Text>
            </View>
          )}

          <View className={styles.locationRow}>
            <Text className={styles.locationIconText}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text className={styles.locationName}>{selectedActivity.location.name}</Text>
              <Text className={styles.locationAddress}>{selectedActivity.location.address}</Text>
            </View>
            <Text className={styles.locationDistance}>{selectedActivity.distance}km</Text>
          </View>

          <View className={styles.routeDetailFooter}>
            <button className={styles.secondaryBtn} onClick={() => setShowRouteDetail(false)}>
              收起
            </button>
            <button className={styles.primaryBtn} onClick={handleViewDetail}>
              查看详情
            </button>
          </View>
        </View>
      ) : (
        <View className={styles.activityPanel}>
          <View className={styles.panelHandle} />
          <View className={styles.panelHeader}>
            <Text className={styles.panelTitle}>附近活动</Text>
            <Text className={styles.panelCount}>共 {activities.length} 个</Text>
          </View>

          <ScrollView
            className={styles.activityList}
            scrollY
            style={{ maxHeight: '400rpx' }}
          >
            {activities.map(activity => {
              const sportConfig = getSportConfig(activity.sportType);
              const isSelected = selectedId === activity.id;
              return (
                <View
                  key={activity.id}
                  className={classNames(styles.miniCard, isSelected && styles.miniCardActive)}
                  onClick={() => handleCardClick(activity.id)}
                >
                  <View
                    className={styles.miniIcon}
                    style={{ backgroundColor: `${sportConfig?.color}15` }}
                  >
                    <Text>{sportConfig?.icon}</Text>
                  </View>
                  <View className={styles.miniInfo}>
                    <Text className={styles.miniTitle}>{activity.title}</Text>
                    <View className={styles.miniMeta}>
                      <Text>📍 {activity.location.name}</Text>
                      <View className={classNames(styles.miniStatus, getStatusClass(activity.status))}>
                        {getStatusText(activity.status)}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default MapPage;

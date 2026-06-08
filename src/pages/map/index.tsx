import React, { useState, useRef } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import { mockActivities, sportTypeConfigs } from '@/data/mockData';
import type { Activity } from '@/types';

const MapPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<any>(null);

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
    const index = mockActivities.findIndex(a => a.id === id);
    if (index >= 0 && scrollRef.current) {
      console.log('[Map] 滚动到活动:', index);
    }
  };

  const handleCardClick = (id: string) => {
    setSelectedId(id);
    Taro.navigateTo({
      url: `/pages/signup/index?id=${id}`,
    });
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

          {mockActivities.map(activity => {
            const pos = getMarkerPosition(activity);
            const sportConfig = getSportConfig(activity.sportType);
            const isSelected = selectedId === activity.id;
            return (
              <View
                key={activity.id}
                className={styles.mapMarker}
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
                  {activity.title.length > 8 ? activity.title.slice(0, 8) + '...' : activity.title}
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

      <View className={styles.activityPanel}>
        <View className={styles.panelHandle} />
        <View className={styles.panelHeader}>
          <Text className={styles.panelTitle}>附近活动</Text>
          <Text className={styles.panelCount}>共 {mockActivities.length} 个</Text>
        </View>

        <ScrollView
          className={styles.activityList}
          scrollY
          style={{ maxHeight: '400rpx' }}
          ref={scrollRef}
        >
          {mockActivities.map(activity => {
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
    </View>
  );
};

export default MapPage;

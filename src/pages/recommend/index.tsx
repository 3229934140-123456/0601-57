import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import ActivityCard from '@/components/ActivityCard';
import { sportTypeConfigs, skillLevelConfigs } from '@/data/mockData';
import type { SportType, SkillLevel } from '@/types';
import { useAppStore } from '@/store/useAppStore';

type SortType = 'distance' | 'time' | 'hot';

const RecommendPage: React.FC = () => {
  const activities = useAppStore(state => state.activities);

  const [searchText, setSearchText] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<SportType[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<SkillLevel[]>([]);
  const [distance, setDistance] = useState(50);
  const [sortBy, setSortBy] = useState<SortType>('distance');

  useDidShow(() => {
    console.log('[Recommend] 页面显示，活动数:', activities.length);
  });

  const filteredActivities = useMemo(() => {
    let result = [...activities];

    if (searchText) {
      result = result.filter(
        a =>
          a.title.includes(searchText) ||
          a.location.name.includes(searchText) ||
          a.description.includes(searchText)
      );
    }

    if (selectedTypes.length > 0) {
      result = result.filter(a => selectedTypes.includes(a.sportType));
    }

    if (selectedLevels.length > 0) {
      result = result.filter(a => selectedLevels.includes(a.skillLevel));
    }

    result = result.filter(a => (a.distance || 0) <= distance);

    switch (sortBy) {
      case 'distance':
        result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'time':
        result.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        break;
      case 'hot':
        result.sort((a, b) => b.currentParticipants - a.currentParticipants);
        break;
    }

    return result;
  }, [activities, searchText, selectedTypes, selectedLevels, distance, sortBy]);

  const toggleType = (type: SportType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleLevel = (level: SkillLevel) => {
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const handleRefresh = () => {
    Taro.showLoading({ title: '刷新中...' });
    setTimeout(() => {
      Taro.hideLoading();
      if (typeof Taro.stopPullDownRefresh === 'function') {
        Taro.stopPullDownRefresh();
      }
    }, 800);
  };

  useEffect(() => {
    if (typeof Taro.onPullDownRefresh === 'function') {
      Taro.onPullDownRefresh(handleRefresh);
      return () => {
        if (typeof Taro.offPullDownRefresh === 'function') {
          Taro.offPullDownRefresh(handleRefresh);
        }
      };
    }
  }, []);

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>发现运动搭子</Text>
        <Text className={styles.headerSubtitle}>找到同城志同道合的运动伙伴</Text>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索活动、地点..."
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
            confirmType="search"
          />
        </View>
      </View>

      <View className={styles.filterSection}>
        <View className={styles.filterCard}>
          <View className={styles.sportTypes}>
            <Text className={styles.filterLabel}>运动类型</Text>
            <View className={styles.typeGrid}>
              {sportTypeConfigs.map(type => (
                <View
                  key={type.key}
                  className={classNames(
                    styles.typeItem,
                    selectedTypes.includes(type.key) && styles.typeItemActive
                  )}
                  onClick={() => toggleType(type.key)}
                >
                  <Text className={styles.typeIcon}>{type.icon}</Text>
                  <Text
                    className={classNames(
                      styles.typeName,
                      selectedTypes.includes(type.key) && styles.typeNameActive
                    )}
                  >
                    {type.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.filterRow}>
            <Text className={styles.filterGroupTitle}>水平</Text>
            <View className={styles.levelChips}>
              {skillLevelConfigs.map(level => (
                <View
                  key={level.key}
                  className={classNames(
                    styles.levelChip,
                    selectedLevels.includes(level.key) && styles.levelChipActive
                  )}
                  onClick={() => toggleLevel(level.key)}
                >
                  {level.label}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.filterRow}>
            <Text className={styles.filterGroupTitle}>距离</Text>
            <View className={styles.levelChips}>
              {[1, 3, 5, 10, 20, 50].map(d => (
                <View
                  key={d}
                  className={classNames(
                    styles.levelChip,
                    distance === d && styles.levelChipActive
                  )}
                  onClick={() => setDistance(d)}
                >
                  {d}km
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className={styles.listSection}
        scrollY
        lowerThreshold={50}
        style={{ height: 'calc(100vh - 420rpx)' }}
      >
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>附近活动 ({filteredActivities.length})</Text>
          <View className={styles.sortOptions}>
            <Text
              className={classNames(
                styles.sortOption,
                sortBy === 'distance' && styles.sortOptionActive
              )}
              onClick={() => setSortBy('distance')}
            >
              距离
            </Text>
            <Text
              className={classNames(
                styles.sortOption,
                sortBy === 'time' && styles.sortOptionActive
              )}
              onClick={() => setSortBy('time')}
            >
              最新
            </Text>
            <Text
              className={classNames(
                styles.sortOption,
                sortBy === 'hot' && styles.sortOptionActive
              )}
              onClick={() => setSortBy('hot')}
            >
              热门
            </Text>
          </View>
        </View>

        {filteredActivities.length > 0 ? (
          filteredActivities.map(activity => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🏃‍♂️</Text>
            <Text className={styles.emptyText}>暂无符合条件的活动</Text>
            <Text style={{ fontSize: 24, color: '#86909C', marginTop: 8 }}>
              去发布页创建第一个活动吧
            </Text>
          </View>
        )}

        {filteredActivities.length > 0 && (
          <View className={styles.loadingMore}>
            <Text>共 {filteredActivities.length} 个活动</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default RecommendPage;

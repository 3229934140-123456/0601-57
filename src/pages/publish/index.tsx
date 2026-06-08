import React, { useState } from 'react';
import { View, Text, Input, Textarea, Picker, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import { sportTypeConfigs, skillLevelConfigs } from '@/data/mockData';
import type { SportType, SkillLevel, Activity } from '@/types';
import { useAppStore } from '@/store/useAppStore';

type FeeType = 'aa' | 'free' | 'sponsor';

const PublishPage: React.FC = () => {
  const addActivity = useAppStore(state => state.addActivity);
  const currentUser = useAppStore(state => state.currentUser);

  const [sportType, setSportType] = useState<SportType | ''>('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationAddr, setLocationAddr] = useState('');
  const [locationLat, setLocationLat] = useState(39.9);
  const [locationLng, setLocationLng] = useState(116.4);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [feeType, setFeeType] = useState<FeeType>('free');
  const [feeAmount, setFeeAmount] = useState('');
  const [hasRoute, setHasRoute] = useState(false);
  const [routeDistance, setRouteDistance] = useState('');
  const [routeDuration, setRouteDuration] = useState('');

  const canPublish = sportType && skillLevel && title && locationName && startDate && startTime && endTime;

  const handleSelectLocation = () => {
    Taro.chooseLocation({
      success: (res) => {
        console.log('[Publish] 选择位置:', res.name, res.latitude, res.longitude);
        setLocationName(res.name || '');
        setLocationAddr(res.address || '');
        setLocationLat(res.latitude);
        setLocationLng(res.longitude);
      },
      fail: (err) => {
        console.error('[Publish] 选择位置失败:', err);
        Taro.showToast({ title: '选择位置失败', icon: 'none' });
      },
    });
  };

  const handleDateChange = (e: any) => {
    setStartDate(e.detail.value);
  };

  const handleStartTimeChange = (e: any) => {
    setStartTime(e.detail.value);
  };

  const handleEndTimeChange = (e: any) => {
    setEndTime(e.detail.value);
  };

  const handleMaxParticipantsChange = (delta: number) => {
    setMaxParticipants(prev => Math.max(2, Math.min(100, prev + delta)));
  };

  const handlePublish = () => {
    if (!canPublish) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '发布中...' });

    const newActivity: Activity = {
      id: `act_${Date.now()}`,
      title,
      sportType: sportType as SportType,
      skillLevel: skillLevel as SkillLevel,
      description,
      organizer: currentUser,
      location: {
        name: locationName,
        address: locationAddr || locationName,
        latitude: locationLat,
        longitude: locationLng,
      },
      startTime: `${startDate} ${startTime}:00`,
      endTime: `${startDate} ${endTime}:00`,
      maxParticipants,
      currentParticipants: 0,
      waitlistCount: 0,
      fee: feeType === 'aa' ? Number(feeAmount) || 0 : 0,
      feeType,
      distance: Number((Math.random() * 5 + 0.5).toFixed(1)),
      status: 'recruiting',
      routeInfo: hasRoute && routeDistance ? {
        distance: Number(routeDistance),
        duration: routeDuration || '待定',
      } : undefined,
      weather: {
        temperature: 25 + Math.floor(Math.random() * 8),
        condition: '晴',
        icon: '☀️',
      },
      participants: [],
      waitlist: [],
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      addActivity(newActivity);
      Taro.hideLoading();
      Taro.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 1500,
      });

      console.log('[Publish] 活动已发布:', newActivity.title, newActivity.id);

      setTimeout(() => {
        setSportType('');
        setSkillLevel('');
        setTitle('');
        setDescription('');
        setLocationName('');
        setLocationAddr('');
        setStartDate('');
        setStartTime('');
        setEndTime('');
        setMaxParticipants(10);
        setFeeType('free');
        setFeeAmount('');
        setHasRoute(false);
        setRouteDistance('');
        setRouteDuration('');
        Taro.switchTab({ url: '/pages/recommend/index' });
      }, 1500);
    }, 800);
  };

  const hasRouteTypes = ['run', 'cycling', 'hiking'];
  const showRouteOption = sportType && hasRouteTypes.includes(sportType);

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>选择运动类型</Text>
        <View className={styles.typeGrid}>
          {sportTypeConfigs.map(type => (
            <View
              key={type.key}
              className={classNames(
                styles.typeItem,
                sportType === type.key && styles.typeItemActive
              )}
              onClick={() => setSportType(type.key)}
            >
              <Text className={styles.typeIcon}>{type.icon}</Text>
              <Text
                className={classNames(
                  styles.typeName,
                  sportType === type.key && styles.typeNameActive
                )}
              >
                {type.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>基本信息</Text>

        <View className={styles.formItem}>
          <Text className={classNames(styles.formLabel, styles.formLabelRequired)}>活动标题</Text>
          <View className={styles.inputBox}>
            <Input
              className={styles.input}
              placeholder="请输入活动标题"
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
              maxlength={30}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>活动描述</Text>
          <View className={styles.textareaBox}>
            <Textarea
              className={styles.textarea}
              placeholder="简单介绍一下活动内容、注意事项等..."
              value={description}
              onInput={(e) => setDescription(e.detail.value)}
              maxlength={200}
              autoHeight
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={classNames(styles.formLabel, styles.formLabelRequired)}>运动水平</Text>
          <View className={styles.levelOptions}>
            {skillLevelConfigs.map(level => (
              <View
                key={level.key}
                className={classNames(
                  styles.levelOption,
                  skillLevel === level.key && styles.levelOptionActive
                )}
                onClick={() => setSkillLevel(level.key)}
              >
                {level.label}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>时间地点</Text>

        <View className={styles.formItem}>
          <Text className={classNames(styles.formLabel, styles.formLabelRequired)}>集合地点</Text>
          <View className={styles.locationBox} onClick={handleSelectLocation}>
            <Text
              className={classNames(
                styles.locationText,
                !locationName && styles.locationPlaceholder
              )}
            >
              {locationName || '点击选择集合地点'}
            </Text>
            <Text className={styles.locationAction}>📍</Text>
          </View>
          {locationAddr && (
            <Text style={{ fontSize: 22, color: '#86909C', marginTop: 8 }}>
              {locationAddr}
            </Text>
          )}
        </View>

        <View className={styles.row}>
          <View className={classNames(styles.rowItem, styles.formItem)}>
            <Text className={classNames(styles.formLabel, styles.formLabelRequired)}>开始日期</Text>
            <View className={styles.inputBox}>
              <Picker mode="date" value={startDate} onChange={handleDateChange}>
                <Text className={classNames(styles.input, !startDate && styles.locationPlaceholder)}>
                  {startDate || '选择日期'}
                </Text>
              </Picker>
            </View>
          </View>
        </View>

        <View className={styles.row}>
          <View className={classNames(styles.rowItem, styles.formItem)}>
            <Text className={classNames(styles.formLabel, styles.formLabelRequired)}>开始时间</Text>
            <View className={styles.inputBox}>
              <Picker mode="time" value={startTime} onChange={handleStartTimeChange}>
                <Text className={classNames(styles.input, !startTime && styles.locationPlaceholder)}>
                  {startTime || '选择时间'}
                </Text>
              </Picker>
            </View>
          </View>
          <View className={classNames(styles.rowItem, styles.formItem)}>
            <Text className={classNames(styles.formLabel, styles.formLabelRequired)}>结束时间</Text>
            <View className={styles.inputBox}>
              <Picker mode="time" value={endTime} onChange={handleEndTimeChange}>
                <Text className={classNames(styles.input, !endTime && styles.locationPlaceholder)}>
                  {endTime || '选择时间'}
                </Text>
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {showRouteOption && (
        <View className={styles.section}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>路线信息</Text>
            <View
              className={classNames(styles.feeOption, hasRoute && styles.feeOptionActive)}
              style={{ padding: '8rpx 20rpx', fontSize: 24 }}
              onClick={() => setHasRoute(!hasRoute)}
            >
              {hasRoute ? '已添加' : '添加路线'}
            </View>
          </View>

          {hasRoute && (
            <>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>路线距离（公里）</Text>
                <View className={styles.inputBox}>
                  <Input
                    className={styles.input}
                    type="digit"
                    placeholder="例如：8.5"
                    value={routeDistance}
                    onInput={(e) => setRouteDistance(e.detail.value)}
                  />
                  <Text className={styles.inputSuffix}>km</Text>
                </View>
              </View>

              <View className={styles.formItem}>
                <Text className={styles.formLabel}>预计时长</Text>
                <View className={styles.inputBox}>
                  <Input
                    className={styles.input}
                    placeholder="例如：约1小时"
                    value={routeDuration}
                    onInput={(e) => setRouteDuration(e.detail.value)}
                  />
                </View>
              </View>
            </>
          )}
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>人数费用</Text>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>招募人数</Text>
          <View className={styles.numberStepper}>
            <View
              className={styles.stepperBtn}
              onClick={() => handleMaxParticipantsChange(-1)}
            >
              <Text>−</Text>
            </View>
            <Text className={styles.stepperValue}>{maxParticipants}</Text>
            <View
              className={styles.stepperBtn}
              onClick={() => handleMaxParticipantsChange(1)}
            >
              <Text>+</Text>
            </View>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>费用方式</Text>
          <View className={styles.feeOptions}>
            <View
              className={classNames(
                styles.feeOption,
                feeType === 'free' && styles.feeOptionActive
              )}
              onClick={() => setFeeType('free')}
            >
              免费
            </View>
            <View
              className={classNames(
                styles.feeOption,
                feeType === 'aa' && styles.feeOptionActive
              )}
              onClick={() => setFeeType('aa')}
            >
              AA制
            </View>
            <View
              className={classNames(
                styles.feeOption,
                feeType === 'sponsor' && styles.feeOptionActive
              )}
              onClick={() => setFeeType('sponsor')}
            >
              主办方
            </View>
          </View>
        </View>

        {feeType === 'aa' && (
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>人均费用</Text>
            <View className={styles.inputBox}>
              <Input
                className={styles.input}
                type="digit"
                placeholder="请输入人均费用"
                value={feeAmount}
                onInput={(e) => setFeeAmount(e.detail.value)}
              />
              <Text className={styles.inputSuffix}>元/人</Text>
            </View>
          </View>
        )}
      </View>

      <View className={styles.footer}>
        <Button
          className={styles.publishBtn}
          onClick={handlePublish}
          disabled={!canPublish}
        >
          发布活动
        </Button>
      </View>
    </ScrollView>
  );
};

export default PublishPage;

import React, { useState } from 'react';
import { View, Text, Input, Textarea, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import { sportTypeConfigs, skillLevelConfigs } from '@/data/mockData';
import type { SportType, SkillLevel } from '@/types';

type FeeType = 'aa' | 'free' | 'sponsor';

const PublishPage: React.FC = () => {
  const [sportType, setSportType] = useState<SportType | ''>('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [feeType, setFeeType] = useState<FeeType>('free');
  const [feeAmount, setFeeAmount] = useState('');

  const canPublish = sportType && skillLevel && title && locationName && startDate && startTime && endTime;

  const handleSelectLocation = () => {
    Taro.chooseLocation({
      success: (res) => {
        console.log('[Publish] 选择位置:', res.name);
        setLocationName(res.name || res.address);
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

    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({
        title: '发布成功',
        icon: 'success',
        duration: 1500,
      });

      console.log('[Publish] 活动已发布:', {
        sportType,
        skillLevel,
        title,
        description,
        locationName,
        startDate,
        startTime,
        endTime,
        maxParticipants,
        feeType,
        feeAmount,
      });

      setTimeout(() => {
        Taro.switchTab({ url: '/pages/recommend/index' });
      }, 1500);
    }, 1000);
  };

  return (
    <View className={styles.pageContainer}>
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
        <button
          className={styles.publishBtn}
          onClick={handlePublish}
          disabled={!canPublish}
        >
          发布活动
        </button>
      </View>
    </View>
  );
};

export default PublishPage;

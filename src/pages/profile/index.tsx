import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import styles from './index.module.scss';
import { mockVenues, sportTypeConfigs } from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import type { EquipmentItem, Venue } from '@/types';

type ModalType = 'equipment' | 'venues' | 'privacy' | null;

const ProfilePage: React.FC = () => {
  const currentUser = useAppStore(state => state.currentUser);
  const equipmentPreferences = useAppStore(state => state.equipmentPreferences);
  const favoriteVenues = useAppStore(state => state.favoriteVenues);
  const settings = useAppStore(state => state.settings);
  const publishedActivities = useAppStore(state => state.publishedActivities);
  const joinedActivities = useAppStore(state => state.joinedActivities);
  const updateSettings = useAppStore(state => state.updateSettings);
  const setEquipmentPreferences = useAppStore(state => state.setEquipmentPreferences);
  const setFavoriteVenues = useAppStore(state => state.setFavoriteVenues);

  const [modalType, setModalType] = useState<ModalType>(null);

  const [editEquipments, setEditEquipments] = useState<EquipmentItem[]>([]);
  const [newEquipmentIcon, setNewEquipmentIcon] = useState('');
  const [newEquipmentName, setNewEquipmentName] = useState('');

  const [editVenues, setEditVenues] = useState<Venue[]>([]);

  const [privacySettings, setPrivacySettings] = useState({
    showDistance: true,
    showActivities: true,
    allowFindMe: true,
  });

  const handleEditProfile = () => {
    console.log('[Profile] 编辑个人资料');
    Taro.showToast({ title: '编辑功能开发中', icon: 'none' });
  };

  const handleCreditClick = () => {
    console.log('[Profile] 查看信用页');
    Taro.navigateTo({ url: '/pages/credit/index' });
  };

  const handleMyActivities = (type: string) => {
    console.log('[Profile] 我的活动:', type);
    if (type === 'joined' || type === 'published') {
      Taro.navigateTo({ url: `/pages/my-activities/index?tab=${type}` });
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  const handleEquipment = () => {
    setEditEquipments([...equipmentPreferences]);
    setNewEquipmentIcon('');
    setNewEquipmentName('');
    setModalType('equipment');
  };

  const handleSaveEquipment = () => {
    setEquipmentPreferences(editEquipments);
    setModalType(null);
    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  const handleAddEquipment = () => {
    if (!newEquipmentName.trim()) {
      Taro.showToast({ title: '请输入装备名称', icon: 'none' });
      return;
    }
    const icon = newEquipmentIcon.trim() || '🎽';
    const newItem: EquipmentItem = {
      id: `eq_${Date.now()}`,
      icon,
      name: newEquipmentName.trim(),
    };
    setEditEquipments([...editEquipments, newItem]);
    setNewEquipmentIcon('');
    setNewEquipmentName('');
  };

  const handleRemoveEquipment = (id: string) => {
    setEditEquipments(editEquipments.filter(e => e.id !== id));
  };

  const handleVenues = () => {
    setEditVenues([...favoriteVenues]);
    setModalType('venues');
  };

  const handleSaveVenues = () => {
    setFavoriteVenues(editVenues);
    setModalType(null);
    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  const handleRemoveVenue = (id: string) => {
    setEditVenues(editVenues.filter(v => v.id !== id));
  };

  const handleAddMockVenue = () => {
    const remaining = mockVenues.filter(mv => !editVenues.find(ev => ev.id === mv.id));
    if (remaining.length === 0) {
      Taro.showToast({ title: '没有更多场馆了', icon: 'none' });
      return;
    }
    const randomVenue = remaining[Math.floor(Math.random() * remaining.length)];
    setEditVenues([...editVenues, randomVenue]);
  };

  const handlePrivacy = () => {
    setPrivacySettings({
      showDistance: settings.showDistance !== false,
      showActivities: settings.showActivities !== false,
      allowFindMe: settings.allowFindMe !== false,
    });
    setModalType('privacy');
  };

  const handleSavePrivacy = () => {
    updateSettings(privacySettings);
    setModalType(null);
    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  const toggleMessageNotify = () => {
    updateSettings({ messageNotify: !settings.messageNotify });
  };

  const toggleActivityRemind = () => {
    updateSettings({ activityRemind: !settings.activityRemind });
  };

  const togglePrivateChat = () => {
    updateSettings({ allowPrivateChat: !settings.allowPrivateChat });
  };

  const togglePrivacySetting = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const displayEquipment = equipmentPreferences.length > 0 ? equipmentPreferences : [
    { id: 'd1', icon: '👟', name: '跑鞋' },
    { id: 'd2', icon: '🎽', name: '运动服' },
    { id: 'd3', icon: '🧢', name: '运动手环' },
    { id: 'd4', icon: '🥤', name: '水杯' },
    { id: 'd5', icon: '🧴', name: '防晒霜' },
    { id: 'd6', icon: '📱', name: '手机臂包' },
  ];

  const displayVenues = favoriteVenues.length > 0 ? favoriteVenues : mockVenues.slice(0, 3);

  const equipmentIcons = ['👟', '🎽', '🧢', '🥤', '🧴', '📱', '🎒', '🕶️', '🧤', '💧', '🏃', '🚴'];

  return (
    <ScrollView className={styles.pageContainer} scrollY>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image
            className={styles.avatar}
            src={currentUser.avatar}
            mode="aspectFill"
          />
          <View className={styles.userDetails}>
            <Text className={styles.userName}>{currentUser.nickname}</Text>
            <Text className={styles.userSignature}>
              {currentUser.signature || '这个人很懒，什么都没写'}
            </Text>
          </View>
          <View className={styles.editBtn} onClick={handleEditProfile}>
            编辑
          </View>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{joinedActivities.length}</Text>
            <Text className={styles.statLabel}>参与活动</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{publishedActivities.length}</Text>
            <Text className={styles.statLabel}>发起活动</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>56</Text>
            <Text className={styles.statLabel}>运动搭子</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{currentUser.keepPromiseRate}%</Text>
            <Text className={styles.statLabel}>守约率</Text>
          </View>
        </View>
      </View>

      <View className={styles.creditEntry} onClick={handleCreditClick}>
        <View className={styles.creditLeft}>
          <View className={styles.creditIcon}>
            <Text>⭐</Text>
          </View>
          <View className={styles.creditInfo}>
            <Text className={styles.creditTitle}>我的信用</Text>
            <Text className={styles.creditDesc}>守约率、评价、黑名单</Text>
          </View>
        </View>
        <Text className={styles.creditScore}>{currentUser.creditScore}</Text>
        <Text className={styles.creditArrow}>›</Text>
      </View>

      <Text className={styles.sectionTitle} style={{ paddingTop: 24, paddingLeft: 48 }}>
        我的活动
      </Text>
      <View className={styles.menuSection}>
        <View className={styles.menuItem} onClick={() => handleMyActivities('joined')}>
          <Text className={styles.menuIcon}>📝</Text>
          <Text className={styles.menuText}>我报名的</Text>
          <View className={styles.menuBadge}>{joinedActivities.length}</View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMyActivities('published')}>
          <Text className={styles.menuIcon}>📢</Text>
          <Text className={styles.menuText}>我发布的</Text>
          <View className={styles.menuBadge}>{publishedActivities.length}</View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMyActivities('favorites')}>
          <Text className={styles.menuIcon}>❤️</Text>
          <Text className={styles.menuText}>我收藏的</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMyActivities('history')}>
          <Text className={styles.menuIcon}>📅</Text>
          <Text className={styles.menuText}>历史记录</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <View className={styles.equipmentSection}>
        <View className={styles.equipmentHeader}>
          <Text className={styles.equipmentTitle}>装备偏好</Text>
          <Text className={styles.equipmentEdit} onClick={handleEquipment}>
            编辑
          </Text>
        </View>
        <View className={styles.equipmentTags}>
          {displayEquipment.map(item => (
            <View key={item.id} className={styles.equipmentTag}>
              <Text>{item.icon} {item.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.venuesSection}>
        <View className={styles.venuesHeader}>
          <Text className={styles.venuesTitle}>常去场馆</Text>
          <Text className={styles.venuesMore} onClick={handleVenues}>
            管理 ›
          </Text>
        </View>
        {displayVenues.map(venue => (
          <View key={venue.id} className={styles.venueItem}>
            <View className={styles.venueIcon}>
              <Text>{sportTypeConfigs.find(s => venue.sportTypes?.includes(s.key))?.icon || '🏟️'}</Text>
            </View>
            <View className={styles.venueInfo}>
              <Text className={styles.venueName}>{venue.name}</Text>
              <Text className={styles.venueAddr}>{venue.address}</Text>
            </View>
            <Text className={styles.venueDistance}>{venue.distance}km</Text>
          </View>
        ))}
        {displayVenues.length === 0 && (
          <View className={styles.emptyTip}>
            <Text>还没有添加常去场馆</Text>
          </View>
        )}
      </View>

      <Text className={styles.sectionTitle} style={{ paddingTop: 24, paddingLeft: 48 }}>
        设置
      </Text>
      <View className={styles.settingsSection}>
        <View className={styles.settingRow}>
          <View className={styles.settingLeft}>
            <Text className={styles.settingIcon}>🔔</Text>
            <Text className={styles.settingText}>消息通知</Text>
          </View>
          <View
            className={classNames(styles.switch, settings.messageNotify && styles.switchActive)}
            onClick={toggleMessageNotify}
          >
            <View className={styles.switchDot} />
          </View>
        </View>
        <View className={styles.settingRow}>
          <View className={styles.settingLeft}>
            <Text className={styles.settingIcon}>⏰</Text>
            <Text className={styles.settingText}>活动提醒</Text>
          </View>
          <View
            className={classNames(styles.switch, settings.activityRemind && styles.switchActive)}
            onClick={toggleActivityRemind}
          >
            <View className={styles.switchDot} />
          </View>
        </View>
        <View className={styles.settingRow}>
          <View className={styles.settingLeft}>
            <Text className={styles.settingIcon}>💬</Text>
            <Text className={styles.settingText}>接受陌生人私聊</Text>
          </View>
          <View
            className={classNames(styles.switch, settings.allowPrivateChat && styles.switchActive)}
            onClick={togglePrivateChat}
          >
            <View className={styles.switchDot} />
          </View>
        </View>
        <View className={styles.settingRow} onClick={handlePrivacy}>
          <View className={styles.settingLeft}>
            <Text className={styles.settingIcon}>�</Text>
            <Text className={styles.settingText}>隐私设置</Text>
          </View>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      {/* 装备偏好编辑弹窗 */}
      {modalType === 'equipment' && (
        <View className={styles.modalOverlay} onClick={() => setModalType(null)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation && e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>编辑装备偏好</Text>
              <Text className={styles.modalClose} onClick={() => setModalType(null)}>✕</Text>
            </View>
            <ScrollView className={styles.modalContent} scrollY>
              <View className={styles.modalFormItem}>
                <Text className={styles.modalFormLabel}>添加装备</Text>
                <View className={styles.equipmentAddRow}>
                  <View className={styles.iconPicker}>
                    {equipmentIcons.slice(0, 8).map(icon => (
                      <View
                        key={icon}
                        className={classNames(
                          styles.iconOption,
                          newEquipmentIcon === icon && styles.iconOptionActive
                        )}
                        onClick={() => setNewEquipmentIcon(icon)}
                      >
                        {icon}
                      </View>
                    ))}
                  </View>
                  <View style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <Input
                      className={styles.equipmentAddInput}
                      placeholder="装备名称"
                      value={newEquipmentName}
                      onInput={(e) => setNewEquipmentName(e.detail.value)}
                      maxlength={10}
                    />
                    <button className={styles.addBtn} onClick={handleAddEquipment}>
                      添加
                    </button>
                  </View>
                </View>
              </View>

              <View className={styles.modalFormItem}>
                <Text className={styles.modalFormLabel}>已添加 ({editEquipments.length})</Text>
                {editEquipments.length > 0 ? (
                  <View className={styles.equipmentEditList}>
                    {editEquipments.map(item => (
                      <View key={item.id} className={styles.equipmentEditItem}>
                        <Text style={{ fontSize: 28, marginRight: 8 }}>{item.icon}</Text>
                        <Text style={{ flex: 1, color: '#1D2129' }}>{item.name}</Text>
                        <Text
                          className={styles.removeBtn}
                          onClick={() => handleRemoveEquipment(item.id)}
                        >
                          删除
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className={styles.emptyTip}>
                    <Text>还没有添加装备</Text>
                  </View>
                )}
              </View>
            </ScrollView>
            <View className={styles.modalFooter}>
              <button className={styles.modalCancelBtn} onClick={() => setModalType(null)}>
                取消
              </button>
              <button className={styles.modalSaveBtn} onClick={handleSaveEquipment}>
                保存
              </button>
            </View>
          </View>
        </View>
      )}

      {/* 常去场馆编辑弹窗 */}
      {modalType === 'venues' && (
        <View className={styles.modalOverlay} onClick={() => setModalType(null)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation && e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>管理常去场馆</Text>
              <Text className={styles.modalClose} onClick={() => setModalType(null)}>✕</Text>
            </View>
            <ScrollView className={styles.modalContent} scrollY>
              <View className={styles.modalFormItem}>
                <button className={styles.addVenueBtn} onClick={handleAddMockVenue}>
                  + 添加场馆
                </button>
              </View>

              <View className={styles.modalFormItem}>
                <Text className={styles.modalFormLabel}>已收藏 ({editVenues.length})</Text>
                {editVenues.length > 0 ? (
                  <View className={styles.venueEditList}>
                    {editVenues.map(venue => (
                      <View key={venue.id} className={styles.venueEditItem}>
                        <View className={styles.venueEditIcon}>
                          <Text>{sportTypeConfigs.find(s => venue.sportTypes?.includes(s.key))?.icon || '🏟️'}</Text>
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text className={styles.venueEditName}>{venue.name}</Text>
                          <Text className={styles.venueEditAddr}>{venue.address}</Text>
                        </View>
                        <Text
                          className={styles.removeBtn}
                          onClick={() => handleRemoveVenue(venue.id)}
                        >
                          删除
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className={styles.emptyTip}>
                    <Text>还没有收藏场馆</Text>
                  </View>
                )}
              </View>
            </ScrollView>
            <View className={styles.modalFooter}>
              <button className={styles.modalCancelBtn} onClick={() => setModalType(null)}>
                取消
              </button>
              <button className={styles.modalSaveBtn} onClick={handleSaveVenues}>
                保存
              </button>
            </View>
          </View>
        </View>
      )}

      {/* 隐私设置弹窗 */}
      {modalType === 'privacy' && (
        <View className={styles.modalOverlay} onClick={() => setModalType(null)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation && e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>隐私设置</Text>
              <Text className={styles.modalClose} onClick={() => setModalType(null)}>✕</Text>
            </View>
            <View className={styles.modalContent}>
              <View className={styles.privacyList}>
                <View className={styles.privacyItem}>
                  <View>
                    <Text className={styles.privacyTitle}>显示距离</Text>
                    <Text className={styles.privacyDesc}>允许他人看到你与活动的距离</Text>
                  </View>
                  <View
                    className={classNames(styles.switch, privacySettings.showDistance && styles.switchActive)}
                    onClick={() => togglePrivacySetting('showDistance')}
                  >
                    <View className={styles.switchDot} />
                  </View>
                </View>
                <View className={styles.privacyItem}>
                  <View>
                    <Text className={styles.privacyTitle}>展示活动记录</Text>
                    <Text className={styles.privacyDesc}>在个人主页展示参与的活动</Text>
                  </View>
                  <View
                    className={classNames(styles.switch, privacySettings.showActivities && styles.switchActive)}
                    onClick={() => togglePrivacySetting('showActivities')}
                  >
                    <View className={styles.switchDot} />
                  </View>
                </View>
                <View className={styles.privacyItem}>
                  <View>
                    <Text className={styles.privacyTitle}>允许被发现</Text>
                    <Text className={styles.privacyDesc}>允许通过附近的人找到你</Text>
                  </View>
                  <View
                    className={classNames(styles.switch, privacySettings.allowFindMe && styles.switchActive)}
                    onClick={() => togglePrivacySetting('allowFindMe')}
                  >
                    <View className={styles.switchDot} />
                  </View>
                </View>
              </View>
            </View>
            <View className={styles.modalFooter}>
              <button className={styles.modalCancelBtn} onClick={() => setModalType(null)}>
                取消
              </button>
              <button className={styles.modalSaveBtn} onClick={handleSavePrivacy}>
                保存
              </button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ProfilePage;

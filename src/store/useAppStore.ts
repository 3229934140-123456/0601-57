import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Activity, ChatMessage, EquipmentItem, Venue, User } from '@/types';
import { mockActivities, mockChatMessages, mockVenues, currentUser } from '@/data/mockData';

interface AppSettings {
  messageNotify: boolean;
  activityRemind: boolean;
  allowPrivateChat: boolean;
  showDistance: boolean;
  showActivities: boolean;
  allowFindMe: boolean;
}

interface AppState {
  activities: Activity[];
  currentUser: User;
  chatMessages: Record<string, ChatMessage[]>;
  userVotes: Record<string, number>;
  equipmentPreferences: EquipmentItem[];
  favoriteVenues: Venue[];
  settings: AppSettings;
  joinedActivities: string[];
  waitlistActivities: string[];
  checkedInActivities: string[];
  publishedActivities: string[];

  addActivity: (activity: Activity) => void;
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  joinActivity: (activityId: string) => void;
  cancelJoin: (activityId: string) => void;
  joinWaitlist: (activityId: string) => void;
  cancelWaitlist: (activityId: string) => void;
  checkIn: (activityId: string, userId: string) => void;
  addChatMessage: (sessionId: string, message: ChatMessage) => void;
  vote: (sessionId: string, messageId: string, optionIndex: number, userId: string) => void;
  setEquipmentPreferences: (items: EquipmentItem[]) => void;
  setFavoriteVenues: (venues: Venue[]) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateUserProfile: (user: Partial<User>) => void;
  adoptVoteTime: (activityId: string, sessionId: string, messageId: string, optionIndex: number, newTime: string) => void;
}

const initialActivities = mockActivities.map(a => ({ ...a }));
const initialChatMessages: Record<string, ChatMessage[]> = {
  c1: [...mockChatMessages],
  c2: mockChatMessages.slice(0, 3),
  c3: mockChatMessages.slice(0, 2),
};

const defaultEquipment: EquipmentItem[] = [
  { id: 'eq1', icon: '👟', name: '跑鞋' },
  { id: 'eq2', icon: '🎽', name: '运动服' },
  { id: 'eq3', icon: '🧢', name: '运动手环' },
  { id: 'eq4', icon: '🥤', name: '水杯' },
  { id: 'eq5', icon: '🧴', name: '防晒霜' },
  { id: 'eq6', icon: '📱', name: '手机臂包' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activities: initialActivities,
      currentUser: { ...currentUser },
      chatMessages: initialChatMessages,
      userVotes: {},
      equipmentPreferences: defaultEquipment,
      favoriteVenues: mockVenues.slice(0, 3),
      settings: {
        messageNotify: true,
        activityRemind: true,
        allowPrivateChat: false,
        showDistance: true,
        showActivities: true,
        allowFindMe: true,
      },
      joinedActivities: ['a1', 'a2'],
      waitlistActivities: ['a4'],
      checkedInActivities: [],
      publishedActivities: ['a6'],

      addActivity: (activity) => {
        set(state => ({
          activities: [activity, ...state.activities],
          publishedActivities: [activity.id, ...state.publishedActivities],
        }));
        console.log('[Store] 活动已添加:', activity.title);
      },

      updateActivity: (activityId, updates) => {
        set(state => ({
          activities: state.activities.map(a =>
            a.id === activityId ? { ...a, ...updates } : a
          ),
        }));
        console.log('[Store] 活动已更新:', activityId);
      },

      joinActivity: (activityId) => {
        set(state => {
          const activities = state.activities.map(a => {
            if (a.id === activityId && a.currentParticipants < a.maxParticipants) {
              return { ...a, currentParticipants: a.currentParticipants + 1 };
            }
            return a;
          });
          return {
            activities,
            joinedActivities: [...state.joinedActivities, activityId],
          };
        });
        console.log('[Store] 加入活动:', activityId);
      },

      cancelJoin: (activityId) => {
        set(state => {
          const activities = state.activities.map(a => {
            if (a.id === activityId && a.currentParticipants > 0) {
              return { ...a, currentParticipants: a.currentParticipants - 1 };
            }
            return a;
          });
          return {
            activities,
            joinedActivities: state.joinedActivities.filter(id => id !== activityId),
            checkedInActivities: state.checkedInActivities.filter(id => id !== activityId),
          };
        });
        console.log('[Store] 取消报名:', activityId);
      },

      joinWaitlist: (activityId) => {
        set(state => {
          const activities = state.activities.map(a => {
            if (a.id === activityId) {
              return { ...a, waitlistCount: (a.waitlistCount || 0) + 1 };
            }
            return a;
          });
          return {
            activities,
            waitlistActivities: [...state.waitlistActivities, activityId],
          };
        });
        console.log('[Store] 加入候补:', activityId);
      },

      cancelWaitlist: (activityId) => {
        set(state => {
          const activities = state.activities.map(a => {
            if (a.id === activityId && (a.waitlistCount || 0) > 0) {
              return { ...a, waitlistCount: (a.waitlistCount || 0) - 1 };
            }
            return a;
          });
          return {
            activities,
            waitlistActivities: state.waitlistActivities.filter(id => id !== activityId),
          };
        });
        console.log('[Store] 取消候补:', activityId);
      },

      checkIn: (activityId, userId) => {
        set(state => {
          if (state.checkedInActivities.includes(activityId)) {
            return {};
          }
          const activities = state.activities.map(a => {
            if (a.id === activityId) {
              return {
                ...a,
                checkInTimes: {
                  ...(a.checkInTimes || {}),
                  [userId]: new Date().toISOString(),
                },
              };
            }
            return a;
          });
          return {
            activities,
            checkedInActivities: [...state.checkedInActivities, activityId],
          };
        });
        console.log('[Store] 签到成功:', activityId);
      },

      addChatMessage: (sessionId, message) => {
        set(state => ({
          chatMessages: {
            ...state.chatMessages,
            [sessionId]: [...(state.chatMessages[sessionId] || []), message],
          },
        }));
        console.log('[Store] 消息已发送:', sessionId, message.type);
      },

      vote: (sessionId, messageId, optionIndex, userId) => {
        set(state => {
          const voteKey = `${messageId}_${userId}`;
          const prevVoteIndex = state.userVotes[voteKey];

          const sessionMessages = state.chatMessages[sessionId] || [];
          const newMessages = sessionMessages.map(msg => {
            if (msg.id !== messageId || !msg.voteData) return msg;

            const newResults = [...msg.voteData.results];

            if (prevVoteIndex !== undefined && prevVoteIndex !== optionIndex) {
              newResults[prevVoteIndex] = Math.max(0, newResults[prevVoteIndex] - 1);
            }

            if (prevVoteIndex !== optionIndex) {
              newResults[optionIndex] = (newResults[optionIndex] || 0) + 1;
            }

            const newUserVotes = { ...msg.voteData.userVotes };
            newUserVotes[userId] = optionIndex;

            return {
              ...msg,
              voteData: {
                ...msg.voteData,
                results: newResults,
                userVotes: newUserVotes,
              },
            };
          });

          return {
            chatMessages: {
              ...state.chatMessages,
              [sessionId]: newMessages,
            },
            userVotes: { ...state.userVotes, [voteKey]: optionIndex },
          };
        });
        console.log('[Store] 投票:', messageId, optionIndex, userId);
      },

      setEquipmentPreferences: (items) => {
        set({ equipmentPreferences: items });
        console.log('[Store] 更新装备偏好:', items.length, '项');
      },

      setFavoriteVenues: (venues) => {
        set({ favoriteVenues: venues });
        console.log('[Store] 更新常去场馆:', venues.length, '个');
      },

      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings },
        }));
        console.log('[Store] 更新设置:', newSettings);
      },

      updateUserProfile: (user) => {
        set(state => ({
          currentUser: { ...state.currentUser, ...user },
        }));
        console.log('[Store] 更新用户资料');
      },

      adoptVoteTime: (activityId, sessionId, messageId, optionIndex, newTime) => {
        set(state => {
          const activity = state.activities.find(a => a.id === activityId);
          if (!activity) return {};

          const startDate = activity.startTime.split(' ')[0];
          const newStartTime = `${startDate} ${newTime}:00`;
          
          const startMs = new Date(activity.startTime).getTime();
          const endMs = new Date(activity.endTime).getTime();
          const durationMs = endMs - startMs;
          const newStartMs = new Date(newStartTime).getTime();
          const newEndMs = newStartMs + durationMs;
          const newEndTime = new Date(newEndMs).toISOString().replace('T', ' ').slice(0, 19);

          const activities = state.activities.map(a =>
            a.id === activityId
              ? { ...a, startTime: newStartTime, endTime: newEndTime }
              : a
          );

          const sessionMessages = state.chatMessages[sessionId] || [];
          const voteMsg = sessionMessages.find(m => m.id === messageId);
          const optionText = voteMsg?.voteData?.options[optionIndex] || newTime;

          const systemMessage: ChatMessage = {
            id: `sys_${Date.now()}`,
            sessionId,
            senderId: 'system',
            senderName: '系统',
            type: 'system',
            content: `📢 投票结果已采用：${optionText}\n活动时间已更新`,
            timestamp: new Date().toISOString(),
          };

          return {
            activities,
            chatMessages: {
              ...state.chatMessages,
              [sessionId]: [...sessionMessages, systemMessage],
            },
          };
        });
        console.log('[Store] 投票时间已采用:', activityId, newTime);
      },
    }),
    {
      name: 'sport-buddy-storage',
      partialize: (state) => ({
        activities: state.activities,
        currentUser: state.currentUser,
        chatMessages: state.chatMessages,
        userVotes: state.userVotes,
        equipmentPreferences: state.equipmentPreferences,
        favoriteVenues: state.favoriteVenues,
        settings: state.settings,
        joinedActivities: state.joinedActivities,
        waitlistActivities: state.waitlistActivities,
        checkedInActivities: state.checkedInActivities,
        publishedActivities: state.publishedActivities,
      }),
    }
  )
);

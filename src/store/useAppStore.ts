import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Activity, ChatMessage, ChatSession, EquipmentItem, Venue, User } from '@/types';
import { mockActivities, mockChatMessages, mockChatSessions, mockVenues, currentUser, mockUsers } from '@/data/mockData';

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
  chatSessions: ChatSession[];
  chatMessages: Record<string, ChatMessage[]>;
  userVotes: Record<string, number>;
  equipmentPreferences: EquipmentItem[];
  favoriteVenues: Venue[];
  settings: AppSettings;
  joinedActivities: string[];
  waitlistActivities: string[];
  checkedInActivities: string[];
  paidActivities: string[];
  publishedActivities: string[];
  targetActivityChatId: string | null;

  addActivity: (activity: Activity) => void;
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  joinActivity: (activityId: string) => void;
  cancelJoin: (activityId: string) => void;
  joinWaitlist: (activityId: string) => void;
  cancelWaitlist: (activityId: string) => void;
  checkIn: (activityId: string, userId: string) => void;
  payAA: (activityId: string, userId: string) => void;
  addChatSession: (session: ChatSession) => void;
  addChatMessage: (sessionId: string, message: ChatMessage) => void;
  vote: (sessionId: string, messageId: string, optionIndex: number, userId: string) => void;
  setEquipmentPreferences: (items: EquipmentItem[]) => void;
  setFavoriteVenues: (venues: Venue[]) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateUserProfile: (user: Partial<User>) => void;
  adoptVoteTime: (activityId: string, sessionId: string, messageId: string, optionIndex: number, newDateTime: string) => void;
  setTargetActivityChat: (activityId: string | null) => void;
}

const initialActivities = mockActivities.map(a => ({ ...a }));
const initialChatSessions = mockChatSessions.map(s => ({ ...s }));
const initialChatMessages: Record<string, ChatMessage[]> = {
  c1: [...mockChatMessages],
  c2: mockChatMessages.slice(0, 3),
  c3: mockChatMessages.slice(0, 2),
  c4: [
    {
      id: 'm_c4_1',
      sessionId: 'c4',
      senderId: 'system',
      senderName: '系统',
      type: 'system',
      content: '🎉 「周末篮球3v3，找人组队」活动群已创建',
      timestamp: '2026-06-03 20:00:00',
    },
    {
      id: 'm_c4_2',
      sessionId: 'c4',
      senderId: 'u5',
      senderName: '篮球少年',
      senderAvatar: 'https://picsum.photos/id/1027/200/200',
      type: 'text',
      content: '周日见，记得穿球鞋',
      timestamp: '2026-06-07 10:00:00',
    },
  ],
  c5: [
    {
      id: 'm_c5_1',
      sessionId: 'c5',
      senderId: 'system',
      senderName: '系统',
      type: 'system',
      content: '🎉 「瑜伽体验课 - 减压放松」活动群已创建',
      timestamp: '2026-06-05 11:00:00',
    },
    {
      id: 'm_c5_2',
      sessionId: 'c5',
      senderId: 'u6',
      senderName: '瑜伽小姐姐',
      senderAvatar: 'https://picsum.photos/id/1025/200/200',
      type: 'text',
      content: '周六上午10点见~',
      timestamp: '2026-06-06 16:00:00',
    },
  ],
  c6: [
    {
      id: 'm_c6_1',
      sessionId: 'c6',
      senderId: 'system',
      senderName: '系统',
      type: 'system',
      content: '🎉 「晨跑打卡 - 朝阳公园」活动群已创建',
      timestamp: '2026-06-02 08:00:00',
    },
    {
      id: 'm_c6_2',
      sessionId: 'c6',
      senderId: 'u1',
      senderName: '运动达人小李',
      senderAvatar: 'https://picsum.photos/id/64/200/200',
      type: 'text',
      content: '明天早上6点半集合',
      timestamp: '2026-06-07 21:00:00',
    },
  ],
  c7: [
    {
      id: 'm_c7_1',
      sessionId: 'c7',
      senderId: 'system',
      senderName: '系统',
      type: 'system',
      content: '🎉 「室内游泳 - 找搭子」活动群已创建',
      timestamp: '2026-06-04 16:00:00',
    },
    {
      id: 'm_c7_2',
      sessionId: 'c7',
      senderId: 'u2',
      senderName: '跑步女神Amy',
      senderAvatar: 'https://picsum.photos/id/91/200/200',
      type: 'text',
      content: '这周六一起去吗？',
      timestamp: '2026-06-05 14:00:00',
    },
  ],
  p1: mockChatMessages.slice(0, 2),
  p2: mockChatMessages.slice(0, 1),
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
      chatSessions: initialChatSessions,
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
      paidActivities: [],
      publishedActivities: ['a6'],
      targetActivityChatId: null,

      addActivity: (activity) => {
        const groupChatId = `gc_${activity.id}`;
        const newSession: ChatSession = {
          id: groupChatId,
          type: 'activity',
          title: activity.title,
          lastMessage: '群聊已创建，快来聊聊吧~',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          activityId: activity.id,
          members: [activity.organizer],
        };

        const systemMessage: ChatMessage = {
          id: `sys_${Date.now()}`,
          sessionId: groupChatId,
          senderId: 'system',
          senderName: '系统',
          type: 'system',
          content: `🎉 「${activity.title}」活动群已创建`,
          timestamp: new Date().toISOString(),
        };

        const activityWithGroup = { ...activity, groupChatId };

        set(state => ({
          activities: [activityWithGroup, ...state.activities],
          publishedActivities: [activity.id, ...state.publishedActivities],
          chatSessions: [newSession, ...state.chatSessions],
          chatMessages: {
            ...state.chatMessages,
            [groupChatId]: [systemMessage],
          },
        }));
        console.log('[Store] 活动已添加，群已创建:', activity.title);
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
          const user = state.currentUser;
          const activities = state.activities.map(a => {
            if (a.id === activityId && a.currentParticipants < a.maxParticipants) {
              const participants = [...(a.participants || []), user];
              return { 
                ...a, 
                currentParticipants: a.currentParticipants + 1,
                participants,
              };
            }
            return a;
          });

          const activity = activities.find(a => a.id === activityId);
          const chatSessions = state.chatSessions.map(s => {
            if (s.activityId === activityId) {
              const members = [...(s.members || []), user];
              return { ...s, members };
            }
            return s;
          });

          return {
            activities,
            chatSessions,
            joinedActivities: [...state.joinedActivities, activityId],
          };
        });
        console.log('[Store] 加入活动:', activityId);
      },

      cancelJoin: (activityId) => {
        set(state => {
          const user = state.currentUser;
          let promotedUser: User | null = null;

          const activities = state.activities.map(a => {
            if (a.id === activityId && a.currentParticipants > 0) {
              const waitlistUsers = a.waitlistUsers || [];
              const participants = (a.participants || []).filter(p => p.id !== user.id);
              
              let newParticipants = participants;
              let newWaitlistUsers = waitlistUsers;
              let newWaitlistCount = a.waitlistCount;

              if (waitlistUsers.length > 0) {
                promotedUser = waitlistUsers[0];
                newParticipants = [...participants, promotedUser];
                newWaitlistUsers = waitlistUsers.slice(1);
                newWaitlistCount = Math.max(0, a.waitlistCount - 1);
              }

              return { 
                ...a, 
                currentParticipants: newParticipants.length,
                participants: newParticipants,
                waitlistUsers: newWaitlistUsers,
                waitlistCount: newWaitlistCount,
              };
            }
            return a;
          });

          let waitlistActivities = state.waitlistActivities;
          let joinedActivities = state.joinedActivities.filter(id => id !== activityId);

          if (promotedUser && promotedUser.id === user.id) {
            // 不应该发生，因为是取消报名的人不是候补中第一位
          }

          if (promotedUser) {
            const promotedUserId = promotedUser.id;
            if (promotedUserId === state.currentUser.id) {
              waitlistActivities = waitlistActivities.filter(id => id !== activityId);
              joinedActivities = [...joinedActivities, activityId];
            }
          }

          const checkedInActivities = state.checkedInActivities.filter(id => id !== activityId);

          return {
            activities,
            joinedActivities,
            waitlistActivities,
            checkedInActivities,
          };
        });
        console.log('[Store] 取消报名:', activityId);
      },

      joinWaitlist: (activityId) => {
        set(state => {
          const user = state.currentUser;
          const activities = state.activities.map(a => {
            if (a.id === activityId) {
              const waitlistUsers = [...(a.waitlistUsers || []), user];
              return { 
                ...a, 
                waitlistCount: (a.waitlistCount || 0) + 1,
                waitlistUsers,
              };
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
          const user = state.currentUser;
          const activities = state.activities.map(a => {
            if (a.id === activityId && (a.waitlistCount || 0) > 0) {
              const waitlistUsers = (a.waitlistUsers || []).filter(u => u.id !== user.id);
              return { 
                ...a, 
                waitlistCount: Math.max(0, (a.waitlistCount || 0) - 1),
                waitlistUsers,
              };
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

      payAA: (activityId, userId) => {
        set(state => {
          if (state.paidActivities.includes(activityId)) {
            return {};
          }
          const activities = state.activities.map(a => {
            if (a.id === activityId) {
              const paidUserIds = [...(a.paidUserIds || []), userId];
              return { ...a, paidUserIds };
            }
            return a;
          });
          return {
            activities,
            paidActivities: [...state.paidActivities, activityId],
          };
        });
        console.log('[Store] AA付款成功:', activityId);
      },

      addChatSession: (session) => {
        set(state => ({
          chatSessions: [session, ...state.chatSessions],
        }));
      },

      addChatMessage: (sessionId, message) => {
        set(state => {
          const chatSessions = state.chatSessions.map(s => {
            if (s.id === sessionId) {
              return {
                ...s,
                lastMessage: message.type === 'text' ? message.content : `[${message.type === 'vote' ? '投票' : message.type === 'image' ? '图片' : '消息'}]`,
                lastMessageTime: message.timestamp,
                unreadCount: s.unreadCount + 1,
              };
            }
            return s;
          });

          return {
            chatSessions,
            chatMessages: {
              ...state.chatMessages,
              [sessionId]: [...(state.chatMessages[sessionId] || []), message],
            },
          };
        });
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

      adoptVoteTime: (activityId, sessionId, messageId, optionIndex, newDateTime) => {
        set(state => {
          const activity = state.activities.find(a => a.id === activityId);
          if (!activity) return {};

          const startMs = new Date(activity.startTime).getTime();
          const endMs = new Date(activity.endTime).getTime();
          const durationMs = endMs - startMs;
          
          let newStartMs: number;
          try {
            newStartMs = new Date(newDateTime).getTime();
            if (isNaN(newStartMs)) {
              throw new Error('Invalid date');
            }
          } catch {
            const timeMatch = newDateTime.match(/(\d{1,2}):(\d{2})/);
            if (timeMatch) {
              const today = new Date();
              today.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
              newStartMs = today.getTime();
            } else {
              return {};
            }
          }

          const newEndMs = newStartMs + durationMs;
          const newStartTime = new Date(newStartMs).toISOString().replace('T', ' ').slice(0, 19);
          const newEndTime = new Date(newEndMs).toISOString().replace('T', ' ').slice(0, 19);

          const activities = state.activities.map(a =>
            a.id === activityId
              ? { ...a, startTime: newStartTime, endTime: newEndTime }
              : a
          );

          const sessionMessages = state.chatMessages[sessionId] || [];
          const voteMsg = sessionMessages.find(m => m.id === messageId);
          const optionText = voteMsg?.voteData?.options[optionIndex] || newDateTime;

          const systemMessage: ChatMessage = {
            id: `sys_${Date.now()}`,
            sessionId,
            senderId: 'system',
            senderName: '系统',
            type: 'system',
            content: `📢 投票结果已采用：${optionText}\n活动时间已更新为 ${newStartTime.slice(5, 16)}`,
            timestamp: new Date().toISOString(),
          };

          const chatSessions = state.chatSessions.map(s => {
            if (s.id === sessionId) {
              return {
                ...s,
                lastMessage: `活动时间已更新：${optionText}`,
                lastMessageTime: systemMessage.timestamp,
              };
            }
            return s;
          });

          return {
            activities,
            chatSessions,
            chatMessages: {
              ...state.chatMessages,
              [sessionId]: [...sessionMessages, systemMessage],
            },
          };
        });
        console.log('[Store] 投票时间已采用:', activityId, newDateTime);
      },

      setTargetActivityChat: (activityId) => {
        set({ targetActivityChatId: activityId });
        console.log('[Store] 设置目标活动群聊:', activityId);
      },
    }),
    {
      name: 'sport-buddy-storage',
      partialize: (state) => ({
        activities: state.activities,
        currentUser: state.currentUser,
        chatSessions: state.chatSessions,
        chatMessages: state.chatMessages,
        userVotes: state.userVotes,
        equipmentPreferences: state.equipmentPreferences,
        favoriteVenues: state.favoriteVenues,
        settings: state.settings,
        joinedActivities: state.joinedActivities,
        waitlistActivities: state.waitlistActivities,
        checkedInActivities: state.checkedInActivities,
        paidActivities: state.paidActivities,
        publishedActivities: state.publishedActivities,
      }),
    }
  )
);

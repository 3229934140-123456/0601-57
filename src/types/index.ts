// 运动类型
export type SportType = 'run' | 'badminton' | 'cycling' | 'basketball' | 'swim' | 'yoga' | 'football' | 'tennis';

// 运动水平
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';

// 活动状态
export type ActivityStatus = 'recruiting' | 'full' | 'ongoing' | 'completed' | 'cancelled';

// 用户信息
export interface User {
  id: string;
  nickname: string;
  avatar: string;
  gender: 'male' | 'female';
  age: number;
  creditScore: number;
  keepPromiseRate: number;
  signature?: string;
  location?: string;
}

// 路线点位
export interface RoutePoint {
  id: string;
  name: string;
  type: 'start' | 'waypoint' | 'end';
  latitude?: number;
  longitude?: number;
  order: number;
}

// 活动信息
export interface Activity {
  id: string;
  title: string;
  sportType: SportType;
  skillLevel: SkillLevel;
  description: string;
  organizer: User;
  location: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentParticipants: number;
  waitlistCount: number;
  fee: number;
  feeType: 'aa' | 'free' | 'sponsor';
  distance?: number;
  status: ActivityStatus;
  routeInfo?: {
    distance: number;
    duration: string;
    waypoints?: string[];
    points?: RoutePoint[];
  };
  weather?: {
    temperature: number;
    condition: string;
    icon: string;
  };
  participants?: User[];
  waitlist?: User[];
  checkInTimes?: Record<string, string>;
  createdAt: string;
}

// 聊天会话
export interface ChatSession {
  id: string;
  type: 'activity' | 'private';
  title: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  activityId?: string;
  targetUserId?: string;
  members?: User[];
}

// 聊天消息
export interface ChatMessage {
  id: string;
  sessionId?: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  type: 'text' | 'image' | 'location' | 'vote' | 'system';
  content: string;
  timestamp: string;
  voteOptions?: string[];
  voteResults?: number[];
  voteData?: VoteData;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

// 投票数据
export interface VoteData {
  title: string;
  options: string[];
  results: number[];
  userVotes: Record<string, number>;
  creatorId: string;
  creatorName: string;
}

// 投票活动
export interface VotePoll {
  id: string;
  title: string;
  options: string[];
  results: number[];
  endTime: string;
  isMultiSelect: boolean;
  isAnonymous: boolean;
}

// 评价
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  content: string;
  activityTitle: string;
  createdAt: string;
}

// 黑名单用户
export interface BlacklistUser {
  id: string;
  user: User;
  reason: string;
  addedAt: string;
}

// AA记录
export interface AARecord {
  id: string;
  activityId: string;
  activityTitle: string;
  totalAmount: number;
  perPerson: number;
  participants: {
    userId: string;
    userName: string;
    userAvatar: string;
    hasPaid: boolean;
  }[];
  createdAt: string;
}

// 装备偏好
export interface EquipmentPreference {
  sportType: SportType;
  items: string[];
}

// 装备项
export interface EquipmentItem {
  id: string;
  icon: string;
  name: string;
}

// 场馆
export interface Venue {
  id: string;
  name: string;
  address: string;
  sportTypes: SportType[];
  distance?: number;
}

// 运动类型配置
export interface SportTypeConfig {
  key: SportType;
  label: string;
  icon: string;
  color: string;
}

// 运动水平配置
export interface SkillLevelConfig {
  key: SkillLevel;
  label: string;
  description: string;
}

// 筛选条件
export interface FilterOptions {
  sportTypes: SportType[];
  skillLevels: SkillLevel[];
  distance: number;
  date?: string;
}

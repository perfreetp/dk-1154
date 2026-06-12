export interface Project {
  id: string;
  title: string;
  description: string;
  stage: 'idea' | 'mvp' | 'growth' | 'scale';
  roles: Role[];
  college: string;
  tags: string[];
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  status: 'active' | 'hidden' | 'expired';
  isCollected: boolean;
  createdAt: string;
  expiredAt: string;
  viewCount: number;
  applyCount: number;
}

export interface Role {
  name: string;
  required: number;
  current: number;
}

export interface FilterOptions {
  college: string;
  stage: string;
  tags: string[];
  keyword: string;
}

export const STAGE_OPTIONS = [
  { label: '全部阶段', value: '' },
  { label: '创意阶段', value: 'idea' },
  { label: 'MVP阶段', value: 'mvp' },
  { label: '成长期', value: 'growth' },
  { label: '规模化', value: 'scale' }
];

export const COLLEGE_OPTIONS = [
  '计算机学院',
  '软件学院',
  '信息学院',
  '商学院',
  '设计学院',
  '机械学院',
  '外语学院',
  '其他'
];

export const SKILL_TAGS = [
  '前端开发',
  '后端开发',
  '移动开发',
  'UI设计',
  '产品经理',
  '运营推广',
  '数据分析',
  '人工智能',
  '区块链',
  '嵌入式'
];

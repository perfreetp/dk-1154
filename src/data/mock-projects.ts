import { Project } from '../types/project';

export const mockProjects: Project[] = [
  {
    id: '1',
    title: '校园二手交易小程序',
    description: '打造一个便捷的校园二手交易平台，帮助同学们快速买卖闲置物品。',
    stage: 'idea',
    roles: [
      { name: '前端开发', required: 2, current: 1 },
      { name: '后端开发', required: 1, current: 0 }
    ],
    college: '计算机学院',
    tags: ['前端开发', '后端开发', '移动开发'],
    creatorId: 'user1',
    creatorName: '张三',
    creatorAvatar: 'https://picsum.photos/id/64/200/200',
    status: 'active',
    isCollected: false,
    createdAt: '2024-01-15',
    expiredAt: '2024-02-15',
    viewCount: 156,
    applyCount: 8
  },
  {
    id: '2',
    title: 'AI智能简历优化助手',
    description: '利用AI技术帮助学生优化简历，提高求职成功率。',
    stage: 'mvp',
    roles: [
      { name: '前端开发', required: 1, current: 1 },
      { name: 'UI设计', required: 1, current: 0 },
      { name: '产品经理', required: 1, current: 1 }
    ],
    college: '软件学院',
    tags: ['人工智能', '前端开发', 'UI设计'],
    creatorId: 'user2',
    creatorName: '李四',
    creatorAvatar: 'https://picsum.photos/id/91/200/200',
    status: 'active',
    isCollected: true,
    createdAt: '2024-01-10',
    expiredAt: '2024-02-10',
    viewCount: 234,
    applyCount: 12
  },
  {
    id: '3',
    title: '校园活动社交平台',
    description: '连接校园活动组织者和参与者，提升校园活动参与度。',
    stage: 'growth',
    roles: [
      { name: '后端开发', required: 2, current: 1 },
      { name: '运营推广', required: 1, current: 0 }
    ],
    college: '商学院',
    tags: ['后端开发', '运营推广', '数据分析'],
    creatorId: 'user3',
    creatorName: '王五',
    creatorAvatar: 'https://picsum.photos/id/177/200/200',
    status: 'active',
    isCollected: false,
    createdAt: '2024-01-08',
    expiredAt: '2024-02-08',
    viewCount: 189,
    applyCount: 6
  },
  {
    id: '4',
    title: '大学生时间管理工具',
    description: '帮助大学生合理规划学习和生活时间，提高效率。',
    stage: 'idea',
    roles: [
      { name: '前端开发', required: 1, current: 0 },
      { name: '产品经理', required: 1, current: 1 }
    ],
    college: '信息学院',
    tags: ['前端开发', '产品经理'],
    creatorId: 'user4',
    creatorName: '赵六',
    creatorAvatar: 'https://picsum.photos/id/338/200/200',
    status: 'active',
    isCollected: false,
    createdAt: '2024-01-12',
    expiredAt: '2024-02-12',
    viewCount: 98,
    applyCount: 3
  },
  {
    id: '5',
    title: '区块链学分认证系统',
    description: '使用区块链技术实现学生学分的不可篡改认证。',
    stage: 'scale',
    roles: [
      { name: '后端开发', required: 2, current: 2 },
      { name: '区块链', required: 1, current: 0 }
    ],
    college: '计算机学院',
    tags: ['区块链', '后端开发'],
    creatorId: 'user5',
    creatorName: '孙七',
    creatorAvatar: 'https://picsum.photos/id/1027/200/200',
    status: 'active',
    isCollected: true,
    createdAt: '2024-01-05',
    expiredAt: '2024-02-05',
    viewCount: 312,
    applyCount: 15
  },
  {
    id: '6',
    title: '校园外卖配送平台',
    description: '连接校园周边餐饮商家和大学生，提供快速配送服务。',
    stage: 'mvp',
    roles: [
      { name: '前端开发', required: 1, current: 1 },
      { name: '后端开发', required: 1, current: 1 },
      { name: '运营推广', required: 2, current: 1 }
    ],
    college: '商学院',
    tags: ['前端开发', '后端开发', '运营推广'],
    creatorId: 'user6',
    creatorName: '周八',
    creatorAvatar: 'https://picsum.photos/id/1/200/200',
    status: 'active',
    isCollected: false,
    createdAt: '2024-01-14',
    expiredAt: '2024-02-14',
    viewCount: 267,
    applyCount: 9
  },
  {
    id: '7',
    title: '智能学习助手App',
    description: '基于大数据分析，为学生提供个性化的学习建议。',
    stage: 'idea',
    roles: [
      { name: '前端开发', required: 1, current: 0 },
      { name: '数据分析', required: 1, current: 0 }
    ],
    college: '计算机学院',
    tags: ['数据分析', '前端开发', '人工智能'],
    creatorId: 'user7',
    creatorName: '吴九',
    creatorAvatar: 'https://picsum.photos/id/3/200/200',
    status: 'active',
    isCollected: false,
    createdAt: '2024-01-16',
    expiredAt: '2024-02-16',
    viewCount: 145,
    applyCount: 5
  },
  {
    id: '8',
    title: '校园公益活动平台',
    description: '整合校园公益活动资源，促进学生参与志愿服务。',
    stage: 'growth',
    roles: [
      { name: '产品经理', required: 1, current: 1 },
      { name: 'UI设计', required: 1, current: 0 }
    ],
    college: '设计学院',
    tags: ['产品经理', 'UI设计', '运营推广'],
    creatorId: 'user8',
    creatorName: '郑十',
    creatorAvatar: 'https://picsum.photos/id/8/200/200',
    status: 'active',
    isCollected: false,
    createdAt: '2024-01-11',
    expiredAt: '2024-02-11',
    viewCount: 203,
    applyCount: 7
  }
];

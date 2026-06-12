import { User, Work } from '../types/user';

export const mockUsers: User[] = [
  {
    id: 'user1',
    name: '张三',
    avatar: 'https://picsum.photos/id/64/200/200',
    college: '计算机学院',
    major: '软件工程',
    grade: '大三',
    skills: ['前端开发', 'React', 'Vue', 'TypeScript'],
    bio: '热爱前端技术，喜欢折腾各种新框架，希望找到志同道合的伙伴一起做项目。',
    availableHours: 15,
    works: [
      {
        id: 'work1',
        title: '个人博客系统',
        url: 'https://example.com/blog',
        description: '使用React开发的个人技术博客',
        coverImage: 'https://picsum.photos/id/1/300/300'
      }
    ],
    rating: 4.8,
    reviewCount: 12,
    isFollowing: false
  },
  {
    id: 'user2',
    name: '李四',
    avatar: 'https://picsum.photos/id/91/200/200',
    college: '软件学院',
    major: '计算机科学与技术',
    grade: '大四',
    skills: ['产品经理', '数据分析', 'Axure', '用户研究'],
    bio: '有3段实习经验，擅长产品规划和需求分析，正在寻找创业机会。',
    availableHours: 20,
    works: [
      {
        id: 'work2',
        title: '校园外卖APP产品文档',
        url: 'https://example.com/doc',
        description: '完整的APP产品需求文档和原型设计',
        coverImage: 'https://picsum.photos/id/2/300/300'
      }
    ],
    rating: 4.6,
    reviewCount: 8,
    isFollowing: true
  },
  {
    id: 'user3',
    name: '王五',
    avatar: 'https://picsum.photos/id/177/200/200',
    college: '商学院',
    major: '工商管理',
    grade: '研二',
    skills: ['运营推广', '市场营销', '内容运营'],
    bio: '有丰富的校园活动组织经验，擅长用户增长和活动运营。',
    availableHours: 12,
    works: [],
    rating: 4.9,
    reviewCount: 15,
    isFollowing: false
  },
  {
    id: 'user4',
    name: '赵六',
    avatar: 'https://picsum.photos/id/338/200/200',
    college: '设计学院',
    major: '视觉传达设计',
    grade: '大三',
    skills: ['UI设计', 'Figma', 'Sketch', '交互设计'],
    bio: '追求完美的设计细节，对用户体验有深入的理解。',
    availableHours: 18,
    works: [
      {
        id: 'work3',
        title: '校园服务小程序UI设计',
        url: 'https://example.com/ui',
        description: '完整的UI设计稿和交互原型',
        coverImage: 'https://picsum.photos/id/3/300/300'
      }
    ],
    rating: 4.7,
    reviewCount: 10,
    isFollowing: false
  },
  {
    id: 'user5',
    name: '孙七',
    avatar: 'https://picsum.photos/id/1027/200/200',
    college: '计算机学院',
    major: '信息安全',
    grade: '研一',
    skills: ['后端开发', '区块链', 'Node.js', 'Go'],
    bio: '专注于区块链技术研究，有智能合约开发经验。',
    availableHours: 25,
    works: [
      {
        id: 'work4',
        title: '以太坊智能合约项目',
        url: 'https://example.com/contract',
        description: '基于以太坊的投票智能合约',
        coverImage: 'https://picsum.photos/id/8/300/300'
      }
    ],
    rating: 4.5,
    reviewCount: 6,
    isFollowing: true
  }
];

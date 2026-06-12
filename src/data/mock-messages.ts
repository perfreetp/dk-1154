import { Message } from '../types/message';

export const mockMessages: Message[] = [
  {
    id: 'msg1',
    type: 'invite',
    title: '组队邀请',
    content: '李四 邀请你加入"AI智能简历优化助手"项目',
    fromUserId: 'user2',
    fromUserName: '李四',
    fromUserAvatar: 'https://picsum.photos/id/91/200/200',
    toUserId: 'currentUser',
    isRead: false,
    createdAt: '2024-01-15 14:30',
    data: {
      projectId: '2',
      projectTitle: 'AI智能简历优化助手'
    }
  },
  {
    id: 'msg2',
    type: 'system',
    content: '你的项目"校园二手交易小程序"已通过审核',
    toUserId: 'currentUser',
    isRead: true,
    createdAt: '2024-01-15 10:20'
  },
  {
    id: 'msg3',
    type: 'invite',
    title: '组队邀请',
    content: '王五 邀请你加入"校园活动社交平台"项目',
    fromUserId: 'user3',
    fromUserName: '王五',
    fromUserAvatar: 'https://picsum.photos/id/177/200/200',
    toUserId: 'currentUser',
    isRead: false,
    createdAt: '2024-01-14 16:45',
    data: {
      projectId: '3',
      projectTitle: '校园活动社交平台'
    }
  },
  {
    id: 'msg4',
    type: 'chat',
    title: '孙七',
    content: '你好，我对你们的项目很感兴趣，方便聊聊吗？',
    fromUserId: 'user5',
    fromUserName: '孙七',
    fromUserAvatar: 'https://picsum.photos/id/1027/200/200',
    toUserId: 'currentUser',
    isRead: true,
    createdAt: '2024-01-14 11:20'
  }
];

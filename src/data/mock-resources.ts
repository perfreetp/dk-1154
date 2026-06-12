import { Resource } from '../types/resource';

export const mockResources: Resource[] = [
  {
    id: '1',
    type: 'roadshow',
    title: '创新创业路演日',
    description: '每月一次的项目路演活动，展示优秀创业项目',
    location: '大学生活动中心报告厅',
    startTime: '2024-02-20 14:00',
    endTime: '2024-02-20 18:00',
    organizer: '创新创业学院',
    isBooked: false,
    capacity: 200,
    bookedCount: 156
  },
  {
    id: '2',
    type: 'workspace',
    title: '创业工位开放日',
    description: '创业孵化基地工位开放参观',
    location: '科技园A栋3楼',
    startTime: '2024-02-18 09:00',
    endTime: '2024-02-18 17:00',
    organizer: '科技园管理办公室',
    isBooked: true,
    capacity: 30,
    bookedCount: 30
  },
  {
    id: '3',
    type: 'activity',
    title: '创业沙龙：产品从0到1',
    description: '邀请成功创业者分享产品开发经验',
    location: '图书馆报告厅',
    startTime: '2024-02-25 19:00',
    endTime: '2024-02-25 21:00',
    organizer: '学生会创业部',
    isBooked: false,
    capacity: 100,
    bookedCount: 67
  },
  {
    id: '4',
    type: 'roadshow',
    title: '互联网+大赛校内选拔赛',
    description: '选拔优秀项目参加省赛',
    location: '学术交流中心',
    startTime: '2024-03-05 08:30',
    endTime: '2024-03-05 17:00',
    organizer: '教务处',
    isBooked: false,
    capacity: 300,
    bookedCount: 234
  },
  {
    id: '5',
    type: 'workspace',
    title: '创业工位预约',
    description: '孵化基地共享工位预约使用',
    location: '科技园B栋2楼',
    startTime: '2024-02-15 08:00',
    endTime: '2024-02-15 22:00',
    organizer: '孵化器管理方',
    isBooked: false,
    capacity: 50,
    bookedCount: 38
  }
];

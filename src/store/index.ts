import Taro from '@tarojs/taro';
import { Project } from '../types/project';
import { Message, ChatMessage } from '../types/message';
import { mockProjects } from '../data/mock-projects';
import { mockMessages } from '../data/mock-messages';
import { mockUsers } from '../data/mock-users';

const STORAGE_KEYS = {
  PROJECTS: 'user_projects',
  MESSAGES: 'user_messages',
  CHAT_MESSAGES: 'chat_messages',
  CANDIDATE_STATUS: 'candidate_status',
  CURRENT_USER: 'current_user',
  APPLICATIONS: 'project_applications',
  MEETINGS: 'project_meetings'
};

export interface Meeting {
  id: string;
  projectId: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar: string;
  meetTime: string;
  location?: string;
  topic?: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export type CandidateStatus = 'uncontacted' | 'preliminary' | 'deep' | 'teamed';
export type CandidateSource = 'application' | 'invitation';

export interface Application {
  id: string;
  projectId: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar: string;
  applicantCollege: string;
  applyTime: string;
  status: CandidateStatus;
  message?: string;
  source?: CandidateSource;
  note?: string;
  intendedRole?: string;
  nextMeetTime?: string;
}

export interface CandidateStatusRecord {
  projectId: string;
  candidateId: string;
  status: CandidateStatus;
  updatedAt: string;
}

class Store {
  private currentUserId = 'currentUser';

  async init(): Promise<void> {
    const hasProjects = await this.getProjects();
    if (!hasProjects || hasProjects.length === 0) {
      await this.saveProjects(mockProjects);
      const myProjects = hasProjects || mockProjects;
      for (const project of myProjects) {
        if (project.creatorId === this.currentUserId) {
          const existingApps = await this.getApplications(project.id);
          if (existingApps.length === 0) {
            const sampleApplications: Application[] = [
              {
                id: this.generateId(),
                projectId: project.id,
                applicantId: 'user2',
                applicantName: '李四',
                applicantAvatar: 'https://picsum.photos/id/91/200/200',
                applicantCollege: '软件学院',
                applyTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'preliminary'
              },
              {
                id: this.generateId(),
                projectId: project.id,
                applicantId: 'user3',
                applicantName: '王五',
                applicantAvatar: 'https://picsum.photos/id/177/200/200',
                applicantCollege: '商学院',
                applyTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'uncontacted'
              },
              {
                id: this.generateId(),
                projectId: project.id,
                applicantId: 'user4',
                applicantName: '赵六',
                applicantAvatar: 'https://picsum.photos/id/338/200/200',
                applicantCollege: '设计学院',
                applyTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'deep'
              }
            ];
            await this.saveApplications(project.id, sampleApplications);
          }
        }
      }
    }

    const hasMessages = await this.getMessages();
    if (!hasMessages || hasMessages.length === 0) {
      await this.saveMessages(mockMessages);
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      const res = await Taro.getStorage({ key: STORAGE_KEYS.PROJECTS });
      return res.data || [];
    } catch {
      return [];
    }
  }

  async saveProjects(projects: Project[]): Promise<void> {
    await Taro.setStorage({ key: STORAGE_KEYS.PROJECTS, data: projects });
  }

  async addProject(project: Project): Promise<void> {
    const projects = await this.getProjects();
    projects.unshift(project);
    await this.saveProjects(projects);
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    const projects = await this.getProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates };
      await this.saveProjects(projects);
    }
  }

  async hideProject(projectId: string): Promise<void> {
    await this.updateProject(projectId, { status: 'hidden' });
  }

  async showProject(projectId: string): Promise<void> {
    await this.updateProject(projectId, { status: 'active' });
  }

  async getMyProjects(): Promise<Project[]> {
    const projects = await this.getProjects();
    return projects.filter(p => p.creatorId === this.currentUserId);
  }

  async getActiveProjects(): Promise<Project[]> {
    const projects = await this.getProjects();
    const now = new Date();
    return projects.filter(p => {
      if (p.status === 'hidden') return false;
      if (p.status === 'expired') return false;
      if (p.expiredAt) {
        const expiredAt = new Date(p.expiredAt);
        if (expiredAt < now) return false;
      }
      return true;
    });
  }

  async checkExpiredProjects(): Promise<void> {
    const projects = await this.getProjects();
    const now = new Date();
    let hasUpdate = false;
    const updatedProjects = projects.map(p => {
      if (p.status === 'active' && p.expiredAt) {
        const expiredAt = new Date(p.expiredAt);
        if (expiredAt < now) {
          hasUpdate = true;
          return { ...p, status: 'expired' as const };
        }
      }
      return p;
    });
    if (hasUpdate) {
      await this.saveProjects(updatedProjects);
    }
  }

  async getMessages(): Promise<Message[]> {
    try {
      const res = await Taro.getStorage({ key: STORAGE_KEYS.MESSAGES });
      return res.data || [];
    } catch {
      return [];
    }
  }

  async saveMessages(messages: Message[]): Promise<void> {
    await Taro.setStorage({ key: STORAGE_KEYS.MESSAGES, data: messages });
  }

  async addMessage(message: Message): Promise<void> {
    const messages = await this.getMessages();
    messages.unshift(message);
    await this.saveMessages(messages);
  }

  async markMessageRead(messageId: string): Promise<void> {
    const messages = await this.getMessages();
    const index = messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      messages[index] = { ...messages[index], isRead: true };
      await this.saveMessages(messages);
    }
  }

  async getChatMessages(projectId: string, candidateId: string): Promise<ChatMessage[]> {
    try {
      const res = await Taro.getStorage({ key: `${STORAGE_KEYS.CHAT_MESSAGES}_${projectId}_${candidateId}` });
      return res.data || [];
    } catch {
      return [];
    }
  }

  async addChatMessage(message: ChatMessage): Promise<void> {
    const key = `${STORAGE_KEYS.CHAT_MESSAGES}_${message.fromUserId}_${message.toUserId}`;
    const messages = await this.getChatMessages(message.fromUserId, message.toUserId);
    messages.push(message);
    await Taro.setStorage({ key, data: messages });
  }

  async getCandidateStatuses(projectId: string): Promise<CandidateStatusRecord[]> {
    try {
      const res = await Taro.getStorage({ key: `${STORAGE_KEYS.CANDIDATE_STATUS}_${projectId}` });
      return res.data || [];
    } catch {
      return [];
    }
  }

  async updateCandidateStatus(
    projectId: string,
    candidateId: string,
    status: CandidateStatus
  ): Promise<void> {
    const statuses = await this.getCandidateStatuses(projectId);
    const index = statuses.findIndex(s => s.candidateId === candidateId);
    const record: CandidateStatusRecord = {
      projectId,
      candidateId,
      status,
      updatedAt: new Date().toISOString()
    };
    if (index !== -1) {
      statuses[index] = record;
    } else {
      statuses.push(record);
    }
    await Taro.setStorage({
      key: `${STORAGE_KEYS.CANDIDATE_STATUS}_${projectId}`,
      data: statuses
    });
  }

  async getCandidateStatus(projectId: string, candidateId: string): Promise<CandidateStatus> {
    const statuses = await this.getCandidateStatuses(projectId);
    const record = statuses.find(s => s.candidateId === candidateId);
    return record?.status || 'uncontacted';
  }

  async extendProjectExpiry(projectId: string, days: number): Promise<void> {
    const project = (await this.getProjects()).find(p => p.id === projectId);
    if (project) {
      const newExpiredAt = new Date();
      newExpiredAt.setDate(newExpiredAt.getDate() + days);
      await this.updateProject(projectId, {
        expiredAt: newExpiredAt.toISOString().split('T')[0],
        status: 'active'
      });
    }
  }

  async getApplications(projectId: string): Promise<Application[]> {
    try {
      const res = await Taro.getStorage({ key: `${STORAGE_KEYS.APPLICATIONS}_${projectId}` });
      return res.data || [];
    } catch {
      return [];
    }
  }

  async saveApplications(projectId: string, applications: Application[]): Promise<void> {
    await Taro.setStorage({
      key: `${STORAGE_KEYS.APPLICATIONS}_${projectId}`,
      data: applications
    });
  }

  async addApplication(application: Application): Promise<void> {
    const applications = await this.getApplications(application.projectId);
    const existingIndex = applications.findIndex(a => a.applicantId === application.applicantId);
    if (existingIndex === -1) {
      applications.push(application);
    } else {
      applications[existingIndex] = application;
    }
    await this.saveApplications(application.projectId, applications);
  }

  async updateApplicationStatus(
    projectId: string,
    applicantId: string,
    status: CandidateStatus
  ): Promise<void> {
    const applications = await this.getApplications(projectId);
    const index = applications.findIndex(a => a.applicantId === applicantId);
    if (index !== -1) {
      applications[index].status = status;
      await this.saveApplications(projectId, applications);
      await this.updateCandidateStatus(projectId, applicantId, status);
    }
  }

  async updateCandidateInfo(
    projectId: string,
    applicantId: string,
    updates: {
      note?: string;
      intendedRole?: string;
      nextMeetTime?: string;
    }
  ): Promise<void> {
    const applications = await this.getApplications(projectId);
    const index = applications.findIndex(a => a.applicantId === applicantId);
    if (index !== -1) {
      if (updates.note !== undefined) {
        applications[index].note = updates.note;
      }
      if (updates.intendedRole !== undefined) {
        applications[index].intendedRole = updates.intendedRole;
      }
      if (updates.nextMeetTime !== undefined) {
        applications[index].nextMeetTime = updates.nextMeetTime;
      }
      await this.saveApplications(projectId, applications);
    }
  }

  async getApplicantInfo(applicantId: string): Promise<{name: string; avatar: string; college: string} | null> {
    const users = mockUsers;
    const user = users.find(u => u.id === applicantId);
    if (user) {
      return {
        name: user.name,
        avatar: user.avatar,
        college: user.college
      };
    }
    return null;
  }

  getCurrentUser() {
    return mockUsers.find(u => u.id === this.currentUserId) || mockUsers[0];
  }

  generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getMeetings(projectId?: string): Promise<Meeting[]> {
    try {
      const res = await Taro.getStorage({ key: STORAGE_KEYS.MEETINGS });
      const meetings: Meeting[] = res.data || [];
      if (projectId) {
        return meetings.filter(m => m.projectId === projectId);
      }
      return meetings;
    } catch {
      return [];
    }
  }

  async addMeeting(meeting: Meeting): Promise<void> {
    const meetings = await this.getMeetings();
    meetings.push(meeting);
    await Taro.setStorage({ key: STORAGE_KEYS.MEETINGS, data: meetings });
    
    const applications = await this.getApplications(meeting.projectId);
    const appIndex = applications.findIndex(a => a.applicantId === meeting.candidateId);
    if (appIndex !== -1) {
      applications[appIndex].nextMeetTime = meeting.meetTime;
      await this.saveApplications(meeting.projectId, applications);
    }
  }

  async getLatestMeeting(projectId: string, candidateId: string): Promise<Meeting | null> {
    const meetings = await this.getMeetings(projectId);
    const filtered = meetings.filter(m => m.candidateId === candidateId);
    if (filtered.length === 0) return null;
    return filtered.sort((a, b) => 
      new Date(b.meetTime).getTime() - new Date(a.meetTime).getTime()
    )[0];
  }

  async updateMeetingStatus(meetingId: string, status: Meeting['status']): Promise<void> {
    const meetings = await this.getMeetings();
    const index = meetings.findIndex(m => m.id === meetingId);
    if (index !== -1) {
      meetings[index].status = status;
      await Taro.setStorage({ key: STORAGE_KEYS.MEETINGS, data: meetings });
    }
  }
}

export const store = new Store();
export default store;
export { Meeting };

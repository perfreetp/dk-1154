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
  CURRENT_USER: 'current_user'
};

export type CandidateStatus = 'uncontacted' | 'preliminary' | 'deep' | 'teamed';

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

  getCurrentUser() {
    return mockUsers.find(u => u.id === this.currentUserId) || mockUsers[0];
  }

  generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const store = new Store();
export default store;

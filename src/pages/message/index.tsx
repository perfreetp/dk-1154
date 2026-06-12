import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Message } from '../../types/message';
import { store, CandidateStatus } from '../../store';
import EmptyState from '../../components/EmptyState';
import styles from './index.module.scss';

const STATUS_OPTIONS: { value: CandidateStatus; label: string; color: string }[] = [
  { value: 'uncontacted', label: '未联系', color: '#94A3B8' },
  { value: 'preliminary', label: '初步沟通', color: '#5B86E5' },
  { value: 'deep', label: '深入洽谈', color: '#10B981' },
  { value: 'teamed', label: '已组队', color: '#F59E0B' }
];

const MessagePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'invite' | 'system'>('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [currentStatus, setCurrentStatus] = useState<CandidateStatus>('uncontacted');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const msgs = await store.getMessages();
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'invite') return msg.type === 'invite';
    if (selectedTab === 'system') return msg.type === 'system';
    return true;
  });

  const handleMessageClick = async (msg: Message) => {
    if (!msg.isRead) {
      await store.markMessageRead(msg.id);
      setMessages(prev => prev.map(m =>
        m.id === msg.id ? { ...m, isRead: true } : m
      ));
    }

    if (msg.type === 'invite' && msg.data?.projectId) {
      Taro.navigateTo({
        url: `/pages/project-detail/index?id=${msg.data.projectId}&candidateId=${msg.fromUserId}`
      });
    }
  };

  const handleStatusClick = (msg: Message, e: any) => {
    e.stopPropagation();
    setSelectedMessage(msg);
    if (msg.fromUserId && msg.data?.projectId) {
      loadCandidateStatus(msg.data.projectId, msg.fromUserId);
    }
    setShowStatusModal(true);
  };

  const loadCandidateStatus = async (projectId: string, candidateId: string) => {
    const status = await store.getCandidateStatus(projectId, candidateId);
    setCurrentStatus(status);
  };

  const handleStatusChange = async (status: CandidateStatus) => {
    if (selectedMessage && selectedMessage.fromUserId && selectedMessage.data?.projectId) {
      await store.updateCandidateStatus(
        selectedMessage.data.projectId,
        selectedMessage.fromUserId,
        status
      );
      setCurrentStatus(status);
      Taro.showToast({
        title: '状态已更新',
        icon: 'success'
      });
      setShowStatusModal(false);
    }
  };

  const getStatusInfo = (status: CandidateStatus) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invite': return '📨';
      case 'chat': return '💬';
      case 'system': return '🔔';
      default: return '📌';
    }
  };

  const unreadCount = messages.filter(m => !m.isRead).length;

  if (showStatusModal && selectedMessage) {
    return (
      <View className={styles.page}>
        <View className={styles.statusHeader}>
          <Button className={styles.closeBtn} onClick={() => setShowStatusModal(false)}>
            <Text style={{ fontSize: '36rpx' }}>←</Text>
          </Button>
          <Text className={styles.statusTitle}>候选人状态</Text>
          <View style={{ width: '80rpx' }} />
        </View>

        <View className={styles.statusContent}>
          <View className={styles.candidateInfo}>
            <Image
              src={selectedMessage.fromUserAvatar || ''}
              className={styles.candidateAvatar}
              mode='aspectFill'
            />
            <Text className={styles.candidateName}>{selectedMessage.fromUserName}</Text>
          </View>

          <Text className={styles.currentStatusLabel}>当前状态</Text>
          <View className={styles.currentStatus} style={{ borderColor: getStatusInfo(currentStatus).color }}>
            <Text style={{ color: getStatusInfo(currentStatus).color, fontWeight: '600' }}>
              {getStatusInfo(currentStatus).label}
            </Text>
          </View>

          <Text className={styles.selectLabel}>修改状态</Text>
          <View className={styles.statusOptions}>
            {STATUS_OPTIONS.map(option => (
              <View
                key={option.value}
                className={`${styles.statusOption} ${currentStatus === option.value ? styles.active : ''}`}
                style={{
                  borderColor: option.color,
                  backgroundColor: currentStatus === option.value ? `${option.color}15` : 'transparent'
                }}
                onClick={() => handleStatusChange(option.value)}
              >
                <Text style={{ color: option.color, fontWeight: currentStatus === option.value ? '600' : '400' }}>
                  {option.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>消息中心</Text>
        {unreadCount > 0 && (
          <View className={styles.badge}>
            <Text className={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <View className={styles.tabs}>
        {[
          { key: 'all', label: '全部' },
          { key: 'invite', label: '邀请' },
          { key: 'system', label: '系统' }
        ].map(tab => (
          <View
            key={tab.key}
            className={`${styles.tab} ${selectedTab === tab.key ? styles.active : ''}`}
            onClick={() => setSelectedTab(tab.key as any)}
          >
            <Text className={styles.tabText}>{tab.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.messageList}>
        {loading ? (
          <View style={{ textAlign: 'center', padding: '100rpx 0' }}>
            <Text style={{ color: '#94A3B8' }}>加载中...</Text>
          </View>
        ) : filteredMessages.length > 0 ? (
          filteredMessages.map(msg => (
            <View
              key={msg.id}
              className={`${styles.messageCard} ${!msg.isRead ? styles.unread : ''}`}
              onClick={() => handleMessageClick(msg)}
            >
              <View className={styles.messageIcon}>
                <Text className={styles.icon}>{getTypeIcon(msg.type)}</Text>
                {!msg.isRead && <View className={styles.unreadDot} />}
              </View>

              <View className={styles.messageContent}>
                <View className={styles.messageHeader}>
                  <Text className={styles.messageTitle}>
                    {msg.title || (msg.fromUserName + '的消息')}
                  </Text>
                  <Text className={styles.messageTime}>
                    {new Date(msg.createdAt).toLocaleDateString('zh-CN', {
                      month: 'numeric',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
                <Text className={styles.messageText}>{msg.content}</Text>
              </View>

              {msg.type === 'invite' && msg.fromUserId && (
                <View className={styles.statusBtn} onClick={(e) => handleStatusClick(msg, e)}>
                  <Text className={styles.statusBtnText}>状态</Text>
                </View>
              )}

              {msg.fromUserAvatar && (
                <Image
                  src={msg.fromUserAvatar}
                  className={styles.avatar}
                  mode='aspectFill'
                />
              )}
            </View>
          ))
        ) : (
          <EmptyState message='暂无消息' />
        )}
      </ScrollView>
    </View>
  );
};

export default MessagePage;

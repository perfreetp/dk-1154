import React, { useState } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Message } from '../../types/message';
import { mockMessages } from '../../data/mock-messages';
import EmptyState from '../../components/EmptyState';
import styles from './index.module.scss';

const MessagePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedTab, setSelectedTab] = useState<'all' | 'invite' | 'system'>('all');

  const filteredMessages = messages.filter(msg => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'invite') return msg.type === 'invite';
    if (selectedTab === 'system') return msg.type === 'system';
    return true;
  });

  const handleMessageClick = (msg: Message) => {
    if (!msg.isRead) {
      setMessages(prev => prev.map(m =>
        m.id === msg.id ? { ...m, isRead: true } : m
      ));
    }

    if (msg.type === 'invite') {
      Taro.navigateTo({
        url: `/pages/project-detail/index?id=${msg.data?.projectId}`
      });
    }
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
        {filteredMessages.length > 0 ? (
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

import React, { useState } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Resource } from '../../types/resource';
import { mockResources } from '../../data/mock-resources';
import styles from './index.module.scss';

const CalendarPage: React.FC = () => {
  const [resources] = useState<Resource[]>(mockResources);
  const [selectedType, setSelectedType] = useState<string>('');

  const filteredResources = resources.filter(r =>
    !selectedType || r.type === selectedType
  );

  const handleBook = (id: string) => {
    Taro.showModal({
      title: '预约确认',
      content: '确定要预约此资源吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '预约成功',
            icon: 'success'
          });
        }
      }
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'roadshow': return '🎤';
      case 'workspace': return '🏢';
      case 'activity': return '🎯';
      default: return '📌';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'roadshow': return '路演';
      case 'workspace': return '工位';
      case 'activity': return '活动';
      default: return '其他';
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>资源日历</Text>
        <Text className={styles.subtitle}>校园创业资源一网打尽</Text>
      </View>

      <View className={styles.filters}>
        {[
          { label: '全部', value: '' },
          { label: '🎤 路演', value: 'roadshow' },
          { label: '🏢 工位', value: 'workspace' },
          { label: '🎯 活动', value: 'activity' }
        ].map(filter => (
          <View
            key={filter.value}
            className={`${styles.filterBtn} ${selectedType === filter.value ? styles.active : ''}`}
            onClick={() => setSelectedType(filter.value)}
          >
            <Text className={styles.filterText}>{filter.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.resourceList}>
        <View style={{ padding: `0 ${$page-padding}` }}>
          {filteredResources.map(resource => (
            <View key={resource.id} className={styles.resourceCard}>
              <View className={styles.cardHeader}>
                <View className={styles.typeTag}>
                  <Text className={styles.typeIcon}>{getTypeIcon(resource.type)}</Text>
                  <Text className={styles.typeText}>{getTypeLabel(resource.type)}</Text>
                </View>
                <Text className={styles.organizer}>{resource.organizer}</Text>
              </View>

              <Text className={styles.resourceTitle}>{resource.title}</Text>
              <Text className={styles.description}>{resource.description}</Text>

              <View className={styles.infoGrid}>
                <View className={styles.infoItem}>
                  <Text className={styles.infoLabel}>📍</Text>
                  <Text className={styles.infoValue}>{resource.location}</Text>
                </View>
                <View className={styles.infoItem}>
                  <Text className={styles.infoLabel}>🕒</Text>
                  <Text className={styles.infoValue}>
                    {new Date(resource.startTime).toLocaleString('zh-CN', {
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                {resource.capacity && (
                  <View className={styles.infoItem}>
                    <Text className={styles.infoLabel}>👥</Text>
                    <Text className={styles.infoValue}>
                      {resource.bookedCount}/{resource.capacity}人
                    </Text>
                  </View>
                )}
              </View>

              <View className={styles.cardFooter}>
                <View className={styles.progress}>
                  {resource.capacity && (
                    <View
                      className={styles.progressBar}
                      style={{
                        width: `${(resource.bookedCount! / resource.capacity) * 100}%`
                      }}
                    />
                  )}
                </View>
                <Button
                  className={`${styles.bookBtn} ${resource.isBooked ? styles.booked : ''}`}
                  onClick={() => handleBook(resource.id)}
                  disabled={resource.isBooked}
                >
                  {resource.isBooked ? '已满' : '立即预约'}
                </Button>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default CalendarPage;

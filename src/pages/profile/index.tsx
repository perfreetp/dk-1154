import React, { useState } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { User, Review } from '../../types/user';
import { mockUsers } from '../../data/mock-users';
import styles from './index.module.scss';

const ProfilePage: React.FC = () => {
  const [currentUser] = useState<User>(mockUsers[0]);
  const [reviews] = useState<Review[]>([]);

  const menuItems = [
    { icon: '📋', label: '我的项目', count: 3 },
    { icon: '⭐', label: '我的收藏', count: 5 },
    { icon: '📝', label: '待评价', count: 2 },
    { icon: '⚙️', label: '设置', count: 0 }
  ];

  const handleMenuClick = (label: string) => {
    switch (label) {
      case '我的项目':
        Taro.showToast({ title: '我的项目', icon: 'none' });
        break;
      case '我的收藏':
        Taro.switchTab({ url: '/pages/square/index' });
        break;
      case '待评价':
        Taro.navigateTo({ url: '/pages/review/index' });
        break;
      case '设置':
        Taro.showToast({ title: '设置', icon: 'none' });
        break;
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userCard}>
          <Image
            src={currentUser.avatar}
            className={styles.avatar}
            mode='aspectFill'
          />
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{currentUser.name}</Text>
            <Text className={styles.userMeta}>
              {currentUser.college} · {currentUser.major}
            </Text>
            <View className={styles.stats}>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{currentUser.rating}</Text>
                <Text className={styles.statLabel}>评分</Text>
              </View>
              <View className={styles.statDivider} />
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{currentUser.reviewCount}</Text>
                <Text className={styles.statLabel}>评价</Text>
              </View>
              <View className={styles.statDivider} />
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{currentUser.availableHours}h</Text>
                <Text className={styles.statLabel}>可用</Text>
              </View>
            </View>
          </View>
          <Button
            className={styles.editBtn}
            onClick={() => Taro.showToast({ title: '编辑资料', icon: 'none' })}
          >
            编辑
          </Button>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>我的技能</Text>
        <View className={styles.skills}>
          {currentUser.skills.map((skill, idx) => (
            <Text key={idx} className={styles.skillTag}>{skill}</Text>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>我的作品</Text>
        {currentUser.works.length > 0 ? (
          <ScrollView scrollX className={styles.worksScroll}>
            {currentUser.works.map(work => (
              <View key={work.id} className={styles.workCard}>
                <Image
                  src={work.coverImage}
                  className={styles.workImage}
                  mode='aspectFill'
                />
                <Text className={styles.workTitle}>{work.title}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View className={styles.emptyWorks}>
            <Text className={styles.emptyText}>暂无作品，快去添加吧~</Text>
          </View>
        )}
      </View>

      <View className={styles.menuSection}>
        {menuItems.map((item, idx) => (
          <View
            key={idx}
            className={styles.menuItem}
            onClick={() => handleMenuClick(item.label)}
          >
            <Text className={styles.menuIcon}>{item.icon}</Text>
            <Text className={styles.menuLabel}>{item.label}</Text>
            {item.count > 0 && (
              <View className={styles.menuBadge}>
                <Text className={styles.menuCount}>{item.count}</Text>
              </View>
            )}
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ProfilePage;

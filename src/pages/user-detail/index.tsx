import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { User } from '../../types/user';
import { mockUsers } from '../../data/mock-users';
import styles from './index.module.scss';

const UserDetailPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { id } = router.params;
    const foundUser = mockUsers.find(u => u.id === id);
    if (foundUser) {
      setUser(foundUser);
    }
  }, [router.params]);

  if (!user) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const handleInvite = () => {
    Taro.showModal({
      title: '发送邀请',
      content: `确定要邀请${user.name}加入你的项目吗？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '邀请已发送',
            icon: 'success'
          });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        }
      }
    });
  };

  const handleFollow = () => {
    setUser(prev => prev ? { ...prev, isFollowing: !prev.isFollowing } : null);
    Taro.showToast({
      title: user.isFollowing ? '已取消关注' : '关注成功',
      icon: 'success'
    });
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.content}>
        <View className={styles.header}>
          <Image
            src={user.avatar}
            className={styles.avatar}
            mode='aspectFill'
          />
          <Text className={styles.name}>{user.name}</Text>
          <Text className={styles.meta}>
            {user.college} · {user.major} · {user.grade}
          </Text>
          <View className={styles.stats}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{user.rating}</Text>
              <Text className={styles.statLabel}>评分</Text>
            </View>
            <View className={styles.statDivider} />
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{user.reviewCount}</Text>
              <Text className={styles.statLabel}>评价</Text>
            </View>
            <View className={styles.statDivider} />
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{user.availableHours}h</Text>
              <Text className={styles.statLabel}>周可用</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>个人简介</Text>
          <Text className={styles.bio}>{user.bio}</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>技能标签</Text>
          <View className={styles.skills}>
            {user.skills.map((skill, idx) => (
              <Text key={idx} className={styles.skillTag}>{skill}</Text>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>作品展示</Text>
          {user.works.length > 0 ? (
            <View className={styles.works}>
              {user.works.map(work => (
                <View key={work.id} className={styles.workCard}>
                  <Image
                    src={work.coverImage}
                    className={styles.workImage}
                    mode='aspectFill'
                  />
                  <Text className={styles.workTitle}>{work.title}</Text>
                  <Text className={styles.workDesc}>{work.description}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text className={styles.emptyText}>暂无作品</Text>
          )}
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <Button className={styles.followBtn} onClick={handleFollow}>
          {user.isFollowing ? '已关注' : '关注'}
        </Button>
        <Button className={styles.inviteBtn} onClick={handleInvite}>
          发送邀请
        </Button>
      </View>
    </View>
  );
};

export default UserDetailPage;

import React from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { User } from '../../types/user';
import { mockUsers } from '../../data/mock-users';
import { COLLEGE_OPTIONS, SKILL_TAGS } from '../../types/project';
import EmptyState from '../../components/EmptyState';
import styles from './index.module.scss';

const MatchPage: React.FC = () => {
  const [users] = React.useState<User[]>(mockUsers);
  const [selectedCollege, setSelectedCollege] = React.useState('');
  const [selectedSkill, setSelectedSkill] = React.useState('');

  const filteredUsers = users.filter(user => {
    if (selectedCollege && user.college !== selectedCollege) return false;
    if (selectedSkill && !user.skills.includes(selectedSkill)) return false;
    return true;
  });

  const handleInvite = (userId: string) => {
    Taro.navigateTo({
      url: `/pages/user-detail/index?id=${userId}&action=invite`
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>寻找搭子</Text>
        <Text className={styles.subtitle}>找到志同道合的创业伙伴</Text>
      </View>

      <View className={styles.filters}>
        <View className={styles.filterGroup}>
          <Text className={styles.filterLabel}>学院：</Text>
          <ScrollView scrollX className={styles.filterScroll}>
            <View
              className={`${styles.filterTag} ${!selectedCollege ? styles.active : ''}`}
              onClick={() => setSelectedCollege('')}
            >
              <Text className={styles.filterText}>全部</Text>
            </View>
            {COLLEGE_OPTIONS.slice(0, 6).map(college => (
              <View
                key={college}
                className={`${styles.filterTag} ${selectedCollege === college ? styles.active : ''}`}
                onClick={() => setSelectedCollege(college)}
              >
                <Text className={styles.filterText}>{college}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.filterGroup}>
          <Text className={styles.filterLabel}>技能：</Text>
          <ScrollView scrollX className={styles.filterScroll}>
            <View
              className={`${styles.filterTag} ${!selectedSkill ? styles.active : ''}`}
              onClick={() => setSelectedSkill('')}
            >
              <Text className={styles.filterText}>全部</Text>
            </View>
            {SKILL_TAGS.slice(0, 8).map(skill => (
              <View
                key={skill}
                className={`${styles.filterTag} ${selectedSkill === skill ? styles.active : ''}`}
                onClick={() => setSelectedSkill(skill)}
              >
                <Text className={styles.filterText}>{skill}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView scrollY className={styles.userList}>
        <View style={{ padding: `0 ${$page-padding}` }}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map(user => (
              <View key={user.id} className={styles.userCard}>
                <View className={styles.userHeader}>
                  <Image src={user.avatar} className={styles.avatar} mode='aspectFill' />
                  <View className={styles.userInfo}>
                    <View className={styles.nameRow}>
                      <Text className={styles.userName}>{user.name}</Text>
                      <Text className={styles.rating}>⭐ {user.rating}</Text>
                    </View>
                    <Text className={styles.meta}>
                      {user.college} · {user.major} · {user.grade}
                    </Text>
                    <Text className={styles.hours}>
                      ⏰ 可投入时间：每周{user.availableHours}小时
                    </Text>
                  </View>
                </View>

                <View className={styles.skills}>
                  {user.skills.slice(0, 4).map((skill, idx) => (
                    <Text key={idx} className={styles.skillTag}>{skill}</Text>
                  ))}
                </View>

                <Text className={styles.bio}>{user.bio}</Text>

                <View className={styles.actions}>
                  <Button
                    className={styles.inviteBtn}
                    onClick={() => handleInvite(user.id)}
                  >
                    发送邀请
                  </Button>
                  <Button
                    className={styles.viewBtn}
                    onClick={() => Taro.navigateTo({
                      url: `/pages/user-detail/index?id=${user.id}`
                    })}
                  >
                    查看详情
                  </Button>
                </View>
              </View>
            ))
          ) : (
            <EmptyState message='暂无符合条件的搭子' />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MatchPage;

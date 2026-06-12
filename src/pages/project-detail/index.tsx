import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { Project, STAGE_OPTIONS } from '../../types/project';
import { mockProjects } from '../../data/mock-projects';
import styles from './index.module.scss';

const ProjectDetailPage: React.FC = () => {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    const { id } = router.params;
    const foundProject = mockProjects.find(p => p.id === id);
    if (foundProject) {
      setProject(foundProject);
    }
  }, [router.params]);

  if (!project) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

  const stageLabel = STAGE_OPTIONS.find(s => s.value === project.stage)?.label || '未知';

  const handleCollect = () => {
    setProject(prev => prev ? { ...prev, isCollected: !prev.isCollected } : null);
    Taro.showToast({
      title: project.isCollected ? '已取消收藏' : '收藏成功',
      icon: 'success'
    });
  };

  const handleApply = () => {
    Taro.showModal({
      title: '申请加入',
      content: `确定要申请加入"${project.title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '申请已发送',
            icon: 'success'
          });
        }
      }
    });
  };

  const handleMeet = () => {
    Taro.navigateTo({
      url: `/pages/meet/index?projectId=${project.id}`
    });
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.content}>
        <View className={styles.header}>
          <View className={styles.userInfo}>
            <Image
              src={project.creatorAvatar}
              className={styles.avatar}
              mode='aspectFill'
            />
            <View className={styles.userText}>
              <Text className={styles.userName}>{project.creatorName}</Text>
              <Text className={styles.college}>{project.college}</Text>
            </View>
          </View>
          <Button className={styles.collectBtn} onClick={handleCollect}>
            <Text className={project.isCollected ? styles.collectedIcon : styles.collectIcon}>
              {project.isCollected ? '❤️' : '🤍'}
            </Text>
          </Button>
        </View>

        <View className={styles.mainInfo}>
          <Text className={styles.title}>{project.title}</Text>
          <View className={styles.tags}>
            {project.tags.map((tag, idx) => (
              <Text key={idx} className={styles.tag}>{tag}</Text>
            ))}
            <Text className={styles.stageTag}>{stageLabel}</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>项目描述</Text>
          <Text className={styles.description}>{project.description}</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>招募角色</Text>
          {project.roles.map((role, idx) => (
            <View key={idx} className={styles.roleCard}>
              <Text className={styles.roleName}>{role.name}</Text>
              <View className={styles.roleProgress}>
                <View className={styles.progressBar}>
                  <View
                    className={styles.progressFill}
                    style={{ width: `${(role.current / role.required) * 100}%` }}
                  />
                </View>
                <Text className={styles.roleCount}>
                  {role.current}/{role.required}人
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{project.viewCount}</Text>
            <Text className={styles.statLabel}>浏览</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{project.applyCount}</Text>
            <Text className={styles.statLabel}>申请</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statValue}>
              {Math.ceil((new Date(project.expiredAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}天
            </Text>
            <Text className={styles.statLabel}>剩余</Text>
          </View>
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <Button className={styles.meetBtn} onClick={handleMeet}>
          预约碰面
        </Button>
        <Button className={styles.applyBtn} onClick={handleApply}>
          申请加入
        </Button>
      </View>
    </View>
  );
};

export default ProjectDetailPage;

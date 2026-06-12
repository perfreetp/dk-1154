import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Project, STAGE_OPTIONS } from '../../types/project';
import styles from './index.module.scss';

interface Props {
  project: Project;
  onCollect?: (id: string) => void;
  onClick?: (id: string) => void;
}

const ProjectCard: React.FC<Props> = ({ project, onCollect, onClick }) => {
  const stageLabel = STAGE_OPTIONS.find(s => s.value === project.stage)?.label || '未知';

  const handleCardClick = () => {
    if (onClick) {
      onClick(project.id);
    } else {
      Taro.navigateTo({
        url: `/pages/project-detail/index?id=${project.id}`
      });
    }
  };

  const handleCollectClick = (e: any) => {
    e.stopPropagation();
    if (onCollect) {
      onCollect(project.id);
    }
  };

  return (
    <View className={styles.card} onClick={handleCardClick}>
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
        <Button
          className={styles.collectBtn}
          onClick={handleCollectClick}
        >
          <Text className={project.isCollected ? styles.collectedIcon : styles.collectIcon}>
            {project.isCollected ? '❤️' : '🤍'}
          </Text>
        </Button>
      </View>

      <Text className={styles.title}>{project.title}</Text>
      <Text className={styles.description}>{project.description}</Text>

      <View className={styles.tags}>
        {project.tags.slice(0, 3).map((tag, index) => (
          <Text key={index} className={styles.tag}>{tag}</Text>
        ))}
        <Text className={styles.stageTag}>{stageLabel}</Text>
      </View>

      <View className={styles.roles}>
        <Text className={styles.rolesTitle}>招募角色：</Text>
        {project.roles.map((role, index) => (
          <Text key={index} className={styles.role}>
            {role.name} ({role.current}/{role.required})
          </Text>
        ))}
      </View>

      <View className={styles.footer}>
        <View className={styles.stats}>
          <Text className={styles.stat}>👁 {project.viewCount}</Text>
          <Text className={styles.stat}>📩 {project.applyCount}</Text>
        </View>
        <Text className={styles.time}>
          {new Date(project.createdAt).toLocaleDateString('zh-CN')}
        </Text>
      </View>
    </View>
  );
};

export default ProjectCard;

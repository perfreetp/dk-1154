import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { User } from '../../types/user';
import { Project } from '../../types/project';
import { mockUsers } from '../../data/mock-users';
import { store, Application } from '../../store';
import styles from './index.module.scss';

const UserDetailPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  useEffect(() => {
    const { id } = router.params;
    const foundUser = mockUsers.find(u => u.id === id);
    if (foundUser) {
      setUser(foundUser);
    }
    loadMyProjects();
  }, [router.params]);

  const loadMyProjects = async () => {
    const projects = await store.getMyProjects();
    setMyProjects(projects);
  };

  const handleInvite = () => {
    if (myProjects.length === 0) {
      Taro.showToast({
        title: '您还没有发布项目',
        icon: 'none'
      });
      return;
    }
    setShowProjectSelector(true);
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectSelector(false);
  };

  const handleConfirmInvite = async () => {
    if (!user || !selectedProject) return;

    const existingApps = await store.getApplications(selectedProject.id);
    const alreadyExists = existingApps.some(a => a.applicantId === user.id);

    if (alreadyExists) {
      Taro.showToast({
        title: '此人已在候选人列表中',
        icon: 'none'
      });
      return;
    }

    Taro.showModal({
      title: '发送邀请',
      content: `确定要邀请${user.name}加入"${selectedProject.title}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          const application: Application = {
            id: store.generateId(),
            projectId: selectedProject.id,
            applicantId: user.id,
            applicantName: user.name,
            applicantAvatar: user.avatar,
            applicantCollege: user.college,
            applyTime: new Date().toISOString(),
            status: 'uncontacted',
            source: 'invitation'
          };

          await store.addApplication(application);

          await store.addMessage({
            id: store.generateId(),
            type: 'invite',
            title: `收到${user.name}的加入邀请`,
            content: `${user.name}邀请加入您的项目"${selectedProject.title}"`,
            toUserId: 'currentUser',
            fromUserId: user.id,
            fromUserName: user.name,
            fromUserAvatar: user.avatar,
            isRead: false,
            createdAt: new Date().toISOString(),
            data: {
              projectId: selectedProject.id,
              projectTitle: selectedProject.title,
              candidateId: user.id,
              source: 'invitation'
            }
          });

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
      title: user?.isFollowing ? '已取消关注' : '关注成功',
      icon: 'success'
    });
  };

  if (showProjectSelector) {
    return (
      <View className={styles.page}>
        <View className={styles.projectSelectorHeader}>
          <Button className={styles.closeBtn} onClick={() => setShowProjectSelector(false)}>
            <Text style={{ fontSize: '36rpx' }}>←</Text>
          </Button>
          <Text className={styles.selectorTitle}>选择关联项目</Text>
          <View style={{ width: '80rpx' }} />
        </View>

        <ScrollView scrollY className={styles.projectList}>
          {myProjects.map(project => (
            <View
              key={project.id}
              className={styles.projectItem}
              onClick={() => handleSelectProject(project)}
            >
              <View className={styles.projectInfo}>
                <Text className={styles.projectTitle}>{project.title}</Text>
                <Text className={styles.projectMeta}>
                  {project.roles.length}个角色 · {project.tags.slice(0, 2).join('、')}
                </Text>
              </View>
              <Text className={styles.selectIcon}>○</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!user) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }

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

        {selectedProject && (
          <View className={styles.selectedProjectBanner}>
            <Text className={styles.bannerLabel}>已选择项目：</Text>
            <Text className={styles.bannerTitle}>{selectedProject.title}</Text>
            <Button 
              className={styles.changeBtn}
              onClick={() => setShowProjectSelector(true)}
            >
              更换
            </Button>
          </View>
        )}
      </ScrollView>

      <View className={styles.footer}>
        <Button className={styles.followBtn} onClick={handleFollow}>
          {user.isFollowing ? '已关注' : '关注'}
        </Button>
        <Button className={styles.inviteBtn} onClick={selectedProject ? handleConfirmInvite : handleInvite}>
          {selectedProject ? '确认邀请' : '邀请加入项目'}
        </Button>
      </View>
    </View>
  );
};

export default UserDetailPage;

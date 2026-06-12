import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { User } from '../../types/user';
import { store } from '../../store';
import { mockUsers } from '../../data/mock-users';
import EmptyState from '../../components/EmptyState';
import styles from './index.module.scss';

const ProfilePage: React.FC = () => {
  const [currentUser] = useState<User>(mockUsers[0]);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [showMyProjects, setShowMyProjects] = useState(false);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { icon: '📋', label: '我的项目', count: myProjects.length },
    { icon: '⭐', label: '我的收藏', count: 5 },
    { icon: '📝', label: '待评价', count: 2 },
    { icon: '⚙️', label: '设置', count: 0 }
  ];

  useEffect(() => {
    store.init().then(() => {
      loadMyProjects();
    });
  }, []);

  const loadMyProjects = async () => {
    setLoading(true);
    try {
      await store.checkExpiredProjects();
      const projects = await store.getMyProjects();
      setMyProjects(projects);
    } catch (error) {
      console.error('Failed to load my projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = async (label: string) => {
    switch (label) {
      case '我的项目':
        await loadMyProjects();
        setShowMyProjects(true);
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

  const handleHideProject = async (projectId: string) => {
    Taro.showModal({
      title: '确认隐藏',
      content: '确定要隐藏此项目吗？隐藏后项目将从广场下架，但可以在"我的项目"中恢复。',
      success: async (res) => {
        if (res.confirm) {
          await store.hideProject(projectId);
          Taro.showToast({ title: '已隐藏', icon: 'success' });
          loadMyProjects();
        }
      }
    });
  };

  const handleShowProject = async (projectId: string, expiredAt: string) => {
    const expiredDate = new Date(expiredAt);
    if (expiredDate < new Date()) {
      Taro.showModal({
        title: '项目已过期',
        content: '该项目已过期，请先延长有效期后再恢复显示。',
        confirmText: '延长有效期',
        success: async (res) => {
          if (res.confirm) {
            handleExtendProject(projectId);
          }
        }
      });
      return;
    }

    Taro.showModal({
      title: '确认恢复',
      content: '确定要恢复显示此项目吗？',
      success: async (res) => {
        if (res.confirm) {
          await store.showProject(projectId);
          Taro.showToast({ title: '已恢复', icon: 'success' });
          loadMyProjects();
        }
      }
    });
  };

  const handleExtendProject = async (projectId: string) => {
    Taro.showModal({
      title: '延长有效期',
      content: '确定要延长此项目30天有效期吗？',
      success: async (res) => {
        if (res.confirm) {
          await store.extendProjectExpiry(projectId, 30);
          Taro.showToast({ title: '已延长30天', icon: 'success' });
          loadMyProjects();
        }
      }
    });
  };

  const handleDeleteProject = async (projectId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除此项目吗？此操作不可恢复。',
      success: async (res) => {
        if (res.confirm) {
          const projects = await store.getProjects();
          const filtered = projects.filter(p => p.id !== projectId);
          await store.saveProjects(filtered);
          Taro.showToast({ title: '已删除', icon: 'success' });
          loadMyProjects();
        }
      }
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '展示中';
      case 'hidden': return '已隐藏';
      case 'expired': return '已过期';
      default: return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return { color: '#10B981' };
      case 'hidden': return { color: '#94A3B8' };
      case 'expired': return { color: '#EF4444' };
      default: return {};
    }
  };

  if (showMyProjects) {
    return (
      <View className={styles.page}>
        <View className={styles.myProjectsHeader}>
          <Button className={styles.backBtn} onClick={() => setShowMyProjects(false)}>
            <Text style={{ fontSize: '36rpx' }}>←</Text>
          </Button>
          <Text className={styles.headerTitle}>我的项目</Text>
          <View style={{ width: '80rpx' }} />
        </View>

        <ScrollView scrollY className={styles.projectsList}>
          {loading ? (
            <View style={{ textAlign: 'center', padding: '100rpx 0' }}>
              <Text style={{ color: '#94A3B8' }}>加载中...</Text>
            </View>
          ) : myProjects.length > 0 ? (
            myProjects.map(project => (
              <View key={project.id} className={styles.projectCard}>
                <View 
                  className={styles.projectContent}
                  onClick={() => Taro.navigateTo({ url: `/pages/project-detail/index?id=${project.id}` })}
                >
                  <View className={styles.projectHeader}>
                    <View className={styles.projectInfo}>
                      <Text className={styles.projectTitle}>{project.title}</Text>
                      {project.status === 'expired' && (
                        <Text className={styles.expiredTag}>已过期</Text>
                      )}
                      <Text style={{ ...styles.projectStatus, ...getStatusStyle(project.status) }}>
                        {getStatusText(project.status)}
                      </Text>
                    </View>
                    <Text style={{ fontSize: '24rpx', color: '#94A3B8' }}>
                      {project.expiredAt ? `有效期至 ${project.expiredAt}` : ''}
                    </Text>
                  </View>

                  <Text className={styles.projectDesc}>{project.description}</Text>

                  <View className={styles.projectTags}>
                    {project.tags.map((tag: string, idx: number) => (
                      <Text key={idx} className={styles.tag}>{tag}</Text>
                    ))}
                  </View>
                </View>

                <View className={styles.projectActions}>
                  {project.status === 'active' && (
                    <Button
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHideProject(project.id);
                      }}
                    >
                      隐藏
                    </Button>
                  )}
                  {project.status === 'hidden' && (
                    <Button
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowProject(project.id, project.expiredAt);
                      }}
                    >
                      恢复显示
                    </Button>
                  )}
                  {project.status === 'expired' && (
                    <Button
                      className={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExtendProject(project.id);
                      }}
                    >
                      延长30天
                    </Button>
                  )}
                  <Button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                  >
                    删除
                  </Button>
                </View>
              </View>
            ))
          ) : (
            <EmptyState message='暂无项目，快去发布一个吧~' />
          )}
        </ScrollView>
      </View>
    );
  }

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

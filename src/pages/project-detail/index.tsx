import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { Project, STAGE_OPTIONS } from '../../types/project';
import { store, CandidateStatus, Application } from '../../store';
import styles from './index.module.scss';

const STATUS_OPTIONS: { value: CandidateStatus; label: string; color: string }[] = [
  { value: 'uncontacted', label: '未联系', color: '#94A3B8' },
  { value: 'preliminary', label: '初步沟通', color: '#5B86E5' },
  { value: 'deep', label: '深入洽谈', color: '#10B981' },
  { value: 'teamed', label: '已组队', color: '#F59E0B' }
];

const ProjectDetailPage: React.FC = () => {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showCandidatePanel, setShowCandidatePanel] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  useEffect(() => {
    loadProject();
  }, [router.params]);

  useEffect(() => {
    if (project) {
      loadApplications();
    }
  }, [project, router.params.candidateId]);

  const loadProject = async () => {
    const { id } = router.params;
    const projects = await store.getProjects();
    const foundProject = projects.find(p => p.id === id);
    if (foundProject) {
      setProject(foundProject);
    }
  };

  const loadApplications = async () => {
    if (!project) return;
    const apps = await store.getApplications(project.id);
    setApplications(apps);
  };

  const handleCollect = async () => {
    if (!project) return;
    await store.updateProject(project.id, { isCollected: !project.isCollected });
    setProject(prev => prev ? { ...prev, isCollected: !prev.isCollected } : null);
    Taro.showToast({
      title: project.isCollected ? '已取消收藏' : '收藏成功',
      icon: 'success'
    });
  };

  const handleApply = async () => {
    if (!project) return;
    const currentUser = store.getCurrentUser();
    const existingApps = await store.getApplications(project.id);
    const alreadyApplied = existingApps.some(a => a.applicantId === currentUser.id);

    if (alreadyApplied) {
      Taro.showToast({ title: '您已申请过此项目', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '申请加入',
      content: `确定要申请加入"${project.title}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          const application: Application = {
            id: store.generateId(),
            projectId: project.id,
            applicantId: currentUser.id,
            applicantName: currentUser.name,
            applicantAvatar: currentUser.avatar,
            applicantCollege: currentUser.college,
            applyTime: new Date().toISOString(),
            status: 'uncontacted'
          };
          await store.addApplication(application);
          await loadApplications();
          Taro.showToast({
            title: '申请已发送',
            icon: 'success'
          });
        }
      }
    });
  };

  const handleMeet = () => {
    if (!project) return;
    Taro.navigateTo({
      url: `/pages/meet/index?projectId=${project.id}`
    });
  };

  const handleStatusChange = async (applicantId: string, status: CandidateStatus) => {
    if (!project) return;
    await store.updateApplicationStatus(project.id, applicantId, status);
    await loadApplications();
    Taro.showToast({
      title: '状态已更新',
      icon: 'success'
    });
    setSelectedCandidate(null);
  };

  const getStatusInfo = (status: CandidateStatus) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  };

  if (!project) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '100rpx', textAlign: 'center' }}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  const stageLabel = STAGE_OPTIONS.find(s => s.value === project.stage)?.label || '未知';
  const isOwner = project.creatorId === 'currentUser';

  if (showCandidatePanel) {
    return (
      <View className={styles.page}>
        <View className={styles.candidateHeader}>
          <Button className={styles.backBtn} onClick={() => setShowCandidatePanel(false)}>
            <Text style={{ fontSize: '36rpx' }}>←</Text>
          </Button>
          <Text className={styles.headerTitle}>候选人管理</Text>
          <View style={{ width: '80rpx' }} />
        </View>

        <ScrollView scrollY className={styles.candidateList}>
          {applications.length > 0 ? (
            applications.map(app => {
              const statusInfo = getStatusInfo(app.status);
              return (
                <View key={app.applicantId} className={styles.candidateCard}>
                  <View className={styles.candidateInfo}>
                    <Image
                      src={app.applicantAvatar}
                      className={styles.candidateAvatar}
                      mode='aspectFill'
                    />
                    <View className={styles.candidateDetail}>
                      <Text className={styles.candidateName}>{app.applicantName}</Text>
                      <Text className={styles.candidateCollege}>{app.applicantCollege}</Text>
                      <Text className={styles.applyTime}>
                        申请时间：{new Date(app.applyTime).toLocaleDateString('zh-CN')}
                      </Text>
                    </View>
                    <View
                      className={styles.candidateStatus}
                      style={{ borderColor: statusInfo.color }}
                    >
                      <Text style={{ color: statusInfo.color }}>{statusInfo.label}</Text>
                    </View>
                  </View>

                  {selectedCandidate === app.applicantId ? (
                    <View className={styles.statusOptions}>
                      {STATUS_OPTIONS.map(option => (
                        <View
                          key={option.value}
                          className={styles.statusOption}
                          onClick={() => handleStatusChange(app.applicantId, option.value)}
                        >
                          <Text style={{ color: option.color }}>{option.label}</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Button
                      className={styles.changeBtn}
                      onClick={() => setSelectedCandidate(app.applicantId)}
                    >
                      修改状态
                    </Button>
                  )}
                </View>
              );
            })
          ) : (
            <View style={{ textAlign: 'center', padding: '100rpx 0' }}>
              <Text style={{ color: '#94A3B8' }}>暂无申请人</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

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

        {isOwner && applications.length > 0 && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>候选人状态</Text>
              <Button className={styles.manageBtn} onClick={() => setShowCandidatePanel(true)}>
                管理 ({applications.length})
              </Button>
            </View>
            <View className={styles.candidateSummary}>
              {STATUS_OPTIONS.map(option => {
                const count = applications.filter(app => app.status === option.value).length;
                if (count === 0) return null;
                return (
                  <View key={option.value} className={styles.summaryItem}>
                    <View className={styles.summaryDot} style={{ background: option.color }} />
                    <Text style={{ color: option.color }}>{option.label}: {count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

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

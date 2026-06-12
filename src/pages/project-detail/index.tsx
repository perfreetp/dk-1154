import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { Project, STAGE_OPTIONS } from '../../types/project';
import { store, CandidateStatus } from '../../store';
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
  const [candidateStatuses, setCandidateStatuses] = useState<Record<string, CandidateStatus>>({});
  const [showCandidatePanel, setShowCandidatePanel] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  useEffect(() => {
    loadProject();
  }, [router.params]);

  useEffect(() => {
    if (project && router.params.candidateId) {
      loadCandidateStatuses();
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

  const loadCandidateStatuses = async () => {
    if (!project) return;
    const messages = await store.getMessages();
    const candidates = messages.filter(m => m.data?.projectId === project.id && m.type === 'invite');
    const statuses: Record<string, CandidateStatus> = {};
    for (const msg of candidates) {
      if (msg.fromUserId) {
        const status = await store.getCandidateStatus(project.id, msg.fromUserId);
        statuses[msg.fromUserId] = status;
      }
    }
    setCandidateStatuses(statuses);
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

  const handleApply = () => {
    if (!project) return;
    Taro.showModal({
      title: '申请加入',
      content: `确定要申请加入"${project.title}"吗？`,
      success: async (res) => {
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
    if (!project) return;
    Taro.navigateTo({
      url: `/pages/meet/index?projectId=${project.id}`
    });
  };

  const handleStatusChange = async (candidateId: string, status: CandidateStatus) => {
    if (!project) return;
    await store.updateCandidateStatus(project.id, candidateId, status);
    setCandidateStatuses(prev => ({ ...prev, [candidateId]: status }));
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
          {Object.entries(candidateStatuses).map(([candidateId, status]) => {
            const statusInfo = getStatusInfo(status);
            return (
              <View key={candidateId} className={styles.candidateCard}>
                <View className={styles.candidateInfo}>
                  <Image
                    src={`https://picsum.photos/seed/${candidateId}/100/100`}
                    className={styles.candidateAvatar}
                    mode='aspectFill'
                  />
                  <View className={styles.candidateDetail}>
                    <Text className={styles.candidateName}>候选人 {candidateId.slice(-4)}</Text>
                    <View className={styles.candidateStatus} style={{ borderColor: statusInfo.color }}>
                      <Text style={{ color: statusInfo.color }}>{statusInfo.label}</Text>
                    </View>
                  </View>
                </View>

                {selectedCandidate === candidateId ? (
                  <View className={styles.statusOptions}>
                    {STATUS_OPTIONS.map(option => (
                      <View
                        key={option.value}
                        className={styles.statusOption}
                        onClick={() => handleStatusChange(candidateId, option.value)}
                      >
                        <Text style={{ color: option.color }}>{option.label}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Button
                    className={styles.changeBtn}
                    onClick={() => setSelectedCandidate(candidateId)}
                  >
                    修改状态
                  </Button>
                )}
              </View>
            );
          })}
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

        {isOwner && Object.keys(candidateStatuses).length > 0 && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>候选人状态</Text>
              <Button className={styles.manageBtn} onClick={() => setShowCandidatePanel(true)}>
                管理
              </Button>
            </View>
            <View className={styles.candidateSummary}>
              {STATUS_OPTIONS.map(option => {
                const count = Object.values(candidateStatuses).filter(s => s === option.value).length;
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

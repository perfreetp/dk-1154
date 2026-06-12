import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import { Project, STAGE_OPTIONS } from '../../types/project';
import { store, CandidateStatus, Application, Meeting } from '../../store';
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
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);
  const [latestMeetings, setLatestMeetings] = useState<{[key: string]: Meeting | null}>({});
  const [filterStatus, setFilterStatus] = useState<CandidateStatus | 'all'>('all');

  const loadProject = useCallback(async () => {
    const { id } = router.params;
    const projects = await store.getProjects();
    const foundProject = projects.find(p => p.id === id);
    if (foundProject) {
      setProject(foundProject);
    }
  }, [router.params]);

  const loadApplications = useCallback(async () => {
    if (!project) return;
    const apps = await store.getApplications(project.id);
    setApplications(apps);
    
    const meetings: {[key: string]: Meeting | null} = {};
    const now = new Date();
    for (const app of apps) {
      const allMeetings = await store.getMeetings(project.id);
      const candidateMeetings = allMeetings
        .filter(m => m.candidateId === app.applicantId)
        .filter(m => new Date(m.meetTime) >= now || m.status === 'pending')
        .sort((a, b) => new Date(a.meetTime).getTime() - new Date(b.meetTime).getTime());
      meetings[app.applicantId] = candidateMeetings.length > 0 ? candidateMeetings[0] : null;
    }
    setLatestMeetings(meetings);
  }, [project]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    if (project) {
      loadApplications();
    }
  }, [project, loadApplications]);

  useDidShow(() => {
    if (project) {
      loadApplications();
      if (selectedCandidate) {
        const updated = applications.find(a => a.applicantId === selectedCandidate.applicantId);
        if (updated) {
          setSelectedCandidate(updated);
        }
      }
    }
  });

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
            status: 'uncontacted',
            source: 'application'
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

  const handleMeet = (candidate?: Application) => {
    if (!project) return;
    let url = `/pages/meet/index?projectId=${project.id}`;
    if (candidate) {
      url += `&candidateId=${candidate.applicantId}&candidateName=${encodeURIComponent(candidate.applicantName)}&candidateAvatar=${encodeURIComponent(candidate.applicantAvatar)}`;
    }
    Taro.navigateTo({ url });
  };

  const handleInvite = () => {
    Taro.switchTab({ url: '/pages/match/index' });
  };

  const handleCandidateClick = (app: Application) => {
    setSelectedCandidate(app);
  };

  const handleStatusChange = async (applicantId: string, status: CandidateStatus) => {
    if (!project) return;
    await store.updateApplicationStatus(project.id, applicantId, status);
    await loadApplications();
    Taro.showToast({
      title: '状态已更新',
      icon: 'success'
    });
  };

  const handleCandidateInfoUpdate = async (updates: {
    note?: string;
    intendedRole?: string;
  }) => {
    if (!selectedCandidate || !project) return;
    await store.updateCandidateInfo(project.id, selectedCandidate.applicantId, updates);
    await loadApplications();
    const updated = applications.find(a => a.applicantId === selectedCandidate.applicantId);
    if (updated) {
      setSelectedCandidate(updated);
    }
    Taro.showToast({
      title: '信息已更新',
      icon: 'success'
    });
  };

  const getStatusInfo = (status: CandidateStatus) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  };

  const stageLabel = STAGE_OPTIONS.find(s => s.value === project?.stage)?.label || '未知';
  const isOwner = project?.creatorId === 'currentUser';

  if (selectedCandidate && project) {
    return (
      <View className={styles.page}>
        <View className={styles.candidateHeader}>
          <Button className={styles.backBtn} onClick={() => setSelectedCandidate(null)}>
            <Text style={{ fontSize: '36rpx' }}>←</Text>
          </Button>
          <Text className={styles.headerTitle}>候选人详情</Text>
          <View style={{ width: '80rpx' }} />
        </View>

        <ScrollView scrollY className={styles.detailContent}>
          <View className={styles.candidateDetailCard}>
            <View className={styles.candidateDetailHeader}>
              <Image
                src={selectedCandidate.applicantAvatar}
                className={styles.candidateAvatar}
                mode='aspectFill'
              />
              <View className={styles.candidateDetailInfo}>
                <Text className={styles.candidateName}>{selectedCandidate.applicantName}</Text>
                <Text className={styles.candidateCollege}>{selectedCandidate.applicantCollege}</Text>
                <View className={styles.sourceTag}>
                  <Text style={{ fontSize: '24rpx', color: selectedCandidate.source === 'invitation' ? '#5B86E5' : '#10B981' }}>
                    {selectedCandidate.source === 'invitation' ? '邀请加入' : '主动申请'}
                  </Text>
                </View>
              </View>
            </View>

            <View className={styles.candidateDetailRow}>
              <Text className={styles.detailLabel}>当前状态</Text>
              <View className={styles.statusBadge} style={{ borderColor: getStatusInfo(selectedCandidate.status).color }}>
                <Text style={{ color: getStatusInfo(selectedCandidate.status).color }}>
                  {getStatusInfo(selectedCandidate.status).label}
                </Text>
              </View>
            </View>

            <View className={styles.candidateDetailRow}>
              <Text className={styles.detailLabel}>下次约聊</Text>
              <Text className={styles.detailValue}>
                {latestMeetings[selectedCandidate.applicantId]
                  ? new Date(latestMeetings[selectedCandidate.applicantId]!.meetTime).toLocaleString('zh-CN')
                  : '未安排'}
              </Text>
            </View>
          </View>

          <View className={styles.candidateDetailCard}>
            <Text className={styles.detailSectionTitle}>沟通状态</Text>
            <View className={styles.statusGrid}>
              {STATUS_OPTIONS.map(option => (
                <View
                  key={option.value}
                  className={`${styles.statusOption} ${selectedCandidate.status === option.value ? styles.active : ''}`}
                  style={{
                    borderColor: option.color,
                    backgroundColor: selectedCandidate.status === option.value ? `${option.color}15` : 'transparent'
                  }}
                  onClick={() => handleStatusChange(selectedCandidate.applicantId, option.value)}
                >
                  <Text style={{ color: option.color, fontWeight: selectedCandidate.status === option.value ? '600' : '400' }}>
                    {option.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.candidateDetailCard}>
            <Text className={styles.detailSectionTitle}>意向角色</Text>
            <View className={styles.roleSelector}>
              {project.roles.map((role, idx) => (
                <View
                  key={idx}
                  className={`${styles.roleOption} ${selectedCandidate.intendedRole === role.name ? styles.active : ''}`}
                  onClick={() => handleCandidateInfoUpdate({ intendedRole: role.name })}
                >
                  <Text>{role.name}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.candidateDetailCard}>
            <Text className={styles.detailSectionTitle}>备注</Text>
            <View className={styles.noteInput}>
              <input
                type='text'
                className={styles.noteInputField}
                placeholder='添加备注信息...'
                value={selectedCandidate.note || ''}
                onBlur={(e: any) => handleCandidateInfoUpdate({ note: e.detail?.value || e.target?.value })}
              />
            </View>
          </View>

          {latestMeetings[selectedCandidate.applicantId] && (
            <View className={styles.candidateDetailCard}>
              <Text className={styles.detailSectionTitle}>最近约聊</Text>
              <View className={styles.meetingInfo}>
                <Text className={styles.meetingTime}>
                  📅 {new Date(latestMeetings[selectedCandidate.applicantId]!.meetTime).toLocaleString('zh-CN')}
                </Text>
                {latestMeetings[selectedCandidate.applicantId]!.location && (
                  <Text className={styles.meetingLocation}>
                    📍 {latestMeetings[selectedCandidate.applicantId]!.location}
                  </Text>
                )}
              </View>
            </View>
          )}

          <Button 
            className={styles.scheduleBtn}
            onClick={() => handleMeet(selectedCandidate)}
          >
            预约碰面
          </Button>
        </ScrollView>
      </View>
    );
  }

  if (!project) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '100rpx', textAlign: 'center' }}>
          <Text>加载中...</Text>
        </View>
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

        {isOwner && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>候选人管理</Text>
              {applications.length > 0 && (
                <Text className={styles.candidateCount}>共{applications.length}人</Text>
              )}
            </View>

            {applications.length > 0 ? (
              <>
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

                <View className={styles.filterBar}>
                  <View
                    className={`${styles.filterItem} ${filterStatus === 'all' ? styles.active : ''}`}
                    onClick={() => setFilterStatus('all')}
                  >
                    <Text className={`${styles.filterText} ${filterStatus === 'all' ? styles.activeText : ''}`}>全部</Text>
                  </View>
                  {STATUS_OPTIONS.map(option => (
                    <View
                      key={option.value}
                      className={`${styles.filterItem} ${filterStatus === option.value ? styles.active : ''}`}
                      onClick={() => setFilterStatus(option.value)}
                    >
                      <Text className={`${styles.filterText} ${filterStatus === option.value ? styles.activeText : ''}`}
                        style={{ color: filterStatus === option.value ? option.color : undefined }}>
                        {option.label}
                      </Text>
                    </View>
                  ))}
                </View>

                <View className={styles.candidateList}>
                  {applications
                    .filter(app => filterStatus === 'all' || app.status === filterStatus)
                    .map(app => {
                    const statusInfo = getStatusInfo(app.status);
                    const nextMeeting = latestMeetings[app.applicantId];
                    return (
                      <View 
                        key={app.applicantId} 
                        className={styles.candidateCard}
                        onClick={() => handleCandidateClick(app)}
                      >
                        <View className={styles.candidateInfo}>
                          <Image
                            src={app.applicantAvatar}
                            className={styles.candidateAvatar}
                            mode='aspectFill'
                          />
                          <View className={styles.candidateDetail}>
                            <Text className={styles.candidateName}>{app.applicantName}</Text>
                            <Text className={styles.candidateCollege}>{app.applicantCollege}</Text>
                            {app.intendedRole && (
                              <Text className={styles.intendedRole}>意向：{app.intendedRole}</Text>
                            )}
                          </View>
                          <View
                            className={styles.candidateStatus}
                            style={{ borderColor: statusInfo.color }}
                          >
                            <Text style={{ color: statusInfo.color }}>{statusInfo.label}</Text>
                          </View>
                        </View>

                        {nextMeeting && (
                          <View className={styles.nextMeetTime}>
                            <Text style={{ fontSize: '24rpx', color: '#5B86E5' }}>
                              📅 下次约聊：{new Date(nextMeeting.meetTime).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                        )}

                        <View className={styles.candidateActions}>
                          <Button 
                            className={styles.meetBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMeet(app);
                            }}
                          >
                            约聊
                          </Button>
                          <Button 
                            className={styles.viewBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCandidateClick(app);
                            }}
                          >
                            查看详情
                          </Button>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {applications.filter(app => filterStatus === 'all' || app.status === filterStatus).length === 0 && (
                  <View className={styles.emptyState}>
                    <Text className={styles.emptyText}>暂无符合条件的候选人</Text>
                    <Button className={styles.inviteBtn} onClick={handleInvite}>
                      去邀请搭子
                    </Button>
                  </View>
                )}
              </>
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyText}>暂没有候选人</Text>
                <Button className={styles.inviteBtn} onClick={handleInvite}>
                  去邀请搭子
                </Button>
              </View>
            )}
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

      {!isOwner && (
        <View className={styles.footer}>
          <Button className={styles.meetBtn} onClick={() => handleMeet()}>
            预约碰面
          </Button>
          <Button className={styles.applyBtn} onClick={handleApply}>
            申请加入
          </Button>
        </View>
      )}
    </View>
  );
};

export default ProjectDetailPage;

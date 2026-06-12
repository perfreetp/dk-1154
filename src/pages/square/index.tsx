import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { STAGE_OPTIONS } from '../../types/project';
import { store } from '../../store';
import ProjectCard from '../../components/ProjectCard';
import SearchBar from '../../components/SearchBar';
import FilterBar from '../../components/FilterBar';
import EmptyState from '../../components/EmptyState';
import styles from './index.module.scss';

const SquarePage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      await store.checkExpiredProjects();
      const activeProjects = await store.getActiveProjects();
      setProjects(activeProjects);
      Taro.stopPullDownRefresh();
    } catch (error) {
      console.error('[Square] Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    filterProjects();
  }, [projects, searchValue, selectedStage]);

  usePullDownRefresh(() => {
    loadProjects();
  });

  useEffect(() => {
    const eventChannel = Taro.getCurrentInstance().page?.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.on('onProjectPublished', () => {
        loadProjects();
      });
    }
  }, [loadProjects]);

  const filterProjects = () => {
    let filtered = [...projects];

    if (searchValue) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.description.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (selectedStage) {
      filtered = filtered.filter(p => p.stage === selectedStage);
    }

    setFilteredProjects(filtered);
  };

  const handleCollect = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      await store.updateProject(id, { isCollected: !project.isCollected });
      setProjects(prev => prev.map(p =>
        p.id === id ? { ...p, isCollected: !p.isCollected } : p
      ));
    }
  };

  const handlePublish = () => {
    Taro.navigateTo({
      url: '/pages/publish/index'
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>项目广场</Text>
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder='搜索项目名称...'
        />
      </View>

      <View className={styles.content}>
        <FilterBar
          options={STAGE_OPTIONS}
          value={selectedStage}
          onChange={setSelectedStage}
        />

        <ScrollView
          scrollY
          className={styles.scrollView}
          style={{ height: 'calc(100vh - 400rpx)' }}
        >
          <View style={{ padding: '0 32rpx' }}>
            {loading ? (
              <View style={{ textAlign: 'center', padding: '100rpx 0' }}>
                <Text style={{ color: '#94A3B8' }}>加载中...</Text>
              </View>
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onCollect={handleCollect}
                />
              ))
            ) : (
              <EmptyState message='暂无相关项目，去发布一个吧~' />
            )}
          </View>
        </ScrollView>
      </View>

      <View className={styles.publishBtn} onClick={handlePublish}>
        <Text className={styles.btnText}>+</Text>
      </View>
    </View>
  );
};

export default SquarePage;

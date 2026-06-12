import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, PullDownRefresh } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { Project, STAGE_OPTIONS } from '../../types/project';
import { mockProjects } from '../../data/mock-projects';
import ProjectCard from '../../components/ProjectCard';
import SearchBar from '../../components/SearchBar';
import FilterBar from '../../components/FilterBar';
import EmptyState from '../../components/EmptyState';
import styles from './index.module.scss';

const SquarePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedStage, setSelectedStage] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchValue, selectedStage]);

  usePullDownRefresh(() => {
    loadProjects();
  });

  const loadProjects = () => {
    try {
      setProjects(mockProjects);
      Taro.stopPullDownRefresh();
    } catch (error) {
      console.error('[Square] Failed to load projects:', error);
    }
  };

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

  const handleCollect = (id: string) => {
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, isCollected: !p.isCollected } : p
    ));
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
          <View style={{ padding: `0 ${$page-padding}` }}>
            {filteredProjects.length > 0 ? (
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

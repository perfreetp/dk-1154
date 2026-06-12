import React, { useState } from 'react';
import { View, Text, Input, Button, ScrollView, Checkbox } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { COLLEGE_OPTIONS, SKILL_TAGS, STAGE_OPTIONS } from '../../types/project';
import styles from './index.module.scss';

const PublishPage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stage: 'idea',
    college: '',
    tags: [] as string[],
    roles: [{ name: '', required: 1 }]
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      Taro.showToast({ title: '请输入项目名称', icon: 'none' });
      return;
    }
    if (!formData.description.trim()) {
      Taro.showToast({ title: '请输入项目描述', icon: 'none' });
      return;
    }
    if (!formData.college) {
      Taro.showToast({ title: '请选择学院', icon: 'none' });
      return;
    }
    if (formData.tags.length === 0) {
      Taro.showToast({ title: '请选择至少一个技能标签', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '发布中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({
        title: '发布成功',
        icon: 'success'
      });
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/square/index' });
      }, 1500);
    }, 1000);
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const addRole = () => {
    setFormData(prev => ({
      ...prev,
      roles: [...prev.roles, { name: '', required: 1 }]
    }));
  };

  const removeRole = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter((_, i) => i !== index)
    }));
  };

  const updateRole = (index: number, field: 'name' | 'required', value: any) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.map((role, i) =>
        i === index ? { ...role, [field]: value } : role
      )
    }));
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY className={styles.form}>
        <View className={styles.formItem}>
          <Text className={styles.label}>项目名称 *</Text>
          <Input
            className={styles.input}
            placeholder='请输入项目名称'
            value={formData.title}
            onInput={(e) => setFormData(prev => ({ ...prev, title: e.detail.value }))}
            maxlength={50}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>项目描述 *</Text>
          <Input
            className={styles.textarea}
            placeholder='请描述你的项目'
            value={formData.description}
            onInput={(e) => setFormData(prev => ({ ...prev, description: e.detail.value }))}
            maxlength={500}
            multiline
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>项目阶段</Text>
          <View className={styles.stageGrid}>
            {STAGE_OPTIONS.filter(s => s.value).map(stage => (
              <View
                key={stage.value}
                className={`${styles.stageTag} ${formData.stage === stage.value ? styles.active : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, stage: stage.value! }))}
              >
                <Text className={styles.stageText}>{stage.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>所属学院 *</Text>
          <View className={styles.collegeGrid}>
            {COLLEGE_OPTIONS.map(college => (
              <View
                key={college}
                className={`${styles.collegeTag} ${formData.college === college ? styles.active : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, college }))}
              >
                <Text className={styles.collegeText}>{college}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.label}>技能标签 *</Text>
          <View className={styles.skillGrid}>
            {SKILL_TAGS.map(skill => (
              <View
                key={skill}
                className={`${styles.skillTag} ${formData.tags.includes(skill) ? styles.active : ''}`}
                onClick={() => toggleTag(skill)}
              >
                <Text className={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.labelRow}>
            <Text className={styles.label}>招募角色</Text>
            <Button className={styles.addBtn} onClick={addRole}>+ 添加</Button>
          </View>
          {formData.roles.map((role, idx) => (
            <View key={idx} className={styles.roleRow}>
              <Input
                className={styles.roleInput}
                placeholder='角色名称'
                value={role.name}
                onInput={(e) => updateRole(idx, 'name', e.detail.value)}
              />
              <View className={styles.roleCount}>
                <Text className={styles.roleLabel}>需求人数</Text>
                <View className={styles.countControl}>
                  <Text
                    className={styles.countBtn}
                    onClick={() => updateRole(idx, 'required', Math.max(1, role.required - 1))}
                  >
                    -
                  </Text>
                  <Text className={styles.countValue}>{role.required}</Text>
                  <Text
                    className={styles.countBtn}
                    onClick={() => updateRole(idx, 'required', role.required + 1)}
                  >
                    +
                  </Text>
                </View>
              </View>
              {formData.roles.length > 1 && (
                <Text className={styles.removeBtn} onClick={() => removeRole(idx)}>删除</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          发布项目
        </Button>
      </View>
    </View>
  );
};

export default PublishPage;

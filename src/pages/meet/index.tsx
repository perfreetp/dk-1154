import React, { useState } from 'react';
import { View, Text, Input, Button, Picker } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';

const MeetPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: '',
    time: '14:00',
    location: '',
    note: ''
  });

  const locations = [
    '大学生活动中心',
    '图书馆咖啡厅',
    '学生食堂三楼',
    '教学楼休息区',
    '创业园会议室'
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00'
  ];

  const handleSubmit = () => {
    if (!formData.date) {
      Taro.showToast({ title: '请选择日期', icon: 'none' });
      return;
    }
    if (!formData.location) {
      Taro.showToast({ title: '请选择地点', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '发送邀约中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({
        title: '邀约已发送',
        icon: 'success'
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    }, 1000);
  };

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.label}>选择日期</Text>
        <Picker
          mode='date'
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.detail.value }))}
        >
          <View className={styles.picker}>
            <Text className={formData.date ? styles.pickerValue : styles.pickerPlaceholder}>
              {formData.date || '请选择日期'}
            </Text>
            <Text className={styles.pickerArrow}>›</Text>
          </View>
        </Picker>
      </View>

      <View className={styles.section}>
        <Text className={styles.label}>选择时间</Text>
        <View className={styles.timeGrid}>
          {timeSlots.map(time => (
            <View
              key={time}
              className={`${styles.timeTag} ${formData.time === time ? styles.active : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, time }))}
            >
              <Text className={styles.timeText}>{time}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.label}>选择地点</Text>
        <View className={styles.locationList}>
          {locations.map((location, idx) => (
            <View
              key={idx}
              className={`${styles.locationItem} ${formData.location === location ? styles.active : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, location }))}
            >
              <Text className={styles.locationIcon}>📍</Text>
              <Text className={styles.locationText}>{location}</Text>
              {formData.location === location && (
                <Text className={styles.checkmark}>✓</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.label}>备注（选填）</Text>
        <Input
          className={styles.input}
          placeholder='可以说说你想讨论的话题...'
          value={formData.note}
          onInput={(e) => setFormData(prev => ({ ...prev, note: e.detail.value }))}
          maxlength={200}
        />
      </View>

      <View className={styles.footer}>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          发送邀约
        </Button>
      </View>
    </View>
  );
};

export default MeetPage;

import React, { useState } from 'react';
import { View, Text, Image, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface ReviewItem {
  id: string;
  userName: string;
  userAvatar: string;
  projectName: string;
}

const ReviewPage: React.FC = () => {
  const [reviews] = useState<ReviewItem[]>([
    {
      id: '1',
      userName: '李四',
      userAvatar: 'https://picsum.photos/id/91/200/200',
      projectName: 'AI智能简历优化助手'
    },
    {
      id: '2',
      userName: '王五',
      userAvatar: 'https://picsum.photos/id/177/200/200',
      projectName: '校园活动社交平台'
    }
  ]);

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [contents, setContents] = useState<Record<string, string>>({});

  const handleRate = (id: string, rating: number) => {
    setRatings(prev => ({ ...prev, [id]: rating }));
  };

  const handleContentChange = (id: string, content: string) => {
    setContents(prev => ({ ...prev, [id]: content }));
  };

  const handleSubmit = (id: string) => {
    if (!ratings[id]) {
      Taro.showToast({ title: '请选择评分', icon: 'none' });
      return;
    }

    Taro.showLoading({ title: '提交中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({
        title: '评价成功',
        icon: 'success'
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    }, 1000);
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>待评价</Text>
        <Text className={styles.subtitle}>给合作过的队友一个评价吧</Text>
      </View>

      <View className={styles.list}>
        {reviews.map(review => (
          <View key={review.id} className={styles.reviewCard}>
            <View className={styles.userInfo}>
              <Image
                src={review.userAvatar}
                className={styles.avatar}
                mode='aspectFill'
              />
              <View className={styles.userText}>
                <Text className={styles.userName}>{review.userName}</Text>
                <Text className={styles.projectName}>{review.projectName}</Text>
              </View>
            </View>

            <View className={styles.ratingSection}>
              <Text className={styles.ratingLabel}>合作评分</Text>
              <View className={styles.stars}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Text
                    key={star}
                    className={`${styles.star} ${ratings[review.id] && star <= ratings[review.id] ? styles.active : ''}`}
                    onClick={() => handleRate(review.id, star)}
                  >
                    ★
                  </Text>
                ))}
              </View>
            </View>

            <View className={styles.contentSection}>
              <Text className={styles.contentLabel}>评价内容</Text>
              <Input
                className={styles.textarea}
                placeholder='分享你的合作体验...'
                value={contents[review.id] || ''}
                onInput={(e) => handleContentChange(review.id, e.detail.value)}
                maxlength={200}
                multiline
              />
            </View>

            <Button
              className={styles.submitBtn}
              onClick={() => handleSubmit(review.id)}
            >
              提交评价
            </Button>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ReviewPage;

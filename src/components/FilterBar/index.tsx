import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';

interface FilterItem {
  label: string;
  value: string;
}

interface Props {
  options: FilterItem[];
  value: string;
  onChange: (value: string) => void;
}

const FilterBar: React.FC<Props> = ({ options, value, onChange }) => {
  return (
    <View className={styles.container}>
      <ScrollView
        scrollX
        className={styles.scrollView}
        scrollWithAnimation
      >
        {options.map((option) => (
          <View
            key={option.value}
            className={`${styles.tag} ${value === option.value ? styles.active : ''}`}
            onClick={() => onChange(option.value)}
          >
            <Text className={styles.tagText}>{option.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default FilterBar;

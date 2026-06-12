import React from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';

interface Props {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<Props> = ({ value, placeholder = '搜索项目...', onChange }) => {
  return (
    <View className={styles.container}>
      <View className={styles.searchBox}>
        <Text className={styles.icon}>🔍</Text>
        <Input
          className={styles.input}
          value={value}
          placeholder={placeholder}
          placeholderClass={styles.placeholder}
          onInput={(e) => onChange(e.detail.value)}
        />
        {value && (
          <Text
            className={styles.clear}
            onClick={() => onChange('')}
          >
            ✕
          </Text>
        )}
      </View>
    </View>
  );
};

export default SearchBar;

import { View, FlatList, Dimensions } from 'react-native';
import { dummyCards } from '@/constants/dummy';
import NewsCard from '@/components/ui/NewsCard';

const { height } = Dimensions.get('window');

export default function FeedScreen() {
  return (
    <FlatList
      data={dummyCards}
      keyExtractor={(item) => item.id}
      pagingEnabled
      snapToInterval={height}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={{ height }}>
          <NewsCard {...item} />
        </View>
      )}
    />
  );
}

import { View, ScrollView } from 'react-native';
import NewsCard from '@/components/ui/NewsCard';
import { dummyCards } from '@/data/dummyCards';

export default function HomeScreen() {
  return (
    <ScrollView>
      {dummyCards.map((card) => (
        <NewsCard key={card.id} {...card} />
      ))}
    </ScrollView>
  );
}

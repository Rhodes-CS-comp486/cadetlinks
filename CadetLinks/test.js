import { useEffect, useState } from 'react';
import { getCadets } from '../firebase/firebase';

export default function CadetListScreen() {
  const [cadets, setCadets] = useState([]);

  useEffect(() => {
    getCadets().then(setCadets);
  }, []);

  if (!cadets) {
    return <Text>Loading cadets...</Text>;
  }

  return (
    <View>
      <Text>Cadets Loaded:</Text>
      <Text>{JSON.stringify(cadets, null, 2)}</Text>
    </View>
  );

}
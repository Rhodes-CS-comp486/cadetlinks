
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { onValue, ref, get } from 'firebase/database';
import { db } from '../../../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERMISSIONS } from '../../../assets/constants';
import {TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// import { ca } from 'react-native-paper-dates';


export let cadetObject: any = null;


export function useHomeLogic() {
  const navigation = useNavigation();
  const [cadetPermissionsMap, setCadetPermissionsMap] = useState<Map<string, boolean>>(
    new Map([
        [PERMISSIONS.EVENT_MAKING, false],
        [PERMISSIONS.FILE_UPLOADING, false],
        [PERMISSIONS.ATTENDANCE_EDITING, false]
    ])
);

  useEffect(() => {
  
    const loadCadetData = async() =>{
      try {
        const storedCadetKey = await AsyncStorage.getItem("currentCadetKey");
        if (!storedCadetKey) {
          console.warn("No cadetKey found in AsyncStorage");
          return;
        }
        const profileRef = ref(db, "cadets/" + storedCadetKey);

        const snapshot = await get(profileRef);

        if (!snapshot.exists()) {
          setCadetPermissionsMap(new Map());
          return;
        }

        console.log("Cadet data in Home:", snapshot.val());
        cadetObject = snapshot.val();

        const cadetData = snapshot.val();

        //console.log("Initial permissions map:", cadetPermissionsMap);   

        const permissions = cadetData?.permissions 
          ? cadetData.permissions.split(","):[];
        for (const perm of permissions) {
            setCadetPermissionsMap(prev => new Map(prev).set(perm, true));
        }
        
      } catch (error) {
        console.error("Error fetching cadet data:", error);
      }
    };
    loadCadetData();
  },[] );

  console.log("Permissions map:",cadetPermissionsMap);


  useLayoutEffect(() => {
    if (!navigation || typeof navigation.setOptions !== 'function') return;

    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          style={{ marginRight: 15 }}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]); 

  //Announcements
  const announcements = [
  { id: '1', title: 'LLAB Uniform', body: 'OCPs required this Thursday.' },
  { id: '2', title: 'PT Location Change', body: 'Meet at gym instead of track this week.' },
  { id: '3', title: 'LLAB Uniform', body: 'Dress Blues required next Thursday.' },
  { id: '4', title: 'PT Cancellation', body: 'PT on 23 Feb has been cancelled.' },
  { id: '5', title: 'Upcoming PFD', body: 'The next PFD is scheduled for 28 Feb.' },
  ];

  const hasPermission = (permission: string): boolean => {
    return cadetPermissionsMap.get(permission) || false;
  };

  return{
    navigation,
    cadetPermissionsMap,
    hasPermission,
    announcements,
  };
  
}
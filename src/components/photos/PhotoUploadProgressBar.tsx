import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter, View } from 'react-native';
import { Colors } from '../../../styles/colors';

export const PhotoUploadProgressBar = () => {
  const [progressBar, setProgressBar] = useState({
    width: 0,
    lengthComputable: false
  });

  useEffect(() => {
    const listener = DeviceEventEmitter.addListener('event.PhotoUploadProgress', (data) => setProgressBar(data));
    return () => {
      listener.remove();
    }
  }, []);

  if (progressBar.lengthComputable && progressBar.width) {
    return (
      <View
        style={{
          width: '100%',
          height: 1,
        }}
      >
        <View style={{
            width: progressBar.width + '%',
            height: 1,
            backgroundColor: Colors.cyan,
          }}
        ></View>
      </View>
    );
  }
  return null;
}

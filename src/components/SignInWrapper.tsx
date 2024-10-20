import React, { ImageBackground, ScrollView, View, Image, StyleSheet } from 'react-native';
import { globalStyles } from '../../styles/global-stylesheet';
import { Screens } from '../helpers/screens';

const screens = new Screens();

interface Props {
  children: JSX.Element
}

export const SignInWrapper = ({ children }: Props): JSX.Element => {
  return (
    <ImageBackground source={require('../../assets/images/APP_BG.jpg')} style={globalStyles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.container} 
        bounces={false} 
        keyboardShouldPersistTaps={'handled'} 
      >
        <View style={{ flexGrow: 1 }}>
          <Image source={require('../../assets/images/CM_Logo_2013.png')} style={styles.logoImage} />
        </View>
        {children}
      </ScrollView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, 
    flexDirection: 'column', 
    alignSelf: 'stretch', 
    justifyContent: 'space-between' 
  },
  logoImage: {
    marginTop: 75,
    alignSelf: 'center',
    ...screens.calcSizeW(3.8,33),
  },
})

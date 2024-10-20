import { StyleSheet } from 'react-native'
import { Colors } from './colors'
import { modalStyles } from './modal'
import { ScreenHeight, ScreenWidth } from '@freakycoder/react-native-helpers'

export const globalStyles = StyleSheet.create({
  backgroundImage: {
    alignSelf: 'flex-start',
    resizeMode: 'cover',
    zIndex: -1,
    width: ScreenWidth,
    height: ScreenHeight,
    ...StyleSheet.absoluteFillObject,
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  butonContainerFullWidth: {
    width: '100%',
    alignSelf: 'center',
  },
  butonContainerPartialWidth: {
    width: '90%',
    alignSelf: 'center',
  },
  buttonStyle: {
    color: Colors.whiteRGBA(),
    borderRadius: 25,
    padding: 12,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: Colors.cyan,
  },
  buttonTransparent: {
    color: Colors.whiteRGBA(),
    borderRadius: 25,
    padding: 12,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: Colors.blackRGBA(),
    borderColor: Colors.whiteRGBA(),
    borderWidth: 1,
  },
  buttonWhiteStyle: {
    color: Colors.darkCyan,
    padding: 12,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: Colors.whiteRGBA(),
  },
  carouselLinkStyle: {
    color: Colors.darkCyan,
    fontWeight: 'bold',
    fontSize: 12,
  },
  centeredText: {
    textAlign: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: Colors.whiteRGBA(),
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkCyanColor: {
    color: Colors.darkCyan,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: 'silver',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    margin: 4,
  },
  headerText: {
    color: Colors.blackRGBA(),
    alignSelf: 'center',
    padding: 15,
    fontWeight: 'bold',
    fontSize: 24,
  },
  inputContainerStyle: {
    paddingLeft: 15,
    backgroundColor: Colors.whiteRGBA(),
    width: '95%',
    alignSelf: 'center',
    borderRadius: 25,
    borderBottomWidth: 0,
  },
  inputLabelText: {
    color: Colors.blackRGBA(),
    padding: 6,
    paddingLeft: 25,
  },
  linkColor: {
    color: Colors.darkCyan,
  },
  linkRightAction: {
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 'auto',
    color: Colors.darkCyan,
    textAlign: 'right'
  },
  ...modalStyles,
  normalText: {
    fontSize: 16,
  },
  primarySectionColor: {
    backgroundColor: Colors.darkCyan,
  },
  sectionHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  softRadius: {
    borderRadius: 12,
  },
  veiledSection: {
    backgroundColor: Colors.whiteRGBA(0.6),
    borderRadius: 40,
  },
  growContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', height: '100%'
  },
});

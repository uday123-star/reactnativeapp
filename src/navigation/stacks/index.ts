import { createStackNavigator } from '@react-navigation/stack'
import { RootStackParamList } from '../../../types/types'

export * from './conversations'
export * from './my-profile'
export * from './classlist'
export * from './photos'
export * from './blocked-users'

export const Stack = createStackNavigator<RootStackParamList>()

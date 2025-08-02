import { registerRootComponent } from 'expo';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TamaguiProvider, createTamagui } from 'tamagui';
import {defaultConfig} from "@tamagui/config/v4"
import {createAnimations} from "@tamagui/animations-moti"; 
import * as eva from "@eva-design/eva";
import {  ApplicationProvider,  } from '@ui-kitten/components';
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

const animations__ = createAnimations({
    fast: {
      type: 'spring',
      damping: 20,
      mass: 1.2,
      stiffness: 250,
    },
    medium: {
      type: 'spring',
      damping: 10,
      mass: 0.9,
      stiffness: 100,
    },
    slow: {
      type: 'spring',
      damping: 20,
      stiffness: 60,
    },
    bouncy: 'ease-out 300ms'
  })
const tamagui_config = createTamagui({
    ...defaultConfig, 
    animations: animations__
});

const RootComponent = () => (
      <ApplicationProvider {...eva} theme={eva.light}>
    <Provider store = {store}>
        <TamaguiProvider config={tamagui_config}>
        <GestureHandlerRootView><App/></GestureHandlerRootView>
        </TamaguiProvider>
    </Provider>
    </ApplicationProvider>
)
//AppRegistry.registerComponent(appName, RootComponent); 
registerRootComponent(RootComponent); 
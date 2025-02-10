import { registerRootComponent } from 'expo';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

const RootComponent = () => (
    <Provider store = {store}>
        <GestureHandlerRootView><App/></GestureHandlerRootView>
    </Provider>
)
//AppRegistry.registerComponent(appName, RootComponent); 
registerRootComponent(RootComponent); 
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import { SafeAreaView, StyleSheet, View, Animated, Easing, useWindowDimensions } from 'react-native';

import { NativeRouter, Route } from 'react-router-native';

import AnimatedStack from 'react-router-native-animate-stack';
import Navigator from './Navigator';
import { Home, Topics, About } from './Components';

const App = () => {
  const enterAnimKit = new Animated.Value(0);
  const exitAnimKit = new Animated.Value(0);
  const width = useWindowDimensions().width;
  return (
    <SafeAreaView>
      <NativeRouter>
        <View style={styles.container}>
          <Navigator />
          <AnimatedStack
            swipeable={true}
            onMountAnimate={() => {
              Animated.timing(enterAnimKit, {
                toValue: 1,
                duration: 100
              }).start();
            }}
            onTransitionAnimate={({ location, action, isNestedRoute }) => {
              if (isNestedRoute) return;
              // Enter and exit or one only
              enterAnimKit.setValue(0);
              exitAnimKit.setValue(0);

              Animated.timing(enterAnimKit, {
                toValue: 1,
                duration: 500,
                delay: 200
              }).start();

              Animated.timing(exitAnimKit, {
                toValue: 1,
                duration: 500
              }).start();
            }}
            activedViewStyleHandler={({ location, action, isNestedRoute }) => {
              return {
                transform: [
                  {
                    translateX: enterAnimKit.interpolate({
                      inputRange: [0, 1],
                      outputRange: [width, 0]
                    })
                  },
                  {
                  scale: enterAnimKit.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0.2, 1]
                  })
                }
                ]
              };
            }}
            deactivedViewStyleHandler={({ location, action, isNestedRoute }) => {
              return {
                transform: [
                  {    
                    translateX: exitAnimKit.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -width]
                    })
                  },
                  {
                  scale: exitAnimKit.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0.2, 1]
                  })
                }
                ]
              };
            }}
          >
            <Route exact path='/'>
              <Home />
            </Route>
            <Route path='/about'>
              <About />
            </Route>
            <Route path='/topics' component={Topics} />
          </AnimatedStack>
        </View>
      </NativeRouter>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    // padding: 10,
    width: '100%'
  },
  header: {
    fontSize: 20
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10
  },
  subNavItem: {
    padding: 5
  },
  topic: {
    textAlign: 'center',
    fontSize: 15
  }
});

export default App;

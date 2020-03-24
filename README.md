[![Codecov Coverage](https://img.shields.io/codecov/c/github/Taymindis/react-router-native-animate-stack/coverage.svg?style=flat-square)](https://codecov.io/gh/Taymindis/react-router-native-animate-stack/)

# react-router-native-animate-stack

[![npm version](https://img.shields.io/npm/v/react-router-native-animate-stack.svg?style=flat-square)](https://www.npmjs.com/package/react-router-native-animate-stack)
[![downloads](https://img.shields.io/npm/dm/react-router-native-animate-stack.svg?style=flat-square)](https://www.npmjs.com/package/react-router-native-animate-stack)

A latest React version react router native animate stack

## purpose of this component

React Router Native v5 with your desired customization transition style! It's design with Animated.View

This package only useable with React Router Native. Use it like a React router native's **Switch**

## Installation

Install `react-router-native` and this package:

`npm install react-router-native react-router-native-animate-stack --save`

OR

`yarn add react-router-native react-router-native-animate-stack`

## Usage

Here's a simple working example of using it.

```jsx
// When no customization, it is just like a stack
<AnimatedStack
    swipeCancelSpeed={50}
    swipeable={true}>
    <Route exact path='/'>
        <Home />
    </Route>
    <Route path='/about'>
        <About />
    </Route>
    <Route path='/topics' component={Topics} />
</AnimatedStack>
```

This is what the above code looks like running on iOS simulator:

![Default Behaviour](https://raw.githubusercontent.com/Taymindis/react-router-native-animate-stack/master/demo/default_bahavior.gif)

The stack component will trigger gesture swipe forward and backward when passing swipeable true. 

If you are familiar with [Switch](https://reacttraining.com/react-router/native/api/Switch), you will know how to use this.

## Customizing Animation your desire animation style

###### onMountAnimate
when the component mounted, you can defined how you going to animate

##### onTransitionAnimate
when the component swap between 2 screen, you can animating the view!

##### activedViewStyleHandler
Enter animation style is the ViewStyle for Enter Screen, which is acive screen

##### deactivedViewStyleHandler
Exit animation style is the ViewStyle for Exit Screen, which is deactive screen

Below example you will be more clear:

```jsx

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
            swipeCancelSpeed={50}
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

```

With this code given, the transition will be shown as below

![Customize Transiction Animation](https://raw.githubusercontent.com/Taymindis/react-router-native-animate-stack/master/demo/custom_transition.gif)


## Reason of created this

React Router Native still a popular routing engine which native, clean(no other UI kit dependencies) and powerful for routing but no animation.

Now added on animate stack, you can animate the view on run time, changing the animation style on runtime! 

React router for routing, let the drawer, menu bar, tab bar and other fancy UI kits bar for other Ui Library control without any breakage. 


## Design for latest React Version.

This package is using getDerivedStateFromProps function which going to replace componentWillReceiveProps 


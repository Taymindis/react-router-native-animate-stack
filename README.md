# react-router-native-animate-stack

[![npm version](https://img.shields.io/npm/v/react-router-native-animate-stack.svg?style=flat-square)](https://www.npmjs.com/package/react-router-native-animate-stack)
[![downloads](https://img.shields.io/npm/dm/react-router-native-animate-stack.svg?style=flat-square)](https://www.npmjs.com/package/react-router-native-animate-stack)

A latest React version react router native animate stack

## purpose of this component

React Router Native v5 with your desired customization transition style! It's design with Animated.View

This package only useable with React Router Native. Use it like a React router native's **Switch**

[Snack Demo](https://snack.expo.io/@minikawoon/react-router-native-animate-stack)

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



### transition like butterfly

![Butterfly Transiction Animation](https://raw.githubusercontent.com/Taymindis/react-router-native-animate-stack/master/demo/butterfly_transition.gif)

```jsx
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
        rotateX: enterAnimKit.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: ['0deg', '180deg', '0deg']
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
        rotateX: exitAnimKit.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: ['0deg', '180deg', '0deg']
      })
    }
    ]
  };
}}
```            




### transition like Scaling

![Scaling Transiction Animation](https://raw.githubusercontent.com/Taymindis/react-router-native-animate-stack/master/demo/scale_transition.gif)

```jsx
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

```            

### Vertical Swipe and Navigation

![Scaling Transiction Up Animation](https://raw.githubusercontent.com/Taymindis/react-router-native-animate-stack/master/demo/vertical_swipe.gif)

```jsx

<NativeRouter>
    <View style={styles.container}>
      <View style={{ flex: 9, height: '100%' }}>
        <AnimatedStack
          swipeMethod={SwipeMethod.SWIPE_VERTICAL}
          onMountAnimate={() => {
            Animated.timing(enterAnimKit, {
              toValue: 1,
              duration: 100,
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
              delay: 200,
            }).start();

            Animated.timing(exitAnimKit, {
              toValue: 1,
              duration: 500,
            }).start();
          }}
          activedViewStyleHandler={({ location, action, isNestedRoute }) => {
            return {
              paddingLeft: 40,
              transform: [
                {
                  translateY: enterAnimKit.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height, 0],
                  }),
                },
                {
                  scale: enterAnimKit.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0.2, 1],
                  }),
                },
              ],
            };
          }}
          deactivedViewStyleHandler={({ location, action, isNestedRoute }) => {
            return {
              transform: [
                {
                  translateY: exitAnimKit.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -height],
                  }),
                },
                {
                  scale: exitAnimKit.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 0.2, 1],
                  }),
                },
              ],
            };
          }}
        >
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/topics" component={Topics} />
        </AnimatedStack>
      </View>
      <View style={{ flex: 1 }}>
        <Navigator />
      </View>
    </View>
  </NativeRouter>

```


## Reason of created this

React Router Native still a popular routing engine which native, clean(no other UI kit dependencies) and powerful for routing but no animation.

Now added on animate stack, you can animate the view on run time, changing the animation style on runtime! 

React router for routing, let the drawer, menu bar, tab bar and other fancy UI kits bar for other Ui Library control without any breakage. 


## Design for latest React Version.

This package is using getDerivedStateFromProps function which going to replace componentWillReceiveProps 


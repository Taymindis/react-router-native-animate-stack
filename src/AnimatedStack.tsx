// This is 2 child overlapping animation like a stack navigator, also has exit animation feature(optional)
import React from 'react';
import { node, object, number, bool, string, oneOf, func } from 'prop-types';
import { View, ViewPropTypes, Dimensions, Animated, PanResponder, StyleProp, ViewStyle } from 'react-native';
import { withRouter, Route, matchPath, RouteComponentProps } from 'react-router-native';

/** state management */
const INIT_STATE: number = 0;
const SWIPING_BACK_STATE = 1;
const SWIPING_FORWD_STATE = 1 << 1;
const SWIPED_BACK_STATE = 1 << 2;
const SWIPED_FORWD_STATE = 1 << 3;
const SWIPED_CANCEL_STATE = 1 << 4;
const TRANSITING_STATE = 1 << 5;
const TRANSITED_STATE = 1 << 6;
const IDLE_STATE = 1 << 7;
/** state management */

const LEFT_POSITION = 0;

const InitAnimatableSwitchRoute = () => <View style={{ backgroundColor: 'transparent' }}></View>;

interface AnimatedStackProps extends RouteComponentProps<any> {
  /**
   * when swiping halfway cancel, the speed of back to actual screen in ms, default is 50ms
   */
  swipeCancelSpeed: number;
  /**
   * when swipeable is false, no gesture swipe is allow, default is true
   */
  swipeable: boolean;
  /**
   * style of Animated.View
   */
  style: { width: any | undefined; height: any };
  /**
   * When componentDidmount, animate the component, enter and exit
   * - example:
   *
   * ```
   * onMountAnimate={()=> {
   *   enterAnimKit.setValue(0); // set to 0 to make it like entering effect
   *   Animated.timing(enterAnimKit, {
   *     toValue: 1,
   *     duration: 100,
   *   }).start();
   * }}
   * ```
   */
  onMountAnimate: () => void;

  /**
   * When component has been updated, transitioning your enter and exit component which defined by activedViewStyleHandler and deactivedViewStyleHandler
   * - location: the react router native current targeted location
   * - action: the react router native action, POP, PUSH, REPLACE
   * - isNestedRoute: whether it's nested route in boolean type or location path are same, it's true as well
   * - example:
   *
   * ```
   *  onTransitionAnimate={({location, action, isNestedRoute}) => {
   *    if(isNestedRoute)
   *      return;
   *    // Enter and exit or one only
   *    enterAnimKit.setValue(0);
   *    exitAnimKit.setValue(0);
   *
   *    Animated.timing(enterAnimKit, {
   *      toValue: 1,
   *      duration: 500,
   *      delay: 200
   *    }).start();
   *
   *    Animated.timing(exitAnimKit, {
   *      toValue: 1,
   *      duration: 500,
   *    }).start();
   *  }}
   * ```
   */
  onTransitionAnimate: (onAnimateParams: { location: object; action: string; isNestedRoute: boolean }) => void;

  /**
   * enter animation style call back to return a Animated.View styles
   * - location: the react router native current targeted location
   * - action: the react router native action, POP, PUSH, REPLACE
   * - isNestedRoute: whether it's nested route in boolean type or location path are same, it's true as well
   * - example:
   *
   * ```
   *   activedViewStyleHandler={({location, action, isNestedRoute}) => {
   *       return {
   *         left: enterAnimKit.interpolate({
   *           inputRange: [0, 1],
   *           outputRange: ['100%', '0%'],
   *         }),
   *       };
   *     }}
   * ```
   */
  activedViewStyleHandler: (onAnimateParams: {
    location: object;
    action: string;
    isNestedRoute: boolean;
  }) => StyleProp<ViewStyle>;

  /**
   * enter animation style call back to return a Animated.View styles
   * - location: the react router native current targeted location
   * - action: the react router native action, POP, PUSH, REPLACE
   * - isNestedRoute: whether it's nested route in boolean type or location path are same, it's true as well
   * - example:
   *
   * ```
   *   activedViewStyleHandler={({location, action, isNestedRoute}) => {
   *       return {
   *         left: enterAnimKit.interpolate({
   *           inputRange: [0, 1],
   *           outputRange: ['100%', '0%'],
   *         }),
   *       };
   *     }}
   * ```
   */
  deactivedViewStyleHandler: (onAnimateParams: {
    location: object;
    action: string;
    isNestedRoute: boolean;
  }) => StyleProp<ViewStyle>;

  /**
   * take over the swipe forward animation control where built in swipe forward animation will be disabled
   * - location: the react router native current targeted location
   * - action: the react router native action, POP, PUSH, REPLACE
   * - animXValue: the current swiped X position
   * - example:
   *
   * ```
   *  swipeInAnimationStyle={({location, action, animXValue }) => {
   *     return {
   *       transform: [
   *         {
   *           translateX: animXValue // when swiping in, the animXvalue must be the full screen width to 0
   *         }
   *       ],
   *       opacity: animXValue.interpolate({
   *         inputRange: [0, screenWidth],
   *         outputRange: [1, 0.3]
   *       })
   *     }
   *  }}
   * ```
   */
  swipeInAnimationStyle: (onAnimateParams: {
    location: object;
    action: string;
    animXValue: Animated.Value;
  }) => StyleProp<ViewStyle>;

  /**
   * take over the swipe out animation control where built in swipe out animation will be disabled
   * - location: the react router native current targeted location
   * - action: the react router native action, POP, PUSH, REPLACE
   * - animXValue: the current swiped X position
   * - example:
   *
   *
   * ```
   *  swipeOutAnimationStyle={({location, action, animXValue }) => {
   *    return {
   *      transform: [
   *        {
   *          translateX: animXValue.interpolate({ // when swiping out, the animXvalue must be the 0 to full screen width
   *            inputRange: [0, screenWidth],
   *            outputRange: ['-30%', '0%']
   *          })
   *        }
   *      ],
   *      opacity: animXValue.interpolate({
   *        inputRange: [0, screenWidth],
   *        outputRange: [0.3, 1]
   *      })
   *    }
   *  }}
   * ```
   */
  swipeOutAnimationStyle: (onAnimateParams: {
    location: object;
    action: string;
    animXValue: Animated.Value;
  }) => StyleProp<ViewStyle>;
  history: any;
  location: any;
}

/**
 * AnimatedStack is similar design pattern to react router native switch but it's swipeable and animatable
 * It's contain 2 <Animated.View /> in between transitioning.
 */
class AnimatedStack extends React.Component<AnimatedStackProps, any> {
  static propTypes = {
    children: node.isRequired,
    style: ViewPropTypes.style,
    location: object.isRequired,
    swipeCancelSpeed: number,
    swipeable: bool,
    onMountAnimate: func,
    onTransitionAnimate: (props: any, propName: any, componentName: any) => {
      const fn = props[propName];
      if (!fn.prototype || (typeof fn.prototype.constructor !== 'function' && fn.prototype.constructor.length !== 10)) {
        return new Error(propName + ' must be a function with 1 args');
      }
    },
    activedViewStyleHandler: func,
    deactivedViewStyleHandler: func,
  };

  static getDerivedStateFromProps(nextProps: any, prevState: any) {
    const {
      children: childrens,
      location,
      // history: { action, entries }
    } = nextProps;
    const {
      stackState,
      // deactivedChild,
      activedChild: prevActivedChild,
      location: prevLocation,
      // popProgressing,
      locKeys: prevLocKeys,
      previousKey,
      isPopBack: isPrevPopBack, // Get back the previous state popback
      // prevChild
      // locHistories
    } = prevState;

    const { key } = location;

    const nextChild: { props: any } | null = findLocationChild(childrens, location);
    if (!nextChild) {
      return null;
    }
    const [locKeys, isPopBack, currKey] = isSwipeBack(prevLocKeys, key, previousKey);

    const isSwiping = isSwiping_(stackState);

    const { render, component, children } = prevActivedChild.props;
    const { render: nRender, component: nComponent, children: nChildren } = nextChild.props;

    const isSameParent =
      (component || children || render || {}).type === (nComponent || nChildren || nRender || {}).type;
    if (isSwiping) {
      if (isPopBack) {
        return {
          location,
          deactivedChild: nextChild, // pop children
          activedChild: prevActivedChild, // animating prevActivedChild
          stackState,
          isSameParent,
          isPopBack,
          // popProgressing: true,
          locKeys,
          previousKey: currKey, // put currKey back to previousKey
        };
      } else {
        // it is swiping forward
        return {
          location,
          deactivedChild: prevActivedChild, // pop children
          activedChild: nextChild, // animated children
          // stackState,
          isSameParent,
          isPopBack,
          // popProgressing: true,
          locKeys,
          previousKey: currKey, // put currKey back to previousKey
        };
      }
    } else if (stackState & (SWIPED_BACK_STATE | SWIPED_FORWD_STATE | SWIPED_CANCEL_STATE)) {
      // if it is swiped state
      if (isPrevPopBack) {
        // swiped back
        return {
          location,
          activedChild: nextChild,
          isSameParent,
          isPopBack,
          stackState: IDLE_STATE,
          // popProgressing: false,
          locKeys,
          previousKey: currKey, // put currKey back to previousKey
        };
      } else {
        // swiped forward
        return {
          stackState: IDLE_STATE,
        };
      }
    }

    // It is transitioning block
    // if (stackState & TRANSITING_STATE) {
    return {
      location,
      deactivedChild: prevActivedChild,
      activedChild: nextChild,
      stackState: TRANSITING_STATE,
      isSameParent,
      isPopBack,
      // popProgressing: false,
      locKeys,
      previousKey: currKey, // put currKey back to previousKey
    };
    // } else /*if(stackState & TRANSITED_STATE)*/ {
    //   return null;
    // }
  }

  unmounted = false;
  _swipeBackable = false;
  _swipeForwardable = false;
  _isAllowSwipe = false;
  _currWidth = Dimensions.get('window').width;
  _currHeight = Dimensions.get('window').height;

  _animXPos = new Animated.Value(LEFT_POSITION);
  _swipeCancelSpeed = 150;

  constructor(props: any) {
    super(props);
    if (props.swipeCancelSpeed) {
      this._swipeCancelSpeed = props.swipeCancelSpeed;
    }

    this._isAllowSwipe = props.swipeable || props.swipeable === undefined;

    this._defaultTransitionAnimate = this._defaultTransitionAnimate.bind(this);

    const panResponder = PanResponder.create({
      // onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, { dx }) => {
        if (this._isAllowSwipe) {
          if (dx < 0) {
            dx = -dx;
          }
          return dx > this._currWidth * 0.05;
        }
        return false;
      },
      // onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: (evt, { x0 }) => {
        const history = this.props.history;
        // If starting X position is less than 11%
        if (history.canGo(-1) && x0 < this._currWidth * 0.16) {
          this._swipeBackable = true;
          this.setState({ stackState: SWIPING_BACK_STATE });
          history.goBack();
        } else if (history.canGo(1) && x0 >= this._currWidth * 0.9) {
          this._animXPos.setValue(this._currWidth);
          this._swipeForwardable = true;
          this.setState({ stackState: SWIPING_FORWD_STATE });
          history.goForward();
        }
      },
      onPanResponderMove: (evt, { moveX, dx }) => {
        if (this._swipeBackable) {
          this._animXPos.setValue(dx);
        } else if (this._swipeForwardable) {
          // const moveForwardX = (moveX + dx);
          // const swipeX = (moveForwardX > this._currWidth)?this._currWidth:moveForwardX;
          this._animXPos.setValue(moveX);
        }
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (event, { moveX, dx }) => {
        // If last X position is more than 40%
        if (this._swipeBackable) {
          const width = this._currWidth;
          if (dx >= width * 0.6) {
            Animated.timing(this._animXPos, {
              toValue: width,
              duration: this._swipeCancelSpeed,
            }).start(() => {
              this._animXPos.setValue(LEFT_POSITION); // let the pop out animated back to 0 position and change the page to poped out screen
              this._swipeBackable = false;
              this._swipeForwardable = false;
              this.setState({ stackState: SWIPED_BACK_STATE });
            });
          } else {
            Animated.timing(this._animXPos, {
              toValue: LEFT_POSITION,
              // easing: Easing.elastic(1000),
              duration: this._swipeCancelSpeed,
            }).start(() => {
              this._swipeBackable = false;
              this._swipeForwardable = false;
              this.props.history.goForward();
              this.setState({ stackState: SWIPED_CANCEL_STATE });
            });
          }
        } else if (this._swipeForwardable) {
          const width = this._currWidth;
          if (moveX < width * 0.4) {
            Animated.timing(this._animXPos, {
              toValue: LEFT_POSITION,
              duration: this._swipeCancelSpeed,
            }).start(() => {
              this._animXPos.setValue(LEFT_POSITION);
              this._swipeBackable = false;
              this._swipeForwardable = false;
              this.setState({ stackState: SWIPED_FORWD_STATE });
            });
          } else {
            this.props.history.goBack();
            Animated.timing(this._animXPos, {
              toValue: width,
              duration: this._swipeCancelSpeed,
            }).start(() => {
              this._animXPos.setValue(LEFT_POSITION); // let the pop out animated back to 0 position and change the page to poped out screen
              this._swipeBackable = false;
              this._swipeForwardable = false;
              this.setState({ stackState: SWIPED_CANCEL_STATE });
            });
          }
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {
        Animated.timing(this._animXPos, {
          toValue: LEFT_POSITION,
          duration: this._swipeCancelSpeed,
        }).start(() => {
          this._swipeBackable = false;
          this._swipeForwardable = false;
          this.setState({ stackState: SWIPED_CANCEL_STATE });
        });
      },
    });

    this.state = {
      panResponder,
      deactivedChild: null, // <Route component={InitAnimatableSwitchRoute} />,
      activedChild: <Route component={InitAnimatableSwitchRoute} />,
      stackState: INIT_STATE,
      location: { pathname: undefined },
      locKeys: [],
      previousKey: undefined,
      isSameParent: false,
    };
  }

  // shouldComponentUpdate(nextProps: any, nextState: any) {
  //   const { location, stackState } = this.state;
  //   return (
  //     stackState !== nextState.stackState ||
  //     location.pathname !== nextProps.location.pathname
  //   );
  // }

  componentDidMount() {
    const { onMountAnimate } = this.props;
    // this.setState({ activedChild })
    if (onMountAnimate) {
      onMountAnimate();
    } else {
      this._animXPos.setValue(1);
    }
  }

  componentDidUpdate() {
    this._currWidth = Dimensions.get('window').width;
    this._currHeight = Dimensions.get('window').height;
    const {
      onTransitionAnimate,
      location,
      history: { action },
    } = this.props;
    const { stackState, isSameParent: isNestedRoute } = this.state;
    if (stackState & TRANSITING_STATE) {
      if (onTransitionAnimate) {
        onTransitionAnimate({ location, action, isNestedRoute });
      } else {
        this._defaultTransitionAnimate(isNestedRoute);
      }
    }
  }

  _defaultTransitionAnimate = (isNestedRoute: any) => {
    if (isNestedRoute) {
      return;
    }
    this._animXPos.setValue(0);
    Animated.timing(this._animXPos, {
      toValue: 1,
      duration: 500,
    }).start();
  };

  componentWillUnmount() {
    this.unmounted = true;
  }

  render() {
    const {
      activedChild,
      deactivedChild,
      stackState,
      panResponder: { panHandlers: handles },
      // isPopBack,
      isSameParent: isNestedRoute,
      //   position
    } = this.state;
    // alert(JSON.stringify(position))
    const {
      style,
      swipeInAnimationStyle,
      swipeOutAnimationStyle,
      activedViewStyleHandler,
      deactivedViewStyleHandler,
      history: { action },
      location,
    } = this.props;
    const {
      width: width_ = Dimensions.get('window').width,
      height: height_ = Dimensions.get('window').height,
      ...restStyle
    } = style || {};
    const { width, height } = {
      width: width_ || this._currWidth,
      height: height_ || this._currHeight,
    };

    // this.onExiting(stackState, isPopBack);
    let enterAnimStyle;
    let exitAnimStyle;

    // future roadmap, enable user take out swiping logic

    // if Swiping Disable user Enter & exit animation
    if (isSwiping_(stackState)) {
      enterAnimStyle = swipeInAnimationStyle
        ? swipeInAnimationStyle({ location, action, animXValue: this._animXPos })
        : {
            transform: [
              {
                translateX: this._animXPos,
              },
            ],
            opacity: this._animXPos.interpolate({
              inputRange: [LEFT_POSITION, this._currWidth],
              outputRange: [1, 0.3],
            }),
          };
      exitAnimStyle = swipeOutAnimationStyle
        ? swipeOutAnimationStyle({ location, action, animXValue: this._animXPos })
        : {
            transform: [
              {
                translateX: this._animXPos.interpolate({
                  inputRange: [LEFT_POSITION, this._currWidth],
                  outputRange: [-(this._currWidth * .3), LEFT_POSITION],
                }),
              },
            ],
            opacity: this._animXPos.interpolate({
              inputRange: [LEFT_POSITION, this._currWidth],
              outputRange: [0.3, 1],
            }),
          };
    } else {
      enterAnimStyle = activedViewStyleHandler
        ? activedViewStyleHandler({ location, action, isNestedRoute })
        : {
            transform: [
              {
                translateX: this._animXPos.interpolate({
                  inputRange: [0, 1],
                  outputRange: [width, LEFT_POSITION],
                }),
              },
            ],
          };
      exitAnimStyle = deactivedViewStyleHandler ? deactivedViewStyleHandler({ location, action, isNestedRoute }) : {};
    }

    return (
      <View style={{ flex: 1 }}>
        <Animated.View
          style={{
            zIndex: 1,
            elevation: 0,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            height,
            width,
            backgroundColor: '#f2f2f2',
            shadowColor: 'black',
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 5,
            ...restStyle,
            ...(exitAnimStyle as {}),
          }}
        >
          {deactivedChild}
        </Animated.View>

        <Animated.View
          style={{
            zIndex: 200,
            elevation: 500,
            position: 'absolute',
            // left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            height,
            width,
            backgroundColor: '#f2f2f2',
            shadowColor: 'black',
            shadowOpacity: 0.2,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 5,
            ...restStyle,
            ...(enterAnimStyle as {}),
          }}
          {...handles}
        >
          {activedChild}
        </Animated.View>
      </View>
    );
  }
}

function findLocationChild(children: any, location: any) {
  if (!location) {
    return null;
  }
  let match: any, child: any;
  React.Children.forEach(
    children,
    (element: { props: { path: any; exact: any; strict: any; sensitive: any; from: any } }) => {
      if (!React.isValidElement(element)) {
        return;
      }

      const { path: pathProp, exact, strict, sensitive, from } = element.props;
      const path = pathProp || from;

      if (match == null) {
        child = element;
        match = path == null ? {} : matchPath(location.pathname, { path, exact, strict, sensitive });
      }
    },
  );

  return match
    ? React.cloneElement(child, {
        location,
        computedMatch: match,
        key: child.key || location.key,
      })
    : null;
}

// return previous key
function isSwipeBack(locKeys: string[], key: string, previousKey: string) {
  let isBack;

  // History entries seemed like not working as expected, so we use internal locKeys

  // If there is no key, it was a goBack.
  if (key === undefined) {
    isBack = true;
  }
  // If it's an entirely new key, it was a goForward.
  // If it was neither of the above, you can compare the index
  // of `key` to the previous key in your locKeys array.
  // else if (!locKeys.includes(key)) {
  else if (locKeys.indexOf(key) === -1) {
    locKeys.push(key);
    isBack = false;
  } else if (locKeys.indexOf(key) < locKeys.indexOf(previousKey)) {
    locKeys = locKeys.slice(0, locKeys.indexOf(key) + 1);
    isBack = true;
  } else {
    isBack = false;
  }

  return [locKeys, isBack, key];
}

function isSwiping_(stackState: number) {
  return stackState & (SWIPING_FORWD_STATE | SWIPING_BACK_STATE);
}

export default withRouter<AnimatedStackProps, any>(AnimatedStack);

// This is 2 child overlapping animation like a stack navigator, also has exit animation feature(optional)
import React from 'react';
import { node, object, number, bool, string, oneOf, func } from 'prop-types';
import {
  View,
  ViewPropTypes,
  Dimensions,
  Animated,
  PanResponder,
  StyleProp,
  ViewStyle,
  PanResponderCallbacks,
} from 'react-native';
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

const InitAnimatableSwitchRoute = () => <View style={{ backgroundColor: 'transparent' }}></View>;

export enum SwipeMethod {
  NO_SWIPE,
  SWIPE_HORIZONTAL,
  SWIPE_VERTICAL,
}

interface AnimatedStackProps extends RouteComponentProps<any> {
  /**
   *
   * when swiping halfway cancel, the speed of back to actual screen in ms, default is 150ms
   *
   */
  swipeCancelSpeed: number;
  /**
   *
   * when swipeable is false, no gesture swipe is allow, default is true
   * @deprecated('Will be replacing by swipe method for next version')
   *
   */
  swipeable: boolean;
  /**
   *
   * how much edge range to trigger the swiping, default is 0.1 of whole screen size whether width or height
   * - min > 0
   * - max <= 1
   *
   */
  swipeEdgeRange: number;
  /**
   *
   * how much edge range to swiped succeed, default is 0.6 of whole screen size whether width or height
   * - min > 0
   * - max <= 1
   *
   */
  swipeSuccessEdge: number;
  /**
   *
   * define swipe method, default is SWIPE_HORIZONTAL
   *
   */
  swipeMethod: undefined | number;
  /**
   *
   * style of Animated.View
   *
   */
  style: { width: any | undefined; height: any };
  /**
   *
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
   *
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
   *
   */
  onTransitionAnimate: (onAnimateParams: { location: object; action: string; isNestedRoute: boolean }) => void;

  /**
   *
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
   *
   */
  activedViewStyleHandler: (onAnimateParams: {
    location: object;
    action: string;
    isNestedRoute: boolean;
  }) => StyleProp<ViewStyle>;

  /**
   *
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
   *
   */
  deactivedViewStyleHandler: (onAnimateParams: {
    location: object;
    action: string;
    isNestedRoute: boolean;
  }) => StyleProp<ViewStyle>;

  /**
   *
   * take over the swipe forward animation control where built in swipe forward animation will be disabled
   * - location: the react router native current targeted location
   * - action: the react router native action, POP, PUSH, REPLACE
   * - animXYValue: the current swiped X position
   * - example:
   *
   * ```
   *  swipeInAnimationStyle={({location, action, animXYValue }) => {
   *     return {
   *       transform: [
   *         {
   *           translateX: animXYValue // when swiping in, the animXvalue must be the full screen width to 0
   *         }
   *       ],
   *       opacity: animXYValue.interpolate({
   *         inputRange: [0, screenWidth],
   *         outputRange: [1, 0.3]
   *       })
   *     }
   *  }}
   * ```
   *
   */
  swipeInAnimationStyle: (onAnimateParams: {
    location: object;
    action: string;
    animXYValue: Animated.Value;
  }) => StyleProp<ViewStyle>;

  /**
   *
   * take over the swipe out animation control where built in swipe out animation will be disabled
   * - location: the react router native current targeted location
   * - action: the react router native action, POP, PUSH, REPLACE
   * - animXYValue: the current swiped X position
   * - example:
   *
   *
   * ```
   *  swipeOutAnimationStyle={({location, action, animXYValue }) => {
   *    return {
   *      transform: [
   *        {
   *          translateX: animXYValue.interpolate({ // when swiping out, the animXvalue must be the 0 to full screen width
   *            inputRange: [0, screenWidth],
   *            outputRange: ['-30%', '0%']
   *          })
   *        }
   *      ],
   *      opacity: animXYValue.interpolate({
   *        inputRange: [0, screenWidth],
   *        outputRange: [0.3, 1]
   *      })
   *    }
   *  }}
   * ```
   *
   */
  swipeOutAnimationStyle: (onAnimateParams: {
    location: object;
    action: string;
    animXYValue: Animated.Value;
  }) => StyleProp<ViewStyle>;
  history: any;
  location: any;
}

/**
 *
 * AnimatedStack is similar design pattern to react router native switch but it's swipeable and animatable
 * It's contain 2 <Animated.View /> in between transitioning.
 *
 */
class AnimatedStack extends React.Component<AnimatedStackProps, any> {
  static propTypes = {
    children: node.isRequired,
    style: ViewPropTypes.style,
    location: object.isRequired,
    swipeCancelSpeed: number,
    swipeable: bool,
    swipeEdgeRange: number,
    swipeSuccessEdge: number,
    swipeMethod: oneOf([SwipeMethod.SWIPE_HORIZONTAL, SwipeMethod.SWIPE_VERTICAL, SwipeMethod.NO_SWIPE, undefined]),
    onMountAnimate: func,
    onTransitionAnimate: func,
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

    // const { render, component, children } = prevActivedChild.props;
    // const { render: nRender, component: nComponent, children: nChildren } = nextChild.props;

    const isSameParent = prevActivedChild.props.computedMatch.path === nextChild.props.computedMatch.path;
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

  _unmounted = false;
  _swipeBackable = false;
  _swipeForwardable = false;
  _swipeEdgeRangeBack = 0.1;
  _swipeEdgeRangeForward = 0.1;
  _swipeSuccessEdgeBack = 0.6;
  _swipeSuccessEdgeForward = 0.6;
  _isAllowSwipe = false;
  _currWidth = Dimensions.get('window').width;
  _currHeight = Dimensions.get('window').height;
  _starting_position = 0;
  _animXY = new Animated.Value(this._starting_position);
  _defaultEnterAnim = new Animated.Value(this._starting_position);
  _swipeCancelSpeed = 150;
  _defaultSwipeInStyle: any;
  _defaultSwipeOutStyle: any;

  constructor(props: any) {
    super(props);
    if (props.swipeCancelSpeed) {
      this._swipeCancelSpeed = props.swipeCancelSpeed;
    }

    if (props.swipeEdgeRange) {
      this._swipeEdgeRangeBack = props.swipeEdgeRange;
      this._swipeEdgeRangeForward = 1 - props.swipeEdgeRange;
    }

    if (props.swipeSuccessEdge) {
      this._swipeSuccessEdgeBack = props.swipeSuccessEdge;
      this._swipeSuccessEdgeForward = 1 - props.swipeSuccessEdge;
    }

    // if (props.leftPosition) {
    //   this._starting_position = props.leftPosition;
    //   this._animXY.setValue(this._starting_position);
    // }

    this._isAllowSwipe =
      props.swipeable === true || props.swipeMethod === undefined || props.swipeMethod !== SwipeMethod.NO_SWIPE;

    this._defaultTransitionAnimate = this._defaultTransitionAnimate.bind(this);
    // this._defaultSwipeInStyle = this._defaultSwipeInStyle.bind(this);
    // this._defaultSwipeOutStyle = this._defaultSwipeOutStyle.bind(this);

    this._defaultSwipeInStyle = () => {};
    this._defaultSwipeOutStyle = () => {};
    let panResponderConf: PanResponderCallbacks = {};

    if (this._isAllowSwipe) {
      const swipMethod = props.swipeMethod ? props.swipeMethod : SwipeMethod.SWIPE_HORIZONTAL; // Default is horizontal

      switch (swipMethod) {
        case SwipeMethod.SWIPE_VERTICAL: {
          this._defaultSwipeInStyle = DEFAULT_VERTICAL_SWIPE_IN_FN.bind(this);
          this._defaultSwipeOutStyle = DEFAULT_VERTICAL_SWIPE_OUT_FN.bind(this);
          panResponderConf = {
            // onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (evt, { dy }) => {
              if (dy < 0) {
                dy = -dy;
              }
              return dy > this._currHeight * 0.05;
            },
            // onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            onPanResponderGrant: (evt, { y0 }) => {
              const history = this.props.history;
              // If starting X position is less than 11%
              if (history.canGo(-1) && y0 < this._currHeight * this._swipeEdgeRangeBack) {
                this._swipeBackable = true;
                this.setState({ stackState: SWIPING_BACK_STATE });
                history.goBack();
              } else if (history.canGo(1) && y0 >= this._currHeight * this._swipeEdgeRangeForward) {
                this._animXY.setValue(this._currHeight);
                this._swipeForwardable = true;
                this.setState({ stackState: SWIPING_FORWD_STATE });
                history.goForward();
              }
            },
            onPanResponderMove: (evt, { dy }) => {
              if (this._swipeBackable) {
                this._animXY.setValue(dy);
              } else if (this._swipeForwardable) {
                const _y = dy + this._currHeight;
                this._animXY.setValue(_y);
              }
            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (event, { dy }) => {
              // If last X position is more than 40%
              if (this._swipeBackable) {
                const height = this._currHeight;
                if (dy >= height * this._swipeSuccessEdgeBack) {
                  Animated.timing(this._animXY, {
                    toValue: height,
                    duration: this._swipeCancelSpeed,
                  }).start(() => {
                    this._animXY.setValue(this._starting_position); // let the pop out animated back to 0 position and change the page to poped out screen
                    this._swipeBackable = false;
                    this._swipeForwardable = false;
                    this.setState({ stackState: SWIPED_BACK_STATE });
                  });
                } else {
                  Animated.timing(this._animXY, {
                    toValue: this._starting_position,
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
                const height = this._currHeight;
                const _y = dy + height;
                if (_y < height * this._swipeSuccessEdgeForward) {
                  Animated.timing(this._animXY, {
                    toValue: this._starting_position,
                    duration: this._swipeCancelSpeed,
                  }).start(() => {
                    this._animXY.setValue(this._starting_position);
                    this._swipeBackable = false;
                    this._swipeForwardable = false;
                    this.setState({ stackState: SWIPED_FORWD_STATE });
                  });
                } else {
                  this.props.history.goBack();
                  Animated.timing(this._animXY, {
                    toValue: height,
                    duration: this._swipeCancelSpeed,
                  }).start(() => {
                    this._animXY.setValue(this._starting_position); // let the pop out animated back to 0 position and change the page to poped out screen
                    this._swipeBackable = false;
                    this._swipeForwardable = false;
                    this.setState({ stackState: SWIPED_CANCEL_STATE });
                  });
                }
              }
            },
            onPanResponderTerminate: (evt, gestureState) => {
              Animated.timing(this._animXY, {
                toValue: this._starting_position,
                duration: this._swipeCancelSpeed,
              }).start(() => {
                this._swipeBackable = false;
                this._swipeForwardable = false;
                this.setState({ stackState: SWIPED_CANCEL_STATE });
              });
            },
          };

          break;
        }
        case SwipeMethod.SWIPE_HORIZONTAL:
        default: {
          this._defaultSwipeInStyle = DEFAULT_HORIZONTAL_SWIPE_IN_FN.bind(this);
          this._defaultSwipeOutStyle = DEFAULT_HORIZONTAL_SWIPE_OUT_FN.bind(this);

          panResponderConf = {
            // onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (evt, { dx }) => {
              if (dx < 0) {
                dx = -dx;
              }
              return dx > this._currWidth * 0.05;
            },
            // onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            onPanResponderGrant: (evt, { x0 }) => {
              const history = this.props.history;
              // If starting X position is less than 11%
              if (history.canGo(-1) && x0 < this._currWidth * this._swipeEdgeRangeBack) {
                this._swipeBackable = true;
                this.setState({ stackState: SWIPING_BACK_STATE });
                history.goBack();
              } else if (history.canGo(1) && x0 >= this._currWidth * this._swipeEdgeRangeForward) {
                this._animXY.setValue(this._currWidth);
                this._swipeForwardable = true;
                this.setState({ stackState: SWIPING_FORWD_STATE });
                history.goForward();
              }
            },
            onPanResponderMove: (evt, { dx }) => {
              if (this._swipeBackable) {
                this._animXY.setValue(dx);
              } else if (this._swipeForwardable) {
                const _x = dx + this._currWidth;
                this._animXY.setValue(_x);
              }
            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (event, { dx }) => {
              // If last X position is more than 40%
              if (this._swipeBackable) {
                const width = this._currWidth;
                if (dx >= width * this._swipeSuccessEdgeBack) {
                  Animated.timing(this._animXY, {
                    toValue: width,
                    duration: this._swipeCancelSpeed,
                  }).start(() => {
                    this._animXY.setValue(this._starting_position); // let the pop out animated back to 0 position and change the page to poped out screen
                    this._swipeBackable = false;
                    this._swipeForwardable = false;
                    this.setState({ stackState: SWIPED_BACK_STATE });
                  });
                } else {
                  Animated.timing(this._animXY, {
                    toValue: this._starting_position,
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
                const _x = dx + width;
                if (_x < width * this._swipeSuccessEdgeForward) {
                  Animated.timing(this._animXY, {
                    toValue: this._starting_position,
                    duration: this._swipeCancelSpeed,
                  }).start(() => {
                    this._animXY.setValue(this._starting_position);
                    this._swipeBackable = false;
                    this._swipeForwardable = false;
                    this.setState({ stackState: SWIPED_FORWD_STATE });
                  });
                } else {
                  this.props.history.goBack();
                  Animated.timing(this._animXY, {
                    toValue: width,
                    duration: this._swipeCancelSpeed,
                  }).start(() => {
                    this._animXY.setValue(this._starting_position); // let the pop out animated back to 0 position and change the page to poped out screen
                    this._swipeBackable = false;
                    this._swipeForwardable = false;
                    this.setState({ stackState: SWIPED_CANCEL_STATE });
                  });
                }
              }
            },
            onPanResponderTerminate: (evt, gestureState) => {
              Animated.timing(this._animXY, {
                toValue: this._starting_position,
                duration: this._swipeCancelSpeed,
              }).start(() => {
                this._swipeBackable = false;
                this._swipeForwardable = false;
                this.setState({ stackState: SWIPED_CANCEL_STATE });
              });
            },
          };
          break;
        }
      }
    }

    const panResponder = PanResponder.create(panResponderConf);

    this.state = {
      panResponder,
      deactivedChild: null, // <Route component={InitAnimatableSwitchRoute} />,
      activedChild: <Route computedMatch={{path:'~!.#@!'}} component={InitAnimatableSwitchRoute} />,
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
      this._defaultEnterAnim.setValue(1);
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
    this._defaultEnterAnim.setValue(this._starting_position);
    Animated.timing(this._defaultEnterAnim, {
      toValue: 1,
      duration: 500,
    }).start();
  };

  componentWillUnmount() {
    this._unmounted = true;
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
        ? swipeInAnimationStyle({ location, action, animXYValue: this._animXY })
        : this._defaultSwipeInStyle();
      exitAnimStyle = swipeOutAnimationStyle
        ? swipeOutAnimationStyle({ location, action, animXYValue: this._animXY })
        : this._defaultSwipeOutStyle();
    } else {
      enterAnimStyle = activedViewStyleHandler
        ? activedViewStyleHandler({ location, action, isNestedRoute })
        : {
            transform: [
              {
                translateX: this._defaultEnterAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [width, this._starting_position],
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

function DEFAULT_HORIZONTAL_SWIPE_IN_FN() {
  return {
    transform: [
      {
        translateX: this._animXY,
      },
    ],
    opacity: this._animXY.interpolate({
      inputRange: [this._starting_position, this._currWidth],
      outputRange: [1, 0.3],
    }),
  };
}

function DEFAULT_HORIZONTAL_SWIPE_OUT_FN() {
  return {
    transform: [
      {
        translateX: this._animXY.interpolate({
          inputRange: [this._starting_position, this._currWidth],
          outputRange: [-(this._currWidth * 0.3), this._starting_position],
        }),
      },
    ],
    opacity: this._animXY.interpolate({
      inputRange: [this._starting_position, this._currWidth],
      outputRange: [0.3, 1],
    }),
  };
}

function DEFAULT_VERTICAL_SWIPE_IN_FN() {
  return {
    transform: [
      {
        translateY: this._animXY,
      },
    ],
    opacity: this._animXY.interpolate({
      inputRange: [this._starting_position, this._currHeight],
      outputRange: [1, 0.3],
    }),
  };
}

function DEFAULT_VERTICAL_SWIPE_OUT_FN() {
  return {
    transform: [
      {
        translateY: this._animXY.interpolate({
          inputRange: [this._starting_position, this._currHeight],
          outputRange: [-(this._currHeight * 0.3), this._starting_position],
        }),
      },
    ],
    opacity: this._animXY.interpolate({
      inputRange: [this._starting_position, this._currHeight],
      outputRange: [0.3, 1],
    }),
  };
}

export default withRouter<AnimatedStackProps, any>(AnimatedStack);

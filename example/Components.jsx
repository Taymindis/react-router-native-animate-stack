import React from 'react';
import { Text, View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Route, Link } from 'react-router-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    padding: 10,
    width: '100%',
  },
  header: {
    fontSize: 20,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  subNavItem: {
    padding: 5,
  },
  topic: {
    textAlign: 'center',
    fontSize: 15,
  },
});

export const Home = () => {
  return (
    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'flex-start' }}>
      <Text style={{ fontSize: SCREEN_WIDTH / 4 }}>Home</Text>
    </View>
  );
};

export const About = () => {
  return (
    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'flex-start' }}>
      <Text style={{ fontSize: SCREEN_WIDTH / 4 }}>About</Text>
    </View>
  );
};

export const Topic = ({ match }) => {
  return (
    <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'flex-end' }}>
      <Text style={[styles.topic, { fontSize: SCREEN_WIDTH / 16 }]}>{match.params.topicId}</Text>
    </View>
  );
};

export const Topics = ({ match }) => (
  <View style={{ flex: 1, height: SCREEN_HEIGHT, flexDirection: 'column', alignItems: 'flex-start' }}>
    <View style={{ flex: 2, flexDirection: 'row', height: '100%', justifyContent: 'center' }}>
      <Text style={{ textAlign: 'center', fontSize: SCREEN_WIDTH / 4 }}>Topics</Text>
    </View>
    <View style={{ flex: 8, flexDirection: 'row' }}>
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <View style={{ flex: 1 }}>
          <Link replace={true} component={TouchableOpacity} activeOpacity={0.2} to={`${match.url}/rendering`} style={styles.subNavItem} underlayColor="#f0f4f7">
            <Text style={{ fontSize: SCREEN_WIDTH / 16 }}>How to render a component</Text>
          </Link>
        </View>
        <View style={{ flex: 1 }}>
          <Link replace={true} component={TouchableOpacity} activeOpacity={0.2}  to={`${match.url}/components`} style={styles.subNavItem} underlayColor="#f0f4f7">
            <Text style={{ fontSize: SCREEN_WIDTH / 16 }}>What is React Component</Text>
          </Link>
        </View>
        <View style={{ flex: 1 }}>
          <Link replace={true} component={TouchableOpacity} activeOpacity={0.2}  to={`${match.url}/props-v-state`} style={styles.subNavItem} underlayColor="#f0f4f7">
            <Text style={{ fontSize: SCREEN_WIDTH / 16 }}>Props vs. State</Text>
          </Link>
        </View>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Route path={`${match.url}/:topicId`} component={Topic} />
        <Route exact path={match.url} render={() => <Text style={styles.topic}>Please select a topic.</Text>} />
      </View>
    </View>
  </View>
);

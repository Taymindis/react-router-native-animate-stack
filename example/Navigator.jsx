import React from 'react';
import {View, Button, StyleSheet} from 'react-native';
import {withRouter} from 'react-router-native';

const DirectionObj = {
  Home: {
    pathname: '/',
    search: '?page=home',
  },
  About: {
    pathname: '/about',
    search: '?page=about',
  },

  Topics: {
    pathname: '/topics',
    search: '?page=topics',
    state: {},
  },
};
const Navigator = props => {
  const HandleRoute = dir => {
    props.history.push(dir);
  };

  return (
    <View style={styles.nav}>
      <Button
        onPress={e => {
          HandleRoute(DirectionObj.Home);
        }}
        style={styles.navItem}
        title="Home"
      />
      <Button
        onPress={e => {
          HandleRoute(DirectionObj.About);
        }}
        style={styles.navItem}
        title="About"
      />
      <Button
        onPress={e => {
          HandleRoute(DirectionObj.Topics);
        }}
        style={styles.navItem}
        title="Topics"
      />
    </View>
  );
};

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

export default withRouter(Navigator);
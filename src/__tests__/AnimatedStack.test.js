import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';

import { NativeRouter, Route } from 'react-router-native';

import AnimatedStack from '../';

import renderer from 'react-test-renderer'


it('should render <AnimatedStack /> and compare with snapshot', () => {
  const tree = renderer
    .create(<SafeAreaView>
      <NativeRouter>
        <View>
          <AnimatedStack>
            <Route exact path='/'>
              <Text>Home</Text>
            </Route>
            <Route path='/about'>
              <Text>About</Text>
            </Route>
          </AnimatedStack>
        </View>
      </NativeRouter>
    </SafeAreaView>)
    .toJSON()

  expect(tree).toMatchSnapshot()
})

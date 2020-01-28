/* eslint-disable no-undef */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import AppContainer from './app/navigation/Navigation';
import NetworkUtil from './app/helper/NetworkUtil';

export default class App extends React.Component {
  componentDidMount() {
    NetworkUtil.initializeNetwork();
  }

  render() {
    return (
      <>
        <AppContainer />
      </>
    );
  }
}

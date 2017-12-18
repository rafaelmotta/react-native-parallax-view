import React from 'react';
import PropTypes from 'prop-types';
import {
  Dimensions,
  StyleSheet,
  View,
  ScrollView,
  Animated,
} from 'react-native';

import ScrollableMixin from 'react-native-scrollable-mixin';
const screen = Dimensions.get('window');
const ScrollViewPropTypes = ScrollView.propTypes;

class ParallaxView extends React.Component {
  mixins = [ScrollableMixin]

  static propTypes = {
    ...ScrollViewPropTypes,
    windowHeight: PropTypes.number,
    backgroundSource: PropTypes.oneOfType([
      PropTypes.shape({
        uri: PropTypes.string,
      }),
      // Opaque type returned by require('./image.jpg')
      PropTypes.number,
    ]),
    header: PropTypes.node,
    blur: PropTypes.string,
    contentInset: PropTypes.object,
  }

  static defaultProps = {
    windowHeight: 300,
    contentInset: {
        top: screen.scale
    }
  }

  state = {
    scrollY: new Animated.Value(0)
  }

  getScrollResponder() {
    return this._scrollView.getScrollResponder();    
  }

  setNativeProps(props) {
    this._scrollView.setNativeProps(props);
  }

  renderBackground() {
    const { windowHeight, backgroundSource, blur } = this.props;
    const { scrollY } = this.state;
    if (!windowHeight || !backgroundSource) {
        return null;
    }
    return (
        <Animated.Image
            style={[styles.background, {
                height: windowHeight,
                transform: [{
                    translateY: scrollY.interpolate({
                        inputRange: [ -windowHeight, 0, windowHeight],
                        outputRange: [windowHeight/2, 0, -windowHeight/3]
                    })
                },{
                    scale: scrollY.interpolate({
                        inputRange: [ -windowHeight, 0, windowHeight],
                        outputRange: [2, 1, 1]
                    })
                }]
            }]}
            source={backgroundSource}>
            {/*
                !!blur && (BlurView || (BlurView = require('react-native-blur').BlurView)) &&
                <BlurView blurType={blur} style={styles.blur} />
            */}
        </Animated.Image>
    );
  }

  renderHeader() {
    const { windowHeight, backgroundSource } = this.props;
    const { scrollY } = this.state;
    if (!windowHeight || !backgroundSource) {
      return null;
    }
    return (
      <Animated.View style={{
        position: 'relative',
        height: windowHeight,
        opacity: scrollY.interpolate({
            inputRange: [-windowHeight, 0, windowHeight / 1.2],
            outputRange: [1, 1, 0]
        }),
      }}>
        {this.props.header}
      </Animated.View>
    );
  }

  render() {
    const { style, ...props } = this.props;
    return (
      <View style={[styles.container, style]}>
        {this.renderBackground()}
        <ScrollView
            ref={component => { this._scrollView = component; }}
            {...props}
            style={styles.scrollView}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: this.state.scrollY }}}]
            )}
            scrollEventThrottle={16}>
            {this.renderHeader()}
            <View style={[styles.content, props.scrollableViewStyle]}>
                {this.props.children}
            </View>
        </ScrollView>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: 'transparent',
  },
  scrollView: {
    backgroundColor: 'transparent',
  },
  background: {
    position: 'absolute',
    backgroundColor: '#2e2f31',
    width: screen.width,
    resizeMode: 'cover'
  },
  blur: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  content: {
    shadowColor: '#222',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'column'
  },
});

export default ParallaxView;
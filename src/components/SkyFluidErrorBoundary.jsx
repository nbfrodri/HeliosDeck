import { Component } from 'react';

/**
 * shadergradient occasionally throws on first mount when its remote HDR
 * environment texture fails to load (CDN flake, HMR cache, etc). Rather than
 * blanking the whole app, we catch the error and fall back to a static gradient
 * with the user's palette. Logged for visibility.
 */
export class SkyFluidErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    console.warn('[SkyFluid] shader failed, falling back to static.', error);
  }
  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

// DeviceOrientationControls.js (copiado do three.js r133)
import {
  Euler,
  EventDispatcher,
  MathUtils,
  Quaternion,
  Vector3
} from 'three';

const DeviceOrientationControls = function ( object ) {

  const scope = this;

  this.object = object;
  this.object.rotation.reorder( 'YXZ' );

  this.enabled = true;

  this.deviceOrientation = {};
  this.screenOrientation = 0;

  const onDeviceOrientationChangeEvent = function ( event ) {
    scope.deviceOrientation = event;
  };

  const onScreenOrientationChangeEvent = function () {
    scope.screenOrientation = window.orientation || 0;
  };

  const setObjectQuaternion = (function () {

    const zee = new Vector3( 0, 0, 1 );

    const euler = new Euler();

    const q0 = new Quaternion();

    const q1 = new Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

    return function ( quaternion, alpha, beta, gamma, orient ) {

      euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us

      quaternion.setFromEuler( euler ); // orient the device

      quaternion.multiply( q1 ); // camera looks out the back of the device, not the top

      quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) ); // adjust for screen orientation

    };

  })();

  this.connect = function () {

    onScreenOrientationChangeEvent(); // run once on load

    window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent );
    window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );

    scope.enabled = true;

  };

  this.disconnect = function () {

    window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent );
    window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );

    scope.enabled = false;

  };

  this.update = function () {

    if ( scope.enabled === false ) return;

    const device = scope.deviceOrientation;

    if ( device ) {

      const alpha = device.alpha ? MathUtils.degToRad( device.alpha ) : 0; // Z
      const beta = device.beta ? MathUtils.degToRad( device.beta ) : 0; // X'
      const gamma = device.gamma ? MathUtils.degToRad( device.gamma ) : 0; // Y''
      const orient = scope.screenOrientation ? MathUtils.degToRad( scope.screenOrientation ) : 0; // O

      setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );

    }

  };

  this.dispose = function () {
    this.disconnect();
  };

  this.connect();

};

DeviceOrientationControls.prototype = Object.create( EventDispatcher.prototype );
DeviceOrientationControls.prototype.constructor = DeviceOrientationControls;

export { DeviceOrientationControls };

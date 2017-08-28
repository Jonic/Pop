class DeviceHelper {
  load() {
    this.screen = {
      height: document.body.clientHeight,
      width: document.body.clientWidth,
    }

    this.android = Boolean(navigator.userAgent.match(/android/i))
    this.ios = !this.android
    this.hasTouchEvents =
      window.hasOwnProperty('ontouchstart') ||
      window.hasOwnProperty('onmsgesturechange')
    this.pixelRatio = window.devicePixelRatio || 1

    return this
  }
}

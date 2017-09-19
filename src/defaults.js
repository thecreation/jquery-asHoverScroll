export default {
  namespace: 'asHoverScroll',

  list: '> ul',
  item: '> li',
  exception: null,

  direction: 'vertical',
  fixed: false,

  mouseMove: true,
  touchScroll: true,
  pointerScroll: true,

  useCssTransforms: true,
  useCssTransforms3d: true,
  boundary: 10,

  throttle: 20,

  // callbacks
  onEnter() {
    $(this).siblings().removeClass('is-active');
    $(this).addClass('is-active');
  },
  onLeave() {
    $(this).removeClass('is-active');
  }
};

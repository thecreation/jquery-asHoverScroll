import $ from 'jquery';
import asHoverScroll from './asHoverScroll';
import info from './info';

const NAMESPACE = 'asHoverScroll';
const OtherAsHoverScroll = $.fn.asHoverScroll;

const jQueryAsHoverScroll = function(options, ...args) {
  if (typeof options === 'string') {
    const method = options;

    if (/^_/.test(method)) {
      return false;
    } else if ((/^(get)/.test(method))) {
      const instance = this.first().data(NAMESPACE);
      if (instance && typeof instance[method] === 'function') {
        return instance[method](...args);
      }
    } else {
      return this.each(function() {
        const instance = $.data(this, NAMESPACE);
        if (instance && typeof instance[method] === 'function') {
          instance[method](...args);
        }
      });
    }
  }

  return this.each(function() {
    if (!$(this).data(NAMESPACE)) {
      $(this).data(NAMESPACE, new asHoverScroll(this, options));
    }
  });
};

$.fn.asHoverScroll = jQueryAsHoverScroll;

$.asHoverScroll = $.extend({
  setDefaults: asHoverScroll.setDefaults,
  noConflict: function() {
    $.fn.asHoverScroll = OtherAsHoverScroll;
    return jQueryAsHoverScroll;
  }
}, info);

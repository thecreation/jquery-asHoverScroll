import $ from 'jquery';
import DEFAULTS from './defaults';
import support from './support';

const NAMESPACE = 'asHoverScroll';
let instanceId = 0;

/**
 * Plugin constructor
 **/
class asHoverScroll {
  constructor(element, options) {
    this.element = element;
    this.$element = $(element);

    this.options = $.extend({}, DEFAULTS, options, this.$element.data());
    this.$list = $(this.options.list, this.$element);

    this.classes = {
      disabled: `${this.options.namespace}-disabled`
    };

    if (this.options.direction === 'vertical') {
      this.attributes = {
        page: 'pageY',
        axis: 'Y',
        position: 'top',
        length: 'height',
        offset: 'offsetTop',
        client: 'clientY',
        clientLength: 'clientHeight'
      };
    } else if (this.options.direction === 'horizontal') {
      this.attributes = {
        page: 'pageX',
        axis: 'X',
        position: 'left',
        length: 'width',
        offset: 'offsetLeft',
        client: 'clientX',
        clientLength: 'clientWidth'
      };
    }

    // Current state information.
    this._states = {};

    // Current state information for the touch operation.
    this._scroll = {
      time: null,
      pointer: null
    };

    this.instanceId = (++instanceId);

    this.trigger('init');
    this.init();
  }

  init() {
    this.initPosition();

    // init length data
    this.updateLength();

    this.bindEvents();
  }

  bindEvents() {
    const that = this;
    const enterEvents = ['enter'];
    const leaveEvents = [];

    if (this.options.mouseMove) {
      this.$element.on(this.eventName('mousemove'), $.proxy(this.onMove, this));
      enterEvents.push('mouseenter');
      leaveEvents.push('mouseleave');
    }

    if (this.options.touchScroll && support.touch) {
      this.$element.on(this.eventName('touchstart'), $.proxy(this.onScrollStart, this));
      this.$element.on(this.eventName('touchcancel'), $.proxy(this.onScrollEnd, this));
    }

    if (this.options.pointerScroll && support.pointer) {
      this.$element.on(this.eventName(support.prefixPointerEvent('pointerdown')), $.proxy(this.onScrollStart, this));
      this.$element.on(this.eventName(support.prefixPointerEvent('pointercancel')), $.proxy(this.onScrollEnd, this));
    }

    this.$list.on(this.eventName(enterEvents.join(' ')), this.options.item, () => {
      if (!that.is('scrolling')) {
        that.options.onEnter.call(this);
      }
    });
    this.$list.on(this.eventName(leaveEvents.join(' ')), this.options.item, () => {
      if (!that.is('scrolling')) {
        that.options.onLeave.call(this);
      }
    });

    $(window).on(this.eventNameWithId('orientationchange'), () => {
      that.update();
    });
    $(window).on(this.eventNameWithId('resize'), this.throttle(() => {
      that.update();
    }, this.options.throttle));
  }

  unbindEvents() {
    this.$element.off(this.eventName());
    this.$list.off(this.eventName());
    $(window).off(this.eventNameWithId());
  }

  /**
   * Handles `touchstart` and `mousedown` events.
   */
  onScrollStart(event) {
    const that = this;
    if (event.which === 3) {
      return;
    }

    if ($(event.target).closest(this.options.exception).length > 0) {
      return;
    }

    this._scroll.time = new Date().getTime();
    this._scroll.pointer = this.pointer(event);
    this._scroll.start = this.getPosition();
    this._scroll.moved = false;

    const callback = () => {
      this.enter('scrolling');
      this.trigger('scroll');
    };

    if (this.options.touchScroll && support.touch) {
      $(document).on(this.eventName('touchend'), $.proxy(this.onScrollEnd, this));

      $(document).one(this.eventName('touchmove'), $.proxy(function() {
        $(document).on(that.eventName('touchmove'), $.proxy(this.onScrollMove, this));

        callback();
      }, this));
    }

    if (this.options.pointerScroll && support.pointer) {
      $(document).on(this.eventName(support.prefixPointerEvent('pointerup')), $.proxy(this.onScrollEnd, this));

      $(document).one(this.eventName(support.prefixPointerEvent('pointermove')), $.proxy(function() {
        $(document).on(that.eventName(support.prefixPointerEvent('pointermove')), $.proxy(this.onScrollMove, this));

        callback();
      }, this));
    }

    $(document).on(this.eventName('blur'), $.proxy(this.onScrollEnd, this));

    event.preventDefault();
  }

  /**
   * Handles the `touchmove` and `mousemove` events.
   */
  onScrollMove(event) {
    this._scroll.updated = this.pointer(event);
    const distance = this.distance(this._scroll.pointer, this._scroll.updated);

    if (Math.abs(this._scroll.pointer.x - this._scroll.updated.x) > 10 || Math.abs(this._scroll.pointer.y - this._scroll.updated.y) > 10) {
      this._scroll.moved = true;
    }

    if (!this.is('scrolling')) {
      return;
    }

    event.preventDefault();
    let postion = this._scroll.start + distance;

    if (this.canScroll()) {
      if (postion > 0) {
        postion = 0;
      } else if (postion < this.containerLength - this.listLength) {
        postion = this.containerLength - this.listLength;
      }
      this.updatePosition(postion);
    }
  }

  /**
   * Handles the `touchend` and `mouseup` events.
   */
  onScrollEnd(event) {
    if (this.options.touchScroll && support.touch) {
      $(document).off(this.eventName('touchmove touchend'));
    }

    if (this.options.pointerScroll && support.pointer) {
      $(document).off(this.eventName(support.prefixPointerEvent('pointerup')));
    }

    $(document).off(this.eventName('blur'));

    if (!this._scroll.moved) {
      $(event.target).trigger('tap');
    }

    if (!this.is('scrolling')) {
      return;
    }

    // touch will trigger mousemove event after 300ms delay. So we need avoid it
    setTimeout(() => {
      this.leave('scrolling');
      this.trigger('scrolled');
    }, 500);
  }

  /**
   * Gets unified pointer coordinates from event.
   * @returns {Object} - Contains `x` and `y` coordinates of current pointer position.
   */
  pointer(event) {
    const result = {
      x: null,
      y: null
    };

    event = this.getEvent(event);

    if (event.pageX && !this.options.fixed) {
      result.x = event.pageX;
      result.y = event.pageY;
    } else {
      result.x = event.clientX;
      result.y = event.clientY;
    }

    return result;
  }

  getEvent(event) {
    event = event.originalEvent || event || window.event;

    event = event.touches && event.touches.length ?
      event.touches[0] : event.changedTouches && event.changedTouches.length ?
      event.changedTouches[0] : event;

    return event;
  }

  /**
   * Gets the distance of two pointer.
   */
  distance(first, second) {
    if (this.options.direction === 'vertical') {
      return second.y - first.y;
    }
    return second.x - first.x;
  }

  onMove(event) {
    event = this.getEvent(event);

    if (this.is('scrolling')) {
      return;
    }

    if (this.isMatchScroll(event)) {
      let pointer;
      let distance;
      let offset;
      if (event[this.attributes.page] && !this.options.fixed) {
        pointer = event[this.attributes.page];
      } else {
        pointer = event[this.attributes.client];
      }

      offset = pointer - this.element[this.attributes.offset];

      if (offset < this.options.boundary) {
        distance = 0;
      } else {
        distance = (offset - this.options.boundary) * this.multiplier;

        if (distance > this.listLength - this.containerLength) {
          distance = this.listLength - this.containerLength;
        }
      }

      this.updatePosition(-distance);
    }
  }

  isMatchScroll(event) {
    if (!this.is('disabled') && this.canScroll()) {
      if (this.options.exception) {
        if ($(event.target).closest(this.options.exception).length === 0) {
          return true;
        }
        return false;
      }
      return true;
    }
    return false;
  }

  canScroll() {
    return this.listLength > this.containerLength;
  }

  getContainerLength() {
    return this.element[this.attributes.clientLength];
  }

  getListhLength() {
    return this.$list[0][this.attributes.clientLength];
  }

  updateLength() {
    this.containerLength = this.getContainerLength();
    this.listLength = this.getListhLength();
    this.multiplier = (this.listLength - this.containerLength) / (this.containerLength - 2 * this.options.boundary);
  }

  initPosition() {
    const style = this.makePositionStyle(0);
    this.$list.css(style);
  }

  getPosition() {
    let value;

    if (this.options.useCssTransforms && support.transform) {
      if (this.options.useCssTransforms3d && support.transform3d) {
        value = support.convertMatrixToArray(this.$list.css(support.transform));
      } else {
        value = support.convertMatrixToArray(this.$list.css(support.transform));
      }
      if (!value) {
        return 0;
      }

      if (this.attributes.axis === 'X') {
        value = value[12] || value[4];
      } else {
        value = value[13] || value[5];
      }
    } else {
      value = this.$list.css(this.attributes.position);
    }

    return parseFloat(value.replace('px', ''));
  }

  makePositionStyle(value) {
    let property;
    let x = '0px';
    let y = '0px';

    if (this.options.useCssTransforms && support.transform) {
      if (this.attributes.axis === 'X') {
        x = `${value}px`;
      } else {
        y = `${value}px`;
      }

      property = support.transform.toString();

      if (this.options.useCssTransforms3d && support.transform3d) {
        value = `translate3d(${x},${y},0px)`;
      } else {
        value = `translate(${x},${y})`;
      }
    } else {
      property = this.attributes.position;
    }
    const temp = {};
    temp[property] = value;

    return temp;
  }

  updatePosition(value) {
    const style = this.makePositionStyle(value);
    this.$list.css(style);
  }

  update() {
    if (!this.is('disabled')) {
      this.updateLength();

      if (!this.canScroll()) {
        this.initPosition();
      }
    }
  }

  eventName(events) {
    if (typeof events !== 'string' || events === '') {
      return `.${NAMESPACE}`;
    }
    events = events.split(' ');

    const length = events.length;
    for (let i = 0; i < length; i++) {
      events[i] = `${events[i]}.${NAMESPACE}`;
    }
    return events.join(' ');
  }

  eventNameWithId(events) {
    if (typeof events !== 'string' || events === '') {
      return `${this.options.namespace}-${this.instanceId}`;
    }

    events = events.split(' ');
    const length = events.length;
    for (let i = 0; i < length; i++) {
      events[i] = `${events[i]}.${this.options.namespace}-${this.instanceId}`;
    }
    return events.join(' ');
  }

  trigger(eventType, ...params) {
    const data = [this].concat(params);

    // event
    this.$element.trigger(`${NAMESPACE}::${eventType}`, data);

    // callback
    eventType = eventType.replace(/\b\w+\b/g, (word) => {
      return word.substring(0, 1).toUpperCase() + word.substring(1);
    });
    const onFunction = `on${eventType}`;

    if (typeof this.options[onFunction] === 'function') {
      this.options[onFunction].apply(this, params);
    }
  }

  /**
   * Checks whether the carousel is in a specific state or not.
   */
  is(state) {
    return this._states[state] && this._states[state] > 0;
  }

  /**
   * Enters a state.
   */
  enter(state) {
    if (this._states[state] === undefined) {
      this._states[state] = 0;
    }

    this._states[state] ++;
  }

  /**
   * Leaves a state.
   */
  leave(state) {
    this._states[state] --;
  }

  /**
   * _throttle
   * @description Borrowed from Underscore.js
   */
  throttle(func, wait) {
    const _now = Date.now || function() {
      return new Date().getTime();
    };

    let timeout;
    let context;
    let args;
    let result;
    let previous = 0;
    let later = function() {
      previous = _now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) {
        context = args = null;
      }
    };

    return (...params) => {
      /*eslint consistent-this: "off"*/
      let now = _now();
      let remaining = wait - (now - previous);
      context = this;
      args = params;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) {
          context = args = null;
        }
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  }

  enable() {
    if (this.is('disabled')) {
      this.leave('disabled');

      this.$element.removeClass(this.classes.disabled);

      this.bindEvents();
    }

    this.trigger('enable');
  }

  disable() {
    if (!this.is('disabled')) {
      this.enter('disabled');

      this.initPosition();
      this.$element.addClass(this.classes.disabled);

      this.unbindEvents();
    }

    this.trigger('disable');
  }

  destroy() {
    this.$element.removeClass(this.classes.disabled);
    this.unbindEvents();
    this.$element.data(NAMESPACE, null);

    this.trigger('destroy');
  }

  static setDefaults(options) {
    $.extend(DEFAULTS, $.isPlainObject(options) && options);
  }
}

export default asHoverScroll;

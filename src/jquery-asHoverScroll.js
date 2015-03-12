/*
 * asHoverScroll
 * https://github.com/amazingSurge/jquery-asHoverScroll
 *
 * Copyright (c) 2015 amazingSurge
 * Licensed under the GPL license.
 */
(function($) {
    "use strict";

    var pluginName = 'asHoverScroll';
    var instanceId = 0;

    var Plugin = $[pluginName] = function(element, options) {
        this.element = element;
        this.$element = $(element);

        this.options = $.extend({}, Plugin.defaults, options, this.$element.data());
        this.$list = $(this.options.list, this.$element);

        this.classes = {
            disabled: this.options.namespace + '-disabled'
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
        this._touch = {
            time: null,
            pointer: null
        };

        this.instanceId = (++instanceId);

        this._trigger('init');
        this.init();
    };

    Plugin.defaults = {
        namespace: pluginName,
        list: '> ul',
        item: '> li',
        exception: null,

        direction: 'vertical',

        mousemove: true,
        touchmove: true,
        pointermove: true,

        useCssTransforms: true,
        useCssTransforms3d: true,

        throttle: 20,

        onEnter: function() {
            $(this).siblings().removeClass('is-active');
            $(this).addClass('is-active');
        },
        onLeave: function() {
            $(this).removeClass('is-active');
        }
    };

    /**
     * Css features detect
     **/
    var support = {};
    Plugin.support = support;
    (function(support) {
        /**
         * Borrowed from Owl carousel
         **/
        var style = $('<support>').get(0).style,
            prefixes = ['webkit', 'Moz', 'O', 'ms'],
            events = {
                transition: {
                    end: {
                        WebkitTransition: 'webkitTransitionEnd',
                        MozTransition: 'transitionend',
                        OTransition: 'oTransitionEnd',
                        transition: 'transitionend'
                    }
                },
                animation: {
                    end: {
                        WebkitAnimation: 'webkitAnimationEnd',
                        MozAnimation: 'animationend',
                        OAnimation: 'oAnimationEnd',
                        animation: 'animationend'
                    }
                }
            },
            tests = {
                csstransforms: function() {
                    return !!test('transform');
                },
                csstransforms3d: function() {
                    return !!test('perspective');
                },
                csstransitions: function() {
                    return !!test('transition');
                },
                cssanimations: function() {
                    return !!test('animation');
                }
            };

        function test(property, prefixed) {
            var result = false,
                upper = property.charAt(0).toUpperCase() + property.slice(1);
            $.each((property + ' ' + prefixes.join(upper + ' ') + upper).split(' '), function(i, property) {
                if (style[property] !== undefined) {
                    result = prefixed ? property : true;
                    return false;
                }
            });

            return result;
        }

        function prefixed(property) {
            return test(property, true);
        }

        if (tests.csstransitions()) {
            /* jshint -W053 */
            support.transition = new String(prefixed('transition'))
            support.transition.end = events.transition.end[support.transition];
        }

        if (tests.cssanimations()) {
            /* jshint -W053 */
            support.animation = new String(prefixed('animation'))
            support.animation.end = events.animation.end[support.animation];
        }

        if (tests.csstransforms()) {
            /* jshint -W053 */
            support.transform = new String(prefixed('transform'));
            support.transform3d = tests.csstransforms3d();
        }

        if (('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch) {
            support.touch = true;
        } else {
            support.touch = false;
        }

        if (window.PointerEvent || window.MSPointerEvent) {
            support.pointer = true;
        } else {
            support.pointer = false;
        }

        support.convertMatrixToArray = function(value) {
            if (value && (value.substr(0, 6) == "matrix")) {
                return value.replace(/^.*\((.*)\)$/g, "$1").replace(/px/g, '').split(/, +/);
            }
            return false;
        }

        support.prefixPointerEvent = function(pointerEvent) {
            return window.MSPointerEvent ?
                'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10) :
                pointerEvent;
        }
    })(support);

    Plugin.prototype = {
        constructor: Plugin,
        init: function() {
            this.initPosition();

            // init length data
            this.updateLength();

            this.bindEvents();
        },

        bindEvents: function() {
            var self = this,
                enterEvents = [],
                leaveEvents = [];

            if (this.options.mousemove) {
                this.$element.on(this.eventName('mousemove'), $.proxy(this.onMove, this));
                enterEvents.push('mouseenter');
                leaveEvents.push('mouseleave');
            }
            // if (this.options.touchmove && support.touch) {
            //     this.$element.on(this.eventName('touchmove touchend touchstart'), $.proxy(this.onMove, this));
            //     enterEvents.push('touchstart');
            //     leaveEvents.push('touchend');
            // }

            //if (this.options.touchTouch && support.touch) {
                this.$element.on(this.eventName('touchstart'), $.proxy(this.onTouchStart, this));
                this.$element.on(this.eventName('touchcancel'), $.proxy(this.onTouchEnd, this));
            //}
            if (this.options.pointermove && support.pointer) {
                this.$element.on(this.eventName(support.prefixPointerEvent('pointermove')), $.proxy(this.onMove, this));
                enterEvents.push(support.prefixPointerEvent('pointerdown'));
                leaveEvents.push(support.prefixPointerEvent('pointerup'));
            }

            this.$list.on(this.eventName(enterEvents.join(' ')), this.options.item, function() {
                self.options.onEnter.call(this);
            });
            this.$list.on(this.eventName(leaveEvents.join(' ')), this.options.item, function() {
                self.options.onLeave.call(this);
            });

            $(window).on(this.eventNameWithId('orientationchange'), function() {
                self.update.call(self);
            });
            $(window).on(this.eventNameWithId('resize'), this.throttle(function() {
                self.update.call(self);
            }, this.options.throttle));
        },

        unbindEvents: function() {
            this.$element.off(this.eventName());
            this.$list.off(this.eventName());
            $(window).off(this.eventNameWithId());
        },

        /**
         * Handles `touchstart` and `mousedown` events.
         */
        onTouchStart: function(event) {
            var self = this;

            if (event.which === 3) {
                return;
            }


            this._touch.time = new Date().getTime();
            this._touch.pointer = this.pointer(event);

            var callback = function() {
                self.enter('touching');
                self.trigger('touch');
            }

            if (this.options.touchmove && support.touch) {
                $(document).on(self.eventName('touchend'), $.proxy(this.onTouchEnd, this));

                $(document).one(self.eventName('touchmove'), $.proxy(function() {
                    $(document).on(self.eventName('touchmove'), $.proxy(this.onTouchMove, this));

                    callback();
                }, this));
            }

            $(document).on(self.eventName('blur'), $.proxy(this.onTouchEnd, this));

            return false;
        },

        /**
         * Handles the `touchmove` and `mousemove` events.
         */
        onTouchMove: function(event) {
            var distance = this.distance(this._touch.pointer, this.pointer(event));

            if (!this.is('touching')) {
                return;
            }

            event.preventDefault();
            this.updatePosition(distance);
        },

        /**
         * Handles the `touchend` and `mouseup` events.
         */
        onTouchEnd: function() {
            $(document).off(this.eventName('touchmove touchend blur'));


            if (!this.is('touching')) {
                return;
            }

            this.leave('touching');
            this.trigger('touched');
        },

        /**
         * Gets unified pointer coordinates from event.
         * @returns {Object} - Contains `x` and `y` coordinates of current pointer position.
         */
        pointer: function(event) {
            var result = {
                x: null,
                y: null
            };

            event = event.originalEvent || event || window.event;

            event = event.touches && event.touches.length ?
                event.touches[0] : event.changedTouches && event.changedTouches.length ?
                event.changedTouches[0] : event;

            if (event.pageX) {
                result.x = event.pageX;
                result.y = event.pageY;
            } else {
                result.x = event.clientX;
                result.y = event.clientY;
            }

            return result;
        },

        /**
         * Gets the distance of two pointer.
         */
        distance: function(first, second) {
            if (this.options.direction === 'vertical') {
                return second.y - first.y;
            } else {
                return second.x - first.x;
            }
        },

        onMove: function(event) {
            event = event.originalEvent || event || window.event;

            event = event.touches && event.touches.length ?
                event.touches[0] : event.changedTouches && event.changedTouches.length ?
                event.changedTouches[0] : event;

            if (this.isMatchScroll(event)) {
                var pointer;

                if (event[this.attributes.page]) {
                    pointer = event[this.attributes.page];
                } else {
                    pointer = event[this.attributes.client];
                }

                var distance = ((this.element[this.attributes.offset] - pointer) * this.multiplier);

                this.updatePosition(distance);
            }
        },

        isMatchScroll: function(event) {
            if (!this.is('disabled') && this.canScroll()) {
                if (this.options.exception) {
                    if ($(event.target).closest(this.options.exception).length === 0) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return true;
            }
            return false;
        },

        canScroll: function() {
            return this.listLength > this.containerLength;
        },

        getContainerLength: function() {
            return this.element[this.attributes.clientLength];
        },

        getListhLength: function() {
            return this.$list[0][this.attributes.clientLength];
        },

        updateLength: function() {
            this.containerLength = this.getContainerLength();
            this.listLength = this.getListhLength();
            this.multiplier = (this.listLength - this.containerLength) / this.containerLength;
        },

        initPosition: function() {
            var style = this.makePositionStyle(0);
            this.$list.css(style);
        },

        getPosition: function() {
            var value;

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
        },

        makePositionStyle: function(value) {
            var property, x = '0px',
                y = '0px';

            if (this.options.useCssTransforms && support.transform) {
                if (this.attributes.axis === 'X') {
                    x = value + 'px';
                } else {
                    y = value + 'px';
                }

                property = support.transform.toString();

                if (this.options.useCssTransforms3d && support.transform3d) {
                    value = "translate3d(" + x + "," + y + ",0px)";
                } else {
                    value = "translate(" + x + "," + y + ")";
                }
            } else {
                property = this.attributes.position;
            }
            var temp = {};
            temp[property] = value;

            return temp;
        },

        updatePosition: function(value) {
            var style = this.makePositionStyle(value);
            this.$list.css(style);
        },

        update: function() {
            if (!this.is('disabled')) {
                this.updateLength();

                if (!this.canScroll()) {
                    this.initPosition();
                }
            }
        },

        eventName: function(events) {
            if (typeof events !== 'string' || events === '') {
                return '.' + pluginName;
            }
            events = events.split(' ');

            var length = events.length;
            for (var i = 0; i < length; i++) {
                events[i] = events[i] + '.' + pluginName;
            }
            return events.join(' ');
        },

        eventNameWithId: function(events) {
            if (typeof events !== 'string' || events === '') {
                return this.options.namespace + '-' + this.instanceId;
            }

            events = events.split(' ');
            var length = events.length;
            for (var i = 0; i < length; i++) {
                events[i] = events[i] + '.' + this.options.namespace + '-' + this.instanceId;
            }
            return events.join(' ');
        },

        _trigger: function(eventType) {
            var method_arguments = Array.prototype.slice.call(arguments, 1),
                data = [this].concat(method_arguments);

            // event
            this.$element.trigger(pluginName + '::' + eventType, data);

            // callback
            eventType = eventType.replace(/\b\w+\b/g, function(word) {
                return word.substring(0, 1).toUpperCase() + word.substring(1);
            });
            var onFunction = 'on' + eventType;
            if (typeof this.options[onFunction] === 'function') {
                this.options[onFunction].apply(this, method_arguments);
            }
        },

        /**
         * Checks whether the carousel is in a specific state or not.
         */
        is: function(state) {
            return this._states[state] && this._states[state] > 0;
        },

        /**
         * Enters a state.
         */
        enter: function(state) {
            if (this._states[state] === undefined) {
                this._states[state] = 0;
            }

            this._states[state] ++;
        },

        /**
         * Leaves a state.
         */
        leave: function(state) {
            this._states[state] --;
        },

        /**
         * _throttle
         * @description Borrowed from Underscore.js
         */
        throttle: function(func, wait) {
            var _now = Date.now || function() {
                return new Date().getTime();
            };
            var context, args, result;
            var timeout = null;
            var previous = 0;
            var later = function() {
                previous = _now();
                timeout = null;
                result = func.apply(context, args);
                context = args = null;
            };
            return function() {
                var now = _now();
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                    context = args = null;
                } else if (!timeout) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            };
        },

        enable: function() {
            if (this.is('disabled')) {
                this.leave('disabled');

                this.$element.removeClass(this.classes.disabled);

                this.bindEvents();
            }
        },

        disable: function() {
            if (!this.is('disabled')) {
                this.enter('disabled');

                this.initPosition();
                this.$element.addClass(this.classes.disabled);

                this.unbindEvents();
            }
        },

        destory: function() {
            this.$element.removeClass(this.classes.disabled);
            this.unbindEvents();
            this.$element.data(pluginName, null);
            this._trigger('destory');
        }
    };

    $.fn[pluginName] = function(options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = Array.prototype.slice.call(arguments, 1);

            if (/^\_/.test(method)) {
                return false;
            } else if ((/^(get)/.test(method))) {
                var api = this.first().data(pluginName);
                if (api && typeof api[method] === 'function') {
                    return api[method].apply(api, method_arguments);
                }
            } else {
                return this.each(function() {
                    var api = $.data(this, pluginName);
                    if (api && typeof api[method] === 'function') {
                        api[method].apply(api, method_arguments);
                    }
                });
            }
        } else {
            return this.each(function() {
                if (!$.data(this, pluginName)) {
                    $.data(this, pluginName, new Plugin(this, options));
                }
            });
        }
    };
})(jQuery);

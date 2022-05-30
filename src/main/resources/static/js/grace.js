(function() {
    "use strict";
    function FastClick(layer, options) {
        var oldOnClick;
        options = options || {};
        this.trackingClick = false;
        this.trackingClickStart = 0;
        this.targetElement = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastTouchIdentifier = 0;
        this.touchBoundary = options.touchBoundary || 10;
        this.layer = layer;
        this.tapDelay = options.tapDelay || 200;
        this.tapTimeout = options.tapTimeout || 700;
        if (FastClick.notNeeded(layer)) {
            return;
        }
        function bind(method, context) {
            return function() {
                return method.apply(context, arguments);
            };
        }
        var methods = [ "onMouse", "onClick", "onTouchStart", "onTouchMove", "onTouchEnd", "onTouchCancel" ];
        var context = this;
        for (var i = 0, l = methods.length; i < l; i++) {
            context[methods[i]] = bind(context[methods[i]], context);
        }
        if (deviceIsAndroid) {
            layer.addEventListener("mouseover", this.onMouse, true);
            layer.addEventListener("mousedown", this.onMouse, true);
            layer.addEventListener("mouseup", this.onMouse, true);
        }
        layer.addEventListener("click", this.onClick, true);
        layer.addEventListener("touchstart", this.onTouchStart, false);
        layer.addEventListener("touchmove", this.onTouchMove, false);
        layer.addEventListener("touchend", this.onTouchEnd, false);
        layer.addEventListener("touchcancel", this.onTouchCancel, false);
        if (!Event.prototype.stopImmediatePropagation) {
            layer.removeEventListener = function(type, callback, capture) {
                var rmv = Node.prototype.removeEventListener;
                if (type === "click") {
                    rmv.call(layer, type, callback.hijacked || callback, capture);
                } else {
                    rmv.call(layer, type, callback, capture);
                }
            };
            layer.addEventListener = function(type, callback, capture) {
                var adv = Node.prototype.addEventListener;
                if (type === "click") {
                    adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
                        if (!event.propagationStopped) {
                            callback(event);
                        }
                    }), capture);
                } else {
                    adv.call(layer, type, callback, capture);
                }
            };
        }
        if (typeof layer.onclick === "function") {
            oldOnClick = layer.onclick;
            layer.addEventListener("click", function(event) {
                oldOnClick(event);
            }, false);
            layer.onclick = null;
        }
    }
    var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;
    var deviceIsAndroid = navigator.userAgent.indexOf("Android") > 0 && !deviceIsWindowsPhone;
    var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;
    var deviceIsIOS4 = deviceIsIOS && /OS 4_\d(_\d)?/.test(navigator.userAgent);
    var deviceIsIOSWithBadTarget = deviceIsIOS && /OS [6-7]_\d/.test(navigator.userAgent);
    var deviceIsBlackBerry10 = navigator.userAgent.indexOf("BB10") > 0;
    FastClick.prototype.needsClick = function(target) {
        switch (target.nodeName.toLowerCase()) {
          case "button":
          case "select":
          case "textarea":
            if (target.disabled) {
                return true;
            }
            break;

          case "input":
            if (deviceIsIOS && target.type === "file" || target.disabled) {
                return true;
            }
            break;

          case "label":
          case "iframe":
          case "video":
            return true;
        }
        return /\bneedsclick\b/.test(target.className);
    };
    FastClick.prototype.needsFocus = function(target) {
        switch (target.nodeName.toLowerCase()) {
          case "textarea":
            return true;

          case "select":
            return !deviceIsAndroid;

          case "input":
            switch (target.type) {
              case "button":
              case "checkbox":
              case "file":
              case "image":
              case "radio":
              case "submit":
                return false;
            }
            return !target.disabled && !target.readOnly;

          default:
            return /\bneedsfocus\b/.test(target.className);
        }
    };
    FastClick.prototype.sendClick = function(targetElement, event) {
        var clickEvent, touch;
        if (document.activeElement && document.activeElement !== targetElement) {
            document.activeElement.blur();
        }
        touch = event.changedTouches[0];
        clickEvent = document.createEvent("MouseEvents");
        clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
        clickEvent.forwardedTouchEvent = true;
        targetElement.dispatchEvent(clickEvent);
    };
    FastClick.prototype.determineEventType = function(targetElement) {
        if (deviceIsAndroid && targetElement.tagName.toLowerCase() === "select") {
            return "mousedown";
        }
        return "click";
    };
    FastClick.prototype.focus = function(targetElement) {
        var length;
        if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf("date") !== 0 && targetElement.type !== "time" && targetElement.type !== "month") {
            length = targetElement.value.length;
            targetElement.setSelectionRange(length, length);
        } else {
            targetElement.focus();
        }
    };
    FastClick.prototype.updateScrollParent = function(targetElement) {
        var scrollParent, parentElement;
        scrollParent = targetElement.fastClickScrollParent;
        if (!scrollParent || !scrollParent.contains(targetElement)) {
            parentElement = targetElement;
            do {
                if (parentElement.scrollHeight > parentElement.offsetHeight) {
                    scrollParent = parentElement;
                    targetElement.fastClickScrollParent = parentElement;
                    break;
                }
                parentElement = parentElement.parentElement;
            } while (parentElement);
        }
        if (scrollParent) {
            scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
        }
    };
    FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {
        if (eventTarget.nodeType === Node.TEXT_NODE) {
            return eventTarget.parentNode;
        }
        return eventTarget;
    };
    FastClick.prototype.onTouchStart = function(event) {
        var targetElement, touch, selection;
        if (event.targetTouches.length > 1) {
            return true;
        }
        targetElement = this.getTargetElementFromEventTarget(event.target);
        touch = event.targetTouches[0];
        if (deviceIsIOS) {
            selection = window.getSelection();
            if (selection.rangeCount && !selection.isCollapsed) {
                return true;
            }
            if (!deviceIsIOS4) {
                if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
                    event.preventDefault();
                    return false;
                }
                this.lastTouchIdentifier = touch.identifier;
                this.updateScrollParent(targetElement);
            }
        }
        this.trackingClick = true;
        this.trackingClickStart = event.timeStamp;
        this.targetElement = targetElement;
        this.touchStartX = touch.pageX;
        this.touchStartY = touch.pageY;
        if (event.timeStamp - this.lastClickTime < this.tapDelay) {
            event.preventDefault();
        }
        return true;
    };
    FastClick.prototype.touchHasMoved = function(event) {
        var touch = event.changedTouches[0], boundary = this.touchBoundary;
        if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
            return true;
        }
        return false;
    };
    FastClick.prototype.onTouchMove = function(event) {
        if (!this.trackingClick) {
            return true;
        }
        if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
            this.trackingClick = false;
            this.targetElement = null;
        }
        return true;
    };
    FastClick.prototype.findControl = function(labelElement) {
        if (labelElement.control !== undefined) {
            return labelElement.control;
        }
        if (labelElement.htmlFor) {
            return document.getElementById(labelElement.htmlFor);
        }
        return labelElement.querySelector("button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea");
    };
    FastClick.prototype.onTouchEnd = function(event) {
        var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;
        if (!this.trackingClick) {
            return true;
        }
        if (event.timeStamp - this.lastClickTime < this.tapDelay) {
            this.cancelNextClick = true;
            return true;
        }
        if (event.timeStamp - this.trackingClickStart > this.tapTimeout) {
            return true;
        }
        this.cancelNextClick = false;
        this.lastClickTime = event.timeStamp;
        trackingClickStart = this.trackingClickStart;
        this.trackingClick = false;
        this.trackingClickStart = 0;
        if (deviceIsIOSWithBadTarget) {
            touch = event.changedTouches[0];
            targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
            targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
        }
        targetTagName = targetElement.tagName.toLowerCase();
        if (targetTagName === "label") {
            forElement = this.findControl(targetElement);
            if (forElement) {
                this.focus(targetElement);
                if (deviceIsAndroid) {
                    return false;
                }
                targetElement = forElement;
            }
        } else if (this.needsFocus(targetElement)) {
            if (event.timeStamp - trackingClickStart > 100 || deviceIsIOS && window.top !== window && targetTagName === "input") {
                this.targetElement = null;
                return false;
            }
            this.focus(targetElement);
            this.sendClick(targetElement, event);
            if (!deviceIsIOS || targetTagName !== "select") {
                this.targetElement = null;
                event.preventDefault();
            }
            return false;
        }
        if (deviceIsIOS && !deviceIsIOS4) {
            scrollParent = targetElement.fastClickScrollParent;
            if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
                return true;
            }
        }
        if (!this.needsClick(targetElement)) {
            event.preventDefault();
            this.sendClick(targetElement, event);
        }
        return false;
    };
    FastClick.prototype.onTouchCancel = function() {
        this.trackingClick = false;
        this.targetElement = null;
    };
    FastClick.prototype.onMouse = function(event) {
        if (!this.targetElement) {
            return true;
        }
        if (event.forwardedTouchEvent) {
            return true;
        }
        if (!event.cancelable) {
            return true;
        }
        if (!this.needsClick(this.targetElement) || this.cancelNextClick) {
            if (event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            } else {
                event.propagationStopped = true;
            }
            event.stopPropagation();
            event.preventDefault();
            return false;
        }
        return true;
    };
    FastClick.prototype.onClick = function(event) {
        var permitted;
        if (this.trackingClick) {
            this.targetElement = null;
            this.trackingClick = false;
            return true;
        }
        if (event.target.type === "submit" && event.detail === 0) {
            return true;
        }
        permitted = this.onMouse(event);
        if (!permitted) {
            this.targetElement = null;
        }
        return permitted;
    };
    FastClick.prototype.destroy = function() {
        var layer = this.layer;
        if (deviceIsAndroid) {
            layer.removeEventListener("mouseover", this.onMouse, true);
            layer.removeEventListener("mousedown", this.onMouse, true);
            layer.removeEventListener("mouseup", this.onMouse, true);
        }
        layer.removeEventListener("click", this.onClick, true);
        layer.removeEventListener("touchstart", this.onTouchStart, false);
        layer.removeEventListener("touchmove", this.onTouchMove, false);
        layer.removeEventListener("touchend", this.onTouchEnd, false);
        layer.removeEventListener("touchcancel", this.onTouchCancel, false);
    };
    FastClick.notNeeded = function(layer) {
        var metaViewport;
        var chromeVersion;
        var blackberryVersion;
        var firefoxVersion;
        if (typeof window.ontouchstart === "undefined") {
            return true;
        }
        chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [ , 0 ])[1];
        if (chromeVersion) {
            if (deviceIsAndroid) {
                metaViewport = document.querySelector("meta[name=viewport]");
                if (metaViewport) {
                    if (metaViewport.content.indexOf("user-scalable=no") !== -1) {
                        return true;
                    }
                    if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            } else {
                return true;
            }
        }
        if (deviceIsBlackBerry10) {
            blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);
            if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
                metaViewport = document.querySelector("meta[name=viewport]");
                if (metaViewport) {
                    if (metaViewport.content.indexOf("user-scalable=no") !== -1) {
                        return true;
                    }
                    if (document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            }
        }
        if (layer.style.msTouchAction === "none" || layer.style.touchAction === "manipulation") {
            return true;
        }
        firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [ , 0 ])[1];
        if (firefoxVersion >= 27) {
            metaViewport = document.querySelector("meta[name=viewport]");
            if (metaViewport && (metaViewport.content.indexOf("user-scalable=no") !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
                return true;
            }
        }
        if (layer.style.touchAction === "none" || layer.style.touchAction === "manipulation") {
            return true;
        }
        return false;
    };
    FastClick.attach = function(layer, options) {
        return new FastClick(layer, options);
    };
    if (typeof define === "function" && typeof define.amd === "object" && define.amd) {
        define(function() {
            return FastClick;
        });
    } else if (typeof module !== "undefined" && module.exports) {
        module.exports = FastClick.attach;
        module.exports.FastClick = FastClick;
    } else {
        window.FastClick = FastClick;
    }
})();

(function(factory) {
    "use strict";
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], factory);
    } else if (typeof exports !== "undefined") {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(function($) {
    "use strict";
    var Slick = window.Slick || {};
    Slick = function() {
        var instanceUid = 0;
        function Slick(element, settings) {
            var _ = this, dataSettings;
            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
                nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3e3,
                centerMode: false,
                centerPadding: "50px",
                cssEase: "ease",
                customPaging: function(slider, i) {
                    return $('<button type="button" />').text(i + 1);
                },
                dots: false,
                dotsClass: "slick-dots",
                draggable: true,
                easing: "linear",
                edgeFriction: .35,
                fade: false,
                focusOnSelect: false,
                focusOnChange: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: "ondemand",
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnFocus: true,
                pauseOnDotsHover: false,
                respondTo: "window",
                responsive: null,
                rows: 1,
                rtl: false,
                slide: "",
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                useTransform: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1e3
            };
            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                scrolling: false,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                swiping: false,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };
            $.extend(_, _.initials);
            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.focussed = false;
            _.interrupted = false;
            _.hidden = "hidden";
            _.paused = true;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = "visibilitychange";
            _.windowWidth = 0;
            _.windowTimer = null;
            dataSettings = $(element).data("slick") || {};
            _.options = $.extend({}, _.defaults, settings, dataSettings);
            _.currentSlide = _.options.initialSlide;
            _.originalSettings = _.options;
            if (typeof document.mozHidden !== "undefined") {
                _.hidden = "mozHidden";
                _.visibilityChange = "mozvisibilitychange";
            } else if (typeof document.webkitHidden !== "undefined") {
                _.hidden = "webkitHidden";
                _.visibilityChange = "webkitvisibilitychange";
            }
            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);
            _.instanceUid = instanceUid++;
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;
            _.registerBreakpoints();
            _.init(true);
        }
        return Slick;
    }();
    Slick.prototype.activateADA = function() {
        var _ = this;
        _.$slideTrack.find(".slick-active").attr({
            "aria-hidden": "false"
        }).find("a, input, button, select").attr({
            tabindex: "0"
        });
    };
    Slick.prototype.addSlide = Slick.prototype.slickAdd = function(markup, index, addBefore) {
        var _ = this;
        if (typeof index === "boolean") {
            addBefore = index;
            index = null;
        } else if (index < 0 || index >= _.slideCount) {
            return false;
        }
        _.unload();
        if (typeof index === "number") {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }
        _.$slides = _.$slideTrack.children(this.options.slide);
        _.$slideTrack.children(this.options.slide).detach();
        _.$slideTrack.append(_.$slides);
        _.$slides.each(function(index, element) {
            $(element).attr("data-slick-index", index);
        });
        _.$slidesCache = _.$slides;
        _.reinit();
    };
    Slick.prototype.animateHeight = function() {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };
    Slick.prototype.animateSlide = function(targetLeft, callback) {
        var animProps = {}, _ = this;
        _.animateHeight();
        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }
        } else {
            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -_.currentLeft;
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function(now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = "translate(" + now + "px, 0px)";
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = "translate(0px," + now + "px)";
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });
            } else {
                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);
                if (_.options.vertical === false) {
                    animProps[_.animType] = "translate3d(" + targetLeft + "px, 0px, 0px)";
                } else {
                    animProps[_.animType] = "translate3d(0px," + targetLeft + "px, 0px)";
                }
                _.$slideTrack.css(animProps);
                if (callback) {
                    setTimeout(function() {
                        _.disableTransition();
                        callback.call();
                    }, _.options.speed);
                }
            }
        }
    };
    Slick.prototype.getNavTarget = function() {
        var _ = this, asNavFor = _.options.asNavFor;
        if (asNavFor && asNavFor !== null) {
            asNavFor = $(asNavFor).not(_.$slider);
        }
        return asNavFor;
    };
    Slick.prototype.asNavFor = function(index) {
        var _ = this, asNavFor = _.getNavTarget();
        if (asNavFor !== null && typeof asNavFor === "object") {
            asNavFor.each(function() {
                var target = $(this).slick("getSlick");
                if (!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }
    };
    Slick.prototype.applyTransition = function(slide) {
        var _ = this, transition = {};
        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + " " + _.options.speed + "ms " + _.options.cssEase;
        } else {
            transition[_.transitionType] = "opacity " + _.options.speed + "ms " + _.options.cssEase;
        }
        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }
    };
    Slick.prototype.autoPlay = function() {
        var _ = this;
        _.autoPlayClear();
        if (_.slideCount > _.options.slidesToShow) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator, _.options.autoplaySpeed);
        }
    };
    Slick.prototype.autoPlayClear = function() {
        var _ = this;
        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }
    };
    Slick.prototype.autoPlayIterator = function() {
        var _ = this, slideTo = _.currentSlide + _.options.slidesToScroll;
        if (!_.paused && !_.interrupted && !_.focussed) {
            if (_.options.infinite === false) {
                if (_.direction === 1 && _.currentSlide + 1 === _.slideCount - 1) {
                    _.direction = 0;
                } else if (_.direction === 0) {
                    slideTo = _.currentSlide - _.options.slidesToScroll;
                    if (_.currentSlide - 1 === 0) {
                        _.direction = 1;
                    }
                }
            }
            _.slideHandler(slideTo);
        }
    };
    Slick.prototype.buildArrows = function() {
        var _ = this;
        if (_.options.arrows === true) {
            _.$prevArrow = $(_.options.prevArrow).addClass("slick-arrow");
            _.$nextArrow = $(_.options.nextArrow).addClass("slick-arrow");
            if (_.slideCount > _.options.slidesToShow) {
                _.$prevArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex");
                _.$nextArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex");
                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }
                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }
                if (_.options.infinite !== true) {
                    _.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true");
                }
            } else {
                _.$prevArrow.add(_.$nextArrow).addClass("slick-hidden").attr({
                    "aria-disabled": "true",
                    tabindex: "-1"
                });
            }
        }
    };
    Slick.prototype.buildDots = function() {
        var _ = this, i, dot;
        if (_.options.dots === true) {
            _.$slider.addClass("slick-dotted");
            dot = $("<ul />").addClass(_.options.dotsClass);
            for (i = 0; i <= _.getDotCount(); i += 1) {
                dot.append($("<li />").append(_.options.customPaging.call(this, _, i)));
            }
            _.$dots = dot.appendTo(_.options.appendDots);
            _.$dots.find("li").first().addClass("slick-active");
        }
    };
    Slick.prototype.buildOut = function() {
        var _ = this;
        _.$slides = _.$slider.children(_.options.slide + ":not(.slick-cloned)").addClass("slick-slide");
        _.slideCount = _.$slides.length;
        _.$slides.each(function(index, element) {
            $(element).attr("data-slick-index", index).data("originalStyling", $(element).attr("style") || "");
        });
        _.$slider.addClass("slick-slider");
        _.$slideTrack = _.slideCount === 0 ? $('<div class="slick-track"/>').appendTo(_.$slider) : _.$slides.wrapAll('<div class="slick-track"/>').parent();
        _.$list = _.$slideTrack.wrap('<div class="slick-list"/>').parent();
        _.$slideTrack.css("opacity", 0);
        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }
        $("img[data-lazy]", _.$slider).not("[src]").addClass("slick-loading");
        _.setupInfinite();
        _.buildArrows();
        _.buildDots();
        _.updateDots();
        _.setSlideClasses(typeof _.currentSlide === "number" ? _.currentSlide : 0);
        if (_.options.draggable === true) {
            _.$list.addClass("draggable");
        }
    };
    Slick.prototype.buildRows = function() {
        var _ = this, a, b, c, newSlides, numOfSlides, originalSlides, slidesPerSection;
        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();
        if (_.options.rows > 1) {
            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(originalSlides.length / slidesPerSection);
            for (a = 0; a < numOfSlides; a++) {
                var slide = document.createElement("div");
                for (b = 0; b < _.options.rows; b++) {
                    var row = document.createElement("div");
                    for (c = 0; c < _.options.slidesPerRow; c++) {
                        var target = a * slidesPerSection + (b * _.options.slidesPerRow + c);
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }
            _.$slider.empty().append(newSlides);
            _.$slider.children().children().children().css({
                width: 100 / _.options.slidesPerRow + "%",
                display: "inline-block"
            });
        }
    };
    Slick.prototype.checkResponsive = function(initial, forceUpdate) {
        var _ = this, breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();
        if (_.respondTo === "window") {
            respondToWidth = windowWidth;
        } else if (_.respondTo === "slider") {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === "min") {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }
        if (_.options.responsive && _.options.responsive.length && _.options.responsive !== null) {
            targetBreakpoint = null;
            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }
            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint = targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === "unslick") {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === "unslick") {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }
            if (!initial && triggerBreakpoint !== false) {
                _.$slider.trigger("breakpoint", [ _, triggerBreakpoint ]);
            }
        }
    };
    Slick.prototype.changeSlide = function(event, dontAnimate) {
        var _ = this, $target = $(event.currentTarget), indexOffset, slideOffset, unevenOffset;
        if ($target.is("a")) {
            event.preventDefault();
        }
        if (!$target.is("li")) {
            $target = $target.closest("li");
        }
        unevenOffset = _.slideCount % _.options.slidesToScroll !== 0;
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;
        switch (event.data.message) {
          case "previous":
            slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
            if (_.slideCount > _.options.slidesToShow) {
                _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
            }
            break;

          case "next":
            slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
            if (_.slideCount > _.options.slidesToShow) {
                _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
            }
            break;

          case "index":
            var index = event.data.index === 0 ? 0 : event.data.index || $target.index() * _.options.slidesToScroll;
            _.slideHandler(_.checkNavigable(index), false, dontAnimate);
            $target.children().trigger("focus");
            break;

          default:
            return;
        }
    };
    Slick.prototype.checkNavigable = function(index) {
        var _ = this, navigables, prevNavigable;
        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }
        return index;
    };
    Slick.prototype.cleanUpEvents = function() {
        var _ = this;
        if (_.options.dots && _.$dots !== null) {
            $("li", _.$dots).off("click.slick", _.changeSlide).off("mouseenter.slick", $.proxy(_.interrupt, _, true)).off("mouseleave.slick", $.proxy(_.interrupt, _, false));
            if (_.options.accessibility === true) {
                _.$dots.off("keydown.slick", _.keyHandler);
            }
        }
        _.$slider.off("focus.slick blur.slick");
        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off("click.slick", _.changeSlide);
            _.$nextArrow && _.$nextArrow.off("click.slick", _.changeSlide);
            if (_.options.accessibility === true) {
                _.$prevArrow && _.$prevArrow.off("keydown.slick", _.keyHandler);
                _.$nextArrow && _.$nextArrow.off("keydown.slick", _.keyHandler);
            }
        }
        _.$list.off("touchstart.slick mousedown.slick", _.swipeHandler);
        _.$list.off("touchmove.slick mousemove.slick", _.swipeHandler);
        _.$list.off("touchend.slick mouseup.slick", _.swipeHandler);
        _.$list.off("touchcancel.slick mouseleave.slick", _.swipeHandler);
        _.$list.off("click.slick", _.clickHandler);
        $(document).off(_.visibilityChange, _.visibility);
        _.cleanUpSlideEvents();
        if (_.options.accessibility === true) {
            _.$list.off("keydown.slick", _.keyHandler);
        }
        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off("click.slick", _.selectHandler);
        }
        $(window).off("orientationchange.slick.slick-" + _.instanceUid, _.orientationChange);
        $(window).off("resize.slick.slick-" + _.instanceUid, _.resize);
        $("[draggable!=true]", _.$slideTrack).off("dragstart", _.preventDefault);
        $(window).off("load.slick.slick-" + _.instanceUid, _.setPosition);
    };
    Slick.prototype.cleanUpSlideEvents = function() {
        var _ = this;
        _.$list.off("mouseenter.slick", $.proxy(_.interrupt, _, true));
        _.$list.off("mouseleave.slick", $.proxy(_.interrupt, _, false));
    };
    Slick.prototype.cleanUpRows = function() {
        var _ = this, originalSlides;
        if (_.options.rows > 1) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr("style");
            _.$slider.empty().append(originalSlides);
        }
    };
    Slick.prototype.clickHandler = function(event) {
        var _ = this;
        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }
    };
    Slick.prototype.destroy = function(refresh) {
        var _ = this;
        _.autoPlayClear();
        _.touchObject = {};
        _.cleanUpEvents();
        $(".slick-cloned", _.$slider).detach();
        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow && _.$prevArrow.length) {
            _.$prevArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", "");
            if (_.htmlExpr.test(_.options.prevArrow)) {
                _.$prevArrow.remove();
            }
        }
        if (_.$nextArrow && _.$nextArrow.length) {
            _.$nextArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", "");
            if (_.htmlExpr.test(_.options.nextArrow)) {
                _.$nextArrow.remove();
            }
        }
        if (_.$slides) {
            _.$slides.removeClass("slick-slide slick-active slick-center slick-visible slick-current").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function() {
                $(this).attr("style", $(this).data("originalStyling"));
            });
            _.$slideTrack.children(this.options.slide).detach();
            _.$slideTrack.detach();
            _.$list.detach();
            _.$slider.append(_.$slides);
        }
        _.cleanUpRows();
        _.$slider.removeClass("slick-slider");
        _.$slider.removeClass("slick-initialized");
        _.$slider.removeClass("slick-dotted");
        _.unslicked = true;
        if (!refresh) {
            _.$slider.trigger("destroy", [ _ ]);
        }
    };
    Slick.prototype.disableTransition = function(slide) {
        var _ = this, transition = {};
        transition[_.transitionType] = "";
        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }
    };
    Slick.prototype.fadeSlide = function(slideIndex, callback) {
        var _ = this;
        if (_.cssTransitions === false) {
            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });
            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);
        } else {
            _.applyTransition(slideIndex);
            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });
            if (callback) {
                setTimeout(function() {
                    _.disableTransition(slideIndex);
                    callback.call();
                }, _.options.speed);
            }
        }
    };
    Slick.prototype.fadeSlideOut = function(slideIndex) {
        var _ = this;
        if (_.cssTransitions === false) {
            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);
        } else {
            _.applyTransition(slideIndex);
            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });
        }
    };
    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function(filter) {
        var _ = this;
        if (filter !== null) {
            _.$slidesCache = _.$slides;
            _.unload();
            _.$slideTrack.children(this.options.slide).detach();
            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);
            _.reinit();
        }
    };
    Slick.prototype.focusHandler = function() {
        var _ = this;
        _.$slider.off("focus.slick blur.slick").on("focus.slick blur.slick", "*", function(event) {
            event.stopImmediatePropagation();
            var $sf = $(this);
            setTimeout(function() {
                if (_.options.pauseOnFocus) {
                    _.focussed = $sf.is(":focus");
                    _.autoPlay();
                }
            }, 0);
        });
    };
    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function() {
        var _ = this;
        return _.currentSlide;
    };
    Slick.prototype.getDotCount = function() {
        var _ = this;
        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;
        if (_.options.infinite === true) {
            if (_.slideCount <= _.options.slidesToShow) {
                ++pagerQty;
            } else {
                while (breakPoint < _.slideCount) {
                    ++pagerQty;
                    breakPoint = counter + _.options.slidesToScroll;
                    counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                }
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else if (!_.options.asNavFor) {
            pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
        } else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }
        return pagerQty - 1;
    };
    Slick.prototype.getLeft = function(slideIndex) {
        var _ = this, targetLeft, verticalHeight, verticalOffset = 0, targetSlide, coef;
        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);
        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = _.slideWidth * _.options.slidesToShow * -1;
                coef = -1;
                if (_.options.vertical === true && _.options.centerMode === true) {
                    if (_.options.slidesToShow === 2) {
                        coef = -1.5;
                    } else if (_.options.slidesToShow === 1) {
                        coef = -2;
                    }
                }
                verticalOffset = verticalHeight * _.options.slidesToShow * coef;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth * -1;
                        verticalOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight * -1;
                    } else {
                        _.slideOffset = _.slideCount % _.options.slidesToScroll * _.slideWidth * -1;
                        verticalOffset = _.slideCount % _.options.slidesToScroll * verticalHeight * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * _.slideWidth;
                verticalOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * verticalHeight;
            }
        }
        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }
        if (_.options.centerMode === true && _.slideCount <= _.options.slidesToShow) {
            _.slideOffset = _.slideWidth * Math.floor(_.options.slidesToShow) / 2 - _.slideWidth * _.slideCount / 2;
        } else if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }
        if (_.options.vertical === false) {
            targetLeft = slideIndex * _.slideWidth * -1 + _.slideOffset;
        } else {
            targetLeft = slideIndex * verticalHeight * -1 + verticalOffset;
        }
        if (_.options.variableWidth === true) {
            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children(".slick-slide").eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children(".slick-slide").eq(slideIndex + _.options.slidesToShow);
            }
            if (_.options.rtl === true) {
                if (targetSlide[0]) {
                    targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                } else {
                    targetLeft = 0;
                }
            } else {
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
            }
            if (_.options.centerMode === true) {
                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children(".slick-slide").eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children(".slick-slide").eq(slideIndex + _.options.slidesToShow + 1);
                }
                if (_.options.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft = 0;
                    }
                } else {
                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                }
                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }
        return targetLeft;
    };
    Slick.prototype.getOption = Slick.prototype.slickGetOption = function(option) {
        var _ = this;
        return _.options[option];
    };
    Slick.prototype.getNavigableIndexes = function() {
        var _ = this, breakPoint = 0, counter = 0, indexes = [], max;
        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }
        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }
        return indexes;
    };
    Slick.prototype.getSlick = function() {
        return this;
    };
    Slick.prototype.getSlideCount = function() {
        var _ = this, slidesTraversed, swipedSlide, centerOffset;
        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;
        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find(".slick-slide").each(function(index, slide) {
                if (slide.offsetLeft - centerOffset + $(slide).outerWidth() / 2 > _.swipeLeft * -1) {
                    swipedSlide = slide;
                    return false;
                }
            });
            slidesTraversed = Math.abs($(swipedSlide).attr("data-slick-index") - _.currentSlide) || 1;
            return slidesTraversed;
        } else {
            return _.options.slidesToScroll;
        }
    };
    Slick.prototype.goTo = Slick.prototype.slickGoTo = function(slide, dontAnimate) {
        var _ = this;
        _.changeSlide({
            data: {
                message: "index",
                index: parseInt(slide)
            }
        }, dontAnimate);
    };
    Slick.prototype.init = function(creation) {
        var _ = this;
        if (!$(_.$slider).hasClass("slick-initialized")) {
            $(_.$slider).addClass("slick-initialized");
            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
            _.checkResponsive(true);
            _.focusHandler();
        }
        if (creation) {
            _.$slider.trigger("init", [ _ ]);
        }
        if (_.options.accessibility === true) {
            _.initADA();
        }
        if (_.options.autoplay) {
            _.paused = false;
            _.autoPlay();
        }
    };
    Slick.prototype.initADA = function() {
        var _ = this, numDotGroups = Math.ceil(_.slideCount / _.options.slidesToShow), tabControlIndexes = _.getNavigableIndexes().filter(function(val) {
            return val >= 0 && val < _.slideCount;
        });
        _.$slides.add(_.$slideTrack.find(".slick-cloned")).attr({
            "aria-hidden": "true",
            tabindex: "-1"
        }).find("a, input, button, select").attr({
            tabindex: "-1"
        });
        if (_.$dots !== null) {
            _.$slides.not(_.$slideTrack.find(".slick-cloned")).each(function(i) {
                var slideControlIndex = tabControlIndexes.indexOf(i);
                $(this).attr({
                    role: "tabpanel",
                    id: "slick-slide" + _.instanceUid + i,
                    tabindex: -1
                });
                if (slideControlIndex !== -1) {
                    $(this).attr({
                        "aria-describedby": "slick-slide-control" + _.instanceUid + slideControlIndex
                    });
                }
            });
            _.$dots.attr("role", "tablist").find("li").each(function(i) {
                var mappedSlideIndex = tabControlIndexes[i];
                $(this).attr({
                    role: "presentation"
                });
                $(this).find("button").first().attr({
                    role: "tab",
                    id: "slick-slide-control" + _.instanceUid + i,
                    "aria-controls": "slick-slide" + _.instanceUid + mappedSlideIndex,
                    "aria-label": i + 1 + " of " + numDotGroups,
                    "aria-selected": null,
                    tabindex: "-1"
                });
            }).eq(_.currentSlide).find("button").attr({
                "aria-selected": "true",
                tabindex: "0"
            }).end();
        }
        for (var i = _.currentSlide, max = i + _.options.slidesToShow; i < max; i++) {
            _.$slides.eq(i).attr("tabindex", 0);
        }
        _.activateADA();
    };
    Slick.prototype.initArrowEvents = function() {
        var _ = this;
        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.off("click.slick").on("click.slick", {
                message: "previous"
            }, _.changeSlide);
            _.$nextArrow.off("click.slick").on("click.slick", {
                message: "next"
            }, _.changeSlide);
            if (_.options.accessibility === true) {
                _.$prevArrow.on("keydown.slick", _.keyHandler);
                _.$nextArrow.on("keydown.slick", _.keyHandler);
            }
        }
    };
    Slick.prototype.initDotEvents = function() {
        var _ = this;
        if (_.options.dots === true) {
            $("li", _.$dots).on("click.slick", {
                message: "index"
            }, _.changeSlide);
            if (_.options.accessibility === true) {
                _.$dots.on("keydown.slick", _.keyHandler);
            }
        }
        if (_.options.dots === true && _.options.pauseOnDotsHover === true) {
            $("li", _.$dots).on("mouseenter.slick", $.proxy(_.interrupt, _, true)).on("mouseleave.slick", $.proxy(_.interrupt, _, false));
        }
    };
    Slick.prototype.initSlideEvents = function() {
        var _ = this;
        if (_.options.pauseOnHover) {
            _.$list.on("mouseenter.slick", $.proxy(_.interrupt, _, true));
            _.$list.on("mouseleave.slick", $.proxy(_.interrupt, _, false));
        }
    };
    Slick.prototype.initializeEvents = function() {
        var _ = this;
        _.initArrowEvents();
        _.initDotEvents();
        _.initSlideEvents();
        _.$list.on("touchstart.slick mousedown.slick", {
            action: "start"
        }, _.swipeHandler);
        _.$list.on("touchmove.slick mousemove.slick", {
            action: "move"
        }, _.swipeHandler);
        _.$list.on("touchend.slick mouseup.slick", {
            action: "end"
        }, _.swipeHandler);
        _.$list.on("touchcancel.slick mouseleave.slick", {
            action: "end"
        }, _.swipeHandler);
        _.$list.on("click.slick", _.clickHandler);
        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));
        if (_.options.accessibility === true) {
            _.$list.on("keydown.slick", _.keyHandler);
        }
        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on("click.slick", _.selectHandler);
        }
        $(window).on("orientationchange.slick.slick-" + _.instanceUid, $.proxy(_.orientationChange, _));
        $(window).on("resize.slick.slick-" + _.instanceUid, $.proxy(_.resize, _));
        $("[draggable!=true]", _.$slideTrack).on("dragstart", _.preventDefault);
        $(window).on("load.slick.slick-" + _.instanceUid, _.setPosition);
        $(_.setPosition);
    };
    Slick.prototype.initUI = function() {
        var _ = this;
        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.show();
            _.$nextArrow.show();
        }
        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            _.$dots.show();
        }
    };
    Slick.prototype.keyHandler = function(event) {
        var _ = this;
        if (!event.target.tagName.match("TEXTAREA|INPUT|SELECT")) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? "next" : "previous"
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? "previous" : "next"
                    }
                });
            }
        }
    };
    Slick.prototype.lazyLoad = function() {
        var _ = this, loadRange, cloneRange, rangeStart, rangeEnd;
        function loadImages(imagesScope) {
            $("img[data-lazy]", imagesScope).each(function() {
                var image = $(this), imageSource = $(this).attr("data-lazy"), imageSrcSet = $(this).attr("data-srcset"), imageSizes = $(this).attr("data-sizes") || _.$slider.attr("data-sizes"), imageToLoad = document.createElement("img");
                imageToLoad.onload = function() {
                    image.animate({
                        opacity: 0
                    }, 100, function() {
                        if (imageSrcSet) {
                            image.attr("srcset", imageSrcSet);
                            if (imageSizes) {
                                image.attr("sizes", imageSizes);
                            }
                        }
                        image.attr("src", imageSource).animate({
                            opacity: 1
                        }, 200, function() {
                            image.removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading");
                        });
                        _.$slider.trigger("lazyLoaded", [ _, image, imageSource ]);
                    });
                };
                imageToLoad.onerror = function() {
                    image.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error");
                    _.$slider.trigger("lazyLoadError", [ _, image, imageSource ]);
                };
                imageToLoad.src = imageSource;
            });
        }
        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }
        loadRange = _.$slider.find(".slick-slide").slice(rangeStart, rangeEnd);
        if (_.options.lazyLoad === "anticipated") {
            var prevSlide = rangeStart - 1, nextSlide = rangeEnd, $slides = _.$slider.find(".slick-slide");
            for (var i = 0; i < _.options.slidesToScroll; i++) {
                if (prevSlide < 0) prevSlide = _.slideCount - 1;
                loadRange = loadRange.add($slides.eq(prevSlide));
                loadRange = loadRange.add($slides.eq(nextSlide));
                prevSlide--;
                nextSlide++;
            }
        }
        loadImages(loadRange);
        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find(".slick-slide");
            loadImages(cloneRange);
        } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find(".slick-cloned").slice(0, _.options.slidesToShow);
            loadImages(cloneRange);
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find(".slick-cloned").slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }
    };
    Slick.prototype.loadSlider = function() {
        var _ = this;
        _.setPosition();
        _.$slideTrack.css({
            opacity: 1
        });
        _.$slider.removeClass("slick-loading");
        _.initUI();
        if (_.options.lazyLoad === "progressive") {
            _.progressiveLazyLoad();
        }
    };
    Slick.prototype.next = Slick.prototype.slickNext = function() {
        var _ = this;
        _.changeSlide({
            data: {
                message: "next"
            }
        });
    };
    Slick.prototype.orientationChange = function() {
        var _ = this;
        _.checkResponsive();
        _.setPosition();
    };
    Slick.prototype.pause = Slick.prototype.slickPause = function() {
        var _ = this;
        _.autoPlayClear();
        _.paused = true;
    };
    Slick.prototype.play = Slick.prototype.slickPlay = function() {
        var _ = this;
        _.autoPlay();
        _.options.autoplay = true;
        _.paused = false;
        _.focussed = false;
        _.interrupted = false;
    };
    Slick.prototype.postSlide = function(index) {
        var _ = this;
        if (!_.unslicked) {
            _.$slider.trigger("afterChange", [ _, index ]);
            _.animating = false;
            if (_.slideCount > _.options.slidesToShow) {
                _.setPosition();
            }
            _.swipeLeft = null;
            if (_.options.autoplay) {
                _.autoPlay();
            }
            if (_.options.accessibility === true) {
                _.initADA();
                if (_.options.focusOnChange) {
                    var $currentSlide = $(_.$slides.get(_.currentSlide));
                    $currentSlide.attr("tabindex", 0).focus();
                }
            }
        }
    };
    Slick.prototype.prev = Slick.prototype.slickPrev = function() {
        var _ = this;
        _.changeSlide({
            data: {
                message: "previous"
            }
        });
    };
    Slick.prototype.preventDefault = function(event) {
        event.preventDefault();
    };
    Slick.prototype.progressiveLazyLoad = function(tryCount) {
        tryCount = tryCount || 1;
        var _ = this, $imgsToLoad = $("img[data-lazy]", _.$slider), image, imageSource, imageSrcSet, imageSizes, imageToLoad;
        if ($imgsToLoad.length) {
            image = $imgsToLoad.first();
            imageSource = image.attr("data-lazy");
            imageSrcSet = image.attr("data-srcset");
            imageSizes = image.attr("data-sizes") || _.$slider.attr("data-sizes");
            imageToLoad = document.createElement("img");
            imageToLoad.onload = function() {
                if (imageSrcSet) {
                    image.attr("srcset", imageSrcSet);
                    if (imageSizes) {
                        image.attr("sizes", imageSizes);
                    }
                }
                image.attr("src", imageSource).removeAttr("data-lazy data-srcset data-sizes").removeClass("slick-loading");
                if (_.options.adaptiveHeight === true) {
                    _.setPosition();
                }
                _.$slider.trigger("lazyLoaded", [ _, image, imageSource ]);
                _.progressiveLazyLoad();
            };
            imageToLoad.onerror = function() {
                if (tryCount < 3) {
                    setTimeout(function() {
                        _.progressiveLazyLoad(tryCount + 1);
                    }, 500);
                } else {
                    image.removeAttr("data-lazy").removeClass("slick-loading").addClass("slick-lazyload-error");
                    _.$slider.trigger("lazyLoadError", [ _, image, imageSource ]);
                    _.progressiveLazyLoad();
                }
            };
            imageToLoad.src = imageSource;
        } else {
            _.$slider.trigger("allImagesLoaded", [ _ ]);
        }
    };
    Slick.prototype.refresh = function(initializing) {
        var _ = this, currentSlide, lastVisibleIndex;
        lastVisibleIndex = _.slideCount - _.options.slidesToShow;
        if (!_.options.infinite && _.currentSlide > lastVisibleIndex) {
            _.currentSlide = lastVisibleIndex;
        }
        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }
        currentSlide = _.currentSlide;
        _.destroy(true);
        $.extend(_, _.initials, {
            currentSlide: currentSlide
        });
        _.init();
        if (!initializing) {
            _.changeSlide({
                data: {
                    message: "index",
                    index: currentSlide
                }
            }, false);
        }
    };
    Slick.prototype.registerBreakpoints = function() {
        var _ = this, breakpoint, currentBreakpoint, l, responsiveSettings = _.options.responsive || null;
        if ($.type(responsiveSettings) === "array" && responsiveSettings.length) {
            _.respondTo = _.options.respondTo || "window";
            for (breakpoint in responsiveSettings) {
                l = _.breakpoints.length - 1;
                if (responsiveSettings.hasOwnProperty(breakpoint)) {
                    currentBreakpoint = responsiveSettings[breakpoint].breakpoint;
                    while (l >= 0) {
                        if (_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {
                            _.breakpoints.splice(l, 1);
                        }
                        l--;
                    }
                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;
                }
            }
            _.breakpoints.sort(function(a, b) {
                return _.options.mobileFirst ? a - b : b - a;
            });
        }
    };
    Slick.prototype.reinit = function() {
        var _ = this;
        _.$slides = _.$slideTrack.children(_.options.slide).addClass("slick-slide");
        _.slideCount = _.$slides.length;
        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }
        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }
        _.registerBreakpoints();
        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.cleanUpSlideEvents();
        _.initSlideEvents();
        _.checkResponsive(false, true);
        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on("click.slick", _.selectHandler);
        }
        _.setSlideClasses(typeof _.currentSlide === "number" ? _.currentSlide : 0);
        _.setPosition();
        _.focusHandler();
        _.paused = !_.options.autoplay;
        _.autoPlay();
        _.$slider.trigger("reInit", [ _ ]);
    };
    Slick.prototype.resize = function() {
        var _ = this;
        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function() {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if (!_.unslicked) {
                    _.setPosition();
                }
            }, 50);
        }
    };
    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function(index, removeBefore, removeAll) {
        var _ = this;
        if (typeof index === "boolean") {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }
        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }
        _.unload();
        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }
        _.$slides = _.$slideTrack.children(this.options.slide);
        _.$slideTrack.children(this.options.slide).detach();
        _.$slideTrack.append(_.$slides);
        _.$slidesCache = _.$slides;
        _.reinit();
    };
    Slick.prototype.setCSS = function(position) {
        var _ = this, positionProps = {}, x, y;
        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == "left" ? Math.ceil(position) + "px" : "0px";
        y = _.positionProp == "top" ? Math.ceil(position) + "px" : "0px";
        positionProps[_.positionProp] = position;
        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = "translate(" + x + ", " + y + ")";
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = "translate3d(" + x + ", " + y + ", 0px)";
                _.$slideTrack.css(positionProps);
            }
        }
    };
    Slick.prototype.setDimensions = function() {
        var _ = this;
        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: "0px " + _.options.centerPadding
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: _.options.centerPadding + " 0px"
                });
            }
        }
        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();
        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil(_.slideWidth * _.$slideTrack.children(".slick-slide").length));
        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5e3 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil(_.$slides.first().outerHeight(true) * _.$slideTrack.children(".slick-slide").length));
        }
        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children(".slick-slide").width(_.slideWidth - offset);
    };
    Slick.prototype.setFade = function() {
        var _ = this, targetLeft;
        _.$slides.each(function(index, element) {
            targetLeft = _.slideWidth * index * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: "relative",
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: "relative",
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });
        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });
    };
    Slick.prototype.setHeight = function() {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css("height", targetHeight);
        }
    };
    Slick.prototype.setOption = Slick.prototype.slickSetOption = function() {
        var _ = this, l, item, option, value, refresh = false, type;
        if ($.type(arguments[0]) === "object") {
            option = arguments[0];
            refresh = arguments[1];
            type = "multiple";
        } else if ($.type(arguments[0]) === "string") {
            option = arguments[0];
            value = arguments[1];
            refresh = arguments[2];
            if (arguments[0] === "responsive" && $.type(arguments[1]) === "array") {
                type = "responsive";
            } else if (typeof arguments[1] !== "undefined") {
                type = "single";
            }
        }
        if (type === "single") {
            _.options[option] = value;
        } else if (type === "multiple") {
            $.each(option, function(opt, val) {
                _.options[opt] = val;
            });
        } else if (type === "responsive") {
            for (item in value) {
                if ($.type(_.options.responsive) !== "array") {
                    _.options.responsive = [ value[item] ];
                } else {
                    l = _.options.responsive.length - 1;
                    while (l >= 0) {
                        if (_.options.responsive[l].breakpoint === value[item].breakpoint) {
                            _.options.responsive.splice(l, 1);
                        }
                        l--;
                    }
                    _.options.responsive.push(value[item]);
                }
            }
        }
        if (refresh) {
            _.unload();
            _.reinit();
        }
    };
    Slick.prototype.setPosition = function() {
        var _ = this;
        _.setDimensions();
        _.setHeight();
        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }
        _.$slider.trigger("setPosition", [ _ ]);
    };
    Slick.prototype.setProps = function() {
        var _ = this, bodyStyle = document.body.style;
        _.positionProp = _.options.vertical === true ? "top" : "left";
        if (_.positionProp === "top") {
            _.$slider.addClass("slick-vertical");
        } else {
            _.$slider.removeClass("slick-vertical");
        }
        if (bodyStyle.WebkitTransition !== undefined || bodyStyle.MozTransition !== undefined || bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }
        if (_.options.fade) {
            if (typeof _.options.zIndex === "number") {
                if (_.options.zIndex < 3) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }
        if (bodyStyle.OTransform !== undefined) {
            _.animType = "OTransform";
            _.transformType = "-o-transform";
            _.transitionType = "OTransition";
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = "MozTransform";
            _.transformType = "-moz-transform";
            _.transitionType = "MozTransition";
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = "webkitTransform";
            _.transformType = "-webkit-transform";
            _.transitionType = "webkitTransition";
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = "msTransform";
            _.transformType = "-ms-transform";
            _.transitionType = "msTransition";
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = "transform";
            _.transformType = "transform";
            _.transitionType = "transition";
        }
        _.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);
    };
    Slick.prototype.setSlideClasses = function(index) {
        var _ = this, centerOffset, allSlides, indexOffset, remainder;
        allSlides = _.$slider.find(".slick-slide").removeClass("slick-active slick-center slick-current").attr("aria-hidden", "true");
        _.$slides.eq(index).addClass("slick-current");
        if (_.options.centerMode === true) {
            var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;
            centerOffset = Math.floor(_.options.slidesToShow / 2);
            if (_.options.infinite === true) {
                if (index >= centerOffset && index <= _.slideCount - 1 - centerOffset) {
                    _.$slides.slice(index - centerOffset + evenCoef, index + centerOffset + 1).addClass("slick-active").attr("aria-hidden", "false");
                } else {
                    indexOffset = _.options.slidesToShow + index;
                    allSlides.slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2).addClass("slick-active").attr("aria-hidden", "false");
                }
                if (index === 0) {
                    allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass("slick-center");
                } else if (index === _.slideCount - 1) {
                    allSlides.eq(_.options.slidesToShow).addClass("slick-center");
                }
            }
            _.$slides.eq(index).addClass("slick-center");
        } else {
            if (index >= 0 && index <= _.slideCount - _.options.slidesToShow) {
                _.$slides.slice(index, index + _.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false");
            } else if (allSlides.length <= _.options.slidesToShow) {
                allSlides.addClass("slick-active").attr("aria-hidden", "false");
            } else {
                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;
                if (_.options.slidesToShow == _.options.slidesToScroll && _.slideCount - index < _.options.slidesToShow) {
                    allSlides.slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder).addClass("slick-active").attr("aria-hidden", "false");
                } else {
                    allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false");
                }
            }
        }
        if (_.options.lazyLoad === "ondemand" || _.options.lazyLoad === "anticipated") {
            _.lazyLoad();
        }
    };
    Slick.prototype.setupInfinite = function() {
        var _ = this, i, slideIndex, infiniteCount;
        if (_.options.fade === true) {
            _.options.centerMode = false;
        }
        if (_.options.infinite === true && _.options.fade === false) {
            slideIndex = null;
            if (_.slideCount > _.options.slidesToShow) {
                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }
                for (i = _.slideCount; i > _.slideCount - infiniteCount; i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr("id", "").attr("data-slick-index", slideIndex - _.slideCount).prependTo(_.$slideTrack).addClass("slick-cloned");
                }
                for (i = 0; i < infiniteCount + _.slideCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr("id", "").attr("data-slick-index", slideIndex + _.slideCount).appendTo(_.$slideTrack).addClass("slick-cloned");
                }
                _.$slideTrack.find(".slick-cloned").find("[id]").each(function() {
                    $(this).attr("id", "");
                });
            }
        }
    };
    Slick.prototype.interrupt = function(toggle) {
        var _ = this;
        if (!toggle) {
            _.autoPlay();
        }
        _.interrupted = toggle;
    };
    Slick.prototype.selectHandler = function(event) {
        var _ = this;
        var targetElement = $(event.target).is(".slick-slide") ? $(event.target) : $(event.target).parents(".slick-slide");
        var index = parseInt(targetElement.attr("data-slick-index"));
        if (!index) index = 0;
        if (_.slideCount <= _.options.slidesToShow) {
            _.slideHandler(index, false, true);
            return;
        }
        _.slideHandler(index);
    };
    Slick.prototype.slideHandler = function(index, sync, dontAnimate) {
        var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null, _ = this, navTarget;
        sync = sync || false;
        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }
        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }
        if (sync === false) {
            _.asNavFor(index);
        }
        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);
        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;
        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > _.slideCount - _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }
        if (_.options.autoplay) {
            clearInterval(_.autoPlayTimer);
        }
        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - _.slideCount % _.options.slidesToScroll;
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }
        _.animating = true;
        _.$slider.trigger("beforeChange", [ _, _.currentSlide, animSlide ]);
        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;
        _.setSlideClasses(_.currentSlide);
        if (_.options.asNavFor) {
            navTarget = _.getNavTarget();
            navTarget = navTarget.slick("getSlick");
            if (navTarget.slideCount <= navTarget.options.slidesToShow) {
                navTarget.setSlideClasses(_.currentSlide);
            }
        }
        _.updateDots();
        _.updateArrows();
        if (_.options.fade === true) {
            if (dontAnimate !== true) {
                _.fadeSlideOut(oldSlide);
                _.fadeSlide(animSlide, function() {
                    _.postSlide(animSlide);
                });
            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }
        if (dontAnimate !== true) {
            _.animateSlide(targetLeft, function() {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }
    };
    Slick.prototype.startLoad = function() {
        var _ = this;
        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.hide();
            _.$nextArrow.hide();
        }
        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            _.$dots.hide();
        }
        _.$slider.addClass("slick-loading");
    };
    Slick.prototype.swipeDirection = function() {
        var xDist, yDist, r, swipeAngle, _ = this;
        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);
        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }
        if (swipeAngle <= 45 && swipeAngle >= 0) {
            return _.options.rtl === false ? "left" : "right";
        }
        if (swipeAngle <= 360 && swipeAngle >= 315) {
            return _.options.rtl === false ? "left" : "right";
        }
        if (swipeAngle >= 135 && swipeAngle <= 225) {
            return _.options.rtl === false ? "right" : "left";
        }
        if (_.options.verticalSwiping === true) {
            if (swipeAngle >= 35 && swipeAngle <= 135) {
                return "down";
            } else {
                return "up";
            }
        }
        return "vertical";
    };
    Slick.prototype.swipeEnd = function(event) {
        var _ = this, slideCount, direction;
        _.dragging = false;
        _.swiping = false;
        if (_.scrolling) {
            _.scrolling = false;
            return false;
        }
        _.interrupted = false;
        _.shouldClick = _.touchObject.swipeLength > 10 ? false : true;
        if (_.touchObject.curX === undefined) {
            return false;
        }
        if (_.touchObject.edgeHit === true) {
            _.$slider.trigger("edge", [ _, _.swipeDirection() ]);
        }
        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {
            direction = _.swipeDirection();
            switch (direction) {
              case "left":
              case "down":
                slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide + _.getSlideCount()) : _.currentSlide + _.getSlideCount();
                _.currentDirection = 0;
                break;

              case "right":
              case "up":
                slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide - _.getSlideCount()) : _.currentSlide - _.getSlideCount();
                _.currentDirection = 1;
                break;

              default:
            }
            if (direction != "vertical") {
                _.slideHandler(slideCount);
                _.touchObject = {};
                _.$slider.trigger("swipe", [ _, direction ]);
            }
        } else {
            if (_.touchObject.startX !== _.touchObject.curX) {
                _.slideHandler(_.currentSlide);
                _.touchObject = {};
            }
        }
    };
    Slick.prototype.swipeHandler = function(event) {
        var _ = this;
        if (_.options.swipe === false || "ontouchend" in document && _.options.swipe === false) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf("mouse") !== -1) {
            return;
        }
        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ? event.originalEvent.touches.length : 1;
        _.touchObject.minSwipe = _.listWidth / _.options.touchThreshold;
        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options.touchThreshold;
        }
        switch (event.data.action) {
          case "start":
            _.swipeStart(event);
            break;

          case "move":
            _.swipeMove(event);
            break;

          case "end":
            _.swipeEnd(event);
            break;
        }
    };
    Slick.prototype.swipeMove = function(event) {
        var _ = this, edgeWasHit = false, curLeft, swipeDirection, swipeLength, positionOffset, touches, verticalSwipeLength;
        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;
        if (!_.dragging || _.scrolling || touches && touches.length !== 1) {
            return false;
        }
        curLeft = _.getLeft(_.currentSlide);
        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;
        _.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));
        verticalSwipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));
        if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {
            _.scrolling = true;
            return false;
        }
        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = verticalSwipeLength;
        }
        swipeDirection = _.swipeDirection();
        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            _.swiping = true;
            event.preventDefault();
        }
        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }
        swipeLength = _.touchObject.swipeLength;
        _.touchObject.edgeHit = false;
        if (_.options.infinite === false) {
            if (_.currentSlide === 0 && swipeDirection === "right" || _.currentSlide >= _.getDotCount() && swipeDirection === "left") {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }
        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + swipeLength * (_.$list.height() / _.listWidth) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }
        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }
        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }
        _.setCSS(_.swipeLeft);
    };
    Slick.prototype.swipeStart = function(event) {
        var _ = this, touches;
        _.interrupted = true;
        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }
        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }
        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;
        _.dragging = true;
    };
    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function() {
        var _ = this;
        if (_.$slidesCache !== null) {
            _.unload();
            _.$slideTrack.children(this.options.slide).detach();
            _.$slidesCache.appendTo(_.$slideTrack);
            _.reinit();
        }
    };
    Slick.prototype.unload = function() {
        var _ = this;
        $(".slick-cloned", _.$slider).remove();
        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }
        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }
        _.$slides.removeClass("slick-slide slick-active slick-visible slick-current").attr("aria-hidden", "true").css("width", "");
    };
    Slick.prototype.unslick = function(fromBreakpoint) {
        var _ = this;
        _.$slider.trigger("unslick", [ _, fromBreakpoint ]);
        _.destroy();
    };
    Slick.prototype.updateArrows = function() {
        var _ = this, centerOffset;
        centerOffset = Math.floor(_.options.slidesToShow / 2);
        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow && !_.options.infinite) {
            _.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false");
            _.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false");
            if (_.currentSlide === 0) {
                _.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true");
                _.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false");
            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {
                _.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true");
                _.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false");
            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {
                _.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true");
                _.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false");
            }
        }
    };
    Slick.prototype.updateDots = function() {
        var _ = this;
        if (_.$dots !== null) {
            _.$dots.find("li").removeClass("slick-active").end();
            _.$dots.find("li").eq(Math.floor(_.currentSlide / _.options.slidesToScroll)).addClass("slick-active");
        }
    };
    Slick.prototype.visibility = function() {
        var _ = this;
        if (_.options.autoplay) {
            if (document[_.hidden]) {
                _.interrupted = true;
            } else {
                _.interrupted = false;
            }
        }
    };
    $.fn.slick = function() {
        var _ = this, opt = arguments[0], args = Array.prototype.slice.call(arguments, 1), l = _.length, i, ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == "object" || typeof opt == "undefined") _[i].slick = new Slick(_[i], opt); else ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != "undefined") return ret;
        }
        return _;
    };
});

(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f;
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
})({
    1: [ function(require, module, exports) {
        "use strict";
        var ps = require("../main");
        var psInstances = require("../plugin/instances");
        function mountJQuery(jQuery) {
            jQuery.fn.perfectScrollbar = function(settingOrCommand) {
                return this.each(function() {
                    if (typeof settingOrCommand === "object" || typeof settingOrCommand === "undefined") {
                        var settings = settingOrCommand;
                        if (!psInstances.get(this)) {
                            ps.initialize(this, settings);
                        }
                    } else {
                        var command = settingOrCommand;
                        if (command === "update") {
                            ps.update(this);
                        } else if (command === "destroy") {
                            ps.destroy(this);
                        }
                    }
                });
            };
        }
        if (typeof define === "function" && define.amd) {
            define([ "jquery" ], mountJQuery);
        } else {
            var jq = window.jQuery ? window.jQuery : window.$;
            if (typeof jq !== "undefined") {
                mountJQuery(jq);
            }
        }
        module.exports = mountJQuery;
    }, {
        "../main": 6,
        "../plugin/instances": 17
    } ],
    2: [ function(require, module, exports) {
        "use strict";
        var DOM = {};
        DOM.create = function(tagName, className) {
            var element = document.createElement(tagName);
            element.className = className;
            return element;
        };
        DOM.appendTo = function(child, parent) {
            parent.appendChild(child);
            return child;
        };
        function cssGet(element, styleName) {
            return window.getComputedStyle(element)[styleName];
        }
        function cssSet(element, styleName, styleValue) {
            if (typeof styleValue === "number") {
                styleValue = styleValue.toString() + "px";
            }
            element.style[styleName] = styleValue;
            return element;
        }
        function cssMultiSet(element, obj) {
            for (var key in obj) {
                var val = obj[key];
                if (typeof val === "number") {
                    val = val.toString() + "px";
                }
                element.style[key] = val;
            }
            return element;
        }
        DOM.css = function(element, styleNameOrObject, styleValue) {
            if (typeof styleNameOrObject === "object") {
                return cssMultiSet(element, styleNameOrObject);
            } else {
                if (typeof styleValue === "undefined") {
                    return cssGet(element, styleNameOrObject);
                } else {
                    return cssSet(element, styleNameOrObject, styleValue);
                }
            }
        };
        DOM.matches = function(element, query) {
            if (typeof element.matches !== "undefined") {
                return element.matches(query);
            } else {
                return element.msMatchesSelector(query);
            }
        };
        DOM.remove = function(element) {
            if (typeof element.remove !== "undefined") {
                element.remove();
            } else {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }
        };
        DOM.queryChildren = function(element, selector) {
            return Array.prototype.filter.call(element.childNodes, function(child) {
                return DOM.matches(child, selector);
            });
        };
        module.exports = DOM;
    }, {} ],
    3: [ function(require, module, exports) {
        "use strict";
        var EventElement = function(element) {
            this.element = element;
            this.events = {};
        };
        EventElement.prototype.bind = function(eventName, handler) {
            if (typeof this.events[eventName] === "undefined") {
                this.events[eventName] = [];
            }
            this.events[eventName].push(handler);
            this.element.addEventListener(eventName, handler, false);
        };
        EventElement.prototype.unbind = function(eventName, handler) {
            var isHandlerProvided = typeof handler !== "undefined";
            this.events[eventName] = this.events[eventName].filter(function(hdlr) {
                if (isHandlerProvided && hdlr !== handler) {
                    return true;
                }
                this.element.removeEventListener(eventName, hdlr, false);
                return false;
            }, this);
        };
        EventElement.prototype.unbindAll = function() {
            for (var name in this.events) {
                this.unbind(name);
            }
        };
        var EventManager = function() {
            this.eventElements = [];
        };
        EventManager.prototype.eventElement = function(element) {
            var ee = this.eventElements.filter(function(eventElement) {
                return eventElement.element === element;
            })[0];
            if (typeof ee === "undefined") {
                ee = new EventElement(element);
                this.eventElements.push(ee);
            }
            return ee;
        };
        EventManager.prototype.bind = function(element, eventName, handler) {
            this.eventElement(element).bind(eventName, handler);
        };
        EventManager.prototype.unbind = function(element, eventName, handler) {
            this.eventElement(element).unbind(eventName, handler);
        };
        EventManager.prototype.unbindAll = function() {
            for (var i = 0; i < this.eventElements.length; i++) {
                this.eventElements[i].unbindAll();
            }
        };
        EventManager.prototype.once = function(element, eventName, handler) {
            var ee = this.eventElement(element);
            var onceHandler = function(e) {
                ee.unbind(eventName, onceHandler);
                handler(e);
            };
            ee.bind(eventName, onceHandler);
        };
        module.exports = EventManager;
    }, {} ],
    4: [ function(require, module, exports) {
        "use strict";
        module.exports = function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
            }
            return function() {
                return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
            };
        }();
    }, {} ],
    5: [ function(require, module, exports) {
        "use strict";
        var dom = require("./dom");
        var toInt = exports.toInt = function(x) {
            return parseInt(x, 10) || 0;
        };
        exports.isEditable = function(el) {
            return dom.matches(el, "input,[contenteditable]") || dom.matches(el, "select,[contenteditable]") || dom.matches(el, "textarea,[contenteditable]") || dom.matches(el, "button,[contenteditable]");
        };
        exports.removePsClasses = function(element) {
            for (var i = 0; i < element.classList.length; i++) {
                var className = element.classList[i];
                if (className.indexOf("ps-") === 0) {
                    element.classList.remove(className);
                }
            }
        };
        exports.outerWidth = function(element) {
            return toInt(dom.css(element, "width")) + toInt(dom.css(element, "paddingLeft")) + toInt(dom.css(element, "paddingRight")) + toInt(dom.css(element, "borderLeftWidth")) + toInt(dom.css(element, "borderRightWidth"));
        };
        function psClasses(axis) {
            var classes = [ "ps--in-scrolling" ];
            var axisClasses;
            if (typeof axis === "undefined") {
                axisClasses = [ "ps--x", "ps--y" ];
            } else {
                axisClasses = [ "ps--" + axis ];
            }
            return classes.concat(axisClasses);
        }
        exports.startScrolling = function(element, axis) {
            var classes = psClasses(axis);
            for (var i = 0; i < classes.length; i++) {
                element.classList.add(classes[i]);
            }
        };
        exports.stopScrolling = function(element, axis) {
            var classes = psClasses(axis);
            for (var i = 0; i < classes.length; i++) {
                element.classList.remove(classes[i]);
            }
        };
        exports.env = {
            isWebKit: typeof document !== "undefined" && "WebkitAppearance" in document.documentElement.style,
            supportsTouch: typeof window !== "undefined" && ("ontouchstart" in window || window.DocumentTouch && document instanceof window.DocumentTouch),
            supportsIePointer: typeof window !== "undefined" && window.navigator.msMaxTouchPoints !== null
        };
    }, {
        "./dom": 2
    } ],
    6: [ function(require, module, exports) {
        "use strict";
        var destroy = require("./plugin/destroy");
        var initialize = require("./plugin/initialize");
        var update = require("./plugin/update");
        module.exports = {
            initialize: initialize,
            update: update,
            destroy: destroy
        };
    }, {
        "./plugin/destroy": 8,
        "./plugin/initialize": 16,
        "./plugin/update": 20
    } ],
    7: [ function(require, module, exports) {
        "use strict";
        module.exports = function() {
            return {
                handlers: [ "click-rail", "drag-scrollbar", "keyboard", "wheel", "touch" ],
                maxScrollbarLength: null,
                minScrollbarLength: null,
                scrollXMarginOffset: 0,
                scrollYMarginOffset: 0,
                suppressScrollX: false,
                suppressScrollY: false,
                swipePropagation: true,
                swipeEasing: true,
                useBothWheelAxes: false,
                wheelPropagation: false,
                wheelSpeed: 1,
                theme: "default"
            };
        };
    }, {} ],
    8: [ function(require, module, exports) {
        "use strict";
        var _ = require("../lib/helper");
        var dom = require("../lib/dom");
        var instances = require("./instances");
        module.exports = function(element) {
            var i = instances.get(element);
            if (!i) {
                return;
            }
            i.event.unbindAll();
            dom.remove(i.scrollbarX);
            dom.remove(i.scrollbarY);
            dom.remove(i.scrollbarXRail);
            dom.remove(i.scrollbarYRail);
            _.removePsClasses(element);
            instances.remove(element);
        };
    }, {
        "../lib/dom": 2,
        "../lib/helper": 5,
        "./instances": 17
    } ],
    9: [ function(require, module, exports) {
        "use strict";
        var instances = require("../instances");
        var updateGeometry = require("../update-geometry");
        var updateScroll = require("../update-scroll");
        function bindClickRailHandler(element, i) {
            function pageOffset(el) {
                return el.getBoundingClientRect();
            }
            var stopPropagation = function(e) {
                e.stopPropagation();
            };
            i.event.bind(i.scrollbarY, "click", stopPropagation);
            i.event.bind(i.scrollbarYRail, "click", function(e) {
                var positionTop = e.pageY - window.pageYOffset - pageOffset(i.scrollbarYRail).top;
                var direction = positionTop > i.scrollbarYTop ? 1 : -1;
                updateScroll(element, "top", element.scrollTop + direction * i.containerHeight);
                updateGeometry(element);
                e.stopPropagation();
            });
            i.event.bind(i.scrollbarX, "click", stopPropagation);
            i.event.bind(i.scrollbarXRail, "click", function(e) {
                var positionLeft = e.pageX - window.pageXOffset - pageOffset(i.scrollbarXRail).left;
                var direction = positionLeft > i.scrollbarXLeft ? 1 : -1;
                updateScroll(element, "left", element.scrollLeft + direction * i.containerWidth);
                updateGeometry(element);
                e.stopPropagation();
            });
        }
        module.exports = function(element) {
            var i = instances.get(element);
            bindClickRailHandler(element, i);
        };
    }, {
        "../instances": 17,
        "../update-geometry": 18,
        "../update-scroll": 19
    } ],
    10: [ function(require, module, exports) {
        "use strict";
        var _ = require("../../lib/helper");
        var dom = require("../../lib/dom");
        var instances = require("../instances");
        var updateGeometry = require("../update-geometry");
        var updateScroll = require("../update-scroll");
        function bindMouseScrollXHandler(element, i) {
            var currentLeft = null;
            var currentPageX = null;
            function updateScrollLeft(deltaX) {
                var newLeft = currentLeft + deltaX * i.railXRatio;
                var maxLeft = Math.max(0, i.scrollbarXRail.getBoundingClientRect().left) + i.railXRatio * (i.railXWidth - i.scrollbarXWidth);
                if (newLeft < 0) {
                    i.scrollbarXLeft = 0;
                } else if (newLeft > maxLeft) {
                    i.scrollbarXLeft = maxLeft;
                } else {
                    i.scrollbarXLeft = newLeft;
                }
                var scrollLeft = _.toInt(i.scrollbarXLeft * (i.contentWidth - i.containerWidth) / (i.containerWidth - i.railXRatio * i.scrollbarXWidth)) - i.negativeScrollAdjustment;
                updateScroll(element, "left", scrollLeft);
            }
            var mouseMoveHandler = function(e) {
                updateScrollLeft(e.pageX - currentPageX);
                updateGeometry(element);
                e.stopPropagation();
                e.preventDefault();
            };
            var mouseUpHandler = function() {
                _.stopScrolling(element, "x");
                i.event.unbind(i.ownerDocument, "mousemove", mouseMoveHandler);
            };
            i.event.bind(i.scrollbarX, "mousedown", function(e) {
                currentPageX = e.pageX;
                currentLeft = _.toInt(dom.css(i.scrollbarX, "left")) * i.railXRatio;
                _.startScrolling(element, "x");
                i.event.bind(i.ownerDocument, "mousemove", mouseMoveHandler);
                i.event.once(i.ownerDocument, "mouseup", mouseUpHandler);
                e.stopPropagation();
                e.preventDefault();
            });
        }
        function bindMouseScrollYHandler(element, i) {
            var currentTop = null;
            var currentPageY = null;
            function updateScrollTop(deltaY) {
                var newTop = currentTop + deltaY * i.railYRatio;
                var maxTop = Math.max(0, i.scrollbarYRail.getBoundingClientRect().top) + i.railYRatio * (i.railYHeight - i.scrollbarYHeight);
                if (newTop < 0) {
                    i.scrollbarYTop = 0;
                } else if (newTop > maxTop) {
                    i.scrollbarYTop = maxTop;
                } else {
                    i.scrollbarYTop = newTop;
                }
                var scrollTop = _.toInt(i.scrollbarYTop * (i.contentHeight - i.containerHeight) / (i.containerHeight - i.railYRatio * i.scrollbarYHeight));
                updateScroll(element, "top", scrollTop);
            }
            var mouseMoveHandler = function(e) {
                updateScrollTop(e.pageY - currentPageY);
                updateGeometry(element);
                e.stopPropagation();
                e.preventDefault();
            };
            var mouseUpHandler = function() {
                _.stopScrolling(element, "y");
                i.event.unbind(i.ownerDocument, "mousemove", mouseMoveHandler);
            };
            i.event.bind(i.scrollbarY, "mousedown", function(e) {
                currentPageY = e.pageY;
                currentTop = _.toInt(dom.css(i.scrollbarY, "top")) * i.railYRatio;
                _.startScrolling(element, "y");
                i.event.bind(i.ownerDocument, "mousemove", mouseMoveHandler);
                i.event.once(i.ownerDocument, "mouseup", mouseUpHandler);
                e.stopPropagation();
                e.preventDefault();
            });
        }
        module.exports = function(element) {
            var i = instances.get(element);
            bindMouseScrollXHandler(element, i);
            bindMouseScrollYHandler(element, i);
        };
    }, {
        "../../lib/dom": 2,
        "../../lib/helper": 5,
        "../instances": 17,
        "../update-geometry": 18,
        "../update-scroll": 19
    } ],
    11: [ function(require, module, exports) {
        "use strict";
        var _ = require("../../lib/helper");
        var dom = require("../../lib/dom");
        var instances = require("../instances");
        var updateGeometry = require("../update-geometry");
        var updateScroll = require("../update-scroll");
        function bindKeyboardHandler(element, i) {
            var hovered = false;
            i.event.bind(element, "mouseenter", function() {
                hovered = true;
            });
            i.event.bind(element, "mouseleave", function() {
                hovered = false;
            });
            var shouldPrevent = false;
            function shouldPreventDefault(deltaX, deltaY) {
                var scrollTop = element.scrollTop;
                if (deltaX === 0) {
                    if (!i.scrollbarYActive) {
                        return false;
                    }
                    if (scrollTop === 0 && deltaY > 0 || scrollTop >= i.contentHeight - i.containerHeight && deltaY < 0) {
                        return !i.settings.wheelPropagation;
                    }
                }
                var scrollLeft = element.scrollLeft;
                if (deltaY === 0) {
                    if (!i.scrollbarXActive) {
                        return false;
                    }
                    if (scrollLeft === 0 && deltaX < 0 || scrollLeft >= i.contentWidth - i.containerWidth && deltaX > 0) {
                        return !i.settings.wheelPropagation;
                    }
                }
                return true;
            }
            i.event.bind(i.ownerDocument, "keydown", function(e) {
                if (e.isDefaultPrevented && e.isDefaultPrevented() || e.defaultPrevented) {
                    return;
                }
                var focused = dom.matches(i.scrollbarX, ":focus") || dom.matches(i.scrollbarY, ":focus");
                if (!hovered && !focused) {
                    return;
                }
                var activeElement = document.activeElement ? document.activeElement : i.ownerDocument.activeElement;
                if (activeElement) {
                    if (activeElement.tagName === "IFRAME") {
                        activeElement = activeElement.contentDocument.activeElement;
                    } else {
                        while (activeElement.shadowRoot) {
                            activeElement = activeElement.shadowRoot.activeElement;
                        }
                    }
                    if (_.isEditable(activeElement)) {
                        return;
                    }
                }
                var deltaX = 0;
                var deltaY = 0;
                switch (e.which) {
                  case 37:
                    if (e.metaKey) {
                        deltaX = -i.contentWidth;
                    } else if (e.altKey) {
                        deltaX = -i.containerWidth;
                    } else {
                        deltaX = -30;
                    }
                    break;

                  case 38:
                    if (e.metaKey) {
                        deltaY = i.contentHeight;
                    } else if (e.altKey) {
                        deltaY = i.containerHeight;
                    } else {
                        deltaY = 30;
                    }
                    break;

                  case 39:
                    if (e.metaKey) {
                        deltaX = i.contentWidth;
                    } else if (e.altKey) {
                        deltaX = i.containerWidth;
                    } else {
                        deltaX = 30;
                    }
                    break;

                  case 40:
                    if (e.metaKey) {
                        deltaY = -i.contentHeight;
                    } else if (e.altKey) {
                        deltaY = -i.containerHeight;
                    } else {
                        deltaY = -30;
                    }
                    break;

                  case 33:
                    deltaY = 90;
                    break;

                  case 32:
                    if (e.shiftKey) {
                        deltaY = 90;
                    } else {
                        deltaY = -90;
                    }
                    break;

                  case 34:
                    deltaY = -90;
                    break;

                  case 35:
                    if (e.ctrlKey) {
                        deltaY = -i.contentHeight;
                    } else {
                        deltaY = -i.containerHeight;
                    }
                    break;

                  case 36:
                    if (e.ctrlKey) {
                        deltaY = element.scrollTop;
                    } else {
                        deltaY = i.containerHeight;
                    }
                    break;

                  default:
                    return;
                }
                updateScroll(element, "top", element.scrollTop - deltaY);
                updateScroll(element, "left", element.scrollLeft + deltaX);
                updateGeometry(element);
                shouldPrevent = shouldPreventDefault(deltaX, deltaY);
                if (shouldPrevent) {
                    e.preventDefault();
                }
            });
        }
        module.exports = function(element) {
            var i = instances.get(element);
            bindKeyboardHandler(element, i);
        };
    }, {
        "../../lib/dom": 2,
        "../../lib/helper": 5,
        "../instances": 17,
        "../update-geometry": 18,
        "../update-scroll": 19
    } ],
    12: [ function(require, module, exports) {
        "use strict";
        var instances = require("../instances");
        var updateGeometry = require("../update-geometry");
        var updateScroll = require("../update-scroll");
        function bindMouseWheelHandler(element, i) {
            var shouldPrevent = false;
            function shouldPreventDefault(deltaX, deltaY) {
                var scrollTop = element.scrollTop;
                if (deltaX === 0) {
                    if (!i.scrollbarYActive) {
                        return false;
                    }
                    if (scrollTop === 0 && deltaY > 0 || scrollTop >= i.contentHeight - i.containerHeight && deltaY < 0) {
                        return !i.settings.wheelPropagation;
                    }
                }
                var scrollLeft = element.scrollLeft;
                if (deltaY === 0) {
                    if (!i.scrollbarXActive) {
                        return false;
                    }
                    if (scrollLeft === 0 && deltaX < 0 || scrollLeft >= i.contentWidth - i.containerWidth && deltaX > 0) {
                        return !i.settings.wheelPropagation;
                    }
                }
                return true;
            }
            function getDeltaFromEvent(e) {
                var deltaX = e.deltaX;
                var deltaY = -1 * e.deltaY;
                if (typeof deltaX === "undefined" || typeof deltaY === "undefined") {
                    deltaX = -1 * e.wheelDeltaX / 6;
                    deltaY = e.wheelDeltaY / 6;
                }
                if (e.deltaMode && e.deltaMode === 1) {
                    deltaX *= 10;
                    deltaY *= 10;
                }
                if (deltaX !== deltaX && deltaY !== deltaY) {
                    deltaX = 0;
                    deltaY = e.wheelDelta;
                }
                if (e.shiftKey) {
                    return [ -deltaY, -deltaX ];
                }
                return [ deltaX, deltaY ];
            }
            function shouldBeConsumedByChild(deltaX, deltaY) {
                var child = element.querySelector("textarea:hover, select[multiple]:hover, .ps-child:hover");
                if (child) {
                    var style = window.getComputedStyle(child);
                    var overflow = [ style.overflow, style.overflowX, style.overflowY ].join("");
                    if (!overflow.match(/(scroll|auto)/)) {
                        return false;
                    }
                    var maxScrollTop = child.scrollHeight - child.clientHeight;
                    if (maxScrollTop > 0) {
                        if (!(child.scrollTop === 0 && deltaY > 0) && !(child.scrollTop === maxScrollTop && deltaY < 0)) {
                            return true;
                        }
                    }
                    var maxScrollLeft = child.scrollLeft - child.clientWidth;
                    if (maxScrollLeft > 0) {
                        if (!(child.scrollLeft === 0 && deltaX < 0) && !(child.scrollLeft === maxScrollLeft && deltaX > 0)) {
                            return true;
                        }
                    }
                }
                return false;
            }
            function mousewheelHandler(e) {
                var delta = getDeltaFromEvent(e);
                var deltaX = delta[0];
                var deltaY = delta[1];
                if (shouldBeConsumedByChild(deltaX, deltaY)) {
                    return;
                }
                shouldPrevent = false;
                if (!i.settings.useBothWheelAxes) {
                    updateScroll(element, "top", element.scrollTop - deltaY * i.settings.wheelSpeed);
                    updateScroll(element, "left", element.scrollLeft + deltaX * i.settings.wheelSpeed);
                } else if (i.scrollbarYActive && !i.scrollbarXActive) {
                    if (deltaY) {
                        updateScroll(element, "top", element.scrollTop - deltaY * i.settings.wheelSpeed);
                    } else {
                        updateScroll(element, "top", element.scrollTop + deltaX * i.settings.wheelSpeed);
                    }
                    shouldPrevent = true;
                } else if (i.scrollbarXActive && !i.scrollbarYActive) {
                    if (deltaX) {
                        updateScroll(element, "left", element.scrollLeft + deltaX * i.settings.wheelSpeed);
                    } else {
                        updateScroll(element, "left", element.scrollLeft - deltaY * i.settings.wheelSpeed);
                    }
                    shouldPrevent = true;
                }
                updateGeometry(element);
                shouldPrevent = shouldPrevent || shouldPreventDefault(deltaX, deltaY);
                if (shouldPrevent) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            }
            if (typeof window.onwheel !== "undefined") {
                i.event.bind(element, "wheel", mousewheelHandler);
            } else if (typeof window.onmousewheel !== "undefined") {
                i.event.bind(element, "mousewheel", mousewheelHandler);
            }
        }
        module.exports = function(element) {
            var i = instances.get(element);
            bindMouseWheelHandler(element, i);
        };
    }, {
        "../instances": 17,
        "../update-geometry": 18,
        "../update-scroll": 19
    } ],
    13: [ function(require, module, exports) {
        "use strict";
        var instances = require("../instances");
        var updateGeometry = require("../update-geometry");
        function bindNativeScrollHandler(element, i) {
            i.event.bind(element, "scroll", function() {
                updateGeometry(element);
            });
        }
        module.exports = function(element) {
            var i = instances.get(element);
            bindNativeScrollHandler(element, i);
        };
    }, {
        "../instances": 17,
        "../update-geometry": 18
    } ],
    14: [ function(require, module, exports) {
        "use strict";
        var _ = require("../../lib/helper");
        var instances = require("../instances");
        var updateGeometry = require("../update-geometry");
        var updateScroll = require("../update-scroll");
        function bindSelectionHandler(element, i) {
            function getRangeNode() {
                var selection = window.getSelection ? window.getSelection() : document.getSelection ? document.getSelection() : "";
                if (selection.toString().length === 0) {
                    return null;
                } else {
                    return selection.getRangeAt(0).commonAncestorContainer;
                }
            }
            var scrollingLoop = null;
            var scrollDiff = {
                top: 0,
                left: 0
            };
            function startScrolling() {
                if (!scrollingLoop) {
                    scrollingLoop = setInterval(function() {
                        if (!instances.get(element)) {
                            clearInterval(scrollingLoop);
                            return;
                        }
                        updateScroll(element, "top", element.scrollTop + scrollDiff.top);
                        updateScroll(element, "left", element.scrollLeft + scrollDiff.left);
                        updateGeometry(element);
                    }, 50);
                }
            }
            function stopScrolling() {
                if (scrollingLoop) {
                    clearInterval(scrollingLoop);
                    scrollingLoop = null;
                }
                _.stopScrolling(element);
            }
            var isSelected = false;
            i.event.bind(i.ownerDocument, "selectionchange", function() {
                if (element.contains(getRangeNode())) {
                    isSelected = true;
                } else {
                    isSelected = false;
                    stopScrolling();
                }
            });
            i.event.bind(window, "mouseup", function() {
                if (isSelected) {
                    isSelected = false;
                    stopScrolling();
                }
            });
            i.event.bind(window, "keyup", function() {
                if (isSelected) {
                    isSelected = false;
                    stopScrolling();
                }
            });
            i.event.bind(window, "mousemove", function(e) {
                if (isSelected) {
                    var mousePosition = {
                        x: e.pageX,
                        y: e.pageY
                    };
                    var containerGeometry = {
                        left: element.offsetLeft,
                        right: element.offsetLeft + element.offsetWidth,
                        top: element.offsetTop,
                        bottom: element.offsetTop + element.offsetHeight
                    };
                    if (mousePosition.x < containerGeometry.left + 3) {
                        scrollDiff.left = -5;
                        _.startScrolling(element, "x");
                    } else if (mousePosition.x > containerGeometry.right - 3) {
                        scrollDiff.left = 5;
                        _.startScrolling(element, "x");
                    } else {
                        scrollDiff.left = 0;
                    }
                    if (mousePosition.y < containerGeometry.top + 3) {
                        if (containerGeometry.top + 3 - mousePosition.y < 5) {
                            scrollDiff.top = -5;
                        } else {
                            scrollDiff.top = -20;
                        }
                        _.startScrolling(element, "y");
                    } else if (mousePosition.y > containerGeometry.bottom - 3) {
                        if (mousePosition.y - containerGeometry.bottom + 3 < 5) {
                            scrollDiff.top = 5;
                        } else {
                            scrollDiff.top = 20;
                        }
                        _.startScrolling(element, "y");
                    } else {
                        scrollDiff.top = 0;
                    }
                    if (scrollDiff.top === 0 && scrollDiff.left === 0) {
                        stopScrolling();
                    } else {
                        startScrolling();
                    }
                }
            });
        }
        module.exports = function(element) {
            var i = instances.get(element);
            bindSelectionHandler(element, i);
        };
    }, {
        "../../lib/helper": 5,
        "../instances": 17,
        "../update-geometry": 18,
        "../update-scroll": 19
    } ],
    15: [ function(require, module, exports) {
        "use strict";
        var _ = require("../../lib/helper");
        var instances = require("../instances");
        var updateGeometry = require("../update-geometry");
        var updateScroll = require("../update-scroll");
        function bindTouchHandler(element, i, supportsTouch, supportsIePointer) {
            function shouldPreventDefault(deltaX, deltaY) {
                var scrollTop = element.scrollTop;
                var scrollLeft = element.scrollLeft;
                var magnitudeX = Math.abs(deltaX);
                var magnitudeY = Math.abs(deltaY);
                if (magnitudeY > magnitudeX) {
                    if (deltaY < 0 && scrollTop === i.contentHeight - i.containerHeight || deltaY > 0 && scrollTop === 0) {
                        return !i.settings.swipePropagation;
                    }
                } else if (magnitudeX > magnitudeY) {
                    if (deltaX < 0 && scrollLeft === i.contentWidth - i.containerWidth || deltaX > 0 && scrollLeft === 0) {
                        return !i.settings.swipePropagation;
                    }
                }
                return true;
            }
            function applyTouchMove(differenceX, differenceY) {
                updateScroll(element, "top", element.scrollTop - differenceY);
                updateScroll(element, "left", element.scrollLeft - differenceX);
                updateGeometry(element);
            }
            var startOffset = {};
            var startTime = 0;
            var speed = {};
            var easingLoop = null;
            var inGlobalTouch = false;
            var inLocalTouch = false;
            function globalTouchStart() {
                inGlobalTouch = true;
            }
            function globalTouchEnd() {
                inGlobalTouch = false;
            }
            function getTouch(e) {
                if (e.targetTouches) {
                    return e.targetTouches[0];
                } else {
                    return e;
                }
            }
            function shouldHandle(e) {
                if (e.pointerType && e.pointerType === "pen" && e.buttons === 0) {
                    return false;
                }
                if (e.targetTouches && e.targetTouches.length === 1) {
                    return true;
                }
                if (e.pointerType && e.pointerType !== "mouse" && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
                    return true;
                }
                return false;
            }
            function touchStart(e) {
                if (shouldHandle(e)) {
                    inLocalTouch = true;
                    var touch = getTouch(e);
                    startOffset.pageX = touch.pageX;
                    startOffset.pageY = touch.pageY;
                    startTime = new Date().getTime();
                    if (easingLoop !== null) {
                        clearInterval(easingLoop);
                    }
                    e.stopPropagation();
                }
            }
            function touchMove(e) {
                if (!inLocalTouch && i.settings.swipePropagation) {
                    touchStart(e);
                }
                if (!inGlobalTouch && inLocalTouch && shouldHandle(e)) {
                    var touch = getTouch(e);
                    var currentOffset = {
                        pageX: touch.pageX,
                        pageY: touch.pageY
                    };
                    var differenceX = currentOffset.pageX - startOffset.pageX;
                    var differenceY = currentOffset.pageY - startOffset.pageY;
                    applyTouchMove(differenceX, differenceY);
                    startOffset = currentOffset;
                    var currentTime = new Date().getTime();
                    var timeGap = currentTime - startTime;
                    if (timeGap > 0) {
                        speed.x = differenceX / timeGap;
                        speed.y = differenceY / timeGap;
                        startTime = currentTime;
                    }
                    if (shouldPreventDefault(differenceX, differenceY)) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }
            }
            function touchEnd() {
                if (!inGlobalTouch && inLocalTouch) {
                    inLocalTouch = false;
                    if (i.settings.swipeEasing) {
                        clearInterval(easingLoop);
                        easingLoop = setInterval(function() {
                            if (!instances.get(element)) {
                                clearInterval(easingLoop);
                                return;
                            }
                            if (!speed.x && !speed.y) {
                                clearInterval(easingLoop);
                                return;
                            }
                            if (Math.abs(speed.x) < .01 && Math.abs(speed.y) < .01) {
                                clearInterval(easingLoop);
                                return;
                            }
                            applyTouchMove(speed.x * 30, speed.y * 30);
                            speed.x *= .8;
                            speed.y *= .8;
                        }, 10);
                    }
                }
            }
            if (supportsTouch) {
                i.event.bind(window, "touchstart", globalTouchStart);
                i.event.bind(window, "touchend", globalTouchEnd);
                i.event.bind(element, "touchstart", touchStart);
                i.event.bind(element, "touchmove", touchMove);
                i.event.bind(element, "touchend", touchEnd);
            } else if (supportsIePointer) {
                if (window.PointerEvent) {
                    i.event.bind(window, "pointerdown", globalTouchStart);
                    i.event.bind(window, "pointerup", globalTouchEnd);
                    i.event.bind(element, "pointerdown", touchStart);
                    i.event.bind(element, "pointermove", touchMove);
                    i.event.bind(element, "pointerup", touchEnd);
                } else if (window.MSPointerEvent) {
                    i.event.bind(window, "MSPointerDown", globalTouchStart);
                    i.event.bind(window, "MSPointerUp", globalTouchEnd);
                    i.event.bind(element, "MSPointerDown", touchStart);
                    i.event.bind(element, "MSPointerMove", touchMove);
                    i.event.bind(element, "MSPointerUp", touchEnd);
                }
            }
        }
        module.exports = function(element) {
            if (!_.env.supportsTouch && !_.env.supportsIePointer) {
                return;
            }
            var i = instances.get(element);
            bindTouchHandler(element, i, _.env.supportsTouch, _.env.supportsIePointer);
        };
    }, {
        "../../lib/helper": 5,
        "../instances": 17,
        "../update-geometry": 18,
        "../update-scroll": 19
    } ],
    16: [ function(require, module, exports) {
        "use strict";
        var instances = require("./instances");
        var updateGeometry = require("./update-geometry");
        var handlers = {
            "click-rail": require("./handler/click-rail"),
            "drag-scrollbar": require("./handler/drag-scrollbar"),
            keyboard: require("./handler/keyboard"),
            wheel: require("./handler/mouse-wheel"),
            touch: require("./handler/touch"),
            selection: require("./handler/selection")
        };
        var nativeScrollHandler = require("./handler/native-scroll");
        module.exports = function(element, userSettings) {
            element.classList.add("ps");
            var i = instances.add(element, typeof userSettings === "object" ? userSettings : {});
            element.classList.add("ps--theme_" + i.settings.theme);
            i.settings.handlers.forEach(function(handlerName) {
                handlers[handlerName](element);
            });
            nativeScrollHandler(element);
            updateGeometry(element);
        };
    }, {
        "./handler/click-rail": 9,
        "./handler/drag-scrollbar": 10,
        "./handler/keyboard": 11,
        "./handler/mouse-wheel": 12,
        "./handler/native-scroll": 13,
        "./handler/selection": 14,
        "./handler/touch": 15,
        "./instances": 17,
        "./update-geometry": 18
    } ],
    17: [ function(require, module, exports) {
        "use strict";
        var _ = require("../lib/helper");
        var defaultSettings = require("./default-setting");
        var dom = require("../lib/dom");
        var EventManager = require("../lib/event-manager");
        var guid = require("../lib/guid");
        var instances = {};
        function Instance(element, userSettings) {
            var i = this;
            i.settings = defaultSettings();
            for (var key in userSettings) {
                i.settings[key] = userSettings[key];
            }
            i.containerWidth = null;
            i.containerHeight = null;
            i.contentWidth = null;
            i.contentHeight = null;
            i.isRtl = dom.css(element, "direction") === "rtl";
            i.isNegativeScroll = function() {
                var originalScrollLeft = element.scrollLeft;
                var result = null;
                element.scrollLeft = -1;
                result = element.scrollLeft < 0;
                element.scrollLeft = originalScrollLeft;
                return result;
            }();
            i.negativeScrollAdjustment = i.isNegativeScroll ? element.scrollWidth - element.clientWidth : 0;
            i.event = new EventManager();
            i.ownerDocument = element.ownerDocument || document;
            function focus() {
                element.classList.add("ps--focus");
            }
            function blur() {
                element.classList.remove("ps--focus");
            }
            i.scrollbarXRail = dom.appendTo(dom.create("div", "ps__scrollbar-x-rail"), element);
            i.scrollbarX = dom.appendTo(dom.create("div", "ps__scrollbar-x"), i.scrollbarXRail);
            i.scrollbarX.setAttribute("tabindex", 0);
            i.event.bind(i.scrollbarX, "focus", focus);
            i.event.bind(i.scrollbarX, "blur", blur);
            i.scrollbarXActive = null;
            i.scrollbarXWidth = null;
            i.scrollbarXLeft = null;
            i.scrollbarXBottom = _.toInt(dom.css(i.scrollbarXRail, "bottom"));
            i.isScrollbarXUsingBottom = i.scrollbarXBottom === i.scrollbarXBottom;
            i.scrollbarXTop = i.isScrollbarXUsingBottom ? null : _.toInt(dom.css(i.scrollbarXRail, "top"));
            i.railBorderXWidth = _.toInt(dom.css(i.scrollbarXRail, "borderLeftWidth")) + _.toInt(dom.css(i.scrollbarXRail, "borderRightWidth"));
            dom.css(i.scrollbarXRail, "display", "block");
            i.railXMarginWidth = _.toInt(dom.css(i.scrollbarXRail, "marginLeft")) + _.toInt(dom.css(i.scrollbarXRail, "marginRight"));
            dom.css(i.scrollbarXRail, "display", "");
            i.railXWidth = null;
            i.railXRatio = null;
            i.scrollbarYRail = dom.appendTo(dom.create("div", "ps__scrollbar-y-rail"), element);
            i.scrollbarY = dom.appendTo(dom.create("div", "ps__scrollbar-y"), i.scrollbarYRail);
            i.scrollbarY.setAttribute("tabindex", 0);
            i.event.bind(i.scrollbarY, "focus", focus);
            i.event.bind(i.scrollbarY, "blur", blur);
            i.scrollbarYActive = null;
            i.scrollbarYHeight = null;
            i.scrollbarYTop = null;
            i.scrollbarYRight = _.toInt(dom.css(i.scrollbarYRail, "right"));
            i.isScrollbarYUsingRight = i.scrollbarYRight === i.scrollbarYRight;
            i.scrollbarYLeft = i.isScrollbarYUsingRight ? null : _.toInt(dom.css(i.scrollbarYRail, "left"));
            i.scrollbarYOuterWidth = i.isRtl ? _.outerWidth(i.scrollbarY) : null;
            i.railBorderYWidth = _.toInt(dom.css(i.scrollbarYRail, "borderTopWidth")) + _.toInt(dom.css(i.scrollbarYRail, "borderBottomWidth"));
            dom.css(i.scrollbarYRail, "display", "block");
            i.railYMarginHeight = _.toInt(dom.css(i.scrollbarYRail, "marginTop")) + _.toInt(dom.css(i.scrollbarYRail, "marginBottom"));
            dom.css(i.scrollbarYRail, "display", "");
            i.railYHeight = null;
            i.railYRatio = null;
        }
        function getId(element) {
            return element.getAttribute("data-ps-id");
        }
        function setId(element, id) {
            element.setAttribute("data-ps-id", id);
        }
        function removeId(element) {
            element.removeAttribute("data-ps-id");
        }
        exports.add = function(element, userSettings) {
            var newId = guid();
            setId(element, newId);
            instances[newId] = new Instance(element, userSettings);
            return instances[newId];
        };
        exports.remove = function(element) {
            delete instances[getId(element)];
            removeId(element);
        };
        exports.get = function(element) {
            return instances[getId(element)];
        };
    }, {
        "../lib/dom": 2,
        "../lib/event-manager": 3,
        "../lib/guid": 4,
        "../lib/helper": 5,
        "./default-setting": 7
    } ],
    18: [ function(require, module, exports) {
        "use strict";
        var _ = require("../lib/helper");
        var dom = require("../lib/dom");
        var instances = require("./instances");
        var updateScroll = require("./update-scroll");
        function getThumbSize(i, thumbSize) {
            if (i.settings.minScrollbarLength) {
                thumbSize = Math.max(thumbSize, i.settings.minScrollbarLength);
            }
            if (i.settings.maxScrollbarLength) {
                thumbSize = Math.min(thumbSize, i.settings.maxScrollbarLength);
            }
            return thumbSize;
        }
        function updateCss(element, i) {
            var xRailOffset = {
                width: i.railXWidth
            };
            if (i.isRtl) {
                xRailOffset.left = i.negativeScrollAdjustment + element.scrollLeft + i.containerWidth - i.contentWidth;
            } else {
                xRailOffset.left = element.scrollLeft;
            }
            if (i.isScrollbarXUsingBottom) {
                xRailOffset.bottom = i.scrollbarXBottom - element.scrollTop;
            } else {
                xRailOffset.top = i.scrollbarXTop + element.scrollTop;
            }
            dom.css(i.scrollbarXRail, xRailOffset);
            var yRailOffset = {
                top: element.scrollTop,
                height: i.railYHeight
            };
            if (i.isScrollbarYUsingRight) {
                if (i.isRtl) {
                    yRailOffset.right = i.contentWidth - (i.negativeScrollAdjustment + element.scrollLeft) - i.scrollbarYRight - i.scrollbarYOuterWidth;
                } else {
                    yRailOffset.right = i.scrollbarYRight - element.scrollLeft;
                }
            } else {
                if (i.isRtl) {
                    yRailOffset.left = i.negativeScrollAdjustment + element.scrollLeft + i.containerWidth * 2 - i.contentWidth - i.scrollbarYLeft - i.scrollbarYOuterWidth;
                } else {
                    yRailOffset.left = i.scrollbarYLeft + element.scrollLeft;
                }
            }
            dom.css(i.scrollbarYRail, yRailOffset);
            dom.css(i.scrollbarX, {
                left: i.scrollbarXLeft,
                width: i.scrollbarXWidth - i.railBorderXWidth
            });
            dom.css(i.scrollbarY, {
                top: i.scrollbarYTop,
                height: i.scrollbarYHeight - i.railBorderYWidth
            });
        }
        module.exports = function(element) {
            var i = instances.get(element);
            i.containerWidth = element.clientWidth;
            i.containerHeight = element.clientHeight;
            i.contentWidth = element.scrollWidth;
            i.contentHeight = element.scrollHeight;
            var existingRails;
            if (!element.contains(i.scrollbarXRail)) {
                existingRails = dom.queryChildren(element, ".ps__scrollbar-x-rail");
                if (existingRails.length > 0) {
                    existingRails.forEach(function(rail) {
                        dom.remove(rail);
                    });
                }
                dom.appendTo(i.scrollbarXRail, element);
            }
            if (!element.contains(i.scrollbarYRail)) {
                existingRails = dom.queryChildren(element, ".ps__scrollbar-y-rail");
                if (existingRails.length > 0) {
                    existingRails.forEach(function(rail) {
                        dom.remove(rail);
                    });
                }
                dom.appendTo(i.scrollbarYRail, element);
            }
            if (!i.settings.suppressScrollX && i.containerWidth + i.settings.scrollXMarginOffset < i.contentWidth) {
                i.scrollbarXActive = true;
                i.railXWidth = i.containerWidth - i.railXMarginWidth;
                i.railXRatio = i.containerWidth / i.railXWidth;
                i.scrollbarXWidth = getThumbSize(i, _.toInt(i.railXWidth * i.containerWidth / i.contentWidth));
                i.scrollbarXLeft = _.toInt((i.negativeScrollAdjustment + element.scrollLeft) * (i.railXWidth - i.scrollbarXWidth) / (i.contentWidth - i.containerWidth));
            } else {
                i.scrollbarXActive = false;
            }
            if (!i.settings.suppressScrollY && i.containerHeight + i.settings.scrollYMarginOffset < i.contentHeight) {
                i.scrollbarYActive = true;
                i.railYHeight = i.containerHeight - i.railYMarginHeight;
                i.railYRatio = i.containerHeight / i.railYHeight;
                i.scrollbarYHeight = getThumbSize(i, _.toInt(i.railYHeight * i.containerHeight / i.contentHeight));
                i.scrollbarYTop = _.toInt(element.scrollTop * (i.railYHeight - i.scrollbarYHeight) / (i.contentHeight - i.containerHeight));
            } else {
                i.scrollbarYActive = false;
            }
            if (i.scrollbarXLeft >= i.railXWidth - i.scrollbarXWidth) {
                i.scrollbarXLeft = i.railXWidth - i.scrollbarXWidth;
            }
            if (i.scrollbarYTop >= i.railYHeight - i.scrollbarYHeight) {
                i.scrollbarYTop = i.railYHeight - i.scrollbarYHeight;
            }
            updateCss(element, i);
            if (i.scrollbarXActive) {
                element.classList.add("ps--active-x");
            } else {
                element.classList.remove("ps--active-x");
                i.scrollbarXWidth = 0;
                i.scrollbarXLeft = 0;
                updateScroll(element, "left", 0);
            }
            if (i.scrollbarYActive) {
                element.classList.add("ps--active-y");
            } else {
                element.classList.remove("ps--active-y");
                i.scrollbarYHeight = 0;
                i.scrollbarYTop = 0;
                updateScroll(element, "top", 0);
            }
        };
    }, {
        "../lib/dom": 2,
        "../lib/helper": 5,
        "./instances": 17,
        "./update-scroll": 19
    } ],
    19: [ function(require, module, exports) {
        "use strict";
        var instances = require("./instances");
        var createDOMEvent = function(name) {
            var event = document.createEvent("Event");
            event.initEvent(name, true, true);
            return event;
        };
        module.exports = function(element, axis, value) {
            if (typeof element === "undefined") {
                throw "You must provide an element to the update-scroll function";
            }
            if (typeof axis === "undefined") {
                throw "You must provide an axis to the update-scroll function";
            }
            if (typeof value === "undefined") {
                throw "You must provide a value to the update-scroll function";
            }
            if (axis === "top" && value <= 0) {
                element.scrollTop = value = 0;
                element.dispatchEvent(createDOMEvent("ps-y-reach-start"));
            }
            if (axis === "left" && value <= 0) {
                element.scrollLeft = value = 0;
                element.dispatchEvent(createDOMEvent("ps-x-reach-start"));
            }
            var i = instances.get(element);
            if (axis === "top" && value >= i.contentHeight - i.containerHeight) {
                value = i.contentHeight - i.containerHeight;
                if (value - element.scrollTop <= 2) {
                    value = element.scrollTop;
                } else {
                    element.scrollTop = value;
                }
                element.dispatchEvent(createDOMEvent("ps-y-reach-end"));
            }
            if (axis === "left" && value >= i.contentWidth - i.containerWidth) {
                value = i.contentWidth - i.containerWidth;
                if (value - element.scrollLeft <= 2) {
                    value = element.scrollLeft;
                } else {
                    element.scrollLeft = value;
                }
                element.dispatchEvent(createDOMEvent("ps-x-reach-end"));
            }
            if (i.lastTop === undefined) {
                i.lastTop = element.scrollTop;
            }
            if (i.lastLeft === undefined) {
                i.lastLeft = element.scrollLeft;
            }
            if (axis === "top" && value < i.lastTop) {
                element.dispatchEvent(createDOMEvent("ps-scroll-up"));
            }
            if (axis === "top" && value > i.lastTop) {
                element.dispatchEvent(createDOMEvent("ps-scroll-down"));
            }
            if (axis === "left" && value < i.lastLeft) {
                element.dispatchEvent(createDOMEvent("ps-scroll-left"));
            }
            if (axis === "left" && value > i.lastLeft) {
                element.dispatchEvent(createDOMEvent("ps-scroll-right"));
            }
            if (axis === "top" && value !== i.lastTop) {
                element.scrollTop = i.lastTop = value;
                element.dispatchEvent(createDOMEvent("ps-scroll-y"));
            }
            if (axis === "left" && value !== i.lastLeft) {
                element.scrollLeft = i.lastLeft = value;
                element.dispatchEvent(createDOMEvent("ps-scroll-x"));
            }
        };
    }, {
        "./instances": 17
    } ],
    20: [ function(require, module, exports) {
        "use strict";
        var _ = require("../lib/helper");
        var dom = require("../lib/dom");
        var instances = require("./instances");
        var updateGeometry = require("./update-geometry");
        var updateScroll = require("./update-scroll");
        module.exports = function(element) {
            var i = instances.get(element);
            if (!i) {
                return;
            }
            i.negativeScrollAdjustment = i.isNegativeScroll ? element.scrollWidth - element.clientWidth : 0;
            dom.css(i.scrollbarXRail, "display", "block");
            dom.css(i.scrollbarYRail, "display", "block");
            i.railXMarginWidth = _.toInt(dom.css(i.scrollbarXRail, "marginLeft")) + _.toInt(dom.css(i.scrollbarXRail, "marginRight"));
            i.railYMarginHeight = _.toInt(dom.css(i.scrollbarYRail, "marginTop")) + _.toInt(dom.css(i.scrollbarYRail, "marginBottom"));
            dom.css(i.scrollbarXRail, "display", "none");
            dom.css(i.scrollbarYRail, "display", "none");
            updateGeometry(element);
            updateScroll(element, "top", element.scrollTop);
            updateScroll(element, "left", element.scrollLeft);
            dom.css(i.scrollbarXRail, "display", "");
            dom.css(i.scrollbarYRail, "display", "");
        };
    }, {
        "../lib/dom": 2,
        "../lib/helper": 5,
        "./instances": 17,
        "./update-geometry": 18,
        "./update-scroll": 19
    } ]
}, {}, [ 1 ]);

var Accordion = function($) {
    var _s = {
        toggle: ".js-toggleAccordion"
    };
    var _init = function() {
        _bindEvents();
    };
    var _bindEvents = function() {
        $(_s.toggle).click(function() {
            $(this).parent().toggleClass("accordion-is-visible");
        });
    };
    return {
        init: _init
    };
}(jQuery);

var SmoothScroll = function($) {
    var _doScroll = function() {
        $('a[href*="#"]:not([href="#"])').click(function() {
            if (location.pathname.replace(/^\//, "") == this.pathname.replace(/^\//, "") && location.hostname == this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
                if (target.length) {
                    $("html,body").animate({
                        scrollTop: target.offset().top - 110
                    }, 1e3);
                    return false;
                }
            }
        });
    };
    var _init = function() {
        _doScroll();
    };
    return {
        init: _init
    };
}(jQuery);

var areClipPathShapesSupported = function() {
    var base = "clipPath", prefixes = [ "webkit", "moz", "ms", "o" ], properties = [ base ], testElement = document.createElement("testelement"), attribute = "polygon(50% 0%, 0% 100%, 100% 100%)";
    for (var i = 0, l = prefixes.length; i < l; i++) {
        var prefixedProperty = prefixes[i] + base.charAt(0).toUpperCase() + base.slice(1);
        properties.push(prefixedProperty);
    }
    for (var i = 0, l = properties.length; i < l; i++) {
        var property = properties[i];
        if (testElement.style[property] === "") {
            testElement.style[property] = attribute;
            if (testElement.style[property] !== "") {
                return true;
            }
        }
    }
    return false;
};

var detectIEVersion = function() {
    var iev = 0;
    var ieold = /MSIE (\d+\.\d+);/.test(navigator.userAgent);
    var trident = !!navigator.userAgent.match(/Trident\/7.0/);
    var rv = navigator.userAgent.indexOf("rv:11.0");
    if (ieold) iev = new Number(RegExp.$1);
    if (navigator.appVersion.indexOf("MSIE 10") != -1) iev = 10;
    if (trident && rv != -1) iev = 11;
    return iev;
};

jQuery(document).ready(function($) {
    var browserSupportsClipPath = areClipPathShapesSupported();
    var ieVersion = detectIEVersion();
    // console.log(browserSupportsClipPath);
    // console.log(ieVersion);
    if (!browserSupportsClipPath) {
        if (ieVersion == 0) {
            $(".mh").addClass("no-clip-support");
        }
    }
    $("a[href='#']").on("click", function(e) {
        e.preventDefault();
    });
    SmoothScroll.init();
    $("#featured-grantees").slick({
        arrows: false,
        dots: true,
        autoplay: true,
        autoplaySpeed: 5e3
    });
    $(".g-accordion__drawer").perfectScrollbar({});
    Accordion.init();
    $(".js-toggleMenu").click(function(e) {
        e.preventDefault();
        $("body").toggleClass("navbar-is-open");
    });
    $(".navbar ul a").click(function(e) {
        $("body").removeClass("navbar-is-open");
    });
});
//# sourceMappingURL=grace-1.0.1.js.map
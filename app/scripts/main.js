/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function() {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = registration.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');

              default:
                // Ignore
            }
          };
        }
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  }
  var $ = window.$;

  // var UtilsFactory = function() {
  //
  // };
  //
  // UtilsFactory.prototype = {
  //   constructor: UtilsFactory,
  //   isElementInView: function(element, fullyInView) {
  //     var pageTop = $(window).scrollTop();
  //     var pageBottom = pageTop + $(window).height();
  //     var elementTop = $(element).offset().top;
  //     var elementBottom = elementTop + $(element).height();
  //     var inView = false;
  //
  //     if (fullyInView === true) {
  //       inView = ((pageTop < elementTop) && (pageBottom > elementBottom));
  //     } else {
  //       inView = ((elementTop <= pageBottom) && (elementBottom >= pageTop));
  //     }
  //     return inView;
  //   }
  // };
  //
  // var Utils = new UtilsFactory();
  // Your custom JavaScript goes here

  var validateEmail = function(email) {
    // eslint-disable-next-line max-len
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };
  var currentAnimatedIndex = -1;
  var imagesData = {};
  var imagesDataLoaded = false;
  var animating = false;
  var currentPrefix = 'none';
  var onMobileOverlay = false;

  var resetPolaroid = function() {
    var polaroid = $('.polaroid.expanded');
    var degrees = polaroid.data('degrees');
    var tx = polaroid.data('tx');
    var ty = polaroid.data('ty');
    var height = polaroid.data('height');
    var width = polaroid.data('width');

    polaroid.removeClass('expanded')
      .css({
        height: height,
        width: width,
        top: 'auto',
        left: 'auto',
        bottom: 'auto',
        right: 'auto'
      });
    polaroid.css('transform', 'rotate(' + degrees + ')' +
                                       'translate(' + tx + ',' + ty + ')');
  };

  var animatePolaroidFromRight = function(polaroid) {
    var polaroidIndex = polaroid.data('index');

    if (animating || polaroidIndex === currentAnimatedIndex) {
      return;
    }
    animating = true;
    var windowElement = $(window);
    var vh = windowElement.height();
    var vw = windowElement.width();
    var leftPadding = 100;
    var topPadding = 50;
    if (vw > 1300) {
      leftPadding = (vw - 1100) / 2;
    } else if (vw > 600) {
      leftPadding = 100;
    } else {
      leftPadding = 50;
    }
    var pw = vw - 2 * leftPadding;
    var ph = vh - 2 * topPadding;
    var degrees = polaroid.data('degrees');
    resetPolaroid();
    currentAnimatedIndex = Number(polaroid.data('index'));
    var iheight = Number(polaroid.data('iheight'));
    var iwidth = Number(polaroid.data('iwidth'));
    var rh = (iheight / iwidth) * (pw - 40) + 70;
    /* Readjust if pw if ph is greater than possible height */
    if (rh > ph) {
      pw = (iwidth / iheight) * (ph - 70) + 40;
      leftPadding = (vw - pw) / 2;
    } else {
      ph = rh;
    }
    topPadding = (vh - ph) / 2;
    polaroid.addClass('expanded');
    if (vw > 600) {
      polaroid.css({bottom: 0,
                    right: 0,
                    transform: 'rotate(' + degrees + ')'})
              .transition({top: topPadding,
                right: leftPadding,
                height: ph,
                width: pw,
                duration: 1000,
                rotate: 0}, function() {
                  animating = false;
                });
    } else {
      polaroid.css({top: topPadding,
                right: leftPadding,
                height: ph,
                width: pw,
                rotate: 0});
      animating = false;
    }
  };

  var animatePolaroidFromLeft = function(polaroid) {
    if (animating) {
      return;
    }
    animating = true;
    var windowElement = $(window);
    var vh = windowElement.height();
    var vw = windowElement.width();
    var leftPadding = 100;
    var topPadding = 50;
    if (vw > 1300) {
      leftPadding = (vw - 1100) / 2;
    } else if (vw > 600) {
      leftPadding = 100;
    } else {
      leftPadding = 50;
    }
    var pw = vw - 2 * leftPadding;
    var ph = vh - 2 * topPadding;
    var degrees = polaroid.data('degrees');
    currentAnimatedIndex = Number(polaroid.data('index'));
    var iheight = polaroid.data('iheight');
    var iwidth = polaroid.data('iwidth');
    var rh = (iheight / iwidth) * (pw - 40) + 70;
    /* Readjust if pw if ph is greater than possible height */
    if (rh > ph) {
      pw = (iwidth / iheight) * (ph - 70) + 40;
      leftPadding = (vw - pw) / 2;
    } else {
      ph = rh;
    }
    topPadding = (vh - ph) / 2;
    polaroid.addClass('expanded');
    if (vw > 600) {
      polaroid.css({top: 0,
                    left: 0,
                    transform: 'rotate(' + degrees + ')'})
              .transition({top: topPadding,
                left: leftPadding,
                height: ph,
                width: pw,
                duration: 1000,
                rotate: 0}, function() {
                  animating = false;
                });
    } else {
      polaroid.css({top: topPadding,
                left: leftPadding,
                height: ph,
                width: pw,
                rotate: 0});
      animating = false;
    }
  };

  var previousImage = function(prefix) {
    if (!animating) {
      var totalImages = imagesData[prefix].length;
      var index = currentAnimatedIndex === 0 ?
                    totalImages - 1 : (currentAnimatedIndex - 1);
      var polaroid = $('#' + prefix + '-polaroid-' + index);
      resetPolaroid();
      animatePolaroidFromLeft(polaroid);
    }
  };

  var nextImage = function(prefix) {
    if (!animating) {
      var totalImages = imagesData[prefix].length;
      var index = (currentAnimatedIndex + 1) % totalImages;
      var polaroid = $('#' + prefix + '-polaroid-' + index);

      resetPolaroid();

      animatePolaroidFromRight(polaroid);
    }
  };

  var startGallery = function(polaroid) {
    currentPrefix = polaroid.data('prefix');
    if (currentPrefix === 'main' && onMobileOverlay) {
      return;
    }
    $('header').hide();
    $('#next').show();
    $('#previous').show();
    if (currentPrefix === 'main') {
      $('#gallery-overlay').show();
      $('#polaroid-gallery').addClass('gallery');
    } else {
      $('#' + currentPrefix + '-polaroid-gallery').addClass('gallery');
      $('.room.' + currentPrefix).addClass('expanded').css({
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      });
    }
    animatePolaroidFromRight(polaroid);
  };
  var stopGallery = function() {
    resetPolaroid();
    $('header').show();
    $('#next').hide();
    $('#previous').hide();
    if (currentPrefix === 'main') {
      $('#gallery-overlay').hide();
      $('#polaroid-gallery').removeClass('gallery');
    } else {
      $('.room.' + currentPrefix).removeClass('expanded').css({
        position: 'relative',
        top: 'auto',
        left: 'auto',
        bottom: 'auto',
        right: 0
      });
    }
    currentAnimatedIndex = -1;
    currentPrefix = 'none';
    $('html, body').animate({scrollTop: '+=10px'}, 300);
  };

  $('.rooms').on('click', '.room.expanded', function() {
    stopGallery();
  });

  var loadPolaroid = function(polaroidGallerySelector, prefix, images) {
    var polaroidGalleryElement = $(polaroidGallerySelector);
    polaroidGalleryElement.on('click', '.polaroid', function(event) {
      var polaroid = $(this);
      event.stopPropagation();
      startGallery(polaroid);
    });
    polaroidGalleryElement.on('click', '.close', function(event) {
      event.stopPropagation();
      stopGallery();
    });
    images.forEach(function(polaroid, index) {
      var polaroidElement = $('<div title="click-me" class="polaroid" id="' +
                                prefix +
                                '-polaroid-' + index + '">' +
                                '<div class="close">&#x2715;</div>' +
                                '<div class="image"></div>' +
                                '<div class="description">' +
                                polaroid.description +
                                '</div>' +
                              '</div>');
      var vw = Math.min($(window).width(), 1300);
      var mainVariations = {
        degrees: [1, 10],
        height: [0.17 * vw, 0.25 * vw],
        width: [0.17 * vw, 0.25 * vw],
        tx: 10,
        ty: 125
      };
      var roomVariations = {
        degrees: [1, 10],
        height: [140, 180],
        width: [180, 220],
        tx: 35,
        ty: 35
      };
      if (vw < 620) {
        mainVariations = {
          degrees: [1, 10],
          height: [0.23 * vw, 0.30 * vw],
          width: [0.23 * vw, 0.30 * vw],
          tx: 10,
          ty: 35
        };
        roomVariations = {
          degrees: [1, 10],
          height: [60, 100],
          width: [60, 100],
          tx: 0,
          ty: 0
        };
      }
      var variations = prefix === 'main' ? mainVariations : roomVariations;
      var sign = Math.random() <= 0.5 ? '-' : '';
      var xsign = Math.random() <= 0.5 ? '-' : '';
      var ysign = Math.random() <= 0.85 ? '-' : '';
      var height = Math.floor(Math.random() *
                    (variations.height[1] - variations.height[0]) +
                    variations.height[0]);
      var width = Math.floor(Math.random() *
                    (variations.width[1] - variations.width[0]) +
                    variations.width[0]);
      var tx = xsign + Math.floor(Math.random() *
          (variations.tx * width /
            (variations.width[0] + variations.width[1]))) + 'px';
      var ty = ysign + Math.floor(Math.random() *
          (variations.ty * height /
            (variations.height[0] + variations.height[1]))) + 'px';
      var degrees = sign + Math.floor(Math.random() *
          (variations.degrees[1] - variations.degrees[0]) +
          variations.degrees[0]) + 'deg';
      if (index === 0) {
        tx = ty = '0px';
      }
      width += 'px';
      height += 'px';
      polaroidElement.data('prefix', prefix);
      polaroidElement.data('degrees', degrees);
      polaroidElement.data('tx', tx);
      polaroidElement.data('ty', ty);
      polaroidElement.data('index', index);
      polaroidElement.data('height', height);
      polaroidElement.data('width', width);
      polaroidElement.css({
        height: height,
        width: width,
        transform: 'rotate(' + degrees + ')' +
                                         'translate(' + tx + ',' + ty + ')'
      });
      polaroidElement.find('.image')
                     .css('background-image', 'url(' + polaroid.url + ')');
      polaroidGalleryElement.append(polaroidElement);
      var image = new Image();
      image.name = polaroid.url;
      image.src = polaroid.url;
      image.onload = function() {
        polaroidElement.data('iheight', this.height);
        polaroidElement.data('iwidth', this.width);
      };
    });
  };

  var loadImages = function(gallerySelector, prefix) {
    if (imagesDataLoaded) {
      loadPolaroid(gallerySelector, prefix, imagesData[prefix]);
    } else {
      $.getJSON('/images.json', function(data) {
        imagesData = data;
        imagesDataLoaded = true;
        loadPolaroid(gallerySelector, prefix, imagesData[prefix]);
      });
    }
  };

  $(document).ready(function() {
    /* Main Hero element carousel code */
    $('.owl-carousel').owlCarousel({
      items: 1,
      autoplay: true,
      autoplayTimeout: 4000,
      loop: true
    });

    loadImages('#polaroid-gallery', 'main');
    loadImages('#single-polaroid-gallery', 'single');
    loadImages('#double-polaroid-gallery', 'double');
    loadImages('#triple-polaroid-gallery', 'triple');

    $('#gallery-overlay').on('click', function(event) {
      stopGallery();
      event.stopPropagation();
    });
    $('#next').on('click', function() {
      nextImage(currentPrefix);
    });
    $('#previous').on('click', function() {
      previousImage(currentPrefix);
    });

    $('.room-overlay').mouseenter(function() {
      $('#polaroid-gallery').hide();
      var roomElement = $(this);
      onMobileOverlay = true;
      setTimeout(function() {
        $('html, body').animate({
          scrollTop: roomElement.offset().top - 35}, 400);
      }, 200);
    });
    $('.room-overlay').mouseleave(function(event) {
      if (currentPrefix === 'none') {
        event.stopPropagation();
        $('#polaroid-gallery').show();
        setTimeout(function() {
          onMobileOverlay = false;
        }, 400);
      }
    });

    /* Adding smoothness to scroll on navigation click */
    $('body').smoothScroll({
      offset: -60,
      delegateSelector: 'header a'
    });

    /* Making sticky header visible on scroll after hero element */
    var headerElement = $('header');
    var contentElement = $('#content');
    $(window).scroll(function() {
      var offset = 5;
      var fromTop = $(this).scrollTop() + offset;
      var windowHeight = $(this).height();
      var ratio = (fromTop / windowHeight * 100);
      var windowWidth = $(this).width();
      var maxHeight = 460;
      if (windowWidth < 600) {
        maxHeight = 210;
      }
      if (ratio >= 90 || fromTop > maxHeight) {
        headerElement.addClass('fixed');
        contentElement.addClass('fixed');
      } else {
        headerElement.removeClass('fixed');
        contentElement.removeClass('fixed');
      }
    });

    /* Site minder integration */
    $('.book').on('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      window.open('https://app-apac.thebookingbutton.com' +
                  '/properties/gilikhayangandirect', '_blank');
    });

    /* Sending email on form submit and validation */

    var showFormError = function(error) {
      $('.form-error').text(error).removeClass('hide');
    };

    var hideError = function() {
      $('.form-error').addClass('hide');
    };

    var showFlashMessage = function(message) {
      $('#flash-message').addClass('show').text(message);
      setTimeout(function() {
        $('#flash-message').removeClass('show');
      }, 1500);
    };

    $('#sign-up').on('click', function() {
      var email = $('#subscriber').val();
      if (!validateEmail(email)) {
        $('.subscriber-error').show();
        return;
      }
      $('.subscriber-error').hide();
      $('#signup').prop('disabled', true);
      $.ajax({
        url: 'http://gilikhayangan-shastri9999.c9users.io:8081/subscribe',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(
          {
            email: email
          }
        ),
        success: function() {
          showFlashMessage('You have successfully subscribed!');
          $('#signup').prop('disabled', false);
          $('#subscriber').val('');
        }
      });
    });

    $('#say-hello-form').submit(function(event) {
      var message = $('#message').val();
      var email = $('#email').val();
      var name = $('#name').val();

      event.preventDefault();

      hideError();
      if (!name) {
        showFormError('Please fill in the Name.');
        return;
      }
      if (!validateEmail(email)) {
        showFormError('Please fill in valid Email.');
        return;
      }
      if (!message) {
        showFormError('Please fill in the Message.');
        return;
      }

      $('.submit').prop('disabled', true);
      $('.form-loading').removeClass('hide');
      $.ajax({
        url: 'http://gilikhayangan-shastri9999.c9users.io:8081/',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(
          {
            to: name + ' <' + email + '>',
            message: message
          }
        ),
        success: function() {
          showFlashMessage('Your Message has reached us!');
          $('.submit').prop('disabled', false);
          $('#message').val('');
          $('#email').val('');
          $('#name').val('');
          $('.form-loading').addClass('hide');
        }
      });
    });
  });
})();

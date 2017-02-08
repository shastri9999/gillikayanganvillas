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
  // Your custom JavaScript goes here

  var currentAnimatedIndex = -1;
  var totalMainImages = 0;
  var animating = false;

  var resetPolaroid = function() {
    var polaroid = $('.polaroid.expanded');
    polaroid.removeClass('expanded')
      .css({
        transform: 'rotate(' + polaroid.data('degrees') + ')',
        height: 280,
        width: 280
      });
  };

  var animatePolaroidFromRight = function(polaroid) {
    if (animating) {
      return;
    }
    animating = true;
    var windowElement = $(window);
    var windowTop = windowElement.scrollTop();
    var vh = windowElement.height();
    var vw = windowElement.width();
    var leftPadding = 100;
    var topPadding = 50;
    var pw = vw - 2 * leftPadding;
    var ph = vh - 2 * topPadding;
    var top = polaroid.offset().top - windowTop;
    var degrees = polaroid.data('degrees');

    resetPolaroid();
    currentAnimatedIndex = Number(polaroid.data('index'));
    var iheight = Number(polaroid.data('iheight'));
    var iwidth = Number(polaroid.data('iwidth'));
    ph = Math.min((iheight / iwidth) * (pw - 40) + 70, ph);
    topPadding = (vh - ph) / 2;
    polaroid.addClass('expanded');
    polaroid.css({top: top,
                  right: 0,
                  transform: 'rotate(' + degrees + ')'})
            .transition({top: topPadding,
              right: leftPadding,
              height: ph,
              width: pw,
              rotate: 360}, function() {
                animating = false;
              });
  };

  var animatePolaroidFromLeft = function(polaroid) {
    if (animating) {
      return;
    }
    animating = true;
    var windowElement = $(window);
    var windowTop = windowElement.scrollTop();
    var vh = windowElement.height();
    var vw = windowElement.width();
    var leftPadding = 100;
    var topPadding = 50;
    var pw = vw - 2 * leftPadding;
    var ph = vh - 2 * topPadding;
    var top = polaroid.offset().top - windowTop;
    var degrees = polaroid.data('degrees');
    currentAnimatedIndex = Number(polaroid.data('index'));
    var iheight = polaroid.data('iheight');
    var iwidth = polaroid.data('iwidth');
    ph = Math.min((iheight / iwidth) * (pw - 40) + 70, ph);
    topPadding = (vh - ph) / 2;

    polaroid.css({position: 'fixed',
                  top: top,
                  right: 0,
                  transform: 'rotate(' + degrees + ')'})
            .transition({top: topPadding,
              right: leftPadding,
              height: ph,
              width: pw,
              rotate: -360}, function() {
                animating = true;
                polaroid.addClass('expanded');
              });
  };

  var previousImage = function() {
    if (!animating) {
      var index = currentAnimatedIndex === 0 ?
                    totalMainImages : (currentAnimatedIndex - 1);
      var polaroid = $('#main-polaroid-' + index);

      resetPolaroid();
      animatePolaroidFromLeft(polaroid);
    }
  };

  var nextImage = function() {
    if (!animating) {
      var index = currentAnimatedIndex === 0 ?
                    totalMainImages : (currentAnimatedIndex - 1);
      var polaroid = $('#main-polaroid-' + index);

      resetPolaroid();

      animatePolaroidFromLeft(polaroid);
    }
  };

  var startGallery = function(polaroid) {
    $('header').hide();
    $('#gallery-overlay').show();
    $('#polaroid-gallery').addClass('gallery');
    animatePolaroidFromRight(polaroid);
  };

  var stopGallery = function() {
    resetPolaroid();
    $('header').show();
    $('#gallery-overlay').hide();
    $('#polaroid-gallery').removeClass('gallery');
  };

  var loadImagesJson = function() {
    $.getJSON('/images.json', function(data) {
      var mainImages = data.main;
      totalMainImages = mainImages.length;
      var polaroidGalleryElement = $('#polaroid-gallery');
      polaroidGalleryElement.on('click', '.polaroid', function() {
        var polaroid = $(this);
        startGallery(polaroid);
      });
      mainImages.forEach(function(polaroid, index) {
        var polaroidElement = $('<div class="polaroid" id="main-polaroid-' +
                                  index + '">' +
                                  '<div class="image"></div>' +
                                  '<div class="description">' +
                                  polaroid.description +
                                  '</div>' +
                                '</div>');
        var sign = index % 2 ? '-' : '';
        var degrees = sign + Math.floor(Math.random() * (10) + 15) + 'deg';
        polaroidElement.data('degrees', degrees);
        polaroidElement.data('index', index);
        polaroidElement.css('transform', 'rotate(' + degrees + ')');
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
    });
  };

  $(document).ready(function() {
    /* Main Hero element carousel code */
    $('.owl-carousel').owlCarousel({
      items: 1,
      autoplay: true,
      autoplayTimeout: 4000,
      loop: true
    });

    loadImagesJson();
    $('#gallery-overlay').on('click', function(event) {
      stopGallery();
      event.stopPropagation();
    });
    /* Adding smoothness to scroll on navigation click */
    $('body').smoothScroll({
      offset: -40,
      delegateSelector: 'header a'
    });

    /* Making sticky header visible on scroll after hero element */
    var headerElement = $('header');
    var contentElement = $('#content');
    $(window).scroll(function() {
      var offset = 100;
      var fromTop = $(this).scrollTop() + offset;
      var windowHeight = $(this).height();
      var ratio = (fromTop / windowHeight * 100);
      if (ratio >= 90) {
        headerElement.addClass('fixed');
        contentElement.addClass('fixed');
      } else {
        headerElement.removeClass('fixed');
        contentElement.removeClass('fixed');
      }
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
      if (!email) {
        showFormError('Please fill in the Email.');
        return;
      }
      if (!message) {
        showFormError('Please fill in the Message.');
        return;
      }

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
        }
      });
    });
  });
})();

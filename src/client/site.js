// The only script on the site. Everything works without it; it adds the slider, the phone
// menu, the gentle section reveal, analytics events and the booking calendar.

(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Analytics ------------------------------------------------------------------
  // Plausible is only loaded in production builds; without it, track() does nothing.
  function track(name, props) {
    if (typeof window.plausible === 'function') window.plausible(name, props ? { props: props } : undefined);
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-event]');
    if (!el) return;
    var props = { page: document.body.getAttribute('data-page') };
    Array.prototype.forEach.call(el.attributes, function (a) {
      if (a.name.indexOf('data-event-') === 0) props[a.name.slice(11)] = a.value;
    });
    track(el.getAttribute('data-event'), props);
  });

  if (document.body.getAttribute('data-page') === 'not-found') track('404', { path: location.pathname });

  // First page and referrer of this visit, passed to the booking so each demo can be traced
  // back to the page and channel that produced it.
  try {
    if (!sessionStorage.getItem('landing')) {
      sessionStorage.setItem('landing', location.pathname);
      sessionStorage.setItem('referrer', document.referrer || 'direct');
    }
  } catch (err) { /* storage unavailable: attribution is skipped */ }

  // --- Phone menu -----------------------------------------------------------------
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.getElementById('mobile-nav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var open = mobileNav.getAttribute('data-open') !== 'true';
      mobileNav.setAttribute('data-open', String(open));
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // --- Lifecycle slider -------------------------------------------------------------
  var lifecycle = document.querySelector('[data-lifecycle]');
  if (lifecycle) {
    var stages = lifecycle.querySelectorAll('[data-stage]');
    var stops = lifecycle.querySelectorAll('[data-stop]');
    var range = lifecycle.querySelector('[data-range]');
    var currentName = lifecycle.querySelector('[data-current-name]');
    var seen = {};
    lifecycle.classList.add('is-enhanced');

    var show = function (i, source) {
      i = Math.max(0, Math.min(stages.length - 1, i));
      stages.forEach(function (s, n) { s.classList.toggle('is-active', n === i); });
      stops.forEach(function (b, n) { b.setAttribute('aria-pressed', String(n === i)); });
      range.value = String(i);
      range.setAttribute('aria-valuetext', stops[i] ? stops[i].textContent : String(i + 1));
      if (currentName && stops[i]) currentName.textContent = stops[i].textContent;
      if (source && !seen[i]) {
        seen[i] = true;
        track('Lifecycle stage', { stage: stops[i] ? stops[i].textContent : String(i + 1) });
      }
    };

    range.addEventListener('input', function () { show(Number(range.value), 'range'); });
    stops.forEach(function (b) { b.addEventListener('click', function () { show(Number(b.getAttribute('data-stop')), 'stop'); }); });
    var prev = lifecycle.querySelector('[data-prev]');
    var next = lifecycle.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { show(Number(range.value) - 1, 'prev'); });
    if (next) next.addEventListener('click', function () { show(Number(range.value) + 1, 'next'); });
    show(0);
  }

  // --- Section reveal ---------------------------------------------------------------
  // Sections rise 8px and fade in once as they enter the viewport. Never with reduced motion.
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var sections = document.querySelectorAll('main > section:not(.hero)');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    sections.forEach(function (s) {
      var rect = s.getBoundingClientRect();
      if (rect.top > window.innerHeight) {
        s.classList.add('reveal');
        observer.observe(s);
      }
    });
  }

  // --- Booking (Cal.com inline embed) ----------------------------------------------
  var booking = document.querySelector('[data-cal-link]');
  if (booking) {
    (function (C, A, L) {
      var p = function (a, ar) { a.q.push(ar); };
      var d = C.document;
      C.Cal = C.Cal || function () {
        var cal = C.Cal; var ar = arguments;
        if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; }
        if (ar[0] === L) {
          var api = function () { p(api, arguments); };
          var namespace = ar[1]; api.q = api.q || [];
          if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, 'https://app.cal.com/embed/embed.js', 'init');

    var landing = 'unknown'; var referrer = 'unknown';
    try { landing = sessionStorage.getItem('landing') || landing; referrer = sessionStorage.getItem('referrer') || referrer; } catch (err) { /* ignore */ }

    window.Cal('init', { origin: 'https://cal.com' });
    window.Cal('inline', {
      elementOrSelector: '#booking',
      calLink: booking.getAttribute('data-cal-link'),
      config: { layout: 'month_view', 'metadata[landing]': landing, 'metadata[referrer]': referrer },
    });
    window.Cal('on', {
      action: 'bookingSuccessful',
      callback: function () {
        track('Demo booked', { landing: landing });
        window.location.href = booking.getAttribute('data-confirmed');
      },
    });
  }
})();

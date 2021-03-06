/**
 * Dynamically adjusts the separator (vertical line between TOC and content) position in the page.
 */
function setSeparatorLeftPosition() {
  var tocColumnWidth = document.getElementById('toc-column').offsetWidth;
  document.getElementById('separator').style.left = tocColumnWidth + 'px';
}

window.addEventListener('DOMContentLoaded', setSeparatorLeftPosition);
window.addEventListener('resize', setSeparatorLeftPosition);

/**
 * Gets the user device or browser name.
 * @returns {string} A string containing the user device or browser name, or "Others" if device or browser name cannot
 * be recognized.
 */
function getDeviceName() {
  const userAgent = navigator.userAgent;

  if (userAgent.match(/Android/i)) return 'Android';
  if (userAgent.match(/BlackBerry/i)) return 'BlackBerry';
  if (userAgent.match(/iPhone/i)) return 'iPhone';
  if (userAgent.match(/iPad/i)) return 'iPad';
  if (userAgent.match(/iPod/i)) return 'iPod';
  if (userAgent.match(/Opera Mini/i)) return 'Opera Mini';
  if (userAgent.match(/IEMobile/i)) return 'IE Mobile';
  if (userAgent.match(/Chrome/i)) return 'Chrome';
  if (userAgent.match(/MSIE/i) || userAgent.match(/Trident/i)) return 'IE';
  if (userAgent.match(/Opera/i)) return 'Opera';
  if (userAgent.match(/Firefox/i)) return 'Firefox';
  if (userAgent.match(/Safari/i)) return 'Safari';
  else return 'Others';
}

/**
 * Formats the Breadcrumb string thus: /[ParentDirectory][/ChildDirectory/].
 * @returns {string} The formatted Breadcrumb string.
 */
function formatBreadcrumbString() {
  // This is the array to format.
  let toFormat = $('.tsd-breadcrumb li')
    .text()
    .split('\n');

  // After an element has been trimmed, if it is an empty string, replace that element by a "/".
  // Otherwise, replace the original element in the array by its trimmed version.
  function formatString(element, index, array) {
    if (element.trim() == '') {
      array.splice(index, 1, '/');
    } else {
      array.splice(index, 1, element.trim());
    }
  }

  toFormat.forEach(formatString);

  // Join the array element into a single string and remove the commas.
  return toFormat.join('');
}

/**
 * Formats the current page title so that it is correctly capitalized (all words capitalized).
 * @returns {string} The correctly capitalized page title string.
 */
function capitalizePageTitle() {
  // This is the string to capitalize (using title case).
  let toCapitalize = $('.tsd-page-title h1')
    .text()
    .trim()
    .split(' ');

  function capitalize(element, index, array) {
    array.splice(index, 1, element.replace(element.charAt(0), element.charAt(0).toUpperCase()));
  }

  toCapitalize.forEach(capitalize);

  return toCapitalize.join(' ');
}

/**
 * Logs a custom event in the usage analytics
 * @param type The type of event (e.g., "pageVisit")
 * @param value The event value (i.e., the href)
 * @param token The search token used (must have the privilege to log usage analytics)
 * @param clickedLabel the name of the clicked label (optional)
 * @param clickedTarget the target URL (optional)
 */
function logCustomEvent(type, value, token, clickedLabel, clickedTarget) {
  $(document).ready(function() {
    if (typeof token === 'undefined') {
      console.log('Error: token argument is missing.');
    } else {
      if (typeof type === 'undefined') {
        console.log('Error: eventType argument is missing.');
        return;
      }
      if (typeof value === 'undefined') {
        console.log('Error: eventValue argument is missing.');
        return;
      }

      const uaData = {
        eventType: type,
        eventValue: value,
        device: getDeviceName(),
        customData: {
          coveoSite: location.hostname,
          jsBreadcrumb: formatBreadcrumbString(),
          referrer: document.referrer,
          referrerHost: document.referrer.split('/')[2],
          pageTitle: capitalizePageTitle(),
          pageURL: location.hostname + location.pathname,
          pageAudience: $('meta[name=audience]').attr('content'),
          pageLanguage: $('meta[name=lang]').attr('content'),
          pageUserAgent: navigator.userAgent,
          navLinkLabel: clickedLabel,
          navLinkTarget: clickedTarget
        },
        anonymous: true,
        language: navigator.language || navigator.userLanguage,
        originLevel1: 'ExternalSearch',
        originLevel2: location.hostname
      };

      const customEventData = encodeURIComponent(JSON.stringify(uaData));
      const requestUrl =
        'https://usageanalytics.coveo.com/rest/v13/analytics/custom?access_token=' + token + '&customEvent=' + customEventData;

      $.ajax({
        url: requestUrl,
        dataType: 'jsonp'
      });
      Coveo.Defer.flush(); // To force immediately sending the UA event (needed for pageNav event before page unloads)
    }
  });
}

const uaToken = 'xxf4d1df7a-7916-481e-9917-f562dddc322d';

// Logs a page visit in the usage analytics
logCustomEvent('pageVisit', window.location.href, uaToken);

// Logs custom page navigation usage analytics events
$(document).on('click', 'a', function() {
  const elem = $(this);
  const label = elem.text().trim();
  const target = elem.attr('href');
  const eventType = 'pageNav';
  let navType = '';

  // Coveo logo
  if (elem.hasClass('logo')) {
    navType = 'logo';
    label = '<Coveo Logo>';
  } else if (elem.is('#communityLink')) {
    // Community next to the logo
    navType = 'community';
  } else if (elem.parents('ul#siteSelection').length) {
    // Site selection
    navType = 'siteSelection';
  } else if (elem.parents('ul#siteSelection2').length) {
    // Secondary site selection
    navType = 'siteSelection';
  } else if (elem.parents('.tsd-breadcrumb').length) {
    // Breadcrumb
    navType = 'breadcrumb';
  } else if (elem.parents('.tsd-navigation').length) {
    // TOC selection
    navType = 'toc';
  } else if (elem.parents('section.tsd-panel').length) {
    // Links in the text
    navType = 'inTopic';
  } else {
    navType = 'unknown';
  }
  //console.log('Navigation type, label, target: ' + navType + ' | ' + label + ' | ' + target);
  logCustomEvent(eventType, navType, uaToken, label, target);
  Coveo.Defer.flush();
});

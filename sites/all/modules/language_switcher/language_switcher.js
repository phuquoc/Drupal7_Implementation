/**
 * @file
 * Overrides default language switcher to provide better multilingual UX.
 *
 * This file overrides the default behaviour of locale's language switcher
 * block. User can change language of the page and even choose the multiple
 * languages layout for side-by-side node and translations display.
 */

(function ($) {

/**
 * Attach behaviors to managed file element upload fields.
 */
Drupal.behaviors.langauges_switcher = {
  languages: [],
  preferences: {},
  initiated: false,
  cookieString: 'language-switcher-preferences=',
  cookies: true,
  language_link: '#block-locale-language-content a.language-link',

  attach: function (context, settings) {
    Drupal.behaviors.langauges_switcher.wrapLangs();
    Drupal.behaviors.langauges_switcher.init();
    Drupal.behaviors.langauges_switcher.blockOverrideDefaults();
    Drupal.behaviors.langauges_switcher.resizePanels();
  },

  init: function () {
    this.cookies = Drupal.settings.cookies;

    if (!this.cookies) {
      $(this.language_link).addClass('on');
      return;
    }

    if (this.initiated) {
      return;
    }

    if (document.cookie.length > 0) {
      // Get the number of characters that have the list of values
      // from our string index.
      offset = document.cookie.indexOf(this.cookieString);

      // If no cookie for language switcher found, add the default one
      if (!Drupal.behaviors.langauges_switcher.getPreferencesCookie(offset)) {
        for (var i in Drupal.settings.languages) {
          this.preferences[i] = Drupal.settings.languages[i];
        }
        Drupal.behaviors.langauges_switcher.storeCookie();

        // Add defaults to language switcher block links.
        $(this.language_link).addClass('on');
      }
    }

    // Load language switcher cookie
    Drupal.behaviors.langauges_switcher.loadCookie();
    var languages_keyed_langcode = [];
    for (var i in this.preferences) {
      var langcode = this.preferences[i];
      languages_keyed_langcode[langcode] = i;
    }

    $(this.language_link).each(function(index, value) {
      var link_langcode = Drupal.behaviors.langauges_switcher.getLangFromCss(this);
      if (languages_keyed_langcode[link_langcode] != undefined) {
        Drupal.behaviors.langauges_switcher.languageToggle(this, 'on');
      }
      else {
        Drupal.behaviors.langauges_switcher.languageToggle(this, 'off');
      }
    });

    this.initiated = true;
  },

  /**
   * Override the default language switcher block.
   */
  blockOverrideDefaults: function () {
    // Add lang attribute
    $(this.language_link).each(function(index, value) {
      var link_langcode = Drupal.behaviors.langauges_switcher.getLangFromCss(this);
      $(this).attr('lang', link_langcode);
    });

    // Language switcher links toggle event
    $(this.language_link).toggle(
      // off toggle
      function(event) {
        Drupal.behaviors.langauges_switcher.languageToggle(this, 'off');
        event.preventDefault();
      },

      // on toggle
      function(event) {
        Drupal.behaviors.langauges_switcher.languageToggle(this, 'on');
        event.preventDefault();
      }
    );
  },

  /**
   * Toggle a specific language on or off.
   */
  languageToggle: function (link, status) {
    // Remove both class from the link first
    $(link).removeClass('off');
    $(link).removeClass('on');

    // Status is either on or off, add it as a class to the link.
    $(link).addClass(status);

    // Get the link's langcode
    var language = Drupal.behaviors.langauges_switcher.getLangFromCss(link);

    // Check the toggle status, and toggle the link with this status
    if (language != '') {
      var selector = "div." + language;
      var i = this.languages[language];

      if (status == 'off') {
        $(selector).removeClass('visible');
        $(selector).addClass('hidden');

        delete(this.preferences[i]);
      }
      else {
        $(selector).removeClass('hidden');
        $(selector).addClass('visible');

        this.preferences[i] = language;
      }

      if (this.cookies) {
        Drupal.behaviors.langauges_switcher.storeCookie();
      }
      Drupal.behaviors.langauges_switcher.resizePanels();
    }
  },

  /**
   * Check the cookie and load the state variable.
   */
  loadCookie: function () {
    // If there is a previous instance of this cookie
    if (document.cookie.length > 0) {
      // Get the number of characters that have the list of values
      // from our string index.
      offset = document.cookie.indexOf(this.cookieString);

      // If its positive, there is a list!
      if (cookie = Drupal.behaviors.langauges_switcher.getPreferencesCookie(offset)) {
        var cookieList = cookie.split(',');
        for (var i = 0; i < cookieList.length; i++) {
          var info = cookieList[i].split(':');
          this.preferences[info[0]] = info[1];
        }
      }
    }
  },

  /**
   * Get the preferences cookie out of cookies string
   */
  getPreferencesCookie: function (offset) {
    if (offset != -1) {
      offset += this.cookieString.length;
      var end = document.cookie.indexOf(';', offset);
      if (end == -1) {
        end = document.cookie.length;
      }

      // Get a list of all values that are saved on our string
      var cookie = unescape(document.cookie.substring(offset, end));

      if (cookie != '') {
        return cookie;
      }
      return false;
    }
  },

  /**
   * Turn the state variable into a string and store it in the cookie.
   */
  storeCookie: function () {
    var cookie = '';

    // Get a list of IDs, saparated by comma
    for (i in this.preferences) {
      if (cookie != '') {
        cookie += ',';
      }
      cookie += i + ':' + this.preferences[i];
    }

    // Save this values on the cookie
    document.cookie = this.cookieString + escape(cookie) + ';path=/';
  },

  /**
   * Add langcode to node's class prop.
   *
   * @TODO need to get this in core http://drupal.org/node/1164926
   */
  wrapLangs: function () {
    for (var i in Drupal.settings.languages) {
      var lang = Drupal.settings.languages[i];
      var node_class = '.node.' + lang;
      this.languages[lang] = i;

      $(node_class).wrapAll("<div class='" + lang + " language visible'></div>");
    }
  },

  /**
   * New panels are equally divided by their widths.
   */
  resizePanels: function () {
    var parent_width = $("div.language").parent().width();
    var panels_count = $("div.language.visible").length;
    var panel_size = (parent_width / panels_count) - 20;

    $(".language").css('width', panel_size + 'px');
    $(".language").css('float', 'left');
    $(".language").css('margin', '0 10px');
  },

  /**
   * Get langcode from node's class prop.
   */
  getLangFromCss: function (link) {
    var languages = Drupal.settings.languages;
    languages = oc(languages);

    var parent_css = $(link).parent().attr('class');
    parent_css = parent_css.split(" ");
    var language = '';

    for (var i in parent_css) {
      if (parent_css[i] in languages) {
        language = parent_css[i];
      }
    }
    return language;
  }
};

// object converter: convert array into object
function oc(a) {
  var o = {};
  for(var i = 0; i < a.length; i++) {
    o[a[i]] = '';
  }
  return o;
}

})(jQuery);
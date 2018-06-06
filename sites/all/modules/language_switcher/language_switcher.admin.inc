<?php

/**
 * @file
 * Extended multilanguage administration and module settings UI.
 */

/**
 * Form builder function.
 */
function language_switcher_admin_settings($form) {
  // Content selection options.
  $form['selection'] = array(
    '#type' => 'fieldset',
    '#title' => t('Content selection'),
  );
  $form['selection']['language_switcher_mode'] = array(
    '#type' => 'radios',
    '#title' => t('Mode'),
    '#default_value' => variable_get('language_switcher_mode', 'off'),
    '#options' => _language_switcher_selection_mode(),
    '#description' => t('Determines which content to show depending on the current page language and the default language of the site.'),
  );
  $form['selection']['language_switcher_cookies'] = array(
    '#type' => 'checkbox',
    '#title' => t('Enable cookies'),
    '#default_value' => variable_get('language_switcher_cookies', 1),
    '#description' => t('Store user preferences in cookies, so when next time the user visits the site her preferences loaded automatically.'),
  );

  return system_settings_form($form);
}

/**
 * Get display modes of language switcher admin page.
 */
function _language_switcher_selection_mode() {
  return array(
    'strict' => t('Display only nodes matching the selected language from language switcher block. Other nodes from languages other than the selected will not appear.'),
    'multi' => t('Display nodes matching all the selected languages from language switcher block. In this mode you can choose more than one language, and they will appear in columns.'),
    'off' => t('Default language switcher behaviour, so this module will not do anything to overrides core behaviour.'),
  );
}
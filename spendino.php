<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://www.spendino.de
 * @since             1.0.0
 * @package           Spendino
 *
 * @wordpress-plugin
 * Plugin Name:       Spendino
 * Plugin URI:        https://www.spendino.de
 * Description:       This plugin connects your site to a valid GRÜN spendino account and allows you to easily insert and customize spendino online donation forms.
 * Version:           1.0.1
 * Author:            GRÜN Software Group GmbH
 * Author URI:        https://www.gruen.net/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       spendino
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'ABSPATH' ) ) {
    die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'SPENDINO_VERSION', '1.0.1' );


/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-wp-spendino-activator.php
 */


class SpendinoPlugin
{
    function __construct()
    {
        add_action('admin_menu', array($this, 'adminPage'));
        add_action('admin_init', array($this, 'settings'));
    }



    function adminPage()
    {
//        load_plugin_textdomain('spendino', false, dirname(plugin_basename( __FILE__ ) ) ) . '/languages/';
        add_menu_page(
                __('GRÜN spendino', 'spendino'),
                __( 'GRÜN spendino', 'spendino' ),
                'manage_options',
                'spendino',
                array( $this, 'settings_callback_function' ) );
    }

    function settings()
    {
        load_plugin_textdomain('spendino', false, dirname(plugin_basename( __FILE__ ) ) . '/languages/');
        /**
         * CREATES THE ROWS IN WP DATABASE
         */
        add_settings_section(
            'spendino_settings_section',
            __('', 'spendino'),
            array($this, 'settings_callback_function'),
            'spendino'
        );

        add_settings_field(
            'spendino_connection',
            __('', 'spendino'),
            array($this, 'settings_callback_function'),
            'spendino_connection',
            'spendino_settings_section'
        );

        add_settings_field(
            'spendino_formselect',
            '',
            array($this, 'settings_callback_function'),
            'spendino',
            'spendino_settings_section'
        );

        add_settings_field(
            'spendino_formdata',
            __('', 'spendino'),
            array($this, 'settings_callback_function'),
            'spendino_create_edit_form',
            'spendino_settings_section'
        );

        register_setting('spendino_connection', 'spendino_connection');
        register_setting('spendino', 'spendino_formselect');
        register_setting('spendinoform', 'spendino_formdata');
    }

    function settings_callback_function() {
        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'spendino/partials/settings-display.phtml';
        wp_enqueue_script('spendino-bootstrap-script', plugins_url('/js/bootstrap.min.js', __FILE__));
        wp_enqueue_script('spendino-main-script', plugins_url('/js/scripts.js', __FILE__), array( 'wp-element', 'wp-components', 'wp-i18n' ), '', true);
        wp_enqueue_style('bootstrap-styles',  plugins_url('/styles/bootstrap.min.css', __FILE__));
//        wp_set_script_translations( '', PLUGIN_NAME );
        wp_set_script_translations('', 'spendino', dirname(plugin_basename( __FILE__ ) ) . '/languages/');

    }
}

$spendinoPlugin = new SpendinoPlugin();

/**
 * initiate AJAX call
 */
add_action( 'wp_ajax_change-option', 'wpse_change_option' );
add_action( 'wp_ajax_nopriv_change-option', 'wpse_change_option' );

//add_filter('sanitize_option_spendino_formdata', 'sanitize_option_spendino_formdata');
//
//function sanitize_option_spendino_formdata($newFormData, $formSelectOption) {
//    return sanitize_option($formSelectOption, $newFormData);
//}

function wpse_change_option() {
    $formSelectOption = sanitize_text_field($_POST['option']);
    $new_value = sanitize_option($formSelectOption, $_POST['new_value']);
//    $new_value = sanitize_option_spendino_formdata($formSelectOption, $_POST['new_value']);


    if( !isset( $formSelectOption ) || $formSelectOption == '' ) {
        die(
        json_encode(
            array(
                'success' => false,
                'message' => 'Missing required information.'
            )
        )
        );
    }

    if (!isset($new_value)) {
        update_option($formSelectOption, '');
    } else {
        update_option( $formSelectOption, $new_value );
        //update_option( $option, json_encode($new_value) );
    }

    die(
    json_encode(
        array(
            'success' => true,
            'message' => 'Database updated successfully.'
        )
    )
    );
}
//
//
//function sanitize_spendino_formdata_option($newValue) {
//    return $newValue;
//}
/**
 * SHORTCODE FUNCTION
 */

function shortcode_funct( $atts )
{
    $url_forms_live = "https://spendino.de/donationmanager/themed_forms/";
    $url_forms_sandbox = "https://sandboxapi.spendino.de/donationmanager/themed_forms/";

    $attribs = shortcode_atts( array(
        'title' => ''
    ), $atts );

    $formData = get_option('spendino_formdata');
    if (is_string($formData)) {
        $formData = json_decode($formData, true);
    }

    if (isset($attribs['title']) && !empty($attribs['title']) && isset($formData[$attribs['title']])) {
        switch ($formData[$attribs['title']]['formSettings']) {
            case 'widgetA':
                $url_forms_sandbox .= 'widget/';
                $ext = '&type:3';
                break;
            case 'widget':
                $url_forms_sandbox .= 'widget/';
                break;
            default:
                $url_forms_sandbox .= ($formData[$attribs['title']]['formSettings'] . '/');
                break;
        }
        $url_forms_sandbox .= ($formData[$attribs['title']]['formId'] . '?xlang:' . $formData[$attribs['title']]['formLanguage'] . $ext);

        return '<script src="' . esc_url($url_forms_sandbox)  . '"></script>';

    }else{
        echo "Not a valid shortcode";
    }
//    return '<pre>' . print_r([$formData, $attribs], true) . '</pre>';
}

add_shortcode('spendinoForm', 'shortcode_funct');

add_action( 'init', 'loadTextDomain' );
 function wpdocs_load_textdomain() {
    load_plugin_textdomain('spendino', false, dirname(plugin_basename( __FILE__ ) ) ) . '/languages/';
}

function loadTextDomain() {
    //We're not using load_plugin_textdomain() or its siblings because figuring out where
    //the library is located (plugin, mu-plugin, theme, custom wp-content paths) is messy.
    $domain = 'spendino';
    $locale = apply_filters(
        'plugin_locale',
        (is_admin() && function_exists('get_user_locale')) ? get_user_locale() : get_locale(),
        $domain
    );

    $moFile = $domain . '-' . $locale . '.mo';
    $path = realpath(dirname(__FILE__) . '/languages');

    if ($path && file_exists($path)) {
        load_textdomain($domain, $path . '/' . $moFile);
    }
}
//function test_load_plugin_textdomain() {
//    load_plugin_textdomain( 'spendino', false, basename( __DIR__ ) . '/languages/' );
//}
//add_action( 'plugins_loaded', 'test_load_plugin_textdomain' );
/**
 *  CREATES THE BLOCK EDITOR
 *  Saving for later version
 */


//function loadMyBlock() {
//    wp_enqueue_script(
//        'my-new-block',
//        plugin_dir_url(__FILE__) . '/js/spendino-block.js',
//        array('wp-blocks','wp-editor'),
//        '1.0.0',
//        true
//    );
//    $forms = !empty(get_option('spendino_formselect')) ?
//        json_decode(get_option('spendino_formselect'), true) : [];
//    $scriptData = array(
//        'forms' => $forms
//    );
//
//    wp_localize_script('my-new-block', 'spendinodata', $scriptData);
//
//}
//add_action('enqueue_block_editor_assets', 'loadMyBlock');
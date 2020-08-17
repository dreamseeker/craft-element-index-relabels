<?php
/**
 * Element Index Relabels plugin for Craft CMS 3.x
 *
 * Relabels field label within element index.
 *
 * @link      https://github.com/dreamseeker
 * @copyright Copyright (c) 2020 dreamseeker
 */

namespace dreamseeker\elementindexrelabels;

use Craft;
use craft\base\Plugin;
use craft\services\Plugins;
use craft\events\PluginEvent;

use yii\base\Event;

use craft\events\TemplateEvent;
use craft\helpers\Json;
use craft\web\View;
use dreamseeker\elementindexrelabels\assetbundles\ElementIndexRelabels\ElementIndexRelabelsAsset;

/**
 * Class ElementIndexRelabels
 *
 * @author    dreamseeker
 * @package   ElementIndexRelabels
 * @since     1.0.0
 */
class ElementIndexRelabels extends Plugin
{
    // Static Properties
    // =========================================================================

    /**
     * @var ElementIndexRelabels
     */
    public static $plugin;

    // Public Properties
    // =========================================================================

    /**
     * @var string
     */
    public $schemaVersion = '1.0.0';

    /**
     * @var bool
     */
    public $hasCpSettings = false;

    /**
     * @var bool
     */
    public $hasCpSection = false;

    /**
     * @var array
     */
    public $jsonVars = [];

    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function init()
    {
        parent::init();
        self::$plugin = $this;

        Event::on(
            Plugins::class,
            Plugins::EVENT_AFTER_INSTALL_PLUGIN,
            function (PluginEvent $event) {
                if ($event->plugin === $this) {
                }
            }
        );

        Craft::info(
            Craft::t(
                'element-index-relabels',
                '{name} plugin loaded',
                ['name' => $this->name]
            ),
            __METHOD__
        );

        // variables.
        $request             = Craft::$app->getRequest();
        $allowedFirstSegment = ['entries', 'globals', 'categories', 'assets', 'users'];

        // Ends if it is not a CP request, or an Ajax request, or the first segment is not on the allow list.
        if (
            !$request->getIsCpRequest() or
            $request->getIsAjax() or
            !in_array($request->getSegment(1), $allowedFirstSegment)
        ) {
            return false;
        }

        $this->jsonVars  = [
            "segments"  => $request->getSegments(),
            "sourceKey" => '',
            "data"      => $this->elementIndexRelabelsService->getRelabelData()
        ];

        // Handler: EVENT_BEFORE_RENDER_TEMPLATE
        // see: https://docs.craftcms.com/api/v3/craft-web-view.html#method-beforerendertemplate
        Event::on(
            View::class,
            View::EVENT_BEFORE_RENDER_TEMPLATE,
            function (TemplateEvent $event) {
                // variables.
                $view = Craft::$app->getView();

                // Load the ElementIndexRelabelAsset resources.
                $view->registerAssetBundle(ElementIndexRelabelsAsset::class);

                // Formatting output code.
                $additionalJs = 'Craft.ElementIndexRelabel = ' . Json::encode($this->jsonVars);

                // Insert Custom JS at View::POS_END position.
                // see: https://www.yiiframework.com/doc/api/2.0/yii-web-view#registerJs()-detail
                $view->registerJs($additionalJs, View::POS_END);
            }
        );
    }

    // Protected Methods
    // =========================================================================

}

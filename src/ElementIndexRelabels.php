<?php
/**
 * Element Index Relabels plugin for Craft CMS
 *
 * Relabels field label within element index.
 *
 * @link      https://github.com/dreamseeker
 * @copyright Copyright (c) 2020 dreamseeker
 */

namespace dreamseeker\elementindexrelabels;

use Craft;
use craft\base\Plugin;

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
    public static Plugin $plugin;

    // Public Properties
    // =========================================================================

    /**
     * @var string
     */
    public string $schemaVersion = '1.0.0';

    /**
     * @var bool
     */
    public bool $hasCpSettings = false;

    /**
     * @var bool
     */
    public bool $hasCpSection = false;

    /**
     * @var array
     */
    public array $jsonVars = [];

    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function init(): void
    {
        parent::init();
        self::$plugin = $this;

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
            return;
        }

        $this->jsonVars  = [
            "segments"  => $request->getSegments(),
            "sourceKey" => '',
            "data"      => $this->elementIndexRelabelsService->getRelabelData(),
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
                $additionalJs = 'Craft.ElementIndexRelabels = ' . Json::encode($this->jsonVars);

                // Insert Custom JS at View::POS_END position.
                // see: https://www.yiiframework.com/doc/api/2.0/yii-web-view#registerJs()-detail
                $view->registerJs($additionalJs, View::POS_END);
            }
        );
    }

    // Protected Methods
    // =========================================================================

}

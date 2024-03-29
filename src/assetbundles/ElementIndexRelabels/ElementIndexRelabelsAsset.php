<?php
/**
 * Element Index Relabels plugin for Craft CMS
 *
 * Relabels field label within element index.
 *
 * @link      https://github.com/dreamseeker
 * @copyright Copyright (c) 2020 dreamseeker
 */

namespace dreamseeker\elementindexrelabels\assetbundles\ElementIndexRelabels;

use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

/**
 * @author    dreamseeker
 * @package   ElementIndexRelabels
 * @since     1.0.0
 */
class ElementIndexRelabelsAsset extends AssetBundle
{
    // Public Methods
    // =========================================================================

    /**
     * @inheritdoc
     */
    public function init(): void
    {
        $this->sourcePath = "@dreamseeker/elementindexrelabels/assetbundles/ElementIndexRelabels/dist";

        $this->depends = [
            CpAsset::class,
        ];

        $this->js = [
            'js/ElementIndexRelabels.js'
        ];

        parent::init();
    }
}

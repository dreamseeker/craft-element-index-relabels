<?php
/**
 * Element Index Relabels plugin for Craft CMS 3.x
 *
 * Relabels field label within element index.
 *
 * @link      https://github.com/dreamseeker
 * @copyright Copyright (c) 2020 dreamseeker
 */

namespace dreamseeker\elementindexrelabelstests\unit;

use Codeception\Test\Unit;
use UnitTester;
use Craft;
use dreamseeker\elementindexrelabels\ElementIndexRelabels;

/**
 * ExampleUnitTest
 *
 *
 * @author    dreamseeker
 * @package   ElementIndexRelabels
 * @since     1.0.0
 */
class ExampleUnitTest extends Unit
{
    // Properties
    // =========================================================================

    /**
     * @var UnitTester
     */
    protected $tester;

    // Public methods
    // =========================================================================

    // Tests
    // =========================================================================

    /**
     *
     */
    public function testPluginInstance()
    {
        $this->assertInstanceOf(
            ElementIndexRelabels::class,
            ElementIndexRelabels::$plugin
        );
    }

    /**
     *
     */
    public function testCraftEdition()
    {
        Craft::$app->setEdition(Craft::Pro);

        $this->assertSame(
            Craft::Pro,
            Craft::$app->getEdition()
        );
    }
}

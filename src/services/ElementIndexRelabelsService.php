<?php
/**
 * Element Index Relabels plugin for Craft CMS
 *
 * Relabels field label within element index.
 *
 * @link      https://github.com/dreamseeker
 * @copyright Copyright (c) 2020 dreamseeker
 */

namespace dreamseeker\elementindexrelabels\services;

use Craft;
use craft\base\Component;

use craft\db\Query;
use craft\db\Table;
use craft\helpers\Json;

/**
 * @author    dreamseeker
 * @package   ElementIndexRelabels
 * @since     1.0.0
 */
class ElementIndexRelabelsService extends Component
{
    // Public Methods
    // =========================================================================

    /*
     * @return array
     */
    public function getRelabelData(): array
    {
        $query           = $this->_queryFieldLayoutTabs();
        $fieldLayoutTabs = $query->all();

        return $this->_formatRelabelData($fieldLayoutTabs);
    }

    // Private Methods
    // =========================================================================

    /*
     * @param array $fieldLayoutTabs
     * @return array
     */
    private function _formatRelabelData(array $fieldLayoutTabs): array
    {
        $fieldIdIndex   = [];
        $fieldNameIndex = [];
        $response       = [];

        // Set a custom index by field's UUID.
        foreach (Craft::$app->getFields()->getAllFields() as $field){
            $fieldIdIndex[$field['uid']]   = $field['id'];
            $fieldNameIndex[$field['uid']] = $field['name'];
        }

        // Check relabel data for each FieldLayoutTab.
        foreach ($fieldLayoutTabs as $fieldLayoutTab){
            $responseKey = '';
            $isIgnore    = false;
            $labels      = [];

            switch ($fieldLayoutTab['type']){
                case 'craft\\elements\\Entry':
                    $responseKey = 'section:' . $fieldLayoutTab['sUid'];
                    $isIgnore    = $fieldLayoutTab['entryTypeSortOrder'] > 1;
                    break;
                case 'craft\\elements\\Asset':
                    $responseKey = 'volume:' . $fieldLayoutTab['vUid'];
                    break;
                case 'craft\\elements\\Category':
                    $responseKey = 'group:' . $fieldLayoutTab['cgUid'];
                    break;
                case 'craft\\elements\\User':
                    $responseKey = 'user';
                    break;
                default:
                    $isIgnore = true;
                    break;
            }

            // For sections, enable only the first EntryType.
            if(!$isIgnore){
                $elements = Json::decode($fieldLayoutTab['elements']);

                foreach ($elements as $element){
                    // Continue if label is saved in custom field.(exclude hidden label)
                    if(
                        $element['type'] === 'craft\\fieldlayoutelements\\CustomField' &&
                        $element['label'] &&
                        $element['label'] !== '__blank__'
                    ) {
                        $labelKey          = 'field:' . $element['fieldUid'];
                        $labels[$labelKey] = [
                            'label'     => $fieldNameIndex[$element['fieldUid']],
                            'relabel'   => $element['label']
                        ];
                    }
                }

                // Merge array if there are multiple tabs.
                $response[$responseKey] = (array_key_exists($responseKey, $response)) ?
                    array_merge($response[$responseKey], $labels) : $labels;
            }
        }

        return $response;
    }

    /*
     * @return object
     *
     * see: https://www.yiiframework.com/doc/guide/2.0/en/db-query-builder
     */
    private function _queryFieldLayoutTabs(): Query
    {
        $elementTypes = [
            'craft\\elements\\Entry',
            'craft\\elements\\Asset',
            'craft\\elements\\Category',
            'craft\\elements\\User'
        ];

        $query = (new Query())
            ->select([
                'type' => 'fl.type',
                'sUid' => 's.uid',
                'vUid' => 'v.uid',
                'cgUid' => 'cg.uid',
                'elements' => 'flt.elements',
                'entryTypeSortOrder' => 'et.sortOrder'
            ])
            ->from(['flt' => Table::FIELDLAYOUTTABS])
            ->leftJoin(['fl' => Table::FIELDLAYOUTS], '[[flt.layoutId]] = [[fl.id]]')
            ->leftJoin(['et' => Table::ENTRYTYPES], '[[flt.layoutId]] = [[et.fieldLayoutId]]')
            ->leftJoin(['s' => Table::SECTIONS], '[[et.sectionId]] = [[s.id]]')
            ->leftJoin(['v' => Table::VOLUMES], '[[flt.layoutId]] = [[v.fieldLayoutId]]')
            ->leftJoin(['cg' => Table::CATEGORYGROUPS], '[[flt.layoutId]] = [[cg.fieldLayoutId]]')
            ->where(['not', ['[[flt.elements]]' => null]])
            ->andWhere(['in', '[[fl.type]]', $elementTypes])
            ->orderBy([
                '[[s.id]]' => SORT_ASC,
                '[[et.sortOrder]]' => SORT_ASC,
                '[[flt.layoutId]]' => SORT_ASC,
                '[[flt.sortOrder]]' => SORT_ASC
            ]);

        return $query;
    }
}

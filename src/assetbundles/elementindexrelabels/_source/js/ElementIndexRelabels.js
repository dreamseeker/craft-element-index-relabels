/**
 * Element Index Relabels plugin for Craft CMS 3.x
 *
 * Relabels field label within element index.
 *
 * @author    dreamseeker
 * @package   ElementIndexRelabel
 * @since     1.0.0
 */

// Methods
// =========================================================================

/**
 * updateElementIndexLabels
 *
 * @param object _target
 *
 * Overwrite labels contained in ElementIndex page or modal.
 */
function updateElementIndexLabels(_target){
  if(Craft.ElementIndexRelabel.sourceKey in Craft.ElementIndexRelabel.data) {
    // variables.
    const $toolbar       = _target.$toolbar,
          $sortMenuBtn   = $toolbar.find('.sortmenubtn'),
          _sortMenuLabel = $sortMenuBtn.text().trim(),
          _labelData     = Craft.ElementIndexRelabel.data[Craft.ElementIndexRelabel.sourceKey];

    // Only table view mode.
    if(_target.viewMode === 'table'){
      // variables.
      const $view  = _target.view,
            $table = $view.$table;

      // Update labels contained in thead.
      $table.find('thead > tr > th').each(function (_index, _element) {
        const $element   = $(_element),
              _attribute = $element.attr('data-attribute');

        // Only if _attribute is contained in _labelData.
        if (_attribute && _attribute in _labelData) {
          $element.text(_labelData[_attribute]['relabel']);
        }
      });

      // Update labels contained in tbody.
      $table.find('tbody > tr > td').each(function (_index, _element) {
        const $element   = $(_element),
              _attribute = $element.attr('data-attr');

        // Only if _attribute is contained in _labelData.
        if (_attribute && _attribute in _labelData) {
          $element.attr('data-title', _labelData[_attribute]);
        }
      });
    }

    // update label of sort menu button.
    $.each(_labelData, function (_key, _data) {
      if(_data.label === _sortMenuLabel) {
        $sortMenuBtn.text(_data.relabel);
      }
    });
  }
}

/**
 * updateSourceSettingsCheckboxLabels
 *
 * Overwrite Checkbox labels in SourceSettings modal.
 */
function updateSourceSettingsCheckboxLabels() {
  $('.customize-sources-table-column').each(function(){
    let _self          = $(this),
        _checkboxName  = _self.find('input:checkbox').attr('name'),
        _checkboxValue = _self.find('input:checkbox').val();

    if(_checkboxValue.indexOf('field:') != -1){
      let _sourceKey =
        (Craft.ElementIndexRelabel.sourceKey !== 'user') ?
          _checkboxName.replace(/^sources\[(.+)]\[tableAttributes]\[]$/, '$1') :
          'user';

      if(typeof Craft.ElementIndexRelabel.data[_sourceKey] !== 'undefined' && typeof Craft.ElementIndexRelabel.data[_sourceKey][_checkboxValue] !== 'undefined') {
        _self.find('label').text(Craft.ElementIndexRelabel.data[_sourceKey][_checkboxValue]['relabel']);
      }
    }
  });
}

// Event Listener Methods
// =========================================================================

/**
 * EventListener : Craft.BaseElementIndex updateElements Event
 */
Garnish.on(Craft.BaseElementIndex, 'updateElements', function (e) {
  const $target = e.target;

  const _targetElementTypes = [
    'craft\\elements\\Category',
    'craft\\elements\\User'
  ];

  if(_targetElementTypes.includes($target.elementType)){
    Craft.ElementIndexRelabel.sourceKey =
      ($target.elementType === 'craft\\elements\\User') ?
        'user' :
        $target.sourceKey;

    updateElementIndexLabels($target);
  }
});

/**
 * EventListener : Craft.EntryIndex updateElements Event
 */
Garnish.on(Craft.EntryIndex, 'updateElements', function (e) {
  const $target = e.target;

  Craft.ElementIndexRelabel.sourceKey = $target.sourceKey;

  updateElementIndexLabels($target);
});

/**
 * EventListener : Craft.AssetIndex updateElements Event
 */
Garnish.on(Craft.AssetIndex, 'updateElements', function (e) {
  const $target = e.target;

  Craft.ElementIndexRelabel.sourceKey = $target.sourceKey;

  updateElementIndexLabels($target);
});

/**
 * EventListener : Craft.BaseElementIndex afterInit Event
 */
Garnish.on(Craft.BaseElementIndex, 'afterInit', function (e) {
  const $target = e.target;

  // When the SortMenu bubtton has focus.
  $target.$sortMenuBtn.data('menubtn').$btn.on('focus', function () {
    const $sortMenuOptions = $target.sortMenu.$options,
          _labelData       = Craft.ElementIndexRelabel.data[Craft.ElementIndexRelabel.sourceKey];

    // Loop through optional items.
    $sortMenuOptions.each(function(_index, _element){
      const $element    = $(_element),
            _attribute  = $element.attr('data-attr');

      // Only if _attribute is contained in _labelData.
      if (_attribute && _attribute in _labelData) {
        $element.text(_labelData[_attribute]['relabel']);
      }
    });
  });
});

/**
 * EventListener : Garnish.Modal show Event
 */
Garnish.on(Garnish.Modal, 'show', function (e) {
  const $target = e.target;

  // Source Setting Modal only.
  if(typeof $target.$sourceSettingsContainer !== 'undefined'){
    let timerId = setTimeout(function repeatTimer() {
      // After Ajax loading.
      if($('.customize-sources-table-column').length){
        updateSourceSettingsCheckboxLabels();

        // When switching to another source.
        $($target.$sourcesContainer).find('.customize-sources-item').on('click', function(){
          updateSourceSettingsCheckboxLabels();
        });

        // Clear timer.
        timerId = null;
      } else {
        // retry
        timerId = setTimeout(repeatTimer, 200);
      }
    }, 200);
  }
});

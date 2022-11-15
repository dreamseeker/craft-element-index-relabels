/**
 * Element Index Relabels plugin for Craft CMS
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
  if(Craft.ElementIndexRelabels.sourceKey in Craft.ElementIndexRelabels.data) {
    // variables.
    const $toolbar       = _target.$toolbar,
          $sortMenuBtn   = $toolbar.find('.sortmenubtn'),
          _sortMenuLabel = $sortMenuBtn.text().trim(),
          _labelData     = Craft.ElementIndexRelabels.data[Craft.ElementIndexRelabels.sourceKey];

    // Only table view mode.
    if(_target.viewMode !== 'table' || typeof _target.view.$table === 'undefined' || _target.view === null){
      return false;
    }

    let timerId = setTimeout(function repeatTimer() {
      // variables.
      const $view  = _target.view,
            $table = $view.$table;

      // After rendering table view.
      if(_target.viewMode === 'table' && $table.find('thead > tr > th').length){
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
            $element.attr('data-title', _labelData[_attribute]['relabel']);
          }
        });

        // update label of sort menu button.
        $.each(_labelData, function (_key, _data) {
          if(_data.label === _sortMenuLabel) {
            $sortMenuBtn.text(_data.relabel);
          }
        });

        // Clear timer.
        timerId = null;
      } else {
        // retry
        timerId = setTimeout(repeatTimer, 200);
      }
    }, 200);
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
        (Craft.ElementIndexRelabels.sourceKey !== 'user') ?
          _checkboxName.replace(/^sources\[(.+)]\[tableAttributes]\[]$/, '$1') :
          'user';

      if(typeof Craft.ElementIndexRelabels.data[_sourceKey] !== 'undefined' && typeof Craft.ElementIndexRelabels.data[_sourceKey][_checkboxValue] !== 'undefined') {
        _self.find('label').text(Craft.ElementIndexRelabels.data[_sourceKey][_checkboxValue]['relabel']);
      }
    }
  });
}


// Event Listener Methods
// =========================================================================

jQuery(function($) {
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

  /**
   * EventListener : Craft.elementIndex updateElements Event
   */
  Craft.elementIndex.on('updateElements', function(e){
    const $target = e.target;

    Craft.ElementIndexRelabels.sourceKey =
      ($target.elementType === 'craft\\elements\\User') ?
        'user' :
        $target.sourceKey;

    // update thead labels.
    updateElementIndexLabels($target);

    if('activeViewMenu' in $target) {
      // for Craft 4.3
      const _labelData  = {},
            _sourceData = Craft.ElementIndexRelabels.data[Craft.ElementIndexRelabels.sourceKey];

      if(typeof _sourceData !== 'undefined') {
        for (const _key in _sourceData) {
          _labelData[_sourceData[_key]['label']] = _sourceData[_key]['relabel'];
        }

        $target.activeViewMenu.$container.find('.element-index-view-menu-table-column').each(function(){
          let _self      = $(this),
              $element   = _self.find('label'),
              _attribute = $element.text();

          // Only if _attribute is contained in _labelData.
          if (_attribute && _attribute in _labelData) {
            $element.text(_labelData[_attribute]);
          }
        });
      }
    } else {
      // for Craft 4.2.8
      // When the SortMenu bubtton has focus.
      $target.$sortMenuBtn.data('menubtn').$btn.on('focus', function () {
        const $sortMenuOptions = $target.sortMenu.$options,
              _labelData       = Craft.ElementIndexRelabels.data[Craft.ElementIndexRelabels.sourceKey];

        if(typeof _labelData !== 'undefined') {
          // Loop through optional items.
          $sortMenuOptions.each(function(_index, _element){
            const $element    = $(_element),
                  _attribute  = $element.attr('data-attr');

            // Only if _attribute is contained in _labelData.
            if (_attribute && _attribute in _labelData) {
              $element.text(_labelData[_attribute]['relabel']);
            }
          });
        }
      });
    }
  });
});

!function(){"use strict";function e(e){if(Craft.ElementIndexRelabels.sourceKey in Craft.ElementIndexRelabels.data){var t=e.$toolbar.find(".sortmenubtn"),n=t.text().trim(),a=Craft.ElementIndexRelabels.data[Craft.ElementIndexRelabels.sourceKey];if("table"!==e.viewMode||void 0===e.view.$table||null===e.view)return!1;setTimeout((function r(){var l=e.view.$table;"table"===e.viewMode&&l.find("thead > tr > th").length?(l.find("thead > tr > th").each((function(e,t){var n=$(t),r=n.attr("data-attribute");r&&r in a&&n.text(a[r].relabel)})),l.find("tbody > tr > td").each((function(e,t){var n=$(t),r=n.attr("data-attr");r&&r in a&&n.attr("data-title",a[r].relabel)})),$.each(a,(function(e,a){a.label===n&&t.text(a.relabel)}))):setTimeout(r,200)}),200)}}function t(){$(".customize-sources-table-column").each((function(){var e=$(this),t=e.find("input:checkbox").attr("name"),n=e.find("input:checkbox").val();if(-1!=n.indexOf("field:")){var a="user"!==Craft.ElementIndexRelabels.sourceKey?t.replace(/^sources\[(.+)]\[tableAttributes]\[]$/,"$1"):"user";void 0!==Craft.ElementIndexRelabels.data[a]&&void 0!==Craft.ElementIndexRelabels.data[a][n]&&e.find("label").text(Craft.ElementIndexRelabels.data[a][n].relabel)}}))}jQuery((function($){Garnish.on(Garnish.Modal,"show",(function(e){var n=e.target;void 0!==n.$sourceSettingsContainer&&setTimeout((function e(){$(".customize-sources-table-column").length?(t(),$(n.$sourcesContainer).find(".customize-sources-item").on("click",(function(){t()}))):setTimeout(e,200)}),200)})),Craft.elementIndex.on("updateElements",(function(t){var n=t.target;Craft.ElementIndexRelabels.sourceKey="craft\\elements\\User"===n.elementType?"user":n.sourceKey,e(n),n.$sortMenuBtn.data("menubtn").$btn.on("focus",(function(){var e=n.sortMenu.$options,t=Craft.ElementIndexRelabels.data[Craft.ElementIndexRelabels.sourceKey];void 0!==t&&e.each((function(e,n){var a=$(n),r=a.attr("data-attr");r&&r in t&&a.text(t[r].relabel)}))}))}))}))}();
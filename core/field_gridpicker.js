/**
 * @license
 * PXT Blockly
 *
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * https://github.com/Microsoft/pxt-blockly
 *
 * See LICENSE file for details.
 */
/**
 * @fileoverview Dropdown input field that arranges elements in a grid instead of a vertical list.
 */
/// <reference path="../localtypings/blockly.d.ts" />
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
goog.provide('Blockly.FieldGridPicker');
goog.require('Blockly.FieldDropdown');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.positioning.ClientPosition');
goog.require('goog.style');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Tooltip');
var pxtblocky;
(function (pxtblocky) {
    var FieldGridPicker = (function (_super) {
        __extends(FieldGridPicker, _super);
        /**
         * Class for an editable dropdown field that arranges elements in a grid.
         * @param {(!Array.<!Array>|!Function)} menuGenerator An array of options
         *     for a dropdown list, or a function which generates these options.
         * @param {number} backgroundColour The background colour of the grid menu
         * @param {number} col The number of columns in the grid menu
         * @param {number} width The width of the dropdown menu, in pixels
         * @param {number} itemColour The background colour of each menu item
         * @param {boolean} useTooltips Whether to add tooltips over the elements
         *     in the dropdown menu.
         * @extends {Blockly.FieldDropdown}
         * @constructor
         */
        function FieldGridPicker(menuGenerator, backgroundColour, params) {
            if (backgroundColour === void 0) { backgroundColour = '#000'; }
            var _this = _super.call(this, menuGenerator) || this;
            _this.tooltips_ = [];
            _this.columns_ = parseInt(params.columns) || 4;
            _this.maxRows_ = parseInt(params.maxRows) || 0;
            _this.width_ = parseInt(params.width) || 400;
            var hue = Number(backgroundColour);
            if (!isNaN(hue)) {
                _this.backgroundColour_ = Blockly.hueToRgb(hue);
            }
            else if (goog.isString(backgroundColour) && backgroundColour.match(/^#[0-9a-fA-F]{6}$/)) {
                _this.backgroundColour_ = backgroundColour;
            }
            else {
                _this.backgroundColour_ = '#000';
            }
            _this.itemColour_ = params.itemColour || '#fff';
            var tooltipCfg = {
                enabled: params.tooltips == 'true' || true,
                xOffset: parseInt(params.tooltipsXOffset) || 15,
                yOffset: parseInt(params.tooltipsYOffset) || -10
            };
            _this.tooltipConfig_ = tooltipCfg;
            return _this;
        }
        /**
         * When disposing the grid picker, make sure the tooltips are disposed too.
         * @public
         */
        FieldGridPicker.prototype.dispose = function () {
            _super.prototype.dispose.call(this);
            this.disposeTooltips();
        };
        /**
         * Create a dropdown menu under the text.
         * @private
         */
        FieldGridPicker.prototype.showEditor_ = function () {
            var _this = this;
            Blockly.WidgetDiv.show(this, this.sourceBlock_.RTL, null);
            this.disposeTooltips();
            var options = this.getOptions_();
            // Container for the menu rows
            var tableContainer = new goog.ui.Control();
            // Container used to limit the height of the tableContainer, because the tableContainer uses
            // display: table, which ignores height and maxHeight
            var scrollContainer = new goog.ui.Control();
            // Needed to correctly style borders and padding around the scrollContainer, because the padding around the
            // scrollContainer is part of the scrollable area and will not be correctly shown at the top and bottom
            // when scrolling
            var paddingContainer = new goog.ui.Control();
            for (var i = 0; i < options.length / this.columns_; i++) {
                var row = this.createRow(i, options);
                tableContainer.addChild(row, true);
            }
            // Record windowSize and scrollOffset before adding menu.
            var windowSize = goog.dom.getViewportSize();
            var scrollOffset = goog.style.getViewportPageOffset(document);
            var xy = this.getAbsoluteXY_();
            var borderBBox = this.getScaledBBox_();
            var div = Blockly.WidgetDiv.DIV;
            scrollContainer.addChild(tableContainer, true);
            paddingContainer.addChild(scrollContainer, true);
            paddingContainer.render(div);
            var paddingContainerDom = paddingContainer.getElement();
            var scrollContainerDom = scrollContainer.getElement();
            var tableContainerDom = tableContainer.getElement();
            // Resize the grid picker if width > screen width
            if (this.width_ > windowSize.width) {
                this.width_ = windowSize.width;
            }
            tableContainerDom.style.width = this.width_ + 'px';
            tableContainerDom.style.backgroundColor = this.backgroundColour_;
            scrollContainerDom.style.backgroundColor = this.backgroundColour_;
            paddingContainerDom.style.backgroundColor = this.backgroundColour_;
            tableContainerDom.className = 'blocklyGridPickerMenu';
            scrollContainerDom.className = 'blocklyGridPickerScroller';
            paddingContainerDom.className = 'blocklyGridPickerPadder';
            // Add the tooltips
            var menuItemsDom = tableContainerDom.getElementsByClassName('goog-menuitem');
            var _loop_1 = function (i) {
                var elem = menuItemsDom[i];
                elem.style.borderColor = this_1.backgroundColour_;
                elem.style.backgroundColor = this_1.itemColour_;
                elem.parentElement.className = 'blocklyGridPickerRow';
                if (this_1.tooltipConfig_.enabled) {
                    var tooltip_1 = new goog.ui.Tooltip(elem, options[i][0].alt || options[i][0]);
                    var onShowOld_1 = tooltip_1.onShow;
                    tooltip_1.onShow = function () {
                        onShowOld_1.call(tooltip_1);
                        var newPos = new goog.positioning.ClientPosition(tooltip_1.cursorPosition.x + _this.tooltipConfig_.xOffset, tooltip_1.cursorPosition.y + _this.tooltipConfig_.yOffset);
                        tooltip_1.setPosition(newPos);
                    };
                    tooltip_1.setShowDelayMs(0);
                    tooltip_1.className = 'goog-tooltip blocklyGridPickerTooltip';
                    elem.addEventListener('mousemove', function (e) {
                        var newPos = new goog.positioning.ClientPosition(e.clientX + _this.tooltipConfig_.xOffset, e.clientY + _this.tooltipConfig_.yOffset);
                        tooltip_1.setPosition(newPos);
                    });
                    this_1.tooltips_.push(tooltip_1);
                }
            };
            var this_1 = this;
            for (var i = 0; i < menuItemsDom.length; ++i) {
                _loop_1(i);
            }
            // Record current container sizes after adding menu.
            var paddingContainerSize = goog.style.getSize(paddingContainerDom);
            var scrollContainerSize = goog.style.getSize(scrollContainerDom);
            // Recalculate dimensions for the total content, not only box.
            scrollContainerSize.height = scrollContainerDom.scrollHeight;
            scrollContainerSize.width = scrollContainerDom.scrollWidth;
            paddingContainerSize.height = paddingContainerDom.scrollHeight;
            paddingContainerSize.width = paddingContainerDom.scrollWidth;
            // Limit scroll container's height if a row limit was specified
            if (this.maxRows_ > 0) {
                var firstRowDom = tableContainerDom.children[0];
                var rowSize = goog.style.getSize(firstRowDom);
                // Compute maxHeight using maxRows + 0.3 to partially show next row, to hint at scrolling
                var maxHeight = rowSize.height * (this.maxRows_ + 0.3);
                // If the current height is greater than the computed max height, limit the height of the scroll
                // container and increase its width to accomodate the scrollbar
                if (scrollContainerSize.height > maxHeight) {
                    scrollContainerDom.style.overflowY = "auto";
                    goog.style.setHeight(scrollContainerDom, maxHeight);
                    // Calculate total border, margin and padding width
                    var scrollPaddings = goog.style.getPaddingBox(scrollContainerDom);
                    var scrollPaddingWidth = scrollPaddings.left + scrollPaddings.right;
                    var scrollMargins = goog.style.getMarginBox(scrollContainerDom);
                    var scrollMarginWidth = scrollMargins.left + scrollMargins.right;
                    var scrollBorders = goog.style.getBorderBox(scrollContainerDom);
                    var scrollBorderWidth = scrollBorders.left + scrollBorders.right;
                    var totalExtraWidth = scrollPaddingWidth + scrollMarginWidth + scrollBorderWidth;
                    // Increase scroll container's width by the width of the scrollbar, so that we don't have horizontal scrolling
                    var scrollbarWidth = scrollContainerDom.offsetWidth - scrollContainerDom.clientWidth - totalExtraWidth;
                    goog.style.setWidth(scrollContainerDom, scrollContainerSize.width + scrollbarWidth);
                    // Refresh the padding container's dimensions
                    paddingContainerSize.height = paddingContainerDom.scrollHeight;
                    paddingContainerSize.width = paddingContainerDom.scrollWidth;
                    // Scroll the currently selected item into view
                    var rowCount = tableContainer.getChildCount();
                    var selectedItemDom = void 0;
                    for (var row = 0; row < rowCount; ++row) {
                        for (var col = 0; col < this.columns_; ++col) {
                            var val = tableContainer.getChildAt(row).getChildAt(col).getValue();
                            if (this.value_ === val) {
                                selectedItemDom = tableContainerDom.children[row].children[col];
                                break;
                            }
                        }
                        if (selectedItemDom) {
                            goog.style.scrollIntoContainerView(selectedItemDom, scrollContainerDom, true);
                            break;
                        }
                    }
                }
            }
            // Position the menu.
            // Flip menu vertically if off the bottom.
            if (xy.y + paddingContainerSize.height + borderBBox.height >=
                windowSize.height + scrollOffset.y) {
                xy.y -= paddingContainerSize.height + 2;
            }
            else {
                xy.y += borderBBox.height;
            }
            if (this.sourceBlock_.RTL) {
                xy.x += borderBBox.width;
                xy.x += Blockly.FieldDropdown.CHECKMARK_OVERHANG;
                // Don't go offscreen left.
                if (xy.x < scrollOffset.x + paddingContainerSize.width) {
                    xy.x = scrollOffset.x + paddingContainerSize.width;
                }
            }
            else {
                xy.x -= Blockly.FieldDropdown.CHECKMARK_OVERHANG;
                // Don't go offscreen right.
                if (xy.x > windowSize.width + scrollOffset.x - paddingContainerSize.width) {
                    xy.x = windowSize.width + scrollOffset.x - paddingContainerSize.width;
                }
            }
            Blockly.WidgetDiv.position(xy.x, xy.y, windowSize, scrollOffset, this.sourceBlock_.RTL);
            tableContainerDom.focus();
        };
        FieldGridPicker.prototype.createRow = function (row, options) {
            var columns = this.columns_;
            var thisField = this;
            function callback(e) {
                var menu = this;
                var menuItem = e.target;
                if (menuItem) {
                    thisField.onItemSelected(menu, menuItem);
                }
                Blockly.WidgetDiv.hideIfOwner(thisField);
                Blockly.Events.setGroup(false);
                thisField.disposeTooltips();
            }
            var menu = new goog.ui.Menu();
            menu.setRightToLeft(this.sourceBlock_.RTL);
            for (var i = (columns * row); i < Math.min((columns * row) + columns, options.length); i++) {
                var content = options[i][0]; // Human-readable text or image.
                var value = options[i][1]; // Language-neutral value.
                if (typeof content == 'object') {
                    // An image, not text.
                    var image = new Image(content['width'], content['height']);
                    image.src = content['src'];
                    image.alt = content['alt'] || '';
                    content = image;
                }
                var menuItem = new goog.ui.MenuItem(content);
                menuItem.setRightToLeft(this.sourceBlock_.RTL);
                menuItem.setValue(value);
                menuItem.setCheckable(true);
                menuItem.setChecked(value == this.value_);
                menu.addChild(menuItem, true);
            }
            // Listen for mouse/keyboard events.
            goog.events.listen(menu, goog.ui.Component.EventType.ACTION, callback);
            // Listen for touch events (why doesn't Closure handle this already?).
            function callbackTouchStart(e) {
                var control = this.getOwnerControl(/** @type {Node} */ (e.target));
                // Highlight the menu item.
                control.handleMouseDown(e);
            }
            function callbackTouchEnd(e) {
                var control = this.getOwnerControl(/** @type {Node} */ (e.target));
                // Activate the menu item.
                control.performActionInternal(e);
            }
            menu.getHandler().listen(menu.getElement(), goog.events.EventType.TOUCHSTART, callbackTouchStart);
            menu.getHandler().listen(menu.getElement(), goog.events.EventType.TOUCHEND, callbackTouchEnd);
            return menu;
        };
        /**
         * Disposes the tooltip DOM elements.
         * @private
         */
        FieldGridPicker.prototype.disposeTooltips = function () {
            if (this.tooltips_ && this.tooltips_.length) {
                this.tooltips_.forEach(function (t) { return t.dispose(); });
                this.tooltips_ = [];
            }
        };
        return FieldGridPicker;
    }(Blockly.FieldDropdown));
    pxtblocky.FieldGridPicker = FieldGridPicker;
})(pxtblocky || (pxtblocky = {}));
Blockly.FieldGridPicker = pxtblocky.FieldGridPicker;

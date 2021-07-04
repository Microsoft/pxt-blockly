/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview An object that provides constants for rendering blocks in PXT
 * mode.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.pxt.ConstantProvider');

goog.require('Blockly.Colours');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.svgPaths');
goog.require('Blockly.zelos.ConstantProvider');


/**
 * An object that provides constants for rendering blocks in PXT mode.
 * @constructor
 * @package
 * @extends {Blockly.zelos.ConstantProvider}
 */
Blockly.pxt.ConstantProvider = function() {
  Blockly.pxt.ConstantProvider.superClass_.constructor.call(this);

  /**
   * @override
   */
  this.FIELD_TEXT_FONTFAMILY =
      '"Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace';

  /**
   * @override
   */
  this.FIELD_TEXT_FONTWEIGHT = '600';

  /**
   * @type {number}
   */
  this.ICON_SEPARATOR_HEIGHT = 8 * this.GRID_UNIT;

  /**
   * Radius of SVG path for ellipses in collapsed blocks.
   * @type {number}
   * @package
   */
  this.ELLIPSES_RADIUS = 6;

  /**
   * Spacing of ellipses in collapsed blocks.
   * @type {number}
   * @package
   */
  this.ELLIPSES_SPACING = 8;

  /**
   * Data URI of svg for collapsing a block
   * @type {string}
   * @package
   */
  this.COLLAPSE_IMAGE_DATAURI = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg enable-background='new 0 0 24 24' version='1.1' viewBox='0 0 24 24' xml:space='preserve' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23CF8B17;%7D .st1%7Bfill:%23FFFFFF;%7D%0A%3C/style%3E%3Ctitle%3Erepeat%3C/title%3E%3Ccircle cx='12' cy='12' r='10.503' fill='none' stroke='%23fff' stroke-linecap='square' stroke-linejoin='round' stroke-width='2'/%3E%3Cg transform='matrix(.0086269 0 0 -.0086269 4.8224 17.354)'%3E%3Cpath d='m1611 367.42q0 53-37 90l-651 651q-38 38-91 38-54 0-90-38l-651-651q-38-36-38-90 0-53 38-91l74-75q39-37 91-37 53 0 90 37l486 486 486-486q37-37 90-37 52 0 91 37l75 75q37 39 37 91z' fill='%23fff'/%3E%3C/g%3E%3C/svg%3E%0A";

  /**
   * Data URI of svg for expanding a block
   * set.
   * @type {string}
   * @package
   */
  this.EXPAND_IMAGE_DATAURI = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg enable-background='new 0 0 24 24' version='1.1' viewBox='0 0 24 24' xml:space='preserve' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%23CF8B17;%7D .st1%7Bfill:%23FFFFFF;%7D%0A%3C/style%3E%3Ctitle%3Erepeat%3C/title%3E%3Ccircle cx='12' cy='12' r='10.503' fill='none' stroke='%23fff' stroke-linecap='square' stroke-linejoin='round' stroke-width='2'/%3E%3Cg transform='matrix(.0086269 0 0 -.0086269 4.8224 17.654)'%3E%3Cpath d='m1611 832q0-53-37-90l-651-651q-38-38-91-38-54 0-90 38l-651 651q-38 36-38 90 0 53 38 91l74 75q39 37 91 37 53 0 90-37l486-486 486 486q37 37 90 37 52 0 91-37l75-75q37-39 37-91z' fill='%23fff'/%3E%3C/g%3E%3C/svg%3E%0A";

  /**
   * The ID of the highlighted glow filter, or the empty string if no filter is
   * set.
   * @type {string}
   * @package
   */
  this.highlightedGlowFilterId = '';

  /**
   * The <filter> element to use for a highlighted glow, or null if not set.
   * @type {SVGElement}
   * @private
   */
  this.highlightedGlowFilter_ = null;

  /**
   * The ID of the warning glow filter, or the empty string if no filter is
   * set.
   * @type {string}
   * @package
   */
  this.warningGlowFilterId = '';

  /**
   * The <filter> element to use for a warning glow, or null if not set.
   * @type {SVGElement}
   * @private
   */
  this.warningGlowFilter_ = null;

  /**
   * The ID of the dropdown arrow SVG, or the empty string if no SVG is
   * set.
   * @type {string}
   * @package
   */
  this.dropdownArrowImageId = ''
};
Blockly.utils.object.inherits(Blockly.pxt.ConstantProvider,
    Blockly.zelos.ConstantProvider);

/**
 * @override
 */
Blockly.pxt.ConstantProvider.prototype.init = function() {
  Blockly.pxt.ConstantProvider.superClass_.init.call(this);

  /**
   * A string containing path information about ellipses.
   * @type {!string}
   */
  this.ELLIPSES = this.makeEllipses();
};

/**
 * @override
 */
Blockly.pxt.ConstantProvider.prototype.createDom = function(svg) {
  Blockly.pxt.ConstantProvider.superClass_.createDom.call(this, svg);
  var defs = Blockly.utils.dom.createSvgElement('defs', {}, svg);

  // Filter for highlighting
  var highlightGlowFilter = Blockly.utils.dom.createSvgElement('filter',
      {
        'id': 'blocklyHighlightGlowFilter' + this.randomIdentifier_,
        'height': '160%',
        'width': '180%',
        y: '-30%',
        x: '-40%'
      },
      defs);
  Blockly.utils.dom.createSvgElement('feGaussianBlur',
      {
        'in': 'SourceGraphic',
        'stdDeviation': Blockly.Colours.highlightGlowSize
      },
      highlightGlowFilter);
  // Set all gaussian blur pixels to 1 opacity before applying flood
  var highlightComponentTransfer = Blockly.utils.dom.createSvgElement('feComponentTransfer', {'result': 'outBlur'}, highlightGlowFilter);
  Blockly.utils.dom.createSvgElement('feFuncA',
      {
        'type': 'table', 'tableValues': '0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1'
      },
      highlightComponentTransfer);
  // Color the highlight
  Blockly.utils.dom.createSvgElement('feFlood',
      {'flood-color': Blockly.Colours.highlightGlow,
        'flood-opacity': Blockly.Colours.highlightGlowOpacity, 'result': 'outColor'}, highlightGlowFilter);
  Blockly.utils.dom.createSvgElement('feComposite',
      {'in': 'outColor', 'in2': 'outBlur',
        'operator': 'in', 'result': 'outGlow'}, highlightGlowFilter);
  this.highlightedGlowFilterId = highlightGlowFilter.id;
  this.highlightedGlowFilter_ = highlightGlowFilter;

  // Filter for error / warning marker
  var warningGlowFilter = Blockly.utils.dom.createSvgElement('filter',
      {
        'id': 'blocklyHighlightWarningFilter' + this.randomIdentifier_,
        'height': '160%',
        'width': '180%',
        y: '-30%',
        x: '-40%'
      },
      defs);
  Blockly.utils.dom.createSvgElement('feGaussianBlur',
      {
        'in': 'SourceGraphic',
        'stdDeviation': Blockly.Colours.warningGlowSize
      },
      warningGlowFilter);
  // Set all gaussian blur pixels to 1 opacity before applying flood
  var warningComponentTransfer = Blockly.utils.dom.createSvgElement('feComponentTransfer', {'result': 'outBlur'}, warningGlowFilter);
  Blockly.utils.dom.createSvgElement('feFuncA',
      {
        'type': 'table', 'tableValues': '0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1'
      },
      warningComponentTransfer);
  // Color the highlight
  Blockly.utils.dom.createSvgElement('feFlood',
      {'flood-color': Blockly.Colours.warningGlow,
        'flood-opacity': Blockly.Colours.warningGlowOpacity, 'result': 'outColor'}, warningGlowFilter);
  Blockly.utils.dom.createSvgElement('feComposite',
      {'in': 'outColor', 'in2': 'outBlur',
        'operator': 'in', 'result': 'outGlow'}, warningGlowFilter);
  this.warningGlowFilterId = warningGlowFilter.id;
  this.warningGlowFilter_ = warningGlowFilter;

  // Grayscale filter
  var grayscaleFilter = Blockly.utils.dom.createSvgElement('filter',
      {
        'id': 'blocklyGrayscaleFilter' + this.randomIdentifier_,
        'height': '160%',
        'width': '180%',
        y: '-30%',
        x: '-40%'
      },
      defs);
  Blockly.utils.dom.createSvgElement('feColorMatrix',
    {'type': 'saturate',
     'values': '0.10'},
    grayscaleFilter);
  this.grayscaleFilterId = grayscaleFilter.id;
  this.grayscaleFilter_ = grayscaleFilter;

  // Add dropdown image definitions
  var arrowSize = this.FIELD_DROPDOWN_SVG_ARROW_SIZE;
  var dropdownArrowImage = Blockly.utils.dom.createSvgElement('image',
      {
        'id': 'blocklyDropdownArrowSvg' + this.randomIdentifier_,
        'height': arrowSize + 'px',
        'width': arrowSize + 'px'
      }, defs);
  dropdownArrowImage.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', this.FIELD_DROPDOWN_SVG_ARROW_DATAURI);
  this.dropdownArrowImageId = dropdownArrowImage.id;
};

/**
 * @return {!string} A string containing path information about
 *     collapsed block ellipses.
 * @package
 */
Blockly.pxt.ConstantProvider.prototype.makeEllipses = function() {
  var r = this.ELLIPSES_RADIUS;
  var spacing = this.ELLIPSES_SPACING;

  var mainPath = "";
  for (var i = 0; i < 3; i++) {
    mainPath += Blockly.utils.svgPaths.moveBy(spacing, 0)
    + Blockly.utils.svgPaths.arc('a', '180 1,1', r,
      Blockly.utils.svgPaths.point(r * 2, 0));
  }
  for (var i = 0; i < 3; i++) {
    mainPath += Blockly.utils.svgPaths.arc('a', '180 1,1', r,
      Blockly.utils.svgPaths.point(- r * 2, 0))
    + Blockly.utils.svgPaths.moveBy(-spacing, 0);
  }

  return mainPath;
};

/**
 * @override
 */
Blockly.pxt.ConstantProvider.prototype.getCSS_ = function(name) {
  var selector = '.' + name + '-renderer';
  var css = Blockly.pxt.ConstantProvider.superClass_.getCSS_.call(this, name);
  return css.concat([
    /* eslint-disable indent */
    // Connection indicator.
    selector + ' .blocklyConnectionIndicator, ' + selector + ' .blocklyInputConnectionIndicator {',
      'fill: #ff0000;',
      'fill-opacity: 0.9;',
      'stroke: #ffff00;',
      'stroke-width: 3px;',
    '}',
    selector + ' .blocklyConnectionIndicator {',
      'display: none;',
    '}',
    selector + ' .blocklyBlockDragSurface > g > .blocklyDraggable > .blocklyConnectionIndicator {',
      'display: block;',
    '}',
    selector + ' .blocklyConnectionLine {',
      'stroke: #ffff00;',
      'stroke-width: 4px;',
    '}',
    selector + ' .blocklyConnectionLine.hidden {',
      'display: none;',
    '}'
    /* eslint-enable indent */
  ])
}
/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
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
 * @fileoverview Text input field with floating "remove" button.
 * @author pkaplan@media.mit.edu (Paul Kaplan)
 */
'use strict';

goog.provide('Blockly.FieldTextInputRemovable');

goog.require('Blockly.BlockSvg.render');
goog.require('Blockly.Colours');
goog.require('Blockly.FieldTextInput');
goog.require('Blockly.Msg');
goog.require('Blockly.utils');
goog.require('goog.dom');
goog.require('goog.dom.TagName');

/**
 * Class for an editable text field displaying a deletion icon when selected.
 * @param {string} text The initial content of the field.
 * @param {Function=} opt_validator An optional function that is called
 *     to validate any constraints on what the user entered.  Takes the new
 *     text as an argument and returns either the accepted text, a replacement
 *     text, or null to abort the change.
 * @param {RegExp=} opt_restrictor An optional regular expression to restrict
 *     typed text to. Text that doesn't match the restrictor will never show
 *     in the text field.
 * @extends {Blockly.FieldTextInput}
 * @constructor
 */
Blockly.FieldTextInputRemovable = function(text, opt_validator, opt_restrictor) {
  Blockly.FieldTextInputRemovable.superClass_.constructor.call(this, text,
      opt_validator, opt_restrictor);
};
goog.inherits(Blockly.FieldTextInputRemovable, Blockly.FieldTextInput);

/**
 * Data URI for the delete argument icon.
 * @type {string}
 * @public
 */
Blockly.FieldTextInputRemovable.REMOVE_ARG_URI = "data:image/svg+xml;charset=UTF-8,%3c?xml version='1.0' encoding='UTF-8' standalone='no'?%3e%3csvg width='20px' height='20px' viewBox='0 0 20 20' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3c!-- Generator: Sketch 48.1 (47250) - http://www.bohemiancoding.com/sketch --%3e%3ctitle%3edelete-argument v2%3c/title%3e%3cdesc%3eCreated with Sketch.%3c/desc%3e%3cdefs%3e%3c/defs%3e%3cg id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3e%3cg id='delete-argument-v2' stroke='%23FF661A'%3e%3cg id='Group' transform='translate(3.000000, 2.500000)'%3e%3cpath d='M1,3 L13,3 L11.8900496,14.0995037 C11.8389294,14.6107055 11.4087639,15 10.8950124,15 L3.10498756,15 C2.59123611,15 2.16107055,14.6107055 2.10995037,14.0995037 L1,3 Z' id='Rectangle' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3e%3c/path%3e%3cpath d='M7,11 L7,6' id='Line' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3e%3c/path%3e%3cpath d='M9.5,11 L9.5,6' id='Line-Copy' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3e%3c/path%3e%3cpath d='M4.5,11 L4.5,6' id='Line-Copy-2' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3e%3c/path%3e%3crect id='Rectangle-2' fill='%23FF661A' x='0' y='2.5' width='14' height='1' rx='0.5'%3e%3c/rect%3e%3cpath d='M6,0 L8,0 C8.55228475,-1.01453063e-16 9,0.44771525 9,1 L9,3 L5,3 L5,1 C5,0.44771525 5.44771525,1.01453063e-16 6,0 Z' id='Rectangle-3' stroke-width='1.5'%3e%3c/path%3e%3c/g%3e%3c/g%3e%3c/g%3e%3c/svg%3e";

/**
 * Show the inline free-text editor on top of the text with the remove button.
 * @private
 */
Blockly.FieldTextInputRemovable.prototype.showEditor_ = function() {
  Blockly.FieldTextInputRemovable.superClass_.showEditor_.call(this);

  var div = Blockly.WidgetDiv.DIV;
  div.className += ' removableTextInput';
  var removeButton =
      goog.dom.createDom(goog.dom.TagName.IMG, 'blocklyTextRemoveIcon');
  removeButton.setAttribute('src', Blockly.FieldTextInputRemovable.REMOVE_ARG_URI);
  this.removeButtonMouseWrapper_ = Blockly.bindEvent_(removeButton,
      'mousedown', this, this.removeCallback_);
  div.appendChild(removeButton);
};

/**
 * Function to call when remove button is called. Checks for removeFieldCallback
 * on sourceBlock and calls it if possible.
 * @private
 */
Blockly.FieldTextInputRemovable.prototype.removeCallback_ = function() {
  if (this.sourceBlock_ && this.sourceBlock_.removeFieldCallback) {
    this.sourceBlock_.removeFieldCallback(this);
  } else {
    console.warn('Expected a source block with removeFieldCallback');
  }
};

/**
 * Helper function to construct a FieldTextInputRemovable from a JSON arg object,
 * dereferencing any string table references.
 * @param {!Object} options A JSON object with options (text, class, and
 *                          spellcheck).
 * @returns {!Blockly.FieldTextInputRemovable} The new text input.
 * @public
 */
Blockly.FieldTextInputRemovable.fromJson = function(options) {
  var text = Blockly.utils.replaceMessageReferences(options['text']);
  var field = new Blockly.FieldTextInputRemovable(text, options['class']);
  if (typeof options['spellcheck'] == 'boolean') {
    field.setSpellcheck(options['spellcheck']);
  }
  return field;
};

Blockly.Field.register(
    'field_input_removable', Blockly.FieldTextInputRemovable);
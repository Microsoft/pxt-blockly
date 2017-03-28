/**
 * @license
 * PXT Blockly
 *
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * https://github.com/Microsoft/pxt-blockly
 *
 * See LICENSE file for details.
 */
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
goog.provide('Blockly.PXTToolbox');
goog.require('Blockly.PXTUtils');
goog.require('Blockly.Toolbox');
var pxtblocky;
(function (pxtblocky) {
    var PXTToolbox = (function (_super) {
        __extends(PXTToolbox, _super);
        function PXTToolbox(workspace) {
            var _this = _super.call(this, workspace) || this;
            _this.invertedToolbox = workspace.options.invertedToolbox;
            return _this;
        }
        /**
         * Recursively add colours to this toolbox.
         * @param {Blockly.Toolbox.TreeNode} opt_tree Starting point of tree.
         *     Defaults to the root node.
         * @private
         */
        PXTToolbox.prototype.addColour_ = function (opt_tree) {
            var pxtOptions = this.workspace_.options;
            var tree = opt_tree || this.tree_;
            var children = tree.getChildren();
            for (var i = 0, child; child = children[i]; i++) {
                var element = child.getRowElement();
                if (element) {
                    // Support for inverted and coloured toolboxes
                    if (pxtOptions.invertedToolbox) {
                        if (this.hasColours_) {
                            element.style.color = '#fff';
                            element.style.background = (child.hexColour || '#ddd');
                            var invertedMultiplier = pxtOptions.invertedMultiplier;
                            if (!child.disabled) {
                                // Hovering over toolbox category fades.
                                Blockly.bindEvent_(child.getRowElement(), 'mouseenter', child, function (e) {
                                    if (!this.isSelected()) {
                                        this.getRowElement().style.background = Blockly.PXTUtils.fadeColour(this.hexColour || '#ddd', invertedMultiplier, false);
                                    }
                                });
                                Blockly.bindEvent_(child.getRowElement(), 'mouseleave', child, function (e) {
                                    if (!this.isSelected()) {
                                        this.getRowElement().style.background = (this.hexColour || '#ddd');
                                    }
                                });
                            }
                        }
                    }
                    else {
                        if (this.hasColours_) {
                            var border = '8px solid ' + (child.hexColour || '#ddd');
                        }
                        else {
                            var border = 'none';
                        }
                        if (this.workspace_.RTL) {
                            element.style.borderRight = border;
                        }
                        else {
                            element.style.borderLeft = border;
                        }
                        // support for a coloured toolbox
                        if (pxtOptions.colouredToolbox && this.hasColours_) {
                            element.style.color = (child.hexColour || '#000');
                        }
                    }
                    // if disabled, show disabled opacity
                    if (child.disabled) {
                        element.style.opacity = pxtOptions.disabledOpacity;
                    }
                }
                this.addColour_(child);
            }
        };
        return PXTToolbox;
    }(Blockly.Toolbox));
    pxtblocky.PXTToolbox = PXTToolbox;
})(pxtblocky || (pxtblocky = {}));
Blockly.Toolbox = pxtblocky.PXTToolbox;

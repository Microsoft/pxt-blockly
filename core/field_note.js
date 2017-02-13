/// <reference path="../localtypings/blockly.d.ts" />
//TODO license
/**
 * @fileoverview note-picker input field.
 */
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
goog.provide('Blockly.FieldNote');
goog.require('goog.events');
goog.require('goog.style');
goog.require('goog.ui.ColorButton');
goog.require('goog.dom');
goog.require('Blockly.Field');
goog.require('Blockly.Toolbox');
goog.require('Blockly.FieldNumber');
var pianoSize;
(function (pianoSize) {
    pianoSize[pianoSize["small"] = 12] = "small";
    pianoSize[pianoSize["medium"] = 36] = "medium";
    pianoSize[pianoSize["large"] = 60] = "large";
})(pianoSize || (pianoSize = {}));
var Blockly;
(function (Blockly) {
    var AudioContextManager;
    (function (AudioContextManager) {
        var _frequency = 0;
        var _context; // AudioContext
        var _vco; // OscillatorNode;
        var _vca; // GainNode;
        var _mute = false; //mute audio
        function context() {
            if (!_context)
                _context = freshContext();
            return _context;
        }
        function freshContext() {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            if (window.AudioContext) {
                try {
                    // this call my crash.
                    // SyntaxError: audio resources unavailable for AudioContext construction
                    return new window.AudioContext();
                }
                catch (e) { }
            }
            return undefined;
        }
        function mute(mute) {
            _mute = mute;
            stop();
        }
        AudioContextManager.mute = mute;
        function stop() {
            if (_vca)
                _vca.gain.value = 0;
            _frequency = 0;
        }
        AudioContextManager.stop = stop;
        function frequency() {
            return _frequency;
        }
        AudioContextManager.frequency = frequency;
        function tone(frequency, gain) {
            if (_mute)
                return;
            if (frequency <= 0)
                return;
            _frequency = frequency;
            var ctx = context();
            if (!ctx)
                return;
            gain = Math.max(0, Math.min(1, gain));
            if (!_vco) {
                try {
                    _vco = ctx.createOscillator();
                    _vca = ctx.createGain();
                    _vco.connect(_vca);
                    _vca.connect(ctx.destination);
                    _vca.gain.value = gain;
                    _vco.start(0);
                }
                catch (e) {
                    _vco = undefined;
                    _vca = undefined;
                    return;
                }
            }
            _vco.frequency.value = frequency;
            _vca.gain.value = gain;
        }
        AudioContextManager.tone = tone;
    })(AudioContextManager = Blockly.AudioContextManager || (Blockly.AudioContextManager = {}));
    //  Class for a note input field.
    var FieldNote = (function (_super) {
        __extends(FieldNote, _super);
        /**
         * @param {string} note The initial note in string format.
         * @param {Function=} opt_validator A function that is executed when a new
         *     note is selected.  Its sole argument is the new note value.  Its
         *     return value becomes the selected note
         * @extends {Blockly.FieldNumber}
         * @constructor
         */
        function FieldNote(note, colour, opt_validator) {
            var _this = _super.call(this, note) || this;
            /**
             * default number of piano keys
             * @type {number}
             * @private
             */
            _this.nKeys_ = pianoSize.medium;
            /**
             * Absolute error for note frequency identification (Hz)
             * @type {number}
             * @private
             */
            _this.eps_ = 1;
            /**
             * array of notes frequency
             * @type {Array.<number>}
             * @private
             */
            _this.noteFreq_ = [];
            /**
             * array of notes names
             * @type {Array.<string>}
             * @private
             */
            _this.noteName_ = [];
            /**
             * default width piano key
             * @type {number}
             * @private
             */
            _this.keyWidth_ = 22;
            /**
             * default height piano key
             * @type {number}
             * @private
             */
            _this.keyHeight_ = 90;
            /**
             * count the number of white piano key that have been rendered
             * @type {number}
             * @private
             */
            _this.whiteKeyCounter_ = 0;
            /**
            * color for the current selected key
            * @type {string}
            * @private
            */
            _this.selectedKeyColor_ = "yellowgreen";
            /**
            * count the number of keys that have sounded in the piano editor
            * @type {number}
            * @private
            */
            _this.soundingKeys_ = 0;
            FieldNote.superClass_.constructor.call(_this, note, opt_validator);
            _this.note_ = note;
            _this.colour_ = Blockly.hueToRgb(colour);
            return _this;
        }
        /**
         * Ensure that only a non negative number may be entered.
         * @param {string} text The user's text.
         * @return {?string} A string representing a valid positive number, or null if invalid.
         */
        FieldNote.prototype.classValidator = function (text) {
            if (text === null) {
                return null;
            }
            text = String(text);
            var n = parseFloat(text || '0');
            if (isNaN(n) || n < 0) {
                // Invalid number.
                return null;
            }
            // Get the value in range.
            return String(n);
        };
        /**
         * Install this field on a block.
         */
        FieldNote.prototype.init = function () {
            FieldNote.superClass_.init.call(this);
            this.borderRect_.style['fillOpacity'] = 1;
            this.noteFreq_.length = 0;
            this.noteName_.length = 0;
            this.whiteKeyCounter_ = 0;
            //  Create arrays of name/frequency of the notes
            this.createNotesArray_();
            this.setValue(this.getValue());
        };
        /**
         * Return the current note frequency.
         * @return {string} Current note in string format.
         */
        FieldNote.prototype.getValue = function () {
            return this.note_;
        };
        /**
         * Set the note.
         * @param {string} note The new note in string format.
         */
        FieldNote.prototype.setValue = function (note) {
            note = String(parseFloat(note || '0'));
            if (isNaN(Number(note)) || Number(note) < 0)
                return;
            if (this.sourceBlock_ && Blockly.Events.isEnabled() &&
                this.note_ != note) {
                Blockly.Events.fire(new Blockly.Events.Change(this.sourceBlock_, 'field', this.name, String(this.note_), String(note)));
            }
            this.note_ = note;
            this.setText(this.getNoteName_());
        };
        /**
         * Get the text from this field.  Used when the block is collapsed.
         * @return {string} Current text.
         */
        FieldNote.prototype.getText = function () {
            return Number(this.note_).toFixed(2);
        };
        /**
         * Set the text in this field and NOT fire a change event.
         * @param {*} newText New text.
         */
        FieldNote.prototype.setText = function (newText) {
            if (newText === null) {
                // No change if null.
                return;
            }
            newText = String(newText);
            if (!isNaN(Number(newText)))
                newText = this.getNoteName_();
            if (newText === this.text_) {
                // No change.
                return;
            }
            Blockly.Field.prototype.setText.call(this, newText);
        };
        /**
        * get the note name to be displayed in the field
        * @return {string} note name
        * @private
        */
        FieldNote.prototype.getNoteName_ = function () {
            var note = this.getValue();
            var text = note.toString();
            for (var i = 0; i < this.nKeys_; i++) {
                if (Math.abs(this.noteFreq_[i] - Number(note)) < this.eps_)
                    return this.noteName_[i];
            }
            if (!isNaN(Number(note)))
                text += ' Hz';
            return text;
        };
        /**
         * Set a custom number of keys for this field.
         * @param {number} nkeys Number of keys for this block,
         *     or 26 to use default.
         * @return {!Blockly.FieldNote} Returns itself (for method chaining).
         */
        FieldNote.prototype.setNumberOfKeys = function (size) {
            if (size != pianoSize.small && size != pianoSize.medium && size != pianoSize.large)
                return this;
            this.nKeys_ = size;
            return this;
        };
        /**
         * create an Array of goo.ui.ColorButton as a piano keys
         * @return {Array.<goog.ui.colorButton>} piano keys.
         * @private
         */
        FieldNote.prototype.createNewPiano_ = function () {
            var N = this.nKeys_;
            var piano = [];
            for (var i = 0; i < N; i++) {
                piano.push(new goog.ui.ColorButton());
            }
            return piano;
        };
        /**
         * create a DOM to assing a style to the button (piano Key)
         * @param {string} bgColor color of the key background
         * @param {number} width width of the key
         * @param {number} heigth heigth of the key
         * @param {number} leftPosition horizontal position of the key
         * @param {number} topPosition vertical position of the key
         * @param {number} z_index z-index of the key
         * @param {string} keyBorderColour border color of the key
         * @param {boolean} isMobile true if the device is a mobile
         * @return {goog.dom} DOM with the new css style.
         * @private
         */
        FieldNote.prototype.getKeyStyle_ = function (bgColor, width, height, leftPosition, topPosition, z_index, keyBorderColour, isMobile) {
            var div = goog.dom.createDom('div', {
                'style': 'background-color: ' + bgColor
                    + '; width: ' + width
                    + 'px; height: ' + height
                    + 'px; left: ' + leftPosition
                    + 'px; top: ' + topPosition
                    + 'px; z-index: ' + z_index
                    + ';   border-color: ' + keyBorderColour
                    + ';'
            });
            div.className = 'blocklyNote';
            return div;
        };
        /**
         * create a DOM to assing a style to the note label
         * @param {number} topPosition vertical position of the label
         * @param {number} leftPosition horizontal position of the label
         * @param {boolean} isMobile true if the device is a mobile
         * @return {goog.dom} DOM with the new css style.
         * @private
         */
        FieldNote.prototype.getShowNoteStyle_ = function (topPosition, leftPosition, isMobile) {
            topPosition += this.keyHeight_;
            if (isMobile)
                topPosition += this.prevNextHeight_;
            var div = goog.dom.createDom('div', {
                'style': 'top: ' + topPosition
                    + 'px; left: ' + leftPosition
                    + 'px; background-color: ' + this.colour_
                    + '; width: ' + this.pianoWidth_
                    + 'px; border-color: ' + this.colour_
                    + ';' + (isMobile ? ' font-size: 70px; height: 90px;' : '')
            });
            div.className = 'blocklyNoteLabel';
            return div;
        };
        ;
        /**
         * create a DOM to assing a style to the previous and next buttons
         * @param {number} topPosition vertical position of the label
         * @param {number} leftPosition horizontal position of the label
         * @param {boolean} isPrev true if is previous button, false otherwise
         * @param {boolean} isMobile true if the device is a mobile
         * @return {goog.dom} DOM with the new css style.
         * @private
         */
        FieldNote.prototype.getNextPrevStyle_ = function (topPosition, leftPosition, isPrev, isMobile) {
            //  x position of the prev/next button
            var xPosition = (isPrev ? 0 : (this.pianoWidth_ / 2)) + leftPosition;
            //  y position of the prev/next button
            var yPosition = (this.keyHeight_ + this.labelHeight_ + topPosition);
            if (isMobile)
                yPosition = this.keyHeight_ + topPosition;
            var div = goog.dom.createDom('div', {
                'style': 'top: ' + yPosition
                    + 'px; left: ' + xPosition
                    + 'px; '
                    + ';' + (isMobile ? ' height: 90px; font-size: 50px;' : '')
                    + 'width: ' + Math.ceil(this.pianoWidth_ / 2) + 'px;'
                    + 'background-color: ' + this.colour_
                    + ';' + (isPrev ? 'border-left-color: ' : 'border-right-color: ') + this.colour_
                    + ';' + (!isMobile ? 'border-bottom-color: ' + this.colour_ : '')
                    + ';'
            });
            div.className = 'blocklyNotePrevNext';
            return div;
        };
        ;
        /**
         * @param {number} idx index of the key
         * @return {boolean} true if key_idx is white
         * @private
         */
        FieldNote.prototype.isWhite_ = function (idx) {
            var octavePosition = idx % 12;
            if (octavePosition == 1 || octavePosition == 3 || octavePosition == 6 ||
                octavePosition == 8 || octavePosition == 10)
                return false;
            return true;
        };
        ;
        /**
         * get background color of the current piano key
         * @param {number} idx index of the key
         * @return {string} key background color
         * @private
         */
        FieldNote.prototype.getBgColor_ = function (idx) {
            //  What color is idx key
            if (this.isWhite_(idx))
                return 'white';
            return 'black';
        };
        /**
         * get width of the piano key
         * @param {number} idx index of the key
         * @return {number} width of the key
         * @private
         */
        FieldNote.prototype.getKeyWidth_ = function (idx) {
            if (this.isWhite_(idx))
                return this.keyWidth_;
            return this.keyWidth_ / 2;
        };
        /**
         * get height of the piano key
         * @param {number} idx index of the key
         * @return {number} height of the key
         * @private
         */
        FieldNote.prototype.getKeyHeight_ = function (idx) {
            if (this.isWhite_(idx))
                return this.keyHeight_;
            return this.keyHeight_ / 2;
        };
        /**
         * get the position of the key in the piano
         * @param {number} idx index of the key
         * @return {number} position of the key
         */
        FieldNote.prototype.getPosition_ = function (idx) {
            var pos = (this.whiteKeyCounter_ * this.keyWidth_);
            if (this.isWhite_(idx))
                return pos;
            return pos - (this.keyWidth_ / 4);
        };
        /**
         * return next note of a piano key
         * @param {string} note current note
         * @return {string} next note
         * @private
         */
        FieldNote.prototype.nextNote_ = function (note) {
            switch (note) {
                case 'A#':
                    return 'B';
                case 'B':
                    return 'C';
                case 'C#':
                    return 'D';
                case 'D#':
                    return 'E';
                case 'E':
                    return 'F';
                case 'F#':
                    return 'G';
                case 'G#':
                    return 'A';
            }
            return note + '#';
        };
        /**
         * return next note prefix
         * @param {string} prefix current note prefix
         * @return {string} next note prefix
         * @private
         */
        FieldNote.prototype.nextNotePrefix_ = function (prefix) {
            switch (prefix) {
                case 'Deep':
                    return 'Low';
                case 'Low':
                    return 'Middle';
                case 'Middle':
                    if (this.nKeys_ == pianoSize.medium)
                        return 'High';
                    return 'Tenor';
                case 'Tenor':
                    return 'High';
            }
        };
        /**
         * create Array of notes name and frequencies
         * @private
         */
        FieldNote.prototype.createNotesArray_ = function () {
            var prefix;
            var curNote = 'C';
            var keyNumber;
            // set piano start key number and key prefix (keyNumbers -> https://en.wikipedia.org/wiki/Piano_key_frequencies)
            switch (this.nKeys_) {
                case pianoSize.small:
                    keyNumber = 40;
                    //  no prefix for a single octave
                    prefix = '';
                    break;
                case pianoSize.medium:
                    keyNumber = 28;
                    prefix = 'Low';
                    break;
                case pianoSize.large:
                    keyNumber = 16;
                    prefix = 'Deep';
                    break;
            }
            for (var i = 0; i < this.nKeys_; i++) {
                // set name of the i note
                this.noteName_.push(prefix + ' ' + curNote);
                // get frequency using math formula -> https://en.wikipedia.org/wiki/Piano_key_frequencies
                var curFreq = Math.pow(2, (keyNumber - 49) / 12) * 440;
                // set frequency of the i note
                this.noteFreq_.push(curFreq);
                // get name of the next note
                curNote = this.nextNote_(curNote);
                if ((i + 1) % 12 == 0)
                    prefix = this.nextNotePrefix_(prefix);
                // increment keyNumber
                keyNumber++;
            }
        };
        /** get width of blockly editor space
        * @return {number} width of the blockly editor workspace
        * @private
        */
        FieldNote.prototype.getEditorWidth_ = function () {
            var editorWidth = document.getElementById('blocklyDiv').offsetWidth;
            var toolBoxWidth = document.getElementsByClassName('blocklyToolboxDiv')[0].offsetWidth; //  Blockly.Toolbox.getWidth();
            return editorWidth - toolBoxWidth;
        };
        /** get height of blockly editor space
        * @return {number} Height of the blockly editor workspace
        * @private
        */
        FieldNote.prototype.getEditorHeight_ = function () {
            var editorHeight = document.getElementById('blocklyDiv').offsetHeight;
            return editorHeight;
        };
        /**
         * Create a piano under the note field.
         */
        FieldNote.prototype.showEditor_ = function (opt_quietInput) {
            //  change Note name to number frequency
            Blockly.FieldNumber.prototype.setText.call(this, this.getText());
            FieldNote.superClass_.showEditor_.call(this, true);
            //  Record windowSize and scrollOffset before adding the piano.
            var windowSize = goog.dom.getViewportSize();
            //  initializate
            this.soundingKeys_ = 0;
            this.pianoWidth_ = this.keyWidth_ * (this.nKeys_ - (this.nKeys_ / 12 * 5));
            this.pianoHeight_ = this.keyHeight_;
            var pagination = false;
            var mobile = false;
            var editorWidth = this.getEditorWidth_();
            var thisField = this;
            this.whiteKeyCounter_ = 0;
            //  Create the piano using Closure (colorButton).
            var piano = this.createNewPiano_();
            if (editorWidth < this.pianoWidth_) {
                pagination = true;
                this.pianoWidth_ = 7 * this.keyWidth_;
            }
            //  Check if Mobile, pagination -> true
            var quietInput = opt_quietInput || false;
            if (!quietInput && (goog.userAgent.MOBILE || goog.userAgent.ANDROID)) {
                pagination = true;
                mobile = true;
                var r = this.keyWidth_ / this.keyHeight_;
                this.keyWidth_ = Math.ceil(windowSize.width / 7);
                this.keyHeight_ = Math.ceil(this.keyWidth_ / r);
                this.pianoWidth_ = 7 * this.keyWidth_;
                this.pianoHeight_ = this.keyHeight_;
                this.labelHeight_ = 90;
                this.prevNextHeight_ = 90;
            }
            //  create piano div
            var div = Blockly.WidgetDiv.DIV;
            var pianoDiv = goog.dom.createDom('div', {});
            pianoDiv.className = 'blocklyPianoDiv';
            div.appendChild(pianoDiv);
            var scrollOffset = goog.style.getViewportPageOffset(document);
            var pianoHeight = this.keyHeight_ + div.scrollHeight + 5;
            var xy = this.getAbsoluteXY_();
            var borderBBox = this.getScaledBBox_();
            var topPosition = 0, leftPosition = 0;
            //  Flip the piano vertically if off the bottom (only in web view).
            if (!mobile) {
                if (xy.y + pianoHeight + borderBBox.height >=
                    windowSize.height + scrollOffset.y) {
                    topPosition = -(pianoHeight + borderBBox.height);
                }
                if (this.sourceBlock_.RTL) {
                    xy.x += borderBBox.width;
                    xy.x -= this.pianoWidth_;
                    leftPosition += borderBBox.width;
                    leftPosition -= this.pianoWidth_;
                    // Don't go offscreen left.
                    if (xy.x < scrollOffset.x) {
                        leftPosition = scrollOffset.x - xy.x;
                    }
                }
                else {
                    // Don't go offscreen right.
                    if (xy.x > windowSize.width + scrollOffset.x - this.pianoWidth_) {
                        leftPosition -= xy.x - (windowSize.width + scrollOffset.x - this.pianoWidth_) + 30;
                    }
                }
            }
            else {
                leftPosition = -document.getElementsByClassName('blocklyWidgetDiv')[0].offsetLeft; //+ ((windowSize.width - this.pianoWidth_) / 2);
                topPosition = windowSize.height - (this.keyHeight_ + this.labelHeight_ + this.prevNextHeight_) - document.getElementsByClassName('blocklyWidgetDiv')[0].offsetTop - borderBBox.height;
            }
            var octaveCounter = 0;
            var currentSelectedKey = null;
            var previousColor;
            //  save all changes in the same group of events
            Blockly.Events.setGroup(true);
            //  render piano keys
            for (var i = 0; i < this.nKeys_; i++) {
                if (i > 0 && i % 12 == 0)
                    octaveCounter++;
                var key = piano[i];
                var bgColor = this.getBgColor_(i);
                var width = this.getKeyWidth_(i);
                var height = this.getKeyHeight_(i);
                var position = this.getPosition_(i);
                //  modify original position in pagination
                if (pagination && i >= 12)
                    position -= 7 * octaveCounter * this.keyWidth_;
                var style = this.getKeyStyle_(bgColor, width, height, position + leftPosition, topPosition, this.isWhite_(i) ? 1000 : 1001, this.isWhite_(i) ? this.colour_ : "black", mobile);
                key.setContent(style);
                key.setId(this.noteName_[i]);
                key.render(pianoDiv);
                var script = key.getContent();
                script.setAttribute("tag", this.noteFreq_[i].toString());
                //  highlight current selected key
                if (Math.abs(this.noteFreq_[i] - Number(this.getValue())) < this.eps_) {
                    previousColor = script.style.backgroundColor;
                    script.style.backgroundColor = this.selectedKeyColor_;
                    currentSelectedKey = key;
                }
                //  Listener when a new key is selected
                goog.events.listen(key.getElement(), goog.events.EventType.MOUSEDOWN, function () {
                    AudioContextManager.stop();
                    var cnt = ++thisField.soundingKeys_;
                    var freq = this.getContent().getAttribute("tag");
                    var script;
                    if (currentSelectedKey != null) {
                        script = currentSelectedKey.getContent();
                        script.style.backgroundColor = previousColor;
                    }
                    script = this.getContent();
                    if (currentSelectedKey !== this)
                        previousColor = script.style.backgroundColor;
                    currentSelectedKey = this;
                    script.style.backgroundColor = thisField.selectedKeyColor_;
                    thisField.setValue(freq);
                    thisField.setText(freq);
                    Blockly.FieldTextInput.htmlInput_.value = thisField.getText();
                    AudioContextManager.tone(freq, 1);
                    Blockly.FieldNote.superClass_.dispose.call(this);
                    setTimeout(function () {
                        // compare current sound counter with listener sound counter (avoid async problems)
                        if (thisField.soundingKeys_ == cnt)
                            AudioContextManager.stop();
                    }, 500);
                }, false, key);
                //  Listener when the mouse is over a key
                goog.events.listen(key.getElement(), goog.events.EventType.MOUSEOVER, function () {
                    var script = showNoteLabel.getContent();
                    script.innerText = this.getId();
                    this.labelHeight_ = document.getElementsByClassName('blocklyNoteLabel')[0].offsetHeight;
                }, false, key);
                //  increment white key counter
                if (this.isWhite_(i))
                    this.whiteKeyCounter_++;
                // set octaves different from first octave invisible
                if (pagination && i > 11)
                    key.setVisible(false);
            }
            //  render note label
            var showNoteLabel = new goog.ui.ColorButton();
            var showNoteStyle = this.getShowNoteStyle_(topPosition, leftPosition, mobile);
            showNoteLabel.setContent(showNoteStyle);
            showNoteLabel.render(pianoDiv);
            var scriptLabel = showNoteLabel.getContent();
            scriptLabel.innerText = '-';
            this.labelHeight_ = document.getElementsByClassName('blocklyNoteLabel')[0].offsetHeight;
            // create next and previous buttons for pagination
            var prevButton = new goog.ui.ColorButton();
            var nextButton = new goog.ui.ColorButton();
            var prevButtonStyle = this.getNextPrevStyle_(topPosition, leftPosition, true, mobile);
            var nextButtonStyle = this.getNextPrevStyle_(topPosition, leftPosition, false, mobile);
            if (pagination) {
                scriptLabel.innerText = 'Octave #1';
                this.labelHeight_ = document.getElementsByClassName('blocklyNoteLabel')[0].offsetHeight;
                //  render previous button
                var script = void 0;
                prevButton.setContent(prevButtonStyle);
                prevButton.render(pianoDiv);
                script = prevButton.getContent();
                //  left arrow - previous button
                script.innerText = '<';
                //  render next button
                nextButton.setContent(nextButtonStyle);
                nextButton.render(pianoDiv);
                script = nextButton.getContent();
                //  right arrow - next button
                script.innerText = '>';
                var Npages_1 = this.nKeys_ / 12;
                var currentPage_1 = 0;
                goog.events.listen(prevButton.getElement(), goog.events.EventType.MOUSEDOWN, function () {
                    if (currentPage_1 == 0) {
                        scriptLabel.innerText = 'Octave #' + (currentPage_1 + 1);
                        return;
                    }
                    var curFirstKey = currentPage_1 * 12;
                    var newFirstKey = currentPage_1 * 12 - 12;
                    //  hide current octave
                    for (var i = 0; i < 12; i++)
                        piano[i + curFirstKey].setVisible(false);
                    //  show new octave
                    for (var i = 0; i < 12; i++)
                        piano[i + newFirstKey].setVisible(true);
                    currentPage_1--;
                    scriptLabel.innerText = 'Octave #' + (currentPage_1 + 1);
                    this.labelHeight_ = document.getElementsByClassName('blocklyNoteLabel')[0].offsetHeight;
                }, false, prevButton);
                goog.events.listen(nextButton.getElement(), goog.events.EventType.MOUSEDOWN, function () {
                    if (currentPage_1 == Npages_1 - 1) {
                        scriptLabel.innerText = 'Octave #' + (currentPage_1 + 1);
                        return;
                    }
                    var curFirstKey = currentPage_1 * 12;
                    var newFirstKey = currentPage_1 * 12 + 12;
                    //  hide current octave
                    for (var i = 0; i < 12; i++)
                        piano[i + curFirstKey].setVisible(false);
                    //  show new octave
                    for (var i = 0; i < 12; i++)
                        piano[i + newFirstKey].setVisible(true);
                    currentPage_1++;
                    scriptLabel.innerText = 'Octave #' + (currentPage_1 + 1);
                    this.labelHeight_ = document.getElementsByClassName('blocklyNoteLabel')[0].offsetHeight;
                }, false, nextButton);
            }
        };
        /**
         * Close the note picker if this input is being deleted.
         */
        FieldNote.prototype.dispose = function () {
            Blockly.WidgetDiv.hideIfOwner(this);
            Blockly.FieldTextInput.superClass_.dispose.call(this);
        };
        return FieldNote;
    }(Blockly.FieldNumber));
    Blockly.FieldNote = FieldNote;
})(Blockly || (Blockly = {}));

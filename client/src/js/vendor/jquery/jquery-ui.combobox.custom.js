/*
*	jQueryUI.Combobox, v1.0.7
*	(c) 2015–2017 Artyom "Sleepwalker" Fedosov <mail@asleepwalker.ru>
*	https://github.com/asleepwalker/jquery-ui.combobox
*
*	Original from NPM 1.0.7
* 	Modified by Neil Smith, DLS to incorporate changes made to earlier vendor copy
* 	Added value method and pass classes into each item
*/

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if (typeof module === 'object' && module.exports) {
		module.exports = function (root, jQuery) {
			if (jQuery === undefined) {
				if (typeof window !== 'undefined') {
					jQuery = require('jquery');
				} else {
					jQuery = require('jquery')(root);
				}
			}
			factory(jQuery);
			return jQuery;
		};
	} else {
		factory(jQuery);
	}
}(function ($) {

	$.widget('custom.combobox', {
		_create: function () {
			this.wrapper = $('<div>')
				.addClass('ui-combobox')
				.insertAfter(this.element);
			this.element.hide();
			this._createAutocomplete();
			this._createShowAllButton();
		},
		_createAutocomplete: function () {
			var selected = this.element.children(':selected');
			var value = selected.val() ? selected.text() : '';

			this.input = $('<input>')
				.appendTo(this.wrapper)
				.val(value)
				.attr('title', '')
				.addClass('ui-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left')
				.autocomplete({
					delay: 0,
					minLength: 0,
					source: $.proxy(this, '_source')
				});
			// Our items have HTML tags.  The default rendering uses text()
			// to set the content of the <a> tag.  We need html().
			this.input.data( "ui-autocomplete" )._renderItem = function( ul, item ) {
                return $( "<li>" )
                            .addClass(item.class)
							.append( $( "<a>" ).html( item.label+'' ) )
							.appendTo( ul );

			};
			this._on(this.input, {
				autocompleteselect: function (event, ui) {
					var input = this.input;

					input.removeClass('ui-input-invalid');
					ui.item.option.selected = true;
					this._trigger('select', event, {
						item: ui.item.option
					});
					setTimeout(function () {
						input.blur();
					}, 1);
				},
				focus: function () {

					// Make input empty but still keep visible previous value
					this.input
						.attr('placeholder', this.input.val())
						.val('');

					// Pass empty string as value to search for, displaying all results
					this.input.autocomplete('search', '');
				},
				blur: function () {

					// Restore previous value if another wasn't typed
					if (this.input.val() === '') {
						this.input.val(this.input.attr('placeholder'));
					}
					this._removeIfInvalid();
					this.element.trigger('change');
				}
			});
		},
		_createShowAllButton: function () {
			var input = this.input;
			var wasOpen = false;

			$('<span>')
				.addClass('ui-icon ui-icon-triangle-1-s')
				.attr('tabIndex', -1)
				.appendTo(this.wrapper)
				.click(function () {
					input.focus();
				});
		},
		_source: function (request, response) {
			var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), 'i');
			response(this.element.children('option').map(function () {
				var text = $(this).text();
				if (this.value && (!request.term || matcher.test(text))) {
					// Concatenate the classes passed into this combobox
					var classes = []
					_.each(this.className.split(/\s+/), function(v) {
						classes.push(v)
					})

					return {
						label: text,
						value: text,
						option: this,
						class: classes.join(' ')
					};
				}
			}));
		},
		_removeIfInvalid: function (event, ui) {
			this.input.removeClass('ui-input-invalid');

			// Selected an item, nothing to do
			if (ui && ui.item) {
				return;
			}

			// Search for a match (case-insensitive)
			var value = this.input.val();
			var valueLowerCase = value.toLowerCase();
			var valid = false;

			this.element.children('option').each(function () {
				if ($(this).text().toLowerCase() === valueLowerCase) {
					this.selected = valid = true;
					return false;
				}
			});

			// Found a match, nothing to do
			if (valid) {
				return;
			}

			// Remove invalid value
			this.element.val('');
			this.input.autocomplete('instance').term = '';
			this.input.addClass('ui-input-invalid');
		},

		// New Method added from earlier vendor copy
		value: function ( newVal ) {
			var select = this.element,
				valid = false,
				selected;
   
			if ( !arguments.length ) {
			   selected = select.children( ":selected" );
			   return selected.length > 0 ? selected.val() : null;
			}
   
			select.prop('selectedIndex', -1);
			select.children('option').each(function() {
				  if ( this.value == newVal ) {
					 this.selected = valid = true;
					 return false;
				  }
			   });
   
			if ( valid ) {
			   this.input.val(select.children(':selected').text());
			} else {
			   this.input.val( "" );
			   this.element.prop('selectedIndex', -1);
			}
   
		 },

		_destroy: function () {
			this.wrapper.remove();
			this.element.show();
		}
	});

}));

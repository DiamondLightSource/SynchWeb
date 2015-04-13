define(['jquery', 'jquery-ui','jquery-ui.combobox'], function($) {

    /*
     Methods to build form fields
    */
    return {
        
        
        date: function(selector) {
            this.$el.find(selector).datepicker({ dateFormat: "dd-mm-yy" });
        },
        
        combobox: function(options) {
          options.selector.combobox({
            invalid: options.invalid
          })
        },
    }

})
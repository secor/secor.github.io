
module.exports.register = function (Handlebars, options)  { 
    Handlebars.registerHelper('partial', function(name) {
        return Handlebars.partials[name];
    });
};

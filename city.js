var db = require('./db');

var City = function (params) {
    var self = this;

    this.name = params.name;
    this.country = params.country;

    this.save = function (cb) {
        self.createCountry(function (country) {
            self.country = country.name;
            db(
                'INSERT INTO `city` SET ?',
                {
                    'name'     : self.name,
                    'country'     : self.country,
                },
                function () {
                    cb(self);
                }
            );
        });
    };

    this.createCountry = function(cb) {
        require('./country').find(self.country, function(country){
            country.save(function () {
                cb(country);    
            });
        });
    };
};

City.find = function (name, cb) {
    //TODO implementar as chamadas pro geonames
    if(name){
        require('./get')(
            "http://api.geonames.org/search?username=augustomorgan&maxRows=1&type=json&q="+name,
            function (places) {
                places = places.geonames[0];
                var  city = new City({
                        name : places.name,
                        country : places.countryName
                    });
                cb(city);
            });
    }
    else cb(null)
};


module.exports = City;
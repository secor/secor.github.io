
var app = angular.module(
    'app', [
        'ui.router', 
        'ngAnimate'
        ]
    )
.run(['$rootScope', '$state', '$stateParams',function ($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            // grab some DOM elements
            $rootScope.gallery = document.getElementById('gallery');
            $rootScope.galleryWrap = document.getElementById('gallery-wrap');
            $rootScope.galleryInterval = 0;

            Math.easeInOutQuad = function (t, b, c, d) {
                t /= d/2;
                if (t < 1) return c/2*t*t + b;
                t--;
                return -c/2 * (t*(t-2) - 1) + b;
            };

            $rootScope.prefix = function($e, val) {
                $e.style.webkitTransform = val;
                $e.style.mozTransform = val;
                $e.style.msTransform = val;
                $e.style.transform = val;
            };

            $rootScope.scrollTo = function(element, to, duration) {
                var start = element.scrollLeft,
                    change = to - start,
                    currentTime = 0,
                    increment = 20;

                var animateScroll = function(){        
                    currentTime += increment;
                    var val = Math.easeInOutQuad(currentTime, start, change, duration);                        
                    element.scrollLeft = val; 
                    if(currentTime < duration) {
                        setTimeout(animateScroll, increment);
                    }
                };
                animateScroll();
            };
        }
    ])
.config(['$stateProvider', '$urlRouterProvider', '$logProvider', '$interpolateProvider', function($stateProvider, $urlRouterProvider, $logProvider, $interpolateProvider) {

    // to use handlebars with angular
    $interpolateProvider.startSymbol('{%');
    $interpolateProvider.endSymbol('%}');

    $urlRouterProvider.otherwise('/');

    $stateProvider.state('gallery', {
        label: 'Gallery',
        url: '/',
        controller: 'galleryController'
    });

    var detail_states = [
        'about-me',
        'the-web-is-inefficient',
        'illustrating-opower',
        'solve-problems-in-your-sleep',
        'figure-drawing',
        'social-responsibilities-of-interaction-designers',
        'opower-ux-team-site'
    ];

    for (var i = 0; i < detail_states.length; i++) {
        $stateProvider.state(detail_states[i], {
            label: detail_states[i],
            url: '/'+detail_states[i],
            type: 'article',
            templateUrl: 'public/app/partials/'+detail_states[i]+'.html',
            controller: 'articleController'
        });
    }

    $logProvider.debugEnabled(true);

}]);

app.service('sharedVariables', function(){
    activeGalleryItem = null;
    launchFromGallery = false;
    windowWidth = 0;
    windowHeight = 0;
    mobile = true;
});

app.controller('galleryController', ['$scope','$window','$state','$timeout','$interval','sharedVariables', function(
    $scope,
    $window,
    $state,
    $timeout,
    $interval,
    sharedVariables
    ){

    $scope.$on('$stateChangeStart', function(event){ 
        $interval.cancel($scope.galleryInterval);
    });

    if (sharedVariables.mobile) {
        $scope.prefix($scope.galleryWrap, 'translate3d(0,0,0)');
    } else if (sharedVariables.activeGalleryItem && sharedVariables.activeGalleryItem.offsetLeft >= sharedVariables.galleryWidth/3) {
        $scope.prefix($scope.galleryWrap, 'translate3d(-'+sharedVariables.galleryPosition+'px,0,0)');
    }
    // remove the lock so we can scan the gallery
    $timeout(function(){
        $scope.galleryWrap.classList.remove('lock');
    },1000);
    if (sharedVariables.activeGalleryItem) {
        sharedVariables.activeGalleryItem.style.width = '';
    }

}]);


app.controller('articleController', ['$scope','$window','$state','$timeout','$interval','sharedVariables', function(
    $scope,
    $window,
    $state,
    $timeout,
    $interval,
    sharedVariables
    ){

    var articleLink = document.getElementById($state.current.label),
        article = document.getElementById('article-'+$state.current.label),
        offset = articleLink.offsetLeft,
        onTheRight = (offset > sharedVariables.galleryWidth/2) ? true : false,
        adjOffset = (onTheRight) ? offset-sharedVariables.windowWidth+300 : offset,
        moveTimeout = (onTheRight) ? 400 : 0,
        growTimeout = (onTheRight) ? 0 : 400;

    sharedVariables.activeGalleryItem = articleLink;

    $scope.galleryWrap.classList.add('lock');
    $interval.cancel($scope.galleryInterval);

    $timeout(function(){
        if (!sharedVariables.mobile) {
            $scope.prefix($scope.galleryWrap, 'translate3d(-'+offset+'px,0,0)');
        } else {
            $scope.scrollTo($scope.gallery, offset, 200);
        }
    },moveTimeout);

    $timeout(function(){
        articleLink.style.width = sharedVariables.windowWidth+'px';
        article.classList.add('active');
    },growTimeout);

}]);


app.directive('jsGallery', ['$timeout', '$interval', '$window', 'sharedVariables', function($timeout, $interval, $window, sharedVariables) {
    return {
        restrict: 'A',
        link: function ($scope, element, attrs) {

            $scope.galleryEvents = function() {
                if (!sharedVariables.mobile) {
                    var $gallery        = element[0],
                        galleryW        = sharedVariables.windowWidth,
                        gallerySW       = $gallery.scrollWidth,
                        wDiff  = (gallerySW/galleryW)-1,  // widths difference ratio
                        mPadd  = 200, // Mousemove Padding
                        damp   = 20,  // Mousemove response softness
                        mX     = 0,   // Real mouse position
                        mX2    = 0,   // Modified mouse position
                        posX   = 0,
                        mmAA   = galleryW-(mPadd*2), // The mousemove available area
                        mmAAr  = (galleryW/mmAA);    // get available mousemove fidderence ratio

                    element.bind('mousemove', function(event) {
                        mX = event.pageX - $gallery.offsetLeft;
                        mX2 = Math.min( Math.max(0, mX-mPadd), mmAA ) * mmAAr;
                        // add a lock so we can't scan the gallery
                        locked = $scope.galleryWrap.classList.contains('lock');
                        // move the gallery
                        if (!$scope.galleryInterval && !locked) {
                            $scope.galleryInterval = $interval(function(){
                                posX += (mX2 - posX) / damp; // zeno's paradox equation "catching delay" 
                                sharedVariables.galleryPosition = posX*wDiff;
                                $scope.prefix($scope.galleryWrap, 'translate3d(-'+sharedVariables.galleryPosition+'px,0,0)');
                            },10);
                        }
                    });
                    // remove the gallery scroll interval, so it stops moving and repainting
                    element.bind('mouseleave', function(event) {
                       $interval.cancel($scope.galleryInterval);
                       $scope.galleryInterval = 0;
                    });
                }
            };
        
            $scope.galleryWrap.style.width = '';

            $timeout(function(){
                $scope.galleryEvents();
            },200);
        }
    };
}]);

app.directive('jsLaunch', ['$timeout', '$interval', 'sharedVariables', function ($timeout, $interval, sharedVariables) {
    return {
        restrict: 'A',
        link: function ($scope, element, attrs) {
            element.bind('click', function(event) {

            sharedVariables.launchFromGallery = true;
                
            });
        }
    };
}]);

app.directive('resize', ['$window', 'sharedVariables', function ($window, sharedVariables) {
    return function (scope, element, attr) {

        var w = angular.element($window);
        scope.$watch(function () {
            return {
                'h': w[0].innerHeight, 
                'w': w[0].innerWidth
            };
        }, function (newValue) {
            sharedVariables.windowHeight = newValue.h;
            sharedVariables.windowWidth = newValue.w;
            sharedVariables.mobile = (sharedVariables.windowWidth <= 600) ? true : false;
            sharedVariables.galleryWidth = scope.galleryWrap.clientWidth;

            scope.resizeHeight = function(offsetH) {
                scope.$eval(attr.notifier);
                return { 
                    'height': (newValue.h - offsetH) + 'px'
                };
            };

        }, true);

        w.bind('resize', function() {
            scope.$apply();
        });
    };
}]); 

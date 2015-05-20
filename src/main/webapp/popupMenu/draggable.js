var draggableModule = angular.module('draggable', [ 'ngCookies' ]);

draggableModule.directive('draggable', [ '$cookies', '$rootScope', 'menuPositionCalculator', function($cookies, $rootScope, menuPositionCalculator) {
	return {
		scope : true,
		link : function(scope, element, attrs) {
			$('img').on('dragstart', function(event) {
				event.preventDefault();
			});

			var lastTop = $cookies['lastTop'];
			var lastLeft = $cookies['lastLeft'];

			$(element).css({
				'z-index' : 0,
				'position' : 'fixed',
				'top' : parseFloat(lastTop),
				'left' : parseFloat(lastLeft),
				'cursor' : 'pointer'
			});
			var mc = new Hammer.Manager(element[0]);
			mc.add(new Hammer.Pan({
				direction : Hammer.DIRECTION_ALL
			}));
			mc.add(new Hammer.Tap());
			var startTop = 0;
			var startLeft = 0;
			var limitTop = $(window).height() - (menuPositionCalculator.getCenterOffsetY() * 2);
			var limitLeft = $(window).width() - (menuPositionCalculator.getCenterOffsetX() * 2);
			mc.on('panstart', function(ev) {
				var position = $(element).position();
				limitTop = $(window).height() - (menuPositionCalculator.getCenterOffsetY() * 2);
				limitLeft = $(window).width() - (menuPositionCalculator.getCenterOffsetX() * 2);
				startTop = position.top;
				startLeft = position.left;
			});
			mc.on('panmove', function(ev) {
				$(element).css({
					'cursor' : 'move'
				});
				var offsetTop = startTop + ev.deltaY;
				var offsetLeft = startLeft + ev.deltaX;
				offsetTop = offsetTop < 0 ? 0 : offsetTop;
				offsetLeft = offsetLeft < 0 ? 0 : offsetLeft;
				offsetTop = offsetTop > limitTop ? limitTop : offsetTop;
				offsetLeft = offsetLeft > limitLeft ? limitLeft : offsetLeft;
				$(element).offset({
					top : offsetTop,
					left : offsetLeft
				});
			});
			mc.on('panend', function(ev) {
				$(element).css({
					'cursor' : 'pointer'
				});
				var targetTop = startTop + ev.deltaY - (ev.velocityY * 150);
				var targetLeft = startLeft + ev.deltaX - (ev.velocityX * 150);
				targetTop = targetTop < 0 ? 0 : targetTop;
				targetLeft = targetLeft < 0 ? 0 : targetLeft;
				targetTop = targetTop > limitTop ? limitTop : targetTop;
				targetLeft = targetLeft > limitLeft ? limitLeft : targetLeft;
				$(element).animate({
					top : targetTop,
					left : targetLeft
				}, '500', 'easeOutCirc');
				$cookies['lastTop'] = targetTop;
				$cookies['lastLeft'] = targetLeft;
				scope.$apply();
			});
			mc.on('tap', function() {
				$rootScope.$broadcast('menuSwitch', true);
			});
		}
	};
} ]);
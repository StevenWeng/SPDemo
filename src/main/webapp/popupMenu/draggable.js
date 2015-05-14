var draggableModule = angular.module('sp.draggable', [ 'ngCookies' ]);

draggableModule.directive('draggable', [ '$cookieStore', '$rootScope', function($cookieStore, $rootScope) {
	return {
		scope : true,
		controller : [ '$scope', '$element', function($scope, $element) {
			$('img').on('dragstart', function(event) {
				event.preventDefault();
			});

			var lastTop = $cookieStore.get('lastTop');
			var lastLeft = $cookieStore.get('lastLeft');

			$(window).on('beforeunload', function() {
				var position = $($element).position();
				$cookieStore.put('lastTop', position.top);
				$cookieStore.put('lastLeft', position.left);
			});

			$($element).css({
				'z-index' : 0,
				'position' : 'fixed',
				'top' : lastTop,
				'left' : lastLeft,
				'cursor' : 'pointer'
			});
			var mc = new Hammer.Manager($element[0]);
			mc.add(new Hammer.Pan({
				direction : Hammer.DIRECTION_ALL
			}));
			mc.add(new Hammer.Tap());
			var startTop = 0;
			var startLeft = 0;
			var limitTop = $(window).height() - 50;
			var limitLeft = $(window).width() - 50;
			mc.on('panstart', function(ev) {
				var position = $($element).position();
				limitTop = $(window).height() - 50;
				limitLeft = $(window).width() - 50;
				startTop = position.top;
				startLeft = position.left;
			});
			mc.on('panmove', function(ev) {
				$($element).css({
					'cursor' : 'move'
				});
				var offsetTop = startTop + ev.deltaY;
				var offsetLeft = startLeft + ev.deltaX;
				offsetTop = offsetTop < 0 ? 0 : offsetTop;
				offsetLeft = offsetLeft < 0 ? 0 : offsetLeft;
				offsetTop = offsetTop > limitTop ? limitTop : offsetTop;
				offsetLeft = offsetLeft > limitLeft ? limitLeft : offsetLeft;
				$($element).offset({
					top : offsetTop,
					left : offsetLeft
				});
			});
			mc.on('panend', function(ev) {
				$($element).css({
					'cursor' : 'pointer'
				});
				var targetTop = startTop + ev.deltaY - (ev.velocityY * 150);
				var targetLeft = startLeft + ev.deltaX - (ev.velocityX * 150);
				targetTop = targetTop < 0 ? 0 : targetTop;
				targetLeft = targetLeft < 0 ? 0 : targetLeft;
				targetTop = targetTop > limitTop ? limitTop : targetTop;
				targetLeft = targetLeft > limitLeft ? limitLeft : targetLeft;
				$($element).animate({
					top : targetTop,
					left : targetLeft
				}, '500', 'easeOutCirc');
			});
			var isMenuShow = false;
			mc.on('tap', function() {
				isMenuShow = !isMenuShow;
				$rootScope.$broadcast('menuSwitch', isMenuShow);
			});
		} ]
	};
} ]);
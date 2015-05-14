var popupMenuModule = angular.module('sp.popupMenu', [ 'ngAnimate' ]);

popupMenuModule.provider('menu', [ function() {
	var menuInstanceMap = {};
	this.addMenu = function(name, items) {
		menuInstanceMap[name] = items;
	};
	this.$get = [ function() {
		return {
			get : function(name) {
				return menuInstanceMap[name];
			}
		};
	} ];
} ]);

popupMenuModule.factory('menuPositionCalculator', [ function() {
	var itemOffsetX = 0;
	var itemOffsetY = 0;
	var centerOffsetX = 0;
	var centerOffsetY = 0;
	return {
		setItemOffset : function(x, y) {
			itemOffsetX = x;
			itemOffsetY = y;
		},
		setCenterOffset : function(x, y) {
			centerOffsetX = x;
			centerOffsetY = y;
		},
		circlePositions : function(r, count, startAngle) {
			if (typeof (startAngle) == "undefined") {
				startAngle = 0;
			}
			var eachAngle = 360.0 / count;
			var positions = [];
			var startPos = [ r, 0 ];
			for (var i = 0; i < count; i++) {
				var angle = (eachAngle * i) + startAngle;
				var radian = angle * (Math.PI / 180.0);
				var m = math.matrix([ [ Math.cos(radian), -Math.sin(radian) ], [ Math.sin(radian), Math.cos(radian) ] ]);
				var pos = math.multiply(m, startPos);
				pos = math.add(pos, [ centerOffsetX - itemOffsetX, centerOffsetY - itemOffsetY ]);
				positions.push(pos._data);
			}
			return positions;
		}
	};
} ]);

popupMenuModule.directive('popupMenu', [ '$compile', '$animate', 'menu', 'menuPositionCalculator', 'eventChannelService', function($compile, $animate, menu, menuPositionCalculator, eventChannelService) {
	return {
		controller : [ '$scope', function($scope) {
			var eventTerminal = eventChannelService.createTerminal($scope);
			$scope.testClick = function(name) {
				console.log(name + ' click!');
				eventTerminal.broadcast('changeLayout', 'la_' + name, 'fade');
			};
		} ],
		link : function(scope, element, attrs) {
			$(element).css({
				'opacity' : 0
			});
			$(element).hide();
			var menuBgTemplate = '<div></div>';
			var menuBgElement = $compile(menuBgTemplate)(scope);
			$(menuBgElement).css({
				'z-index' : -1,
				'top' : -45,
				'left' : -45,
				'height' : 140,
				'width' : 140,
				'background-color' : 'gray',
				'position' : 'absolute',
				'border-radius' : '70px',
				'-moz-border-radius' : '70px',
				'-webkit-border-radius' : '70px',
				'opacity' : 0.5
			});
			$(element).append(menuBgElement);
			var menuName = attrs.popupMenu;
			var menuItems = menu.get(menuName);
			menuPositionCalculator.setCenterOffset(25, 25);
			menuPositionCalculator.setItemOffset(5, 9);
			var itemsPos = menuPositionCalculator.circlePositions(50, menuItems.length, -30);
			angular.forEach(menuItems, function(menuItem, index) {
				var itemTemplate = '<a ng-click="testClick(\'' + menuItem.text + '\')" href="#">' + menuItem.text + '</a>';
				var itemElement = $compile(itemTemplate)(scope);
				$(itemElement).css({
					'z-index' : 10,
					'position' : 'absolute',
					'left' : itemsPos[index][0],
					'top' : itemsPos[index][1]
				});
				$(element).append(itemElement);
			});

			scope.$on('menuSwitch', function(e, isShow) {
				if (isShow) {
					$(element).show();
					$animate.addClass(element, 'menu-show');
				} else {
					$animate.removeClass(element, 'menu-show', function() {
						$(element).hide();
					});
				}
			});
		}
	};
} ]);

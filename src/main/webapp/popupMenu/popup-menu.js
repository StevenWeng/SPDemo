var popupMenuModule = angular.module('sp.popupMenu', [ 'ngAnimate' ]);

var MenuInstance = function() {
	var self = this;
	var instance = [];

	self.addItem = function(template, onckick) {
		instance.push({
			'temp' : template,
			'onclick' : onckick
		});
	};

	self.addSubMenu = function(template, menuName, menu) {
		instance.push({
			'temp' : template,
			'name' : menuName,
			'sub' : menu
		});
	};

	self.getInstance = function() {
		return instance;
	};
};

popupMenuModule.provider('menu', [ function() {
	var menuInstanceMap = {};
	this.$get = [ function() {
		return {
			get : function(name) {
				return menuInstanceMap[name];
			},
			createMenu : function() {
				return new MenuInstance();
			},
			addMenu : function(name, menu) {
				menuInstanceMap[name] = menu;
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

popupMenuModule.directive('popupMenu', [ '$compile', '$q', '$animate', 'menu', 'menuPositionCalculator', function($compile, $q, $animate, menu, menuPositionCalculator) {
	return {
		controller : [ '$scope', function($scope) {
			$scope.buildMenu = function(menu) {
				var deferred = $q.defer();
				var menuElement = $compile('<div></div>')($scope);
				$(menuElement).css({
					'opacity' : 0
				});
				$(menuElement).hide();
				var menuBgTemplate = '<div></div>';
				var menuBgElement = $compile(menuBgTemplate)($scope);
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
				$(menuElement).append(menuBgElement);

				var menuItems = menu.getInstance();
				menuPositionCalculator.setCenterOffset(25, 25);
				menuPositionCalculator.setItemOffset(5, 9);
				var itemsPos = menuPositionCalculator.circlePositions(50, menuItems.length, -30);
				angular.forEach(menuItems, function(menuItem, index) {
					var itemTemplate = menuItem.temp;
					var itemElement = $compile(itemTemplate)($scope);
					$(itemElement).click(menuItem.onclick);
					$(itemElement).css({
						'z-index' : 10,
						'position' : 'absolute',
						'left' : itemsPos[index][0],
						'top' : itemsPos[index][1]
					});
					$(menuElement).append(itemElement);
				});
				deferred.resolve(menuElement); // TODO subMenuList
				// deferred.reject(reason);
				return deferred.promise;
			};

		} ],
		link : function(scope, element, attrs) {
			var buildSubMenu = function(parentMenuElement, subMenuList) {
				// TODO parentMenuElement 倒退要用
				// TODO forEach subMenuList
				// TODO scope.buildMenu(eachSubMenu) 
				// TODO then append to element and recursive build sub menus
			};
			var menuName = attrs.popupMenu;
			var mainMenu = menu.get(menuName);
			var mainMenuElement = null;
			scope.buildMenu(mainMenu).then(function(menuElement) {
				// TODO get subMenuList and call buildSubMenu
				mainMenuElement = menuElement;
				$(element).append(mainMenuElement);
			});

			scope.$on('menuSwitch', function(e, isShow) {
				if (isShow) {
					$(mainMenuElement).show();
					$animate.addClass(mainMenuElement, 'menu-show');
				} else {
					$animate.removeClass(mainMenuElement, 'menu-show', function() {
						$(mainMenuElement).hide();
					});
				}
			});
		}
	};
} ]);

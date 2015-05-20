var popupMenuModule = angular.module('popupMenu', [ 'ngAnimate' ]);

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
			'menu' : menu,
			'isSubMenu' : true
		});
	};

	self.getInstance = function() {
		return instance;
	};
};

popupMenuModule.provider('menuPositionCalculator', [ function() {
	var itemOffsetX = 0;
	var itemOffsetY = 0;
	var centerOffsetX = 0;
	var centerOffsetY = 0;
	var radius = 50;
	var angle = 0;

	this.setItemOffset = function(x, y) {
		itemOffsetX = x;
		itemOffsetY = y;
	};
	this.setCenterOffset = function(x, y) {
		centerOffsetX = x;
		centerOffsetY = y;
	};
	this.setRadius = function(r) {
		radius = r;
	};
	this.setAngle = function(a) {
		angle = a;
	};
	this.$get = [ function() {
		return {
			circlePositions : function(count) {
				var eachAngle = 360.0 / count;
				var positions = [];
				var startPos = [ radius, 0 ];
				for (var i = 0; i < count; i++) {
					var thisAngle = (eachAngle * i) + angle;
					var radian = thisAngle * (Math.PI / 180.0);
					var m = math.matrix([ [ Math.cos(radian), -Math.sin(radian) ], [ Math.sin(radian), Math.cos(radian) ] ]);
					var pos = math.multiply(m, startPos);
					pos = math.add(pos, [ centerOffsetX - itemOffsetX, centerOffsetY - itemOffsetY ]);
					positions.push(pos._data);
				}
				return positions;
			},
			getCircleMenuRadius : function() {
				var circleMenuRadius = radius + Math.sqrt(Math.pow(itemOffsetX, 2) + Math.pow(itemOffsetY, 2));
				return circleMenuRadius;
			},
			getCenterOffsetX : function() {
				return centerOffsetX;
			},
			getCenterOffsetY : function() {
				return centerOffsetY;
			}
		};
	} ];
} ]);

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

popupMenuModule.directive('menuIcon', [ function() {
	return {
		controller : [ '$element', function($element) {
			$($element).css({
				'opacity' : 0
			});
			$($element).addClass('icon-show');
			this.getIconElement = function() {
				return $element;
			};
		} ]
	};
} ]);

popupMenuModule.directive('popupMenu', [ '$compile', '$q', '$animate', 'menu', 'menuPositionCalculator', function($compile, $q, $animate, menu, menuPositionCalculator) {
	return {
		controller : [ '$scope', function($scope) {
			$scope.buildMenu = function(menu, onMenuBack) {
				var deferred = $q.defer();
				var menuElement = $compile('<div></div>')($scope);
				$(menuElement).css({
					'opacity' : 0,
					'height' : 0
				});
				$(menuElement).hide();
				var menuBgTemplate = '<div></div>';
				var menuBgElement = $compile(menuBgTemplate)($scope);
				var menuRadius = menuPositionCalculator.getCircleMenuRadius() + 10;
				var menuCenterOffsetX = menuPositionCalculator.getCenterOffsetX();
				var menuCenterOffsetY = menuPositionCalculator.getCenterOffsetY();
				$(menuBgElement).css({
					'z-index' : -1,
					'top' : menuCenterOffsetY - menuRadius,
					'left' : menuCenterOffsetX - menuRadius,
					'height' : menuRadius * 2,
					'width' : menuRadius * 2,
					'background-color' : 'gray',
					'position' : 'absolute',
					'border-radius' : menuRadius,
					'-moz-border-radius' : menuRadius,
					'-webkit-border-radius' : menuRadius,
					'opacity' : 0.5
				});
				$(menuElement).append(menuBgElement);

				var backBtn = $compile('<span class="glyphicon glyphicon-arrow-left"></span>')($scope);
				$(backBtn).css({
					'top' : menuCenterOffsetY - 8,
					'left' : menuCenterOffsetX - 7
				});
				$(backBtn).click(function() {
					onMenuBack.call(this);
				});
				$(menuElement).append(backBtn);

				var subMenuItemMap = {};
				var menuItems = menu.getInstance();
				var itemsPos = menuPositionCalculator.circlePositions(menuItems.length);
				angular.forEach(menuItems, function(menuItem, index) {
					var itemTemplate = menuItem.temp;
					var itemElement = $compile(itemTemplate)($scope);
					if (menuItem.isSubMenu === true) {
						menuItem.element = itemElement;
						subMenuItemMap[menuItem.name] = menuItem;
					} else {
						$(itemElement).click(menuItem.onclick);
					}
					$(itemElement).css({
						'z-index' : 10,
						'position' : 'absolute',
						'left' : itemsPos[index][0],
						'top' : itemsPos[index][1]
					});
					$(menuElement).append(itemElement);
				});
				deferred.resolve({
					'menuElement' : menuElement,
					'subMenuItemMap' : subMenuItemMap
				});
				// deferred.reject(reason);
				return deferred.promise;
			};

		} ],
		link : function(scope, element, attrs) {
			var buildSubMenu = function(parentMenuElement, subMenuItemMap) {
				angular.forEach(subMenuItemMap, function(subMenuItem, name) {
					var subMenuElement = null;
					var onSubMenuBack = function() {
						$(parentMenuElement).show();
						$animate.addClass(parentMenuElement, 'sub-menu-show');
						$animate.removeClass(subMenuElement, 'sub-menu-show', function() {
							$(subMenuElement).hide();
						});
					};
					scope.buildMenu(subMenuItem.menu, onSubMenuBack).then(function(resule) {
						subMenuElement = resule.menuElement;
						$(subMenuItem.element).click(function() {
							$(subMenuElement).show();
							$animate.addClass(subMenuElement, 'sub-menu-show');
							$animate.removeClass(parentMenuElement, 'sub-menu-show', function() {
								$(parentMenuElement).hide();
							});
						});
						$(element).append(resule.menuElement);
						buildSubMenu(resule.menuElement, resule.subMenuItemMap);
					});
				});
			};
			var menuName = attrs.popupMenu;
			var mainMenu = menu.get(menuName);
			var mainMenuElement = null;
			var onMainMenuBack = function() {
				scope.$broadcast('menuSwitch', false);
			};
			scope.buildMenu(mainMenu, onMainMenuBack).then(function(resule) {
				buildSubMenu(resule.menuElement, resule.subMenuItemMap);
				mainMenuElement = resule.menuElement;
				$(element).append(mainMenuElement);
			});

			var iconElement = $('img[menu-icon]');
			var isMenuShow = false;
			scope.$on('menuSwitch', function(e, show) {
				if (show && !isMenuShow) {
					$animate.removeClass(iconElement, 'icon-show', function() {
						$(iconElement).hide();
						isMenuShow = true;
					});
					$(mainMenuElement).show();
					$animate.addClass(mainMenuElement, 'menu-show');
				} else if (!show && isMenuShow) {
					$(iconElement).show();
					$animate.addClass(iconElement, 'icon-show');
					$animate.removeClass(mainMenuElement, 'menu-show', function() {
						$(mainMenuElement).hide();
						isMenuShow = false;
					});
				}
			});
		}
	};
} ]);

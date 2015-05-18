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
			'menu' : menu,
			'isSubMenu' : true
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
					'height': 0
				});
				$(menuElement).hide();
				var menuBgTemplate = '<div></div>';
				var menuBgElement = $compile(menuBgTemplate)($scope);
				$(menuBgElement).css({
					'z-index' : -1,
					'top' : -55,
					'left' : -55,
					'height' : 160,
					'width' : 160,
					'background-color' : 'gray',
					'position' : 'absolute',
					'border-radius' : '80px',
					'-moz-border-radius' : '80px',
					'-webkit-border-radius' : '80px',
					'opacity' : 0.5
				});
				$(menuElement).append(menuBgElement);

				var backBtn = $compile('<span class="glyphicon glyphicon-arrow-left"></span>')($scope);
				$(backBtn).css({
					'top' : 17,
					'left' : 17
				});
				$(backBtn).click(function() {
					onMenuBack.call(this);
				});
				$(menuElement).append(backBtn);

				var subMenuItemMap = {};
				var menuItems = menu.getInstance();
				menuPositionCalculator.setCenterOffset(25, 25);
				menuPositionCalculator.setItemOffset(9, 17);
				var itemsPos = menuPositionCalculator.circlePositions(50, menuItems.length, -30);
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

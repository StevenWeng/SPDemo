var popupMenuModule = angular.module('popupMenu', [ 'ngAnimate' ]);

/**
 * @ngdoc object
 * @name popupMenu.object:MenuInstance
 * @description
 * 選單資料結構實體。
 * 
 * 可透過 `menu.createMenu()` 取得。
 */
var MenuInstance = function() {
	var self = this;
	var instance = [];

	/**
	 * @ngdoc function
	 * @name addItem
	 * @methodOf popupMenu.object:MenuInstance
	 * @param {string} template item 按鈕的 html
	 * @param {function} onckick item onclick callback
	 * @description
	 * 增加選單 Item 。
	 * 
	 * <pre>
	 *	var popMenu = menu.createMenu();
	 *	popMenu.addItem('<a style="font-size: 24px;" href="#">index2</a>', function() {
	 *		location.href = 'index2.html';
	 *	});
	 * </pre>
	 */
	self.addItem = function(template, onckick) {
		instance.push({
			'temp' : template,
			'onclick' : onckick
		});
	};

	/**
	 * @ngdoc function
	 * @name addSubMenu
	 * @methodOf popupMenu.object:MenuInstance
	 * @param {string} template 子選單按鈕的 html
	 * @param {string} menuName 子選單按鈕的名稱
	 * @param {MenuInstance} menu 子選單按鈕的實體
	 * @description
	 * 增加子選單。
	 * 
	 * <pre>
	 *	var popMenu = menu.createMenu();
	 *	var subMenu = menu.createMenu();
	 *	subMenu.addItem('<a style="font-size: 24px;" href="#">index2</a>', function() {
	 *		location.href = 'index2.html';
	 *	});
	 *	popMenu.addSubMenu('<span style="font-size: 24px;" class="glyphicon glyphicon-option-horizontal"></span>', 'sub1', subMenu);
	 * </pre>
	 */
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

/**
 * @ngdoc service
 * @name popupMenu.service:menuPositionCalculatorProvider
 * @description
 * 設定選單之幾何位置參數。
 */
popupMenuModule.provider('menuPositionCalculator', [ function() {
	var itemOffsetX = 0;
	var itemOffsetY = 0;
	var centerOffsetX = 0;
	var centerOffsetY = 0;
	var radius = 50;
	var angle = 0;

	/**
	 * @ngdoc function
	 * @name setItemOffset
	 * @methodOf popupMenu.service:menuPositionCalculatorProvider
	 * @param {number} x item offset x
	 * @param {number} y item offset y
	 * @description
	 * 繪製 menu item 時的座標偏移量
	 * 
	 * 簡單來說 x 就是 item 的寬除以2， y 就是 item 的高除以 2 。 
	 */
	this.setItemOffset = function(x, y) {
		itemOffsetX = x;
		itemOffsetY = y;
	};

	/**
	 * @ngdoc function
	 * @name setCenterOffset
	 * @methodOf popupMenu.service:menuPositionCalculatorProvider
	 * @param {number} x center offset x
	 * @param {number} y center offset y
	 * @description
	 * 繪製 menu icon 時的座標偏移量
	 * 
	 * 簡單來說 x 就是 menu icon 的寬除以2， y 就是 menu icon 的高除以 2 。 
	 */
	this.setCenterOffset = function(x, y) {
		centerOffsetX = x;
		centerOffsetY = y;
	};

	/**
	 * @ngdoc function
	 * @name setRadius
	 * @methodOf popupMenu.service:menuPositionCalculatorProvider
	 * @param {number} r 選單半徑
	 * @description
	 * Item 中心到選單中心的距離。
	 */
	this.setRadius = function(r) {
		radius = r;
	};

	/**
	 * @ngdoc function
	 * @name setAngle
	 * @methodOf popupMenu.service:menuPositionCalculatorProvider
	 * @param {number} a 選單偏移角度
	 * @description
	 * Menu item 的偏移角度。
	 */
	this.setAngle = function(a) {
		angle = a;
	};

	/**
	 * @ngdoc service
	 * @name popupMenu.service:menuPositionCalculator
	 * @description
	 * 取得選單之幾何位置參數。
	 */
	this.$get = [ function() {
		return {
			/**
			 * @ngdoc function
			 * @name circlePositions
			 * @methodOf popupMenu.service:menuPositionCalculator
			 * @param {number} count 座標組的數量
			 * @return {Array} 環狀座標組陣列
			 * @description
			 * 計算環狀選單的 item 座標，產出的座標已經算過 offset 可以直接使用。
			 */
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
			/**
			 * @ngdoc function
			 * @name getCircleMenuRadius
			 * @methodOf popupMenu.service:menuPositionCalculator
			 * @return {number} 環狀選單半徑
			 * @description
			 * 計算環狀半徑，含 item 的寬高。
			 */
			getCircleMenuRadius : function() {
				var circleMenuRadius = radius + Math.sqrt(Math.pow(itemOffsetX, 2) + Math.pow(itemOffsetY, 2));
				return circleMenuRadius;
			},
			/**
			 * @ngdoc function
			 * @name getCenterOffsetX
			 * @methodOf popupMenu.service:menuPositionCalculator
			 * @return {number} center offset x
			 * @description
			 * 取得 menu icon 的 x 偏移量。
			 */
			getCenterOffsetX : function() {
				return centerOffsetX;
			},
			/**
			 * @ngdoc function
			 * @name getCenterOffsetY
			 * @methodOf popupMenu.service:menuPositionCalculator
			 * @return {number} center offset y
			 * @description
			 * 取得 menu icon 的 y 偏移量。
			 */
			getCenterOffsetY : function() {
				return centerOffsetY;
			}
		};
	} ];
} ]);

popupMenuModule.provider('menu', [ function() {
	var menuInstanceMap = {};
	/**
	 * @ngdoc service
	 * @name popupMenu.service:menu
	 * @description
	 * 選單的操作服務。
	 */
	this.$get = [ function() {
		return {
			/**
			 * @ngdoc function
			 * @name get
			 * @methodOf popupMenu.service:menu
			 * @param {string} name menu name
			 * @return {MenuInstance} 選單實體
			 * @description
			 * 取得 {@link popupMenu.object:MenuInstance MenuInstance} 選單實體。
			 */
			get : function(name) {
				return menuInstanceMap[name];
			},
			/**
			 * @ngdoc function
			 * @name createMenu
			 * @methodOf popupMenu.service:menu
			 * @return {MenuInstance} 選單實體
			 * @description
			 * 建立新的 {@link popupMenu.object:MenuInstance MenuInstance} 選單實體。
			 */
			createMenu : function() {
				return new MenuInstance();
			},
			/**
			 * @ngdoc function
			 * @name addMenu
			 * @methodOf popupMenu.service:menu
			 * @param {string} name menu name
			 * @param {MenuInstance} menu 選單實體
			 * @description
			 * 加入 {@link popupMenu.object:MenuInstance MenuInstance} 選單實體。
			 */
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

/**
 * @ngdoc directive
 * @name popupMenu.directive:popupMenu
 * @param {string} popup-menu menu name
 * @description
 * 
 * 設定此 tag ，就會依照 {@link popupMenu.service:menu menu} 中的設定，畫出選單。
 * 
 * 例如:
 * <pre>
 *	<div draggable>
 *		<img menu-icon src="../popupMenu/cis_circle.png" style="width: 50px;">
 *		<div popup-menu="menu1"></div>
 *	</div>
 * </pre>
 * 
 */
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
				// 遞迴建立子選單
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

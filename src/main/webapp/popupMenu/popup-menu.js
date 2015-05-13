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

popupMenuModule.directive('popupMenu', [ '$compile', 'menu', function($compile, menu) {
	return {
		controller : [ '$scope', '$element', '$attrs', function($scope, $element, $attrs) {
			var menuName = $attrs.popupMenu;
			var menuItems = menu.get(menuName);
			angular.forEach(menuItems, function(menuItem, index) {
				var itemTemplate = '<span>' + menuItem.text + '</span>';
				var itemElement = $compile(itemTemplate)($scope);
				// TODO 算 top and left
				$(itemElement).css({
					'position' : 'absolute'
				});
				$($element).append(itemElement);
			});
		} ],
		link : {

		}
	};
} ]);
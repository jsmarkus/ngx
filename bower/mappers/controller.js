var findParent = function($scope) {
  var parent = $scope.$parent;

  if (!angular.isObject($scope.$parent)) {
    console.error('Cannot find parent $scope for directive api');
  }

  if (!angular.isObject(parent.$ngx) || !angular.isFunction(parent.$ngx.api)) {
    parent = findParent(parent);
  }

  return parent;
};

var applyApi = function(Instance, $scope) {
  var parent = findParent($scope);

  parent.$ngx.api(Instance);
};

var initNgx = function($scope){
  $scope.$ngx = {};

  initApi($scope);
};

var initApi = function($scope) {
  $scope.$ngx.api = function(Instance) {
    $scope.$ngx.instance = Instance;
  };

  $scope.$ngx.get = function(key) {
    debugger
  }
};

var translate = function(controller, Api) {
  var AppController = controller.config.src;

  var src = function($scope, $injector, ...dependencies) {
    initNgx($scope);

    if (controller.config.defaults) {
      angular.extend($scope, controller.config.defaults);
    }

    if (angular.isObject(AppController)) {

      for (var attr in AppController) {
        $scope[attr] = AppController[attr];
      }

      /**
       * Get angular dependencies
       */
      $scope.get = function(name) {
        if (!$injector.has(name)) {
          throw new Error('Controller $injector: dependency is not registered: "' + name + '"');
        }

        return $injector.get(name);
      };

      if (angular.isFunction($scope.initialize)) {
        $scope.initialize.apply($scope, dependencies);
      }
    } else if (angular.isFunction(AppController)) {

      AppController.apply(null, [$scope].concat(dependencies));
    } else {
      throw new Error('Wrong controller.src type');
    }

    /**
     * TODO: isConstructor
     */
    if (angular.isFunction(Api)) {
      var apiInstance = new Api($scope);
      applyApi(apiInstance, $scope);
    }
  };

  /**
   * $scope and $injector are defaults
   */
  var di = ['$scope', '$injector'].concat(controller.config.dependencies);
  di.push(src);

  return di;
};


var register = function(controller) {
  var module_name = controller.module;

  if (!module_name) {
    throw new Error('System.Controller.Mapper: application name is not described');
  }

  if (!controller.config.src) {
    throw new Error('System.Controller.Mapper: controller source is not set');
  }

  angular.module(module_name)
      .controller(controller.name, translate(controller));
};

var ControllerMapper = function(components) {
  for (var component of components) {
    register(component);
  }
};

export default ControllerMapper;
export var ControllerTranslate = translate;

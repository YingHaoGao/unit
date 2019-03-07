const ajax = function (options, n) {
	n = !!n ? n : 0;

	var local = false;
	if(!!options.isLoacl){
		options.beforeSend = function(){
			local = new _Alert({
				isLoacl: true
			});
		}
	}

	var _success = options.success;
	options.success = function (res) {
		if(local){
			setTimeout(function(){
				local.hide();
			},300)
		}

		if(typeof res == 'string'){
			res = JSON.parse(res);
		}
		switch(res.code){
			case 40002:
				alert("系统繁忙，稍后重试");
				break;
			case 40005:
			case 40006:
				if(n < 2) {
					n++;
					options.apiToken = unit.getPaper();
					ajax(options, n);
				}else{
					alert("获取token出错，请刷新重试")
				}
				break;
			case 200:
			case 0:
			case 40112:
				!!_success && _success(res);
				break;
			default:
				let _alert = new _Alert({
					title: "错误",
					text: res.msg,
					button: "我知道了"
				});
				break;
		}
	};
	var _error = options.error;
	options.error = function (a, b, c){
		if(local){
			local.hide();
		}

		let _alert = new _Alert({
				title: "错误",
				text: '连接失败，请稍候重试',
				button: "我知道了"
			});
		!!_error && _error(a, b, c);
	};

	$.ajax(options);
}

const params = {
	appId : 'test',
	appSecret : 'test',
	// www: 'http://project.guyundata.com/',
	www: 'http://dfhbo2o.com:8686/',
	errorImg: "this.src='./img/error.png'"
};

const API = {
	/* 全局 */
	// 获取票据 post
	"getPaper" : params.www + "app/Index/getApiToken",

	/* 首页模块 */
	// 获取首页数据 post
	"getHomeData" : params.www + "app/AppIndex/getIndexData",
	// 获取分类下厂商数据 post
	"getFirmInfoData" : params.www + "app/AppIndex/getInfoData",
	// 搜索厂商数据接口 post
	"searchFirmList" : params.www + "app/AppIndex/searchListData",

	/* 新闻 */
	// 获取新闻列表数据 post
	"getNewsList" : params.www + "app/news/getNewsListData",
	// 获取新闻详情 post
	"getNewsInfo" : params.www + "app/news/getNewsInfo",
	
	/* 用户模块 */
	// 用户登陆接口
	"login" : params.www + "app/Login/login",
	// 用户注册接口
	"register" : params.www + "app/login/register",
	// 企业经营许可详情接口
	"getPermit" : params.www + "app/AppIndex/getEnterpriseInfo",

	/* 系统模块 */
	// 获取手机验证码
	"getMobileCode" : params.www + "app/System/getMobileCode",
	// 业务分类及编码
	"getCateAndCode" : params.www + "app/Common/getCateAndCode",
	// 业务分类
	"getCateClass" : params.www + "app/AppIndex/getCateClass",
	// 获取系统消息数据接口
	"massage" : params.www + "app/user/massage",
	// 获取系统消息详情接口
	"massageInfo" : params.www + "app/user/massageInfo",
	// 未读变已读
	"changeMessageStatus" : params.www + "app/user/changeMessageStatus",
	// 获取促销数据列表
	"getPromotion" : params.www + "app/AppIndex/getList",
	// 用户上传公用 name=file
	"user_upload" : params.www + "app/user/user_upload",

	/* 个人中心 */
	// 修改个人信息
	"informationSetup" : params.www + "app/PersonalCenter/informationSetup",
	// 用户修改头像接口
	"modifyHead" : params.www + "app/user/modifyHead",
	// 用户厂商认证
	"manufacturerCertification" : params.www + "app/user/manufacturerCertification",
	// 用户资质认证
	"qualificationCertification" : params.www + "app/Check/qualificationCertification",
	// 获取全国城市数据
	"getRegion" : params.www + "app/AppIndex/getRegion",
	// 获取用户详情
	"getUserInfo" : params.www + "app/User/getUserInfo",
	// 用户意见建议
	"feedback" : params.www + "app/user/feedback",

	/* 订单模块 */
	// 获取订单列表
	"getUserOrder" : params.www + "app/user/getUserOrder",
	// 发布订单
	"orderPush" : params.www + "app/user/orderPush",
	// "获取固废编码"
	"getCateCodeList" : params.www + "app/AppIndex/getCateCodeList"
};

const unit = {
	/**
	 * 
	 */
	hideFex () {
		setTimeout(function(){
			$('#bodyfix').animate({
			    opacity:'0'
			  }, function(){
			  	$('#bodyfix').remove();
			  });
		},300);
	},
	/**
	 * @Author   MuTong
	 * @DateTime 2019-01-02
	 * @return   {[type]}             [description]
	 */
	user_upload (file) {
		var user = unit.getUserToken();

		var form = new FormData();
		form.append('token', user.token);
		form.append('file', file);

		_ajax({
			url: API.user_upload,
			type: 'post',
            cache: false,
            contentType: false,
            processData: false,
			data: form,
			success(res) {
				return params.www + res.data.url
			}
		})
	},
	/**
	 * @Author   MuTong
	 * @DateTime 2019-01-02
	 * @return   {[type]}             [description]
	 */
	getPaper () {
		// var token = false;
		
		// ajax({
		// 	url: API.getPaper,
		// 	type: 'post',
		// 	dataType: "json",
		// 	isLoacl: true,
		// 	async: false,
		// 	data: {
		// 		appId: params.appId,
		// 		appSecret: params.appSecret
		// 	},
		// 	success (res) {
		// 		if(res.code === 0){
		// 			token = res.data.apiToken;
		// 			localStorage.setItem("_df_token", token);
		// 		}else{
		// 			console.log(res)
		// 		}
		// 	},
		// 	error (req) {
		// 		console.log(req)
		// 	}
		// });

		// return token;
	},
	/**
	 * @Author   MuTong
	 * @DateTime 2019-01-03
	 * @param    {[type]}   name [需要获取的key]
	 * @return   {[type]}        [与key匹配的值]
	 */
	getUrlParam (name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return decodeURI(r[2]); return null;
	},
	/**
	 * @Author   MuTong
	 * @name  	退回上一页
	 * @DateTime 2019-01-04
	 */
	pageBack () {
		window.history.go(-1);
	},
	/**
	 * @Author   MuTong
	 * @DateTime 2019-01-04
	 * @name   	 判断用户是否登录
	 * @return   {[string]}   [用户唯一标识]
	 */
	getUserToken () {
		var userToken = localStorage.getItem('_df_userToken');

		if(!!userToken){
			userToken = (typeof userToken == 'string' ? JSON.parse(userToken) : userToken);
			return userToken;
		}else{
			window.location.href = `./register_default.html`;
		}
	},
	/**
	 * @Author   MuTong
	 * @DateTime 2019-01-10
	 * @name     更新用户信息
	 * @param    {[Object]}   userInfo [用户信息]
	 * @return   {[Object]}            [更新后的用户信息]
	 */
	refreshUser (userInfo) {
		var user = JSON.parse(localStorage.getItem('_df_userToken'));

		if(!!user && (typeof userInfo == 'object')){
			$.each(userInfo, function(key, value){
				user[key] = value;
			});

			user = JSON.stringify(user);
			localStorage.setItem('_df_userToken', user);
			return JSON.parse(user);
		}
	},
	/**
	 * @Author   MuTong
	 * @DateTime 2019-01-04
	 * @name     登录
	 * @param    {[string]}   userToken [用户唯一标识]
	 */
	logIn (userToken) {
		if(!!userToken){
			userToken = (typeof userToken != 'string' ? JSON.stringify(userToken) : userToken);
			localStorage.setItem('_df_userToken', userToken);
			window.location.href = `./index.html`;
		}
	},
	/**
	 * @Author   MuTong
	 * @DateTime 2019-01-04
	 * @name     退出登录
	 */
	logOut () {
		localStorage.removeItem('_df_userToken');
		window.location.href = `./logIn.html`;
	},
	/**
	 * @Author   MuTong
	 * @DateTime 2019-01-07
	 * @name     [获取Sign 签名]
	 * @param    {[Object]}   params [上传参数]
	 * @return   {[string]}          [sign]
	 */
	getSign (params) {
		return undefined
		// if (typeof params == "string") {
	 //        return this._paramsStrSort(params);
	 //    } else if (typeof params == "object") {
	 //        var arr = [];
	 //        for (var i in params) {
	 //            arr.push((i + "=" + params[i]));
	 //        }
	 //        return this._paramsStrSort(arr.join(("&")));
	 //    }
	},
	_paramsStrSort (paramsStr) {
	    var url = paramsStr;
	    var urlStr = url.split("&").sort().join("&");
	    var newUrl = urlStr + params.appId;
	    return $.md5(newUrl);
	},
	/**
	 * @Author   MuTong
	 * @DateTime 2019-01-07
	 * @name     获取本地图片路径
	 * @param    {[Object]}   file [图片文件]
	 * @return   {[String]}        [图片本地地址]
	 */
	getObjectURL (file) {
		var url = null ;   
	      if (window.createObjectURL!=undefined) {  
	        url = window.createObjectURL(file) ;  
	      } else if (window.URL!=undefined) {   
	        url = window.URL.createObjectURL(file) ;  
	      } else if (window.webkitURL!=undefined) {  
	        url = window.webkitURL.createObjectURL(file) ;  
	      }  
	      return url;
	},
	/**
	 * @Author   MuTong
	 * @DateTime 2019-01-08
	 * @name     城市数据类型转换
	 * @param    {[Array]}   arr [后台返回的数据类型]
	 * @return   {[Array]}       [修正后的数据类型]
	 */
	cityListToggle (arr) {
		if($.isArray(arr)){
			arr.map(function(item){
				item.id = item.province_id;
				item.name = item.province;
				item.child = item.city || [];

				item.child.map(function(_item){
					_item.id = _item.city_id;
					_item.name = _item.city;
					_item.child = _item.area || [];

					_item.child.map(function(__item){
						__item.id = __item.area_id;
						__item.name = __item.area;
					})
				})
			})
		}

		return arr;
	},
	/**
	 * @Author   MuTong
	 * @DateTime 2019-01-11
	 * @param    XX年XX月XX日 转化为 XX-XX-XX
	 * @param    {[String]}   str [带有年月日的时间字符串]
	 * @return   {[type]}         [带有-的时间字符串]
	 */
	timeToggle (str) {
		var newStr = '';

		if(!!str && typeof str == 'string'){
			for(var i = 0; i < str.length; i++){
				if(str[i] == '年' || str[i] == '月'){
					newStr += '-'
				}else if(str[i] == '日'){

				}else{
					newStr += str[i];
				}
			}
		}else{
			newStr = str;
		}

		return newStr;
	}
};

window._API = API;
window._UNIT = unit;
window._ajax = ajax;
window._Params = params;
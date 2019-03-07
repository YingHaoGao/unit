const unit = {
	/**
	 * @Author   MuTong
	 * @name     获取地址中的参数
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
		if (typeof params == "string") {
	        return this._paramsStrSort(params);
	    } else if (typeof params == "object") {
	        var arr = [];
	        for (var i in params) {
	            arr.push((i + "=" + params[i]));
	        }
	        return this._paramsStrSort(arr.join(("&")));
	    }
	},
	_paramsStrSort (paramsStr) {
	    var url = paramsStr;
	    var urlStr = url.split("&").sort().join("&");
	    var newUrl = urlStr + params.appId;

	    if(!!$.md5){
	    	return $.md5(newUrl);
	    }else{
	    	console.error('需要安装 md5')
	    }
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

window._UNIT = unit;
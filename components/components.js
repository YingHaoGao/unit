/**
 * 标签选择组件
 * @author MuTong
 * @DateTime 2019-03-29T17:42:29+0800
 * @param    {[type]}                 $ele    [description]
 * @param    {[type]}                 options [description]
 */
var TabList = function($ele, options){
	var options = options || {};

	// 参数
	this.$ele = $ele || $('body');
	this.id = options.id || false;
	this.pageNum = options.pageNum || 10;
	this.currentPage = options.currentPage || 1;
	this.title = options.title || $.i18n.prop("i18n.institutional.selected.column.list");
	this.bodyTitle = options.bodyTitle || $.i18n.prop("i18n.institutional.waiting.column.list");
	this.moreTitle = options.moreTitle || $.i18n.prop("i18n.institutional.more.column.list");
	this.cuserId = options.cuserId || getCommonUserId();
	this.isNotLoad = options.isNotLoad;
	this.loadDom = options.loadDom || $('#classify');
	this.isSelect = options.isSelect || false;
	this.isModel = options.isModel || false;
	this.active = options.active || false;
	this.key = options.key || 'results';
	this.listUrl = options.listUrl || "api/production/xy/v1/queryColumnPage";
	this.selectedList = options.selectedList || [];
	this.callback = options.callback || function(){};
	this.placeholder = $.i18n.prop("i18n.common.please.enter.the.search.content");
	this.listData = {};
	this.allListData = {};
	this.login = new mcMethod.public.LoginShow();

	if(!this.isNotLoad){ this.createLoad() }
	this.create();
	this.getListData(true);
};
// 遮罩层
TabList.prototype.createLoad = function() {
	var that = this;

	that.loadDom.addClass('loadAfter');
};
// 初始化dom
TabList.prototype.create = function() {
	var that = this;
	//外层
	that.$com = $('<div class="com_tabList"></div>');
	that.$title = $('<div class="com_title"></div>');
	that.$head = $('<div class="com_head"></div>');
	that.$body = $('<div class="com_body"></div>');
	that.$select_title = $('<span class="com_select_title"></span>');
	that.$select = $('<select class="com_select"></select>');
	that.$select_label = $('<label class="com_select_label"></label>');
	that.$body_title = $('<div class="com_body_title"></div>');
	that.$body_list = $('<div class="com_body_list"></div>');
	that.$more = $('<span class="com_more mty_skin_bgc">+'+$.i18n.prop("i18n.common.more")+'</span>');
	that.$null = $('<div class="com_null"></div>');
	// model
	if(that.isModel){
		that.$model = $('<div class="mc-ant-modal"></div>');
		that.$wrap = $('<div class="ant-modal-content-wrap"></div>');
		that.$model_content = $('<div class="ant-modal-content moreTab_alert referenceMaterial_alert g_mainc_main"></div>');
		that.$model_body = $('<div class="ant-modal-body"></div>');
		that.$model_head_name = $('<div class="model_head_name"></div>');
		that.$model_body_name = $('<div class="model_body_name"></div>');
		that.$model_title_icon = $('<i class="icon-distribution"></i>');
		that.$model_close = $('<div class="retractBtn" id="close_alert"><img src="common/img/mc_return.svg" alt="返回按钮"></div>');
		that.$model_body_btns = $('<div class="model_body_btns"></div>');
		that.$model_body_search = $('<div class="model_body_search"></div>');
		that.$model_body_save = $('<button class="btn-info btn btn-xs save_btn mty_skin_bgc"><i></i></button>');
		that.$model_body_search_input = $('<input type="text" placeholder="'+ that.placeholder +'" class="model_body_search_input" name="search"/>');
		that.$model_body_search_btn = $('<button class="btn-info btn btn-xs search_btn mty_skin_bgc"></button>');
	}

	that.$null.html($.i18n.prop("i18n.catalogue.null") + this.bodyTitle);

	if(that.id){ that.$com.attr('id', that.id) }
};
// 关闭测弹框
TabList.prototype.removeModel = function(that) {
	var that = that || this;

	that.$model_content.removeClass('moreTab');
	setTimeout(function(){
		that.$model.remove();
	}, 100);
};
// 绑定事件
TabList.prototype.bindEvent = function(that) {
	var that = that || this;

	// 更多
	that.$more.off().on('click',function(){
		// setTimeout(function () {
		// 	mcMethod.public.detailsShow();
		// 	// $("#referenceMaterial_alert").addClass("active");
		// }, 100);
		// $("#mediaShow").load("components/cloudEditor/my/moreTab.html",function () {
		// 	//console.log(">>>>>>>打开页面回调>>>>>>");
		// });
		that.login.loginIng();

		// 创建侧弹框
		new TabList($('body'),{
			id: that.id,
			isNotLoad: true,
			title: that.title,
			bodyTitle: that.bodyTitle,
			listUrl: that.listUrl,
			selectedList: that.selectedList,
			key: that.key,
			isModel: true,
			callback: function(list, listData){
				that.refresh(list, listData);
			}
		});
	});
	// select
	that.$select.off().on('change',function(){
		that.returnData(that, $(this));
	});

	if(that.isModel){
		// 保存
		that.$model_body_save.on('click', function(e){
			that.returnData(that);
			that.removeModel(that);
			layer.msg('保存成功');
			mcMethod.public.loseFocus(e);
		});
		// 搜索条件
		that.$model_body_search_input.on('input',function(){
			that.keyValue = $(this).val();
		});
		that.$model_body_search_input.on('keyup',function(e){
			if(e.keyCode == '13'){
				that.getListData(true,that, true);
			}
			mcMethod.public.loseFocus(e);
		});
		// 搜索
		that.$model_body_search_btn.on('click', function(e){
			that.getListData(true,that, true);
			mcMethod.public.loseFocus(e);
		});
	}
};
// 获取待选列表
TabList.prototype.getListData = function(isFirst, that, isNotRefershHead) {
	var that = that || this;
	var jsonObj = {};
	//分页信息
	jsonObj["currentPage"] = that.currentPage;
	jsonObj["sort"] = {"index":-1};
	if(that.isModel){
		jsonObj["pageNum"] = 10000000;

		if(that.keyValue && that.keyValue != ''){
			jsonObj["keyValue"] = that.keyValue;
			jsonObj["keyWord"] = 'name';
		}else{
			delete jsonObj["keyValue"];
			delete jsonObj["keyWord"];
		}
	}else{
		jsonObj["pageNum"] = that.pageNum;
	}

	if(that.isModel){
		that.login.loginIng();
	}

	$.ajax({
		type: "POST",
		url: config.cloudUrl + that.listUrl + "?companyId="+config.companyId+"&appCode="+mcPlatform.config.qmtnrk+"&userId="+config.userId+"&serviceCode=NEWUGC_YUNSHI",
		// async: false,
		contentType: "application/json ; charset=utf-8",
		dataType: "json",
		data: JSON.stringify(jsonObj),
		success: function (data) {
			that.listData = data.data;
			if(that.isSelect){
				that.addOptionItem()
			}else{
				if(isFirst && !isNotRefershHead){ that.addHeadItem(false, true) }
				that.addBodyItem(isFirst)
			}

			if(that.isModel && ( !that.keyValue || that.keyValue == '' )){
				that.allListData = data.data;
			}

			if(that.currentPage == that.listData.totalPage){
				that.$more.remove();
				that.showNull();
			}

			that.bindEvent();
			that.render();

			that.login.closelogin();
		}
	});
};
// refresh
TabList.prototype.refresh = function(selectedList, listData) {
	var that = this;

	that.selectedList = selectedList;

	if(that.isSelect){
		that.addOptionItem();
	}else{
		that.addHeadItem(false, true);
		that.addBodyItem(true);
	}

	that.bindEvent();
	that.returnData(that);

	if(that.currentPage == that.listData.totalPage){
		that.$more.remove();
		that.showNull();
	}
};
// 插入select -> option
TabList.prototype.addOptionItem = function() {
	var that = this;

	if(that.listData[that.key] && that.listData[that.key].length > 0){
		var $item = $('<option class="com_select_option" data-id="false" value="false" name="false">'+ $.i18n.prop('i18n.common.please.select') +'</option>');
		that.$select.append($item);
		that.listData[that.key].map(function(item, idx){
			var $item = $('<option class="com_select_option" data-id="'+ item._id +'" value="'+ item._id +'" name="'+ item.name +'">'+ item.name +'</option>');
			if(item._id == that.selectedList.id){
				$item.prop('selected', true);
			}

			that.$select.append($item);
		});
	}
};
// 插入待选列表
TabList.prototype.addBodyItem = function(isFirst) {
	var that = this;

	if(that.listData[that.key] && that.listData[that.key].length > 0){
		if(isFirst){
			that.$body_list.html(that.$null);
		}
		that.$body_list.find('.com_null').hide();

		var selectedIdList = [];
		$.each(that.$head.find('.com_head_item'),function(key, item){
			selectedIdList.push($(item).data('id'));
		});
		that.listData[that.key].map(function(item, idx){
			var $item = $('<span class="com_body_item" data-id="'+ item._id +'">'+ item.name +'</span>');

			// 添加到已选事件
			$item.off().on('click',function(e){
				that.addHeadItem(item);
				$(e.target).hide();
				that.showNull();
			});

			if(selectedIdList.indexOf(item._id) > -1){
				$item.hide();
			}
			that.$body_list.append($item);
		});
		if(that.listData.totalPage && that.listData.totalPage > 1){
			that.$body_list.append(that.$more);
		}
	}
};
// 插入已选列表
TabList.prototype.addHeadItem = function(obj, isFirst, isModel) {
	var that = this;
	var obj = obj || {};
	var deleteItem = function(e){
		var _this = $(e.target).closest('.com_head_item');
		var $listItem = that.$body_list.find('.com_body_item[data-id='+ _this.data('id') +']');

		if($listItem){
			$listItem.show();
		}

		_this.remove();

		var itemNum = 0;
		$.each(that.$head.find('.com_head_item'),function(key, item){
			if(!$(item).is(':hidden')){
				itemNum += 1;
			}
		});
		if(itemNum == 0){
			that.$head.html('<div class="com_null">'+ $.i18n.prop("i18n.catalogue.null") + that.bodyTitle +'</div>');
		}else{
			that.$head.find('.com_null').remove();
		}
		that.showNull();
		if(!that.isModel){ that.returnData(that, $(this)) }
	};

	if(isFirst){
		if(that.selectedList && that.selectedList.length>0){
			that.$head.html(null);
			that.selectedList.map(function(item,idx){
				var $item = $('<span class="com_head_item" data-id="'+ item._id +'">'+ item.name +'<i class="com_close"></i></span>');

				// 删除已选事件
				$item.off().on('click',deleteItem);

				that.$head.append($item);
			})
		}else{
			that.$head.html('<div class="com_null">'+ $.i18n.prop("i18n.catalogue.null") + that.bodyTitle +'</div>');
		}
	}else{
		var $item = $('<span class="com_head_item" data-id="'+ obj._id +'">'+ obj.name +'<i class="com_close"></i></span>');

		// 删除已选事件
		$item.off().on('click',deleteItem);

		that.$head.find('.com_null').remove();
		that.$head.append($item);
		if(!that.isModel){ that.returnData(that) }
	}
};
// 判断空
TabList.prototype.showNull = function() {
	var that = this;
	var itemNum = 0;

	$.each(that.$body_list.find('.com_body_item'),function(key, item){
		if(!$(item).is(':hidden')){
			itemNum += 1;
		}
	});

	if(that.isModel){
		if(itemNum == 0){
			that.$body_list.find('.com_null').show();
		}else{
			that.$body_list.find('.com_null').hide();
		}
	}else{
		if(itemNum == 0 && that.$body_list.find('.com_more').length == 0){
			that.$body_list.find('.com_null').show();
		}else{
			that.$body_list.find('.com_null').hide();
		}
	}
};
// render
TabList.prototype.render = function() {
	var that = this;

	if(that.isModel){
		that.$model_body_save.html($.i18n.prop("i18n.common.save"));
		that.$model_body_search_btn.html('<i class="icon-search"></i>'+$.i18n.prop("i18n.common.search"));
		that.$title.html('<i class="icon-distribution"></i>' + that.moreTitle);
		that.$model_head_name.html(that.title + ':');
		that.$model_body_name.html(that.bodyTitle + ':');

		that.$model_body_search.append(that.$model_body_search_input).append(that.$model_body_search_btn);
		that.$model_body_btns.append(that.$model_body_save).append(that.$model_body_search);
		that.$model_body.append(that.$model_head_name).append(that.$head)
			.append('<div class="com_hr"></div>').append(that.$model_body_btns).append(that.$model_body_name).append(that.$body_list);
		that.$model_content.append(that.$title).append(that.$model_body).append(that.$model_close);
		that.$model.append(that.$wrap).append(that.$model_content);

		that.$model_close.on('click', function(){
			that.removeModel(that)
		});

		that.$ele.append(that.$model);

		that.$model_content.addClass('moreTab');
		that.login.closelogin();
	}else{
		// 先返回默认值
		that.returnData(that, that.$select);

		that.$title.html(that.title);
		if(that.isSelect){
			that.$select_title.html(that.bodyTitle + ':');
			that.$select_label.html(that.$select);
			that.$body.append(that.$select_title).append(that.$select_label);
			that.$body.addClass('com_sbody');
			that.$com.append(that.$title).append(that.$body);
		}else{
			that.$body_title.html(that.bodyTitle);
			that.$body.append(that.$body_title).append(that.$body_list);
			that.$com.append(that.$title).append(that.$head).append(that.$body);
		}
		that.$ele.append(that.$com);
		that.showNull();
		that.loadDom.removeClass('loadAfter');
	}
	that.showNull();
};
// returnData
TabList.prototype.returnData = function(that, _this) {
	if(that.isSelect){
		var returnData = [{
			id: _this.find('option:selected').val(),
			val: _this.find('option:selected').attr('name')
		}];
		that.callback(returnData);
	}else{
		var idList = [];
		var returnData = [];
		$.each(that.$head.find('.com_head_item'),function(key, item){
			idList.push($(item).data('id'));
		});

		idList.map(function(item, idx){
			var _item = that.listData[that.key].find(function (x) {
				return x._id == item
			});

			if(!_item){
				_item = that.selectedList.find(function (x) {
					return x._id == item
				});
			}
			returnData.push(_item)
		});
		that.selectedList = returnData;
		that.callback(returnData, that.listData);
	}
};


/**
 * Labels
 * @author MuTong
 * @param $ele
 * @param options
 * @constructor
 */
var Labels = function($ele, options){
    var that = this;
    if(CLabels){
        $('#Labels_con').remove();
    }

    this.options = options || {};
    this.list = this.options.strOrArr || '';
    this.maxWidth = this.options.maxWidth || '180px';
    this.callback = this.options.callback || function(){};
    this.$ele = $ele;

    this.$con = $('<div id="Labels_con" class="Labels_con"></div>');
    this.$list = $('<div class="Labels_list"></div>');
    this.$add = $('<div class="Label_add">+</div>');
    this.$input = $('<input type="text" placeholder="最多15个字符"/>');

    if(this.list && this.list.indexOf(',')>=0){
        this.list = this.list.split(',');
    }else{
        if(this.list == ""){
            this.list = [];
        }else{
            this.list = [ this.list ];
        }
    }

    this.list.map(function(item, idx){
        that.addLabel(item, true);
    });

    this.bindEvent();
    this.render();
};
Labels.prototype.bindEvent = function(){
    var that = this;

    that.$add.off().on('click', function(){
        that.$add.hide();
        that.$input.show();
        that.$input.css('width', that.maxWidth);
    });
    that.$input.off('blur').on('blur', function(){
        that.$input.val(null).css('width', 0).hide();
        that.$add.show();
    });
    that.$input.off('keyup').on('keyup', function(e){
        if(e.keyCode == 13){
            that.addLabel($(e.target).val());
            that.$input.val(null).css('width', 0).hide();
            that.$add.show();
        }
    });
    that.delLabel();
};
Labels.prototype.addLabel = function(item, isFirst){
    var that = this;
    var item = item.replace(/(^\s*)|(\s*$)/g, "");

    if(item){
        if((that.list.indexOf(item) < 0 || isFirst) && item.length <= 15 && !!item && item != ""){
            var $item = $('<span class="Labels_item">'+ item +'<i class="del_icon"><img src="common/img/close_icon.png"></i></span>');
            that.$list.append($item);
            if(!isFirst){
                that.list.push(item)
            }
        }
    }else{
        that.$list.html(null);
        that.list.map(function(_item){
           var $item = $('<span class="Labels_item">'+ _item +'<i class="del_icon"></i></span>');
           that.$list.append($item);
        });
    }

    that.callback(that.list);
};
Labels.prototype.delLabel = function(){
    var that = this;

    that.$list.on('click', '.del_icon', function(){
        var text = $(this).find('.Labels_item').text();

        that.list = $.grep(that.list, function(item){
            return item != text
        });
        $(this).closest('.Labels_item').remove();
        that.callback(that.list);
    });
};
Labels.prototype.render = function(){
    var that = this;

    that.$con.append(that.$list).append(that.$input).append(that.$add);
    that.$ele.append(that.$con);
};

/***
 * UserTree
 * @author MuTong
 * @param options
 * @constructor
 */
var UserTree = function(options){
    this.options = options || {};
    this.organizationUrl = options.organizationUrl || '';
    this.userUrl = options.userUrl || '';
    this.key = options.key || '';
    this.activeList = options.activeList || [];
    this.yesFn = options.yesFn || function(){};

    this.list = changeArrObj[this.key];
    this.$ele = false;
    this.organizationObj = {
        data: {},
        url: this.organizationUrl,
        page: {
            "parentId":1,
            "currentPage":1,
            "pageNum":100
        }
    };
    this.userObj = {
        data: {},
        url: this.userUrl,
        page: {
            "parentId":1,
            "currentPage":1,
            "pageNum":18,
            "userName":"",
            "departmentId": ""
        }
    };
    this.tree = false;

    this.openLayer();
};
UserTree.prototype.getOrganization = function(isFirst){
    var that = this;

    $.ajax({
        type: 'post',
        url: that.organizationObj.url,
        contentType: "application/json ; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(that.organizationObj.page),
        success: function(res){
            if(res.code == 0){
                that.tree = new Tree(
                    that.$organizationList,
                    res.data.result,
                    {
                        radio: true,
                        organizationUrl: that.organizationObj.url,
                        callback: function(arr){
                            that.userObj.page.currentPage = 1;
                            that.userObj.page.departmentId = arr[0] ? arr[0].departmentId : '';
                            that.userObj.page.parentId = arr[0] ? arr[0].parentId : '';
                            that.getUser();
                        }
                    }
                );
                if(isFirst){
                    that.getUser();
                }
            }
        },
        error:function(err){
            console.log('----------> 获取组织列表：' + err);
        }
    });
};
UserTree.prototype.getUser = function(){
    var that = this;

    $.ajax({
        type: 'post',
        url: that.userObj.url,
        contentType: "application/json ; charset=utf-8",
        dataType: "json",
        data: JSON.stringify(that.userObj.page),
        success: function(res){
            if(res.code == 0){
                var totalPage = (res.data.total % that.userObj.page.pageNum === 0) ? (parseInt(res.data.total / that.userObj.page.pageNum)) : (parseInt(res.data.total / that.userObj.page.pageNum) + 1);

                that.userObj.data = res.data.result;
                that.addUser();

                that.$userCon_page.createPage({
                    pageCount: totalPage,
                    current: that.userObj.page.currentPage,
                    totalNum: res.data.total,
                    backFn: function (p) {
                        that.userObj.page.currentPage = p;
                        that.getUser();
                    }
                });
            }
        },
        error:function(err){
            console.log('----------> 获取用户列表：' + err);
        }
    });
};
UserTree.prototype.bindEvent = function(){
    var that = this;

    that.$search_div.off().on('keyup', 'input', function(e){
        if(e.keyCode == 13){
            that.userObj.page.userName = $(this).val().replace(/(^\s*)|(\s*$)/g, "");
            that.getUser();
        }
    });
    that.$userCon_body_ul.off().on('click', 'li',function(e){
        var key = $(this).closest('.addPersonnel').data('name');
        var userJson = $(this).data('json');

        if($(this).find(".head-mask").hasClass('active')){
            that.list = $.grep(that.list, function(item, idx){
                console.log(item, userJson);
                return  item.userId != userJson.userId
            });
        }else{
            that.list.push(userJson);
        }
        $(this).find(".head-mask").toggleClass('active');
    })
};
UserTree.prototype.create = function(){
    var that = this;

    that.$con = $('<div class="clearfloat user-choice"></div>');
    that.$organizationList = $('<div class="fl user-list"></div>');
    that.$userCon = $('<div class="fr user-show"></div>');
    that.$search_div = $('<div class="search-user"><input type="text" placeholder="搜索"></div>');
    that.$userCon_body = $('<div class="user-cont"></div>');
    that.$userCon_body_ul = $('<ul class="clearfloat addPersonnel" data-name="'+ that.key +'"></ul>');
    that.$userCon_page = $('<div id="user_page" class="page"></div>');

    that.$userCon_body.append(that.$userCon_body_ul);
    that.$userCon.append(that.$search_div).append(that.$userCon_body).append(that.$userCon_page);
    that.$con.append(that.$organizationList).append(that.$userCon);
    that.$ele.html(that.$con);
};
UserTree.prototype.addUser = function(){
    var that = this;

    that.$userCon_body_ul.html(null);
    if(!!that.userObj.data && that.userObj.data.length>0){
        that.userObj.data.map(function(item, idx){
           var $item = $('<li title="'+ item.userName +'"><div class="user-head"><div class="head-mask">&radic;</div><img src="" onerror="this.src=\'http://testhwobs.yunshicloud.com/37096FDBAC854830/QMTNRK_YUNSHI/0203881DAB8E4871A690D5359B540E3B/000000/C5FEF322E7F3413584B307392FB70FDD.jpg\'" alt="img"></div><p>'+ item.userName +'</p></li>')
            $item.attr('data-json', JSON.stringify(item));

            $.grep(that.activeList,function(_item){
                if(_item.userId == item.userId){
                   $item.find(".head-mask").addClass('active');
               }
           });

           if(that.list && that.list.length>0){
               $.grep(that.list, function(_item){
                   if(_item.userId == item.userId){
                       $item.find('.head-mask').addClass('active');
                   }
               });
           }

            that.$userCon_body_ul.append($item);
        });
    }
};
UserTree.prototype.openLayer = function(){
    var that = this;
    var layerCom = '<div class="layerCom"></div>';

    layer.open({
        type: 1,
        skin: 'layui-layer-rim', //加上边框
        area: ['680px', '500px'], //宽高
        title:'选择用户',
        content: layerCom,
        btn : [ '确认', '取消' ],
        success: function(e){
            that.$ele = $(e).find('.layerCom');
            that.create();
            that.bindEvent();
            that.getOrganization(true);
        },
        yes: function(e){
            changeArrObj[that.key] = that.list;
            that.yesFn();
            layer.close(e)
        }
    });
};

/***
 * Tree
 * @author MuTong
 * @param $ele
 * @param arr
 * @param options
 * @constructor
 */
var Tree = function ( $ele, arr, options) {
    this.$ele = $ele || $('body');
    this.options = options || {};
    this.radio = options.radio || false;
    this.organizationUrl = options.organizationUrl || '';
    this.callback = options.callback || function(){};

    this.organizationObj = {
        data: {},
        url: this.organizationUrl,
        page: {
            "parentId":1,
            "currentPage":1,
            "pageNum":100
        }
    };

    this.arr = arr;

    this.init();
};
Tree.prototype.init = function () {
    var that = this;

    that.$con = $('<div id="tree"></div>');

    if(that.arr.constructor == Array){
        that.appendItem(that.arr, that.$con);
        that.$ele.append(that.$con);
    }else{
        console.error('The second argument should be an array!');
    }
};
Tree.prototype.appendItem = function (arr, $con) {
    var that = this;

    arr.map(function(item, idx){
        var $tab = $(`<div class="tab"></div>`);
        var $tab_title = $(`<div class="tab_title" data-parentid="${item.parentId}" data-departmentid="${item.departmentId}"><div class="checkbox"></div>${item.deparmentName}</div>`);
        var $tab_list = $(`<div class="tab_list"></div>`);

        $tab.append($tab_title);
        $tab.append($tab_list);
        $con.append($tab);

        $tab_title.off().on('click', function(eve){
            var $this = $(eve.target);

            if($this.hasClass('checkbox')){
                that.toggleActive($this, that);
            }else{
                if(!$this.closest('.tab').children('.tab_list').is(":hidden")){
                    $this.closest('.tab').children('.tab_list').slideUp(100);
                }else{
                    that.organizationObj.page.parentId = $this.data('departmentid');
                    console.log(that.organizationObj.page.parentId);
                    if(that.organizationObj.page.parentId){
                        $.ajax({
                            type: 'post',
                            url: that.organizationObj.url,
                            contentType: "application/json ; charset=utf-8",
                            dataType: "json",
                            data: JSON.stringify(that.organizationObj.page),
                            success: function(res){
                                if(res.code == 0){
                                    that.appendItem(res.data.result, $tab_list);
                                    $this.closest('.tab').children('.tab_list').slideDown(100);
                                }
                            },
                            error:function(err){
                                console.log('----------> 获取组织列表：' + err);
                            }
                        });
                    }
                }
            }
        });
    })
};
Tree.prototype.toggleActive = function (eve, that) {
    var $this = eve;

    if($this.hasClass('active')){
        $this.closest('.tab').find('.checkbox').removeClass("active");
    }else{
        if(that.radio){
            that.$con.find('.active').removeClass('active');
        }

        $this.closest('.tab').find('.checkbox').addClass("active");
    }

    this.return();
    return false;
};
Tree.prototype.return = function () {
    var arr = [];
    var $eleArr = this.$con.find('.checkbox.active');

    $.each($eleArr, function(key, item){
        var departmentid = $(item).closest('.tab_title').data('departmentid');
        var parentid = $(item).closest('.tab_title').data('parentid');

        arr.push({
            departmentId: departmentid,
            parentId: parentid
        });
    });
    this.callback(arr);
    return arr;
};


/**
 * 高德地图 - 弹窗地图插件
 * 依赖layer-ui
 * @constructor
 */
var Amap_interView = function(options){
	var options = options || {};
	this.area = options.area || ['700px', '550px'];
	this.drag_start = options.drag_start || false;
	this.drag_end = options.drag_end || false;
	this.drag_path = options.drag_path || [];
	this.markerList = options.markerList || [];
	this.maxMarker = options.maxMarker || 1;
	this.on_clickAddMarker = options.on_clickAddMarker || false;
	this.on_dragRoute = options.on_dragRoute || false;
	this.markerChange = options.markerChange || function(){};

	// 高德key - 使用账号：个人
	this.amap_key = '90088d1667f57d78c83a3a786ab428f9';

	this.dragRoute = false;
	this.contextMenu = false;
	this.geocoder = false;
	this.infoWindow = false;
	this.geolocation = false;

	this.contextMenuPositon = null;
	this.marker = {};
	this.pluginList = [
		// 定位，提供了获取用户当前准确位置、所在城市的方法
		'AMap.Geolocation',
		// 地理编码与逆地理编码服务，提供地址与坐标间的相互转换
		'AMap.Geocoder',
		// 拖拽导航插件，可拖拽起终点、途经点重新进行路线规划
		'AMap.DragRoute',
	];

	this.create();
};
// 引用资源 加载环境
Amap_interView.prototype.create = function(){
	var that = this;
	var height = that.area[1] ? (parseInt(that.area[1]) - 50) + 'px' : '500px';
	var amap_script = $('<script type="text/javascript" id="amap_script" src="https://webapi.amap.com/maps?v=1.4.14&key='+ that.amap_key +'"></script>');

	that.s_content = '<div id="amap_container" class="loadAfter" style="height: '+ height +'"></div>';
	that.$search = $('<div class="search"></div>');
	that.$search_input = $('<input type="text" placeholder="'+ $.i18n.prop('i18n.common.please.enter.the.search.content') +'"/>');
	that.$search_button = $('<button class="btn-info btn btn-xs search_btn"><i class="icon-search"></i>'+ $.i18n.prop("i18n.common.search") +'</button>');

	that.$search.append(that.$search_input).append(that.$search_button);

	if($('#amap_script').length == 0){
		$('head').append(amap_script);
	}

	var isAmap = setInterval(function(){
		if(!!window.AMap){
			that.map = new AMap.Map('amap_container');
			clearInterval(isAmap);

			that.init(that);
		}
	}, 300);
};
// 初始化
Amap_interView.prototype.init = function(that) {
	var that = that || this;

	that.plugin(that);
	that.bindEvent(that);

	if(that.markerList instanceof Array){
		that.marker = {};
		that.markerList.map(function(item, idx){
			if(item.constructor != String){
				that.addMarker(that, { positon: item.positon, markerKey: item.markerKey });
			}else if(item != ""){
				that.getLocation(that, item)
			}
		});
	}else{
		console.error('-------------> markerList参数类型错误，类型应为：Array，当前为：' + that.markerList.constructor);
	}
};
// 打开layer
Amap_interView.prototype.openLayer = function() {
	var that = this;

	that.layer = layer.open({
		skin: 'layer_amap_container',
		type: 1,
		area: that.area,
		content: that.s_content,
		btn: false,
		resize: false,
		success: function(e){
			$(e).append(that.$search);

			var isAmap = setInterval(function(){
				if(!!window.AMap){
					$(e).append('<div id="panel"></div>');
					$(e).find('#amap_container').removeClass('loadAfter');
					clearInterval(isAmap);
				}
			}, 300);
		},
		cancel: function(){

		}
	});
};
// 插件异步加载
Amap_interView.prototype.plugin = function(that) {
	var that = that || this;

	that.map.plugin(that.pluginList,function(){
		that.create_geocoder(that);
		that.create_geolocation(that);
	});
};
// 事件绑定
Amap_interView.prototype.bindEvent = function(that) {
	var that = that || this;

	// 地图绑定鼠标左击事件——弹出消息框
	that.map.on('click', function(ev) {
		// 触发事件的对象
		var target = ev.target;
		// 触发事件的地理坐标，AMap.LngLat 类型
		var lnglat = ev.lnglat;
		// 触发事件的像素坐标，AMap.Pixel 类型
		var pixel = ev.pixel;
		// 触发事件类型
		var type = ev.type;

		if(that.on_clickAddMarker){
			if(!!that.maxMarker && !!that.marker.total && that.marker.total >= that.maxMarker){
				$.each(that.marker,function(key, val){
					if(key != 'total'){
						that.delMarker(that, key);
					}
				})
			}
		}

		that.getAddress(that, lnglat);
		that.delMarker(that, 'searchMarker');
	});
	//地图绑定鼠标右击事件——弹出右键菜单
	that.map.on('rightclick', function (e) {
		that.create_conTextMenu(that);
		that.contextMenu.open(that.map, e.lnglat);
		that.contextMenuPositon = e.lnglat;
	});
	that.$search_input.off('keyup').on('keyup',function(e){
		if(e.keyCode === 13){
			var geography = that.$search_input.val();
			if(geography && geography != ''){
				that.getLocation(that, geography);
			}
		}
	});
	// 搜索
	that.$search_button.off('click').on('click',function(){
		var geography = that.$search_input.val();
		if(geography && geography != ''){
			that.getLocation(that, geography);
		}
	})
};
// 操作 - 反向搜索并定位
Amap_interView.prototype.getLocation = function(that, geography){
	var that = that || this;
	var geography = geography || '';

	that.geocoder.getLocation(geography, function(status, result) {
		if (status === 'complete' && result.info === 'OK') {
			var lnglat = result.geocodes[0].location;
			var options = { 'markerKey': 'searchMarker' };
			var info = result.geocodes[0].addressComponent;

			info.formattedAddress = result.geocodes[0].formattedAddress;
			info.lnglat = lnglat;
			that.contextMenuPositon = lnglat;
			options.info = info;

			if(that.on_clickAddMarker){
				if(!!that.maxMarker && !!that.marker.total && that.marker.total >= that.maxMarker){
					$.each(that.marker,function(key, val){
						if(key != 'total'){
							that.delMarker(that, key);
						}
					})
				}
			}

			that.delMarker(that, 'searchMarker');
			that.addMarker(that, options);

			if(that.marker[options.markerKey]){
				that.marker[options.markerKey].setPosition(lnglat);
				that.map.setFitView(that.marker[options.markerKey]);
			}
		}
		else if(status === "error"){
			layer.msg('未找到该地址，请尝试输入更详细地址');
			console.error('------------> 高德报错： ' + result)
		}
		else if(status === "no_data"){
			layer.msg('未找到该地址，请尝试输入更详细地址');
		}
	})
};
// 操作 - 搜索并显示信息框
Amap_interView.prototype.getAddress = function(that, lnglat) {
	var that = that || this;
	var lnglat = lnglat || [];

	that.geocoder.getAddress(lnglat, function(status, result) {
		if (status === 'complete' && result.info === 'OK') {
			var info = result.regeocode.addressComponent;
			info.formattedAddress = result.regeocode.formattedAddress;
			info.lnglat = lnglat;

			if(that.on_clickAddMarker){
				that.addMarker(that, {
					position: lnglat,
					info: info,
					markerKey: 'interview'
				});
			}

			if(!!info.building && info.building != ''){
				that.showInfoWindow(that, info);
			}
		}
		else if(status === "error"){
			layer.msg(result)
		}
		else if(status === "no_data"){
			layer.msg('未找到该地址');
		}
	})
};
// 操作 - 添加标记
Amap_interView.prototype.addMarker = function(that, options){
	var that = that || this;
	var options = options || {};

	if(options.position || that.contextMenuPositon){
		if(!that.marker.total){ that.marker.total = 0 }

		var markerTotal = that.marker.total;
		var options = options || {};
		var markerKey = options.markerKey || (markerTotal+1);
		var info = options.info || false;

		that.marker[markerKey] = new AMap.Marker({
			extData: {
				key: markerKey,
				info: info
			},
			map: that.map,
			position: options.position || that.contextMenuPositon
		});
		that.marker[markerKey].on('rightclick',function(e){
			that.create_conTextMenu(that, e.target.B.extData.key);
			that.contextMenu.open(that.map, e.lnglat);
			that.contextMenuPositon = e.lnglat;
		});
		that.marker.total += 1;

		that.markerChange(that.marker);
	}
};
// 操作 - 删除标记
Amap_interView.prototype.delMarker = function(that, markerKey){
	var that = that || this;

	if(!!that.marker[markerKey]){
		that.map.remove(that.marker[markerKey]);
		delete that.marker[markerKey];
		that.marker.total -= 1;

		that.markerChange(that.marker);
	}
};
// 操作 - 删除路线
Amap_interView.prototype.delDragRoute = function(that, isDelAds){
	var that = that || this;

	if(!!that.dragRoute){
		that.dragRoute.destroy();
		that.dragRoute = false;
		that.map.remove([ that.marker.drag_start, that.marker.drag_end ]);

		if(isDelAds){
			that.drag_start = false;
			that.drag_end = false;
		}
	}
};
// 操作 - 显示信息窗体
Amap_interView.prototype.showInfoWindow = function(that, info) {
	var that = that || this;

	var content = "<div class='infoWindow'>";
	content += "<p class='infoWindow_title'>"+ (info.building == '' ? '<span style=\"color: #ccc;\">数据缺失</span>' : info.building) +"</p>";
	content += "<p class='infoWindow_address'>地址："+ info.formattedAddress +"</p>";
	content += "<p class='infoWindow_address'>邮编："+ info.adcode +"</p>";

	that.infoWindow = new AMap.InfoWindow({
		content: content,
		offset: new AMap.Pixel(0, -20),
		showShadow: true,
		closeWhenClickMap: true
	});

	that.infoWindow.open(that.map, info.lnglat);
};
// 插件 - 可拖拽驾车路线规划
Amap_interView.prototype.create_dragRoute = function(that) {
	var that = that || this;
	//绘制初始路径
	var path = [
		that.drag_start,
		that.drag_end
	];

	that.dragRoute = new AMap.DragRoute(that.map, path, AMap.DrivingPolicy.LEAST_FEE); //构造拖拽导航类
	that.dragRoute.search(); //查询导航路径并开启拖拽导航
};
// 插件 - 右键菜单
Amap_interView.prototype.create_conTextMenu = function(that, markerKey) {
	var that = that || this;

	//创建右键菜单
	that.contextMenu = new AMap.ContextMenu();

	// //右键放大
	// that.contextMenu.addItem("放大一级", function () {
	//     that.map.zoomIn();
	// }, 0);
	//
	// //右键缩小
	// that.contextMenu.addItem("缩小一级", function () {
	//     that.map.zoomOut();
	// }, 1);
	//
	// //右键显示全国范围
	// that.contextMenu.addItem("缩放至全国范围", function () {
	//     that.map.setZoomAndCenter(4, [108.946609, 34.262324]);
	// }, 2);

	//右键添加Marker标记
	that.contextMenu.addItem("添加标记", function () {
		if(that.on_clickAddMarker){
			if(!!that.maxMarker && !!that.marker.total && that.marker.total >= that.maxMarker){
				$.each(that.marker,function(key, val){
					if(key != 'total'){
						that.delMarker(that, key);
					}
				})
			}

			that.getAddress(that, that.contextMenuPositon);
		}else{
			that.addMarker(that);
		}
	}, 3);

	if(that.on_dragRoute){
		//设置起点
		that.contextMenu.addItem("设置起点", function (e) {
			if(!!that.drag_start){
				that.delMarker(that, 'drag_start')
			}

			that.addMarker(that, { markerKey: 'drag_start', title: '起' });
			that.drag_start = that.contextMenuPositon;

			if(!!that.drag_start && !!that.drag_end){
				that.delDragRoute(that, false);
				that.create_dragRoute(that);
				that.map.remove([ that.marker.drag_start, that.marker.drag_end ]);
			}
			if(!!markerKey){
				that.delMarker(that, markerKey);
			}
		}, 4);

		//设置终点
		that.contextMenu.addItem("设置终点", function () {
			if(!!that.drag_end){
				that.dragRoute.destroy();
				that.delMarker(that, 'drag_end')
			}

			that.addMarker(that, { markerKey: 'drag_end', title: '终' });
			that.drag_end = that.contextMenuPositon;

			if(!!that.drag_start && !!that.drag_end){
				that.delDragRoute(that, false);
				that.create_dragRoute(that);
				that.map.remove([ that.marker.drag_start, that.marker.drag_end ]);
			}
			if(!!markerKey){
				that.delMarker(that, markerKey);
			}
		}, 5);

		//删除路线
		if(!!that.dragRoute){
			that.contextMenu.addItem("删除路线", function () {
				that.delDragRoute(that, true);
			}, 6);
		}
	}

	//删除标记点
	if(!!markerKey){
		that.contextMenu.addItem("删除标记点", function () {
			that.delMarker(that, markerKey);
		}, 7);
	}
};
// 插件 - 地理编码服务
Amap_interView.prototype.create_geocoder = function(that) {
	var that = that || this;

	that.geocoder = new AMap.Geocoder({
		city: '北京'
	});
};
// 插件 - 用户定位
Amap_interView.prototype.create_geolocation = function(that) {
	var that = that || this;

	that.geolocation = new AMap.Geolocation({
		// 是否使用高精度定位，默认：true
		enableHighAccuracy: true,
		// 设置定位超时时间，默认：无穷大
		timeout: 10000,
		showButton: false,
		//  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
		zoomToAccuracy: true,
	});
	that.map.addControl(that.geolocation);

	if(!that.markerList || that.markerList.length == 0 || (that.markerList.length == 1 && that.markerList[0] == '')){
		that.geolocation.getCurrentPosition();
	}
	AMap.event.addListener(that.geolocation, 'complete', function(data){
		console.log('用户定位成功');
	});
	AMap.event.addListener(that.geolocation, 'error', function(data){
		console.log('用户定位失败');
	});
};

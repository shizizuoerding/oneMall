'use strict';
var router = require('express').Router();
var AV = require('leanengine');
var http = require('http');

function sendError(res,code,message){
	var result = {
		code:code,
		message:message,
		data:[]
	}
	res.send(result);
}

function validate(res,req,data){
	for(var i in data){
		console.log(i);
		if(req.method == 'GET'){
			var value = req.query[i];
		}else{
			var value = req.body[i];
		}
		if(data[i]){
			//必须值
			if(!value){
				var result = {
					code : '302',
					message : '缺少'+data[i],
					data : []
				}
				res.send(result);
				return '';
			}
		}
		data[i] = value;
	}
	return data;
}

var Grade = AV.Object.extend('Grade');

// 新增
router.post('/add', function(req, res, next) {
	var data = {
		userId : '用户id',
		grades : '分数',
		nickName: '昵称'
    }
	var data = validate(res,req,data);
	if(!data){
		return;
	}
	var query = new AV.Query(Grade);
	query.equalTo('userId',data.userId);
	query.find().then(function(results) {
		//判断是否存在
		if(results.length){
			console.log(results[0].attributes.grade);
			console.log(data.grades);
			//存在
			if(data.grades > results[0].attributes.grades){
				console.log(results[0].id);
				var editObj = AV.Object.createWithoutData('Grade', results[0].id);
				for(var key in data){
					editObj.set(key,data[key]);
				}
				editObj.set("grade",parseInt(data.grades));
				editObj.save().then(function (editResult) {
					var result = {
					    code : 200,
					    data : editResult,
					    message : 'success'
					}
					res.send(result);
				}, function (error) {
					var result = {
					    code : 500,
					    message : '保存出错'
					}
					res.send(result);
				}).catch(next);
			}
			// var result = {
		 //   		code : 601,
		 //    	message : '用户已存在'
			// }
			// res.send(result);
		}else{ 
			//不存在
			//创建应用
			var addObj = new Grade();
			for(var key in data){
				addObj.set(key,data[key]);
			}
			addObj.set("grade",parseInt(data.grades));
			// console.log(data);
			addObj.save().then(function (addResult) {
		    	var result = {
		    		code : 200,
		    		data : addResult,
		    		message : '保存成功'
		    	}
		    	res.send(result);
			}, function (error) {
		    	var result = {
		    		code : 500,
		    		message : '保存出错了'
		    	}
		    	res.send(result);
			});
		}
	}, function(err) {
		if (err.code === 101) {
			res.send(err);
  		} else {
      		next(err);
    	}
	}).catch(next);
})

// 删除
router.get('/delete', function(req, res, next) {
	var data = {
		id  : id
    }
	var data = validate(res,req,data);
	if(!data){
		return;
	}
	var delObj = AV.Object.createWithoutData('Grade', data.name);
	delObj.destroy().then(function (success) {
		// 删除成功
		var result = {
		   	code : 200,
		   	data : [],
		    message : '删除成功'
		}
		res.send(result);
	}, function(error) {
		res.send(error);
	}).catch(next);
})

// 编辑
router.post('/edit', function(req, res, next) {
	var data = {
		userId : '用户id',
		grade : '分数'
    }
	var data = validate(res,req,data);
	if(!data){
		return;
	}
	var editObj = AV.Object.createWithoutData('Grade', data.id);
	for(var key in data){
		editObj.set(key,data[key]);
	}
	editObj.save().then(function (editResult) {
		var result = {
		    code : 200,
		    data : editResult,
		    message : 'success'
		}
		res.send(result);
	}, function (error) {
		var result = {
		    code : 500,
		    message : '保存出错'
		}
		res.send(result);
	}).catch(next);
})

// 查找
router.get('/list', function(req, res, next) {
	var data = {
		limit : '',
       	skip  : '',
       	status : '排序'
    }
	var data = validate(res,req,data);
	if(!data){
		return;
	}
	var limit = data.limit ? data.limit : 1000;
	var skip  = data.skip ? data.skip : 0;
	var query = new AV.Query('Grade');
	query.skip(skip);
	query.limit(limit);
	if(data.status == '0'){
		query.descending('grade');
	}
	else if(data.status == '1'){
		query.ascending('grade');
	}
	// query.sort(sortBy('grade',false));
	query.find().then(function (results) {		
		var result = {
		   	code : 200,
		   	data : results,
		    message : '获取成功'
		}
		res.send(result);
	}, function(error) {
		res.send(error);
	}).catch(next);
})

// 详情
router.get('/detail', function(req, res, next) {
	var data = {
		id  : 'id'
    }
	var data = validate(res,req,data);
	if(!data){
		return;
	}
	var query = new AV.Query('Grade');
	query.get(data.id).then(function(results){
		
		var result = {
		   	code : 200,
		   	data : results,
		    message : '获取成功'
		}
		res.send(result);
	}, function(error) {
		res.send(error);
	}).catch(next);
})

module.exports = router;
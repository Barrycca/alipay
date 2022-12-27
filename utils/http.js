const baseUrl = 'https://middle.szcaee.cn/pay' // 全局地址
 
import store from '../store/index.js'// 用来记录登录状态，统一封装token
 
module.exports = (params) => {
	let url = params.url; // 请求地址 例如：/api/order/payRevertDevice
	let method = params.method; // 请求方法
	let header = params.header || {}; // 请求头
	let data = params.data || {}; // 参数
	let isjson = params.isjson || false // 请求头的content-type，默认不是'application/json'，如果需要就设置为TRUE
	
	if (method) {
		method = method.toUpperCase(); //	小写转大写
	}
	// 请求类型
	if (!isjson) {
		header = {
			"content-type": "application/x-www-form-urlencoded"
		}
	}else {
		header = {
			"content-type": "application/json"
		}
	}
	// 获取登录状态
	let token = store.state.token
	if (token) {
		header = {
			...header,
			token
		}
	}
 
	//	发起请求 加载动画
	if (!params.hideLoading) {
		uni.showLoading({
			title: "加载中"
		})
	}
	
	
	// 支付宝小程序不支持res，用my.request
	// #ifdef MP-ALIPAY
	my.request({
		url: baseUrl + url,
		method: method || "GET",
		data: data,
		headers: header,
		dataType: 'json',
		success: res => {
			console.log(res,'http request res')
			if (res.status && res.status != 200) {
				//	api错误
				uni.showModal({
					// content: res.msg
					content: res
				})
				return;
			}
			typeof params.success == "function" && params.success(res.data);
		},
		fail: err => {
			uni.showModal({
				content: err
			})
			typeof params.fail == "function" && params.fail(err.data);
		},
		complete: (e) => {
			// console.log("请求完成");
			uni.hideLoading()
			typeof params.complete == "function" && params.complete(e.data);
			return;
		}
	})
	// #endif
 
	// 微信小程序的请求 
	// #ifdef MP-WEIXIN
	//	发起网络请求
	uni.request({
		url: baseUrl + url,
		method: method || "GET",
		header: header,
		data: data,
		dataType: "json",
		sslVerify: false, //	是否验证ssl证书
		success: res => {
			if (res.status && res.status != 200) {
				//	api错误
				uni.showModal({
					content: res.msg
				})
				return;
			}
			typeof params.success == "function" && params.success(res.data);
		},
		fail: err => {
			uni.showModal({
				content: err.msg
			})
			typeof params.fail == "function" && params.fail(err.data);
		},
		complete: (e) => {
			// console.log("请求完成");
			uni.hideLoading()
			typeof params.complete == "function" && params.complete(e.data);
			return;
		}
	})
	//  #endif	
}
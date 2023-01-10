<template>
	<view class="content">
		<!-- 	<view class="input_box">
			<input type="text" class="transparent input" />
		</view> -->


		<!-- <view class="btn bgbtn">
			返回App
		</view> -->
		<view class="version">
			v0.05
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userId: "",
				goodsid: "",
				amount: "",
				testid: "",
				loginNo:""
			}
		},
		onLoad(option) {
			uni.showLoading({
				title: '订单支付中',
				mask: true
			});
			this.alilogin()
			console.log(option)
			
			this.goodsid = option.goodsid;
			this.amount = option.amount;
			this.outOrderNo = option.outOrderNo;
			this.loginNo = option.loginNo;
		},

		methods: {

			// 获取用户authCode
			alilogin() {
				let _this = this
				//#ifdef MP-WEIXIN
				wx.login({
					success(res) {
						var code = res.code;
						console.log("code:" + code);

						_this.login(code)
						// util.requestData(methodName, data, function(code, msg, info) {
						// 	//console.log(info);
						// 	openid = info[0].openid;
						// 	app.globalData.openid = info[0].openid;
						// 	//将openid存入缓存
						// 	wx.setStorageSync('openid', openid);
						// 	_this.wxMiniPay(id, coin, money, openid);
						// });
					}

				})
				//#endif
				//#ifdef MP-ALIPAY
				my.getAuthCode({
					scopes: 'auth_user',
					success: (res2) => {
						console.log(res2, 'res.authCode')
						// return
						_this.login(res2.authCode)
						// console.log(res2,'res2') , userInfo.avatar, userInfo.nickName || '支付宝用户'
					},
					fail: (resfail) => {
						// 用户取消授权
					},
				});
				//#endif

			},


			// 支付宝登录
			login(code) {
				//#ifdef MP-ALIPAY
				this.http({
					url: '/ali/get/userId',
					method: 'POST',
					data: {
						code
					},
					success: res => {
						console.log(res)
						if (res.status === 200) {
							// 存token
							this.$store.commit('login', res.data.accessToken)
							this.userId = res.data.userId;
							this.order()
						} else {
							// console.log('MP-ALIPAY 登录失败！')
							uni.showToast({
								title: '登录失败！',
								icon: 'error'
							})
						}
					},
					fail: err => {
						// console.log(err, 'MP-ALIPAY login err')
						// console.log('登录失败！')
						uni.showToast({
							title: '登录失败！',
							icon: 'error'
						})
					}
				})
				//#endif
				//#ifdef MP-WEIXIN
				this.http({
					url: '/open_api/getopenid',
					method: 'GET',
					data: {
						code
					},
					success: res => {
						console.log(res)
						if (res.status === 200) {
							// 存token
							this.$store.commit('login', res.data)
							this.userId = res.data;
							this.order()
						} else {
							// console.log('MP-ALIPAY 登录失败！')
							uni.showToast({
								title: '登录失败！',
								icon: 'error'
							})
						}
					},
					fail: err => {
						// console.log(err, 'MP-ALIPAY login err')
						// console.log('登录失败！')
						uni.showToast({
							title: '登录失败！',
							icon: 'error'
						})
					}
				})
				//#endif
			},
			//下单
			order() {
				if (!this.amount && !this.goodsid) {
					return
				}
				
				this.http({
					url: '/pay/open_api/anonymity/aggregatePay',
					method: 'POST',
					isjson: true,
					data: {
						amount: this.amount,
						goodsName: this.goodsid,
						outOrderNo: this.outOrderNo,
						openid: this.userId,
						loginNo:this.loginNo,
						//#ifdef MP-ALIPAY
						paidType:"ALIPAY_ALXCX",
						//#endif
						//#ifdef MP-WEIXIN
						paidType:"WECHAT_JSXCX",
						//#endif
						callBackUrl: "https://ysys.szcaee.cn/api/notice/baofu_pay"
					},
					success: res => {
						console.log(res)
						if (res.status === 200) {
							let result = JSON.parse(res.message)
							console.log(result)
							this.toPay(result.body)
						} else {
							// console.log('MP-ALIPAY 登录失败！')
							uni.showToast({
								title: res.message,
								icon: 'error'
							})
							console.log('cancel')
						}
					},
					fail: err => {
						// console.log(err, 'MP-ALIPAY login err')
						// console.log('登录失败！')

						uni.showToast({
							title: err,
							icon: 'error'
						})
					}
				})
				
			},
			//唤起支付
			toPay(tradeNo) {
				//#ifdef MP-ALIPAY
				my.tradePay({
					// 调用统一收单交易创建接口（alipay.trade.create），获得返回字段支付宝交易号trade_no
					tradeNO: tradeNo,
					success: (res) => {

						console.log(res.resultCode)
						if (res.resultCode == 9000) {
							uni.showToast({
								title: '支付成功！'
							})
						}
						if (res.resultCode == 6001) {
							uni.showToast({
								title: '取消支付！'
							})
						}
					},
					fail: (res) => {
						// my.alert({
						// 	content: JSON.stringify(res),
						// });
					}
				});
				//#endif
				//#ifdef MP-WEIXIN
				console.log(JSON.parse(tradeNo))
				wx.requestPayment({
					...JSON.parse(tradeNo),
					"success": function(res) {},
					"fail": function(res) {
						uni.hideLoading();
					},
					"complete": function(res) {
						uni.hideLoading();
					}
				})
				//#endif

			},
			//返回APP
			back() {
				if (this.testid) {
					this.goodsid = this.testid;
					this.amount = this.testid;
					this.order()
				}
			}
		}
	}
</script>

<style>
	.content {
		position: relative;
		background: #1e1d22;
		height: 100vh;
	}

	.version {
		position: absolute;
		bottom: 100rpx;
		right: 100rpx;
		color: #aaa;
	}

	.transparent {
		background: transparent;
		border: none;
	}

	.input_box {
		text-align: center;
		margin-top: 60rpx;
	}

	.input {
		width: 100rpx;
		height: 50rpx;
	}

	.btn {
		position: absolute;
		bottom: 200rpx;
		width: 600rpx;
		left: 50%;
		transform: translate(-50%, 50%);

	}

	.bgbtn {
		color: #2AB675;
		border: 1rpx solid #2AB675;
		border-radius: 40rpx;
		line-height: 2;
		text-align: center;
		margin: 0 10rpx;
		line-height: 2.6;
		font-size: 30rpx;
		background-image: linear-gradient(to right, #2FE890, #4FE0F1);
		border: 0;
		color: #333;
	}
</style>

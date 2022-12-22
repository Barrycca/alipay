<template>
	<view class="content">
		<view class="input_box">
			<input type="text" class="transparent input" v-model="testid" />
		</view>
		

		<view class="btn bgbtn" @click="back">
			返回App
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
				testid:""
			}
		},
		onLoad(option) {
			this.alilogin()
			console.log(option)
			this.goodsid = option.goodsid;
			this.amount = option.amount;
		},

		methods: {

			// 获取用户authCode
			alilogin() {
				let _this = this
				my.getAuthCode({
					scopes: 'auth_user',
					success: (res2) => {
						console.log(res2, 'res.authCode')
						// return
						_this.alipaylogin(res2.authCode)
						// console.log(res2,'res2') , userInfo.avatar, userInfo.nickName || '支付宝用户'
					},
					fail: (resfail) => {
						// 用户取消授权
					},
				});
			},


			// 支付宝登录
			alipaylogin(code) {
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
			},
			//下单
			order() {
				if (!this.amount && !this.goodsid) {
					return
				}
				this.http({
					url: '/pay/anonymity/aggregatePay',
					method: 'POST',
					isjson: true,
					data: {
						"amount": this.amount,
						"goodsName": this.goodsid,
						"openid": this.userId
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
				my.tradePay({
					// 调用统一收单交易创建接口（alipay.trade.create），获得返回字段支付宝交易号trade_no
					tradeNO: tradeNo,
					success: (res) => {
						my.alert({
							content: JSON.stringify(res),
						});
					},
					fail: (res) => {
						my.alert({
							content: JSON.stringify(res),
						});
					}
				});
			},
			//返回APP
			back(){
				if(this.testid){
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

	.transparent {
		background: transparent;
		border: none;
	}
	.input_box{
		text-align: center;
		margin-top: 60rpx;
	}
	.input{
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

<template>
	<view class="home">
		<navbar></navbar>
		<view class="tabs_container">
			<van-tabs 
				v-if="labelList.length" 
				swipeable 
				animated 
				:ellipsis="false"
				class="tab_bar" 
				:active="tab_active"
				@change="tab_active_change"
			>
				<!-- <van-icon slot="nav-right" name="setting-o" class="tab_setting_icon" /> -->
				<van-tab v-for="(o,index) in labelList" :key="index" :title="o.name" :name="o.name" style="flex-basis:auto;">
					<!-- <van-skeleton v-if="cardLoading" title row="20" /> -->
					<!-- <van-empty v-if="!cardList.length" description="暂无数据" /> -->
					<scroll-view scroll-y="true" @scrolltolower="scrolltolower" style="height: 100%;">
						<van-card 
							v-for="(cardItem,cardIndex) in cacheData[tab_active]"
							lazy-load 
							class="card_item" 
							:key="cardIndex"
						>
							<view slot="thumb">
								<van-image
									fit="cover"
									:src="cardItem.cover[0]||'https://mp-26a34db9-ce85-423e-8aa4-95c501f2a761.cdn.bspapp.com/cloudstorage/56cd171d-4354-4849-a467-413ca61273eb.jpg'"								
									@tap="toDetail(cardItem)"
									width="88"
									height="88"
									use-loading-slot
									use-error-slot
									lazy-load	
								>
									<van-loading
										slot="loading"
										type="spinner"
										size="20" 
										vertical
									>								
									</van-loading>
									<van-icon slot="error" size="48" name="photo-fail" />	
								</van-image>
							</view>
							<view slot="title" class="card_item_title">
								<view @tap="toDetail(cardItem)" class=""> {{cardItem.title}} </view>
								<like :cardItem="cardItem"></like>
							</view>
							<view slot="num" style="display: flex;justify-content: space-between;">
								<van-tag plain color="#f07373" round type="primary">{{cardItem.classify}}</van-tag>
								<text style="color: #bbb;">{{cardItem.browse_count}}浏览</text>
							</view>																				
						</van-card>
						<uni-load-more iconType="snow" :status="cardLoading?'loading':'noMore'"></uni-load-more>
					</scroll-view>
				</van-tab>
			</van-tabs>
		</view>
	</view>
</template>

<script>
	import navbar from '@/components/navbar/navbar.vue'
	import tab from '@/components/tab/tab.vue'
	import listScroll from '@/components/list-scroll/list-scroll.vue'
	import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
	import like from "@/components/like/like.vue"

	export default {
		components: {
			navbar,
			tab,
			listScroll,
			uniLoadMore,
			like
		},
		data() {
			return {
				labelList: [],
				cardList: [],
				cacheData: {},
				cardLoading: true,
				tab_active: '全部',
				page: 1,
				pageSize: 10
			}
		},
		onLoad() {
			this.init();
		},
		onShow() {
			// const that = this;
		},
		created(){			
			// uniCloud.callFunction({
			// 		name: "test-fn"
			// 	})
			// 	.then(res => {
			// 		uni.showToast({
			// 			title:res.result.msg
			// 		})
			// 		console.log(res);
			// 	}).catch(err => {
			// 		console.log(err);
			// 	})		
				
			// uni.request({
			// 	url:"https://fc-mp-26a34db9-ce85-423e-8aa4-95c501f2a761.next.bspapp.com/test",
			// 	success(res){
			// 		console.log(res);
			// 	},
			// 	fail() {
			// 		console.log('fail');
			// 	},
			// 	complete(){
			// 		console.log('complete');
			// 	}
			// })
			
			uni.$on("update_article",this.get_list);
			uni.$on("update_like",this.get_list);	
		},
		methods: {
			async init() {
				await this.get_label();
				await this.get_list();
			},
			tab_active_change(e) {
				this.tab_active = e.detail.title;
				this.page = 1;
				this.pageSize = 10;
				this.cardLoading = true;
				if (Object.keys(this.cacheData).includes(e.detail.title)) {
					this.cardList = this.cacheData[e.detail.title];
				} else {
					this.get_list();
				}
			},
			get_label() {
				return new Promise((reslove, reject) => {	
					this.$ajax({
						name: "get_label"
					}).then(res => {
						if (res.code == 200) {
							this.labelList = res.data;
							// 在分类标签页最前面添加一个"全部"分类
							this.labelList.unshift({
								name: '全部'
							});
							this.tab_active = res.data[0].name;
							reslove();
						} else {
							uni.showToast({
								title: "请求label失败!",
								icon: 'none'
							})
							reject();
						}
					}).catch(err => {
						console.log(err);
						uni.showToast({
							title: "数据库连接超时",
							icon: 'error'
						})						
						reject();
					})
				})
			},
			get_list(type) {
				this.cardLoading = true;				
				return new Promise((reslove, reject) => {	
					this.$ajax({
						name: "get_list",
						data: {
							// user_id:"f6e08a6462cd56630c14e8ed67021386",
							classify: this.tab_active,
							pageSize: this.pageSize,
							page: this.page
						}
					}).then(res => {
						if (res.code == 200) {
							// console.log(res.data);
							this.cardLoading = false;

							if (type && type == 'push') {
								this.cardList = this.cardList.concat(res.data);
							} else {
								this.cardList = res.data;
							}
							this.cacheData[this.tab_active] = this.cardList;	
							// console.log(this.tab_active);
							// console.log(this.cacheData);
							// console.log(this.cacheData[this.tab_active]);
							reslove();
						} else {
							uni.showToast({
								title: "请求文章内容失败!",
								icon: 'none'
							})
							reject();
						}
					}).catch(err => {
						uni.showToast({
							title: "请求文章内容失败!",
							icon: 'none'
						})
						reject();
					})
				}).finally(()=>{
					uni.hideLoading()
				})
			},
			scrolltolower() {
				this.page++;
				this.get_list('push');
			},
			toDetail(cardItem){
				const params = {
					_id:cardItem._id,
					title:cardItem.title,
					create_time:cardItem.create_time,
					thumbs_up_count:cardItem.thumbs_up_count,
					browse_count:cardItem.browse_count,
					author:cardItem.author,
					is_like:cardItem.is_like,
					is_thumbs_up:cardItem.is_thumbs_up
				}
				uni.navigateTo({
					url:"/pages/home-detail/home-detail?params="+JSON.stringify(params)
				})
			},

		}
	}
</script>

<style lang="scss">
	page {
		height: 100%;
		width: 100%;
		display: flex;
	}
	.home {
		flex: 1;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	
	.tab-class{
		flex-basis: auto;
	}
		.tabs_container {
			display: flex;
			flex: 1;
			margin-bottom: 10px;
			height: calc(100% - 45px);

			.van-tabs__content {
				padding-top: 20px;

				.van-sticky {
					padding: 0 10px;
				}
			}		
			.tab_bar {
				// flex: 1;
				// overflow: hidden;

				width: 100%;

				van-tab {
					height: calc(100vh - 110px);
					overflow: hidden;

					// padding: 0 10px;
					// flex-basis: auto !important;
					&>view {
						height: 100% !important;
					}
				}

				.nav-class {
					padding: 0 10px;
				}

				.card_item {

					// display: flex;
					// align-items: center;
					// justify-content: center;
					// height: 150px;
					// margin: 5px;
					// border: 1px solid #000;
					.right_content {
						background-color: #f66;
					}
					.card_item_title {
						position: relative;
						padding-right: 30px;
						overflow: hidden;
						text-overflow: ellipsis;
						display: -webkit-box;
						line-height: 24px;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 2;
						font-size: 16px;
						word-wrap: break-word;
						word-break: break-all;
					}
				}
			}

			.tab_setting_icon {
				flex: 1;
				padding: 0 10px;
				font-size: 24px;

				view {
					flex: 1;
				}

				&::after {
					content: "";
					position: absolute;
					left: 0;
					top: 12px;
					bottom: 12px;
					width: 1px;
					background-color: #ccc;
				}
			}

			.scroll {
				flex: 1;
				overflow: hidden;
				box-sizing: border-box;

				// height: 100%;
				.list-scroll {
					height: 100%;
					display: flex;
					flex-direction: column;
				}
			}
		}
}
</style>

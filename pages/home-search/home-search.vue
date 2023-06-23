<template>
	<view class="history_container">
		<navbar @searchTap="searchTap" @search="searchFn" @clear="clearInput"></navbar>
		<view v-if="is_show_history" class="tag_container">
			<view class="tag_container_title">
				<view class="history">搜索历史</view>
				<view class="clear" @click="clearHistory">清空</view>
			</view>
			<view class="tag_container_list" v-if="historyList.length">
				<van-tag size="large" plain color="#1989fa" v-for="(tag,index) in historyList" :key="index"> {{ tag }} </van-tag>
			</view>
			<!-- 因为van-empty组件没有生效，所以就把van-empty组件的源码copy过来了 -->
			<view v-else class="custom-class van-empty">
				<view class="van-empty__image">
					<image class="van-empty__image__img" src="https://img.yzcdn.cn/vant/empty-image-search.png" />
				</view>
				<view class="van-empty__description">
					无搜索历史
				</view>
			</view>
			<!-- <van-empty v-else image="search" description="无搜索历史" /> -->
		</view>
		<scroll-view v-else scroll-y="true" class="card_container">
			<!-- 因为van-empty组件没有生效，所以就把van-empty组件的源码copy过来了 -->
			<view class="custom-class van-empty" v-if="!cardList.length">
				<view class="van-empty__image">
					<image class="van-empty__image__img" src="https://img.yzcdn.cn/vant/custom-empty-image.png" />
				</view>
				<view class="van-empty__description">
					暂无数据
				</view>
			</view>
			<!-- <van-empty
				v-if="!cardList.length"
				class="custom-image"
				image="https://img.yzcdn.cn/vant/custom-empty-image.png"
				description="暂无数据"
			/> -->
				<view class="card_item" v-for="(cardItem,index) in cardList" :key="index">
					<view class="card_item_title_container">
						<view> {{ cardItem.title }} </view>
						<like :cardItem="cardItem"></like>					
					</view>
					<view style="display: flex;justify-content: center;">
						<van-image style="padding:5px 0 10px;width: 33%;" width="100%" height="88" :src="cardItem.cover[0] || 'https://img.yzcdn.cn/vant/cat.jpeg'" fit="aspectFill" />
						<van-image style="padding:5px 10px;width: 33%;" width="100%" height="88" :src="cardItem.cover[1] || 'https://img.yzcdn.cn/vant/cat.jpeg'" fit="aspectFill" />
						<van-image style="padding:5px 10px;width: 33%;" width="100%" height="88" :src="cardItem.cover[2] || 'https://img.yzcdn.cn/vant/cat.jpeg'" fit="aspectFill" />

						<!-- <image v-for="(scr,srcIndex) in cardItem.cover.slice(0,3).map(src=>({link:src}))" :key="srcIndex" src="/static/about.png" mode="aspectFill" style="width:88px;height: 88px;"></image> -->
					</view>
					<view style="display: flex;justify-content: space-between;">
						<van-tag size="large" plain color="#f07373"> {{ cardItem.classify }} </van-tag>
						<text style="color: #bbb;">{{cardItem.browse_count}}浏览</text>
					</view>
				</view>
		</scroll-view>
	</view>
</template>

<script>
	import navbar from '@/components/navbar/navbar.vue'
	import like from "@/components/like/like.vue"
	import { mapState } from "vuex";
	
	export default {
		components:{
			navbar,
			like
		},
		data() {
			return {
				is_show_history:true,				
				cardList:[]
			};
		},
		methods:{
			searchTap(query){
				if(query.length == 0) return;
				this.$store.dispatch('set_history',query);
			},
			searchFn(value){						
				if(value.trim().length != 0){
					this.$store.dispatch('set_history',value);					
				}
				this.is_show_history = value.length == 0 ? true : false;
				uni.showLoading({
					title:"搜索中..."
				});
				this.cardList = [];
				this.$ajax({
					name: "get_search",
					data: {
						value
					}
				}).then(res => {
					if (res.code == 200) {
						this.cardList = res.data;
						this.cardList = this.cardList.concat(this.cardList )
					} 
				}).catch(err => {
					uni.showToast({
						title:'数据库连接超时',
						icon:"error"
					})
				}).finally(()=>{					
					uni.hideLoading();
				})				
			},
			clearInput(){
				this.is_show_history = true;
			},
			clearHistory(){
				this.$store.commit('SET_HISTORY_LIST',[]);
			}
		},
		computed:{
			...mapState(['historyList'])
		}
	}
</script>

<style lang="scss">
.history_container{
	.tag_container{
		.tag_container_title{
			display: flex;
			justify-content: space-between;
			padding: 10px 20px;
			margin-bottom: 10px;
			.history{
				color: $mk-base-color;
			}
			.clear{
				color: #30b33a;
				font-weight: bold;
			}
		}
		.tag_container_list{
			display: flex;
			flex-wrap: wrap;
			align-items: baseline;
			padding: 0 10px;
			van-tag{
				margin: 10px;
				.van-tag{				
					padding: 4px 8px;
				}
			}
		}
	}
	.card_container{			
		.card_item{
			margin: 10px 0 20px 0;
			padding: 0 10px;			
		}
		.card_item_title_container{
			position: relative;
			padding-right: 30px;
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			font-size: 16px;	
			// height: 24px;
			// line-height: 24px;
			font-weight: bold;
			like{					
				van-icon{
					right:10px;
				}
			}
		}
	}
	.van-empty{align-items:center;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;padding:32px 0}.van-empty__image{height:160px;width:160px}.van-empty__image:empty{display:none}.van-empty__image__img{height:100%;width:100%}.van-empty__image:not(:empty)+.van-empty__image{display:none}.van-empty__description{color:#969799;font-size:14px;line-height:20px;margin-top:16px;padding:0 60px}.van-empty__description:empty,.van-empty__description:not(:empty)+.van-empty__description{display:none}.van-empty__bottom{margin-top:24px}
}
</style>

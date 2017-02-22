// pages/activity/mine.js
var app = getApp()
Page({
  data:{
    userInfo: {},
    actlist:[],
    isSearch:false,
    openid:false
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var openid=options.openid
    var that = this
    that.setData({openid:openid})
    that.loadData('')
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  loadData:function(k){
    var that = this
    var openid = that.data.openid
    wx.request({
        url: 'https://a.lares.me/activity_mine?openid='+openid+'&keyword='+k,
        data: {},
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {'Content-Type': 'application/json'}, // 设置请求的 header
        success: function(res){
            that.setData({
              isSearch:true
            })
            if(res.data.data){
                that.setData({
                    actlist:res.data.data
                })
            }
        },
        fail: function() {
            // fail
        },
        complete: function() {

        }
    })
  },
   startSearch:function(e){
    var that = this
    that.loadData(e.detail.value)
  },
  showAct:function(e){
    wx.navigateTo({
      url: '../activity/show?act_id='+e.currentTarget.dataset.actid
    })
  },
  cancelSearch:function(){
    wx.navigateBack()
  }
})
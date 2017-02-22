var app = getApp()
var util = require('../../utils/util.js')
Date.prototype.Format = function(fmt)   
{ //author: meizz   
  var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "h+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
} 
var myDate = new Date()
myDate.setDate(myDate.getDate()+1)
var _startDate = new Date()
var startDate = _startDate.Format('yyyy-MM-dd')
var today = myDate.Format('yyyy-MM-dd')
var end_date = myDate.setMonth(myDate.getMonth()+6).toLocaleDateString
var showWarning = function(that,msg,target){
    that.setData({
        // warning:{
        //     msg:msg,
        //     show_warning:"block"
        // },
        i_error:target
    })
    var clear_error=function(){
        that.setData({
            // warning:{
            //     msg:"",
            //     show_warning:"none"
            // },
            i_error:''
        }) 
    }
    wx.showToast({
        title:'信息错误',
        icon:"loading",
        duration:500
    })
    
    setTimeout(clear_error,2000)
}
var sourceType = [ ['camera'], ['album'], ['camera', 'album'] ]
var sizeType = [ ['compressed'], ['original'], ['compressed', 'original'] ]
Page({
  data:{
      userInfo:{},
      date:today,
      sourceTypeIndex: 2,
      sourceType: ['拍照', '相册', '拍照或相册'],
      sizeTypeIndex: 0,
      sizeType: ['压缩', '原图', '压缩或原图'],
      countIndex: 0,
      count: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      tips:['点这里选择地点'],
      loc_name:'',
      tips_index:0,
      date_array:[today],
      date_index:0,
      date_start:startDate,
      date_end:end_date,
      date_select:today,
      time_select:'06:00',
      warning:{
        show_warning:"none",
        msg:""
      },
      i_error:"",
      locations:[],
      location:"",
      show_limit:"none",
      show_org:"none",
      org_list:['个人'],
      org_linkman_list:[''],
      org_linkman_phone_list:[''],
      org_id_list:[0],
      org_index:0,
      title:'----',
      file:'',
      i_error_title:'none',
      errors:{
          i_title:{show:'none',icon:'warn'},
          i_topic:{show:'none',icon:'warn'},
          i_linkman:{show:'none',icon:'warn'},
          i_phone:{show:'none',icon:'warn'},
          i_loc_name:{show:'none',icon:'warn'},
          i_image:{show:'none',icon:'warn'},
          i_limit:{show:'none',icon:'warn'}
        },
        imageList:[]
  },
  onLoad: function (options) {
    var that = this 
    var u ={}
    try {
      u = wx.getStorageSync('userInfo')
      console.dir(u.org)
      if(u.org&&u.org.length>0){
          console.log('=====================')
          var o = []
          for(var i=0;i<u.org.length;i++){
              o.push(u.org[i].org_id)
          }
          
          var orgs = o.join(',')
          wx.request({
            url: 'https://a.lares.me/getorgs',
            data: {orgs:orgs},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {'Content-Type': 'application/json'}, // 设置请求的 header
            success: function(res){
                console.dir(res.data)
                if(res.data.data){
                    var names = ['个人'],indexs = [0],org_linkman_list=[''],org_linkman_phone_list=['']
                    for(var i=0;i<res.data.data.length;i++){
                        names.push(res.data.data[i].org_name)
                        indexs.push(res.data.data[i].org_id)
                        org_linkman_list.push(res.data.data[i].linkman)
                        org_linkman_phone_list.push(res.data.data[i].phone)
                    }
                    that.setData({
                        org_list:names,
                        org_id_list:indexs,
                        org_index:0,
                        org_linkman_list:org_linkman_list,
                        org_linkman_phone_list:org_linkman_phone_list
                    })
                }
            },
            fail: function() {
              // fail
            },
            complete: function() {
              // complete
            }
          })

      }

    } catch (e) {
      // Do something when catch error
    }
    that.setData({
        userInfo:u
    })
  },
  bindOrgChange:function(e){
      var that = this
      that.setData({
          org_index : e.detail.value
      })

  },
  switch2Change:function(e){
      var that = this
      if(e.detail.value==true){
          that.setData({
            show_limit:'block'
        })
      }else{
          that.setData({
            show_limit:'none'
        })
        var errors = {}
        for(var k in that.data.errors){
            errors[k]={}
            if(k=='i_limit'){
                errors[k]={show:'none',icon:'warn'}
            }else{
                errors[k]=that.data.errors[k]
            }
        }
        that.setData({
            errors:errors
        })
      }
      
  },
  setWarning:function(key,t=1){
    var that = this
    var changeData = {}
    for(var k in that.data.errors){
        changeData[k] = {}
        if(k==key){
            changeData[k].show='block'
            changeData[k].icon='warn'
            if(t==0){
                changeData[k].show='block'
                changeData[k].icon='success_no_circle'
            }
        }else{
            changeData[k]=that.data.errors[k]
        }
    }
    that.setData({
        errors:changeData
    })
  },
  formSubmit: function(e) {
    var that = this
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    console.log(e)

    if(that.data.imageList.length==0){
        that.setWarning('i_image')
        return false
    }else{
        that.setWarning('i_image',0)
    }

    
    var f = e.detail.value
    if(f.title==''){
        that.setWarning('i_title')
        return false
    }

    

    if(f.topic==''){
        that.setWarning('i_topic')
        // showWarning(that,'请填写活动文案','i_topic')
        return false
    }
    // if(f.start_date==''){
    //     showWarning(that,'请选择活动日期','i_start_date')
    //   return false
    // }
    if(f.loc_name==''){
        that.setWarning('i_loc_name')
      return false
    }
   

     if(f.linkman==''){
        that.setWarning('i_linkman')
      return false
    }
    if(f.phone==''){
        that.setWarning('i_hone')
      return false
    }

    if(f.limit&&f.counter==0){
        that.setWarning('i_limit')
        return false
    }
    console.log('-------openid before----------')

    f.openid=that.data.userInfo.openid
    var _close = function(){
        wx.navigateBack()
    }

    console.log('-------uploadFile before----------')

    
    wx.request({
      url: 'https://a.lares.me/activity_add',
      data: f,
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {'Content-Type': 'application/x-www-form-urlencoded'}, 
      success: function(res){
        if(res.data.code==0){
            wx.showToast({
            title: '活动创建成功',
            icon: 'success',
            duration: 1000
            })
            wx.redirectTo({
              url: '../activity/show?act_id='+res.data.data,
              success: function(res){
                // success
              },
              fail: function() {
                // fail
              },
              complete: function() {
                // complete
              }
            })
        }else{
             wx.showModal({
                title:'创建失败',
                content:res.data.msg,
                showCancel:false,
                confirmText:'知道了'
            })
        }
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })  

    
  },
  formReset: function() {
    console.log('form发生了reset事件')
  },
  bindLocation:function(e){
      var k = e.detail.value
      var that = this
      var status = 0
      if(k.length>=2&&status==0){
          status = 1
          wx.request({
            url: 'https://a.lares.me/gettips',
            data: {keywords:k},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: {'Content-Type': 'application/json'}, // 设置请求的 header
            success: function(res){
                
                if(res.data.data){
                    var list = res.data.data
                    var t = [],l=[]
                    for(var key in list){                        
                        t.push(list[key].name)
                        l.push(list[key].location)
                    } 
                    that.setData({
                        tips:t,
                        tips_index:0,
                        locations:l
                    })
                    // console.dir(res.data.data)
                // try {
                //     wx.setStorageSync('userInfo', that.globalData.userInfo)
                // } catch (e) {    
                // }
                // console.dir(that.globalData.userInfo)
                }
            },
            fail: function() {
                // fail
            },
            complete: function() {
                // complete
                status = 0
            }
        })
      }
  },//地址选择变更
  chooseLocation:function(e){
      var that = this
      wx.chooseLocation({
          success:function(res){
            
            that.setData({
                loc_name:res.name,
                location:res.longitude+','+res.latitude
            })
          },
          cancel:function(e){

          },
          fail:function(){
              
          },
          complete:function(){

          }
      })
  },
  bindLocationChange:function(e){
      var that = this
      that.setData({
          loc_name:that.data.tips[e.detail.value],
          tips_index : e.detail.value,
          location:that.data.locations[e.detail.value]
      })

  },
  bindDateChange:function(e){
      var that = this
    //   console.log(e.detail.value)
      that.setData({
          date_select:e.detail.value
      })
  },
  bindTimeChange:function(e){
      var that = this
    //   console.log(e.detail.value)
      that.setData({
          time_select:e.detail.value
      })
  },
  sourceTypeChange: function (e) {
    this.setData({
      sourceTypeIndex: e.detail.value
    })
  },
  sizeTypeChange: function (e) {
    this.setData({
      sizeTypeIndex: e.detail.value
    })
  },
  countChange: function (e) {
    this.setData({
      countIndex: e.detail.value
    })
  },
  chooseImage: function () {
    var that = this
    wx.chooseImage({
      sourceType: sourceType[this.data.sourceTypeIndex],
      sizeType: sizeType[this.data.sizeTypeIndex],
      count: this.data.count[this.data.countIndex],
      success: function (res) {
        console.log(res)
        that.setData({
          imageList: res.tempFilePaths
        })
        wx.uploadFile({
            url: 'https://a.lares.me/file_upload',
            filePath:that.data.imageList[0],
            name:'file',
            header: {'Content-Type': 'multipart/form-data'},
            formData: {}, // HTTP 请求中其他额外的 form data
            success: function(res){
                var r =  JSON.parse(res.data)
                if(r.code==0){
                    // wx.showToast({
                    // title: '上传成功',
                    // icon: 'success',
                    // duration: 500
                    // })
                    that.setData({
                        file:r.data
                    })
                }

            },
            fail: function(res) {
                console.log('upload failed')
                console.log(res)
            },
            complete: function() {
                // complete
                console.log('upload complete')
            }
            })


      }
    })
  },
  previewImage: function (e) {
    var current = e.target.dataset.src

    wx.previewImage({
      current: current,
      urls: this.data.imageList
    })
  },
  topiclinechange:function(e){
      console.log(e.detail);  
  },
  checkInput:function(e){
    var that  = this
    console.log(e)
    var _type = e.currentTarget.dataset.type
    var _value = e.detail.value
    var _i_error = e.currentTarget.dataset.error
    var _depend = e.currentTarget.dataset.depend
    var _error = false
    console.log(_type)
    console.log(_depend+'----------_depend')
    if(_depend&&_depend=='none'){
        _depend = false
    }else{
        _depend = true
    }
    switch(_type){
        case 'text':{
            if(_value==""){
                _error=true
            }else{
                _error=false
            }
            break
        }
        case 'phone':{
            console.log(_value)
            if(!util.checkMobile(_value)){
                _error=true
            }else{
                _error=false
            }
            break
        }
        case 'number':{
            if(parseInt(_value)!=_value){
                _error=true
            }else{
                _error=false
            }
            break
        }
        default:break
    }
    //   console.log(that.data.errors)
    var changeData = {}
    for(var k in that.data.errors){
    //   console.log(k)
        changeData[k] = {}
        if(k==_i_error){
            if(_error){
                changeData[k].show='block'
                changeData[k].icon='warn'
            }else{
                changeData[k].show='block'
                changeData[k].icon='success_no_circle'
            }
            if(!_depend){
                changeData[k].show='none'
                changeData[k].icon='warn'
            }
        }else{
            changeData[k]=that.data.errors[k]
        }
    }
    console.log(_error)
    that.setData({
        errors:changeData
    })

    console.log(that.data.errors)
  }
})
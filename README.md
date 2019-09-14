## 运行效果
![image](https://github.com/jianzhang15/wxCrawler/blob/master/img/crawler.png)

## 使用方法
* 获取 key，uin、__biz 填入 index.js 中的 COMMON_PARAMS
* node index.js
## key，uin、__biz获取方法：（目前需要手动获取）

* #### **STEP 1** 
			手机、电脑同时登录微信
			-> 手机里搜索一个公众号
			-> 进入公众号后点击右上角的人像按钮
			-> 点击“查看历史消息”
			-> 点击右上角三个点
			-> 分享给自己
			-> 电脑端收到消息后点击
			-> 浏览器打开历史消息页面后从 url 里即可找到 uin、key 值和 biz 值

* #### **STEP 2** 运行脚本

	``` bash
  npm install
  node index.js
	```

随后，每次推送数据将json以 .txt 格式的文件存储到根目录下。

例：
``` json
{
  "id" : "503948740",
  "title" : "刚收养的杜宾犬使劲咬住小孩把她扔出去，走近看才发现原因……",
  "desc" : "Svilicic夫妇刚在4天前收养了一只名叫Khan的杜宾犬，之前的主人虐待过它最后还遗弃了它，收容所在这对",
  "url" : "http://mp.weixin.qq.com/s?__biz=MjM5NjM2NjQ0OA==&amp;mid=2651432395&amp;idx=4&amp;sn=bee861bd2f1325e4a1103a8a8156f3e7&amp;scene=4#wechat_redirect",
  "cover" : "http://mmbiz.qpic.cn/mmbiz/ftBdoTM0jjUicicfhMb8Wq2yibnAqibJQMBONzoCSprVUrgOWgTtFJmRK16kT6libkNFb4ib9ibKQH0mNTYG6yaIicEaibA/0?wx_fmt=jpeg",
}
```

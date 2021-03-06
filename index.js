const axios = require("axios");
const fs = require("fs");
const qs = require("qs");
const querystring = require("querystring");
const moment = require("moment");

axios.defaults.withCredentials = true;
axios.defaults.headers.common = {
  "Content-Type": "application/json; charset=UTF-8",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36 MicroMessenger/6.5.2.501 NetType/WIFI WindowsWechat"
};

/***************************************** 你只需要修改下面的参数即可 *****************************************/

const COMMON_PARAMS = {
  // 公众号授权 key，会失效
  key: "53d58f2c35f2d81fe753719df1645c0bb8f4197faf7c385be7a7643cb6bc4f0269a58805f10b25d882d9ba197c2adc4a0f953f4e52067cced5ab9d0f8f09764ebd13fdcba3f5cc40f70b97486eac4887",
  // 用户标识
  uin: "MTMwNDA4MTI0MA%3D%3D",
  /**
   * 公众号标识
   * 天合光能：MzA3MzI1NTYzMA==
   * 阳光电源：MzA4MjAyNTcxOA==
   */
  __biz: "MzA5Njc4ODI1NA=="
};
let page=0; 
const pageTotal=1;//取几页，每页10次推送数据
const pageSize=5;//每页取几条数据
/***************************************** 爬虫 *****************************************/

const output_txt = `result.txt`;

try {
  fs.unlinkSync(output_txt);
} catch (error) {}

/**
 * 根据 offset 生成文章列表接口的 url
 * @param {从第几篇文章开始} offset
 */
function generateArticlesUrl(offset) {
  let params = Object.assign({}, COMMON_PARAMS, {
    offset,
    action: "getmsg",
    f: "json",
    count: pageSize
  });
  // fs.appendFileSync(output_txt, `https://mp.weixin.qq.com/mp/profile_ext?` + qs.stringify(params), "utf8");
  return `https://mp.weixin.qq.com/mp/profile_ext?` + qs.stringify(params);
}

/**
 * 根据文章发布时间过滤，目前只爬取需要 2019 和 2018 的数据
 */
function filterArticles(articles) {
  return articles.filter(o => {
    let year = new Date(o.comm_msg_info.datetime * 1000).getFullYear();
    return [2018, 2019].includes(year);
  });
}

/**
 * 获取文章阅读量
 * @param {文章链接} url
 */
function getArticleReadCount(url) {
  return new Promise((resolve, reject) => {
    // 注意：延迟两秒绕过反爬机制
    setTimeout(() => {
      // 从 url 参数中提取 mid 和 sn
      let params = querystring.parse(url);
      let mid = params.mid;
      let sn = params.sn;

      let urlParams = Object.assign({}, COMMON_PARAMS, {
        clientversion: "12031211",
        f: "json"
      });

      // 生成阅读量接口 url
      let readCountApi =
        `https://mp.weixin.qq.com/mp/getappmsgext?` + qs.stringify(urlParams);

      // 生成请求体
      let body = {
        mid,
        sn,
        __biz: COMMON_PARAMS.__biz,
        appmsg_type: "9",
        idx: "1",
        scene: "27",
        is_need_ticket: 1,
        is_need_ad: 0,
        is_need_reward: 0,
        both_ad: 0,
        reward_uin_count: 0,
        msg_daily_idx: "1",
        is_original: 0,
        is_only_read: 1,
        is_temp_url: 0,
        item_show_type: "0",
        tmp_version: 1,
        more_read_type: 0,
        appmsg_like_type: 2
      };

      axios
        .post(readCountApi, qs.stringify(body))
        .then(data => resolve(data.data.appmsgstat.read_num))
        .catch(err => console.log(err) + resolve(0));
    }, 2000);
  });
}

function run(offset = 0) {
  axios
    .get(generateArticlesUrl(offset))
    .then(async ({data}) => {
      let articles = JSON.parse(data.general_msg_list).list;
      let nextOffset = data.next_offset;

      /* articles = filterArticles(articles); */

      let finalArticles = [];

      for (let i = 0; i < articles.length; i++) {
        let subArticles = [];
        let article = articles[i];
        let {
          comm_msg_info: basic = {}, 
          app_msg_ext_info: info = {}
        } = article;

        if (!info.title) continue;

        // 比较接口返回的文章 url 与实际访问的 url 得到以下替换规则
        let url = info.content_url
          .replace(/amp;/g, "")
          // .replace(/27#wechat_redirect/g, "38");

        // 文章发布时间
        let time = moment(basic.datetime * 1000).format("YYYY-MM-DD HH:mm:ss");

        /* let readCount = await getArticleReadCount(url); */
        
        console.log(
          `标题：${info.title}, 发布时间：${time}, 阅读量：0`
        );
        // 先加头条
        subArticles.push({
          title: info.title,
          desc: info.digest,
          url,
          time,
          cover: info.cover
        });
        // 再加子文章
        if (info.multi_app_msg_item_list.length > 0) {
          info.multi_app_msg_item_list.forEach(item=>{
            subArticles.push({
              title: item.title,
              desc: item.digest,
              url: item.content_url,
              time: time,
              cover: item.cover
            });
          });
        }
        finalArticles.push(subArticles);
      }
      // 写入 txt 文件
      fs.appendFileSync(output_txt, JSON.stringify(finalArticles), "utf8");
      if (++page > pageTotal) {
        run(nextOffset);
      }
    })
    .catch(error => console.log(error));
}

console.log(`
******** 公众号文章爬虫    ********
******** 作者：Jsonzhang   ********
******** 时间：2019-09-15 ********

开始干活了~~~
`);

run();

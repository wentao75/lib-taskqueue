!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self)["@wt/lib-taskqueue"]=t()}(this,(function(){"use strict";const e=require("pino"),t=require("numeral"),r=e({level:process.env.LOGGER||"info",prettyPrint:{levelFirst:!0,translateTime:"SYS:yyyy-yy-dd HH:MM:ss.l",crlf:!0},prettifier:require("pino-pretty")});function n(e,n,o){let i=e*(o-n)/n;i=Number.parseInt(i);let l=i%1e3;i=Number.parseInt(i/1e3);let f=i%60;i=Number.parseInt(i/60);let s=i%60,u=Number.parseInt(i/60);return r.info(`计算预计时间：elapsed=${e}, finished=${n}, total=${o}; 计算结果：time=${i}, ms=${l}, sec=${f}, min=${s}, hour=${u}`),`${t(u).format("00")}:${t(s).format("00")}:${t(f).format("00")}.${t(l).format("000")}`}return function(e,t=20,o="默认任务队列"){let i=[],l=0,f=[],s=Date.now(),u=0;for(let a=0;a<t;a++)i[a]=new Promise(async(t,i)=>{try{for(;e&&l<e.length;){let t=l,i=e[t].args;l++,r.debug(`【${o}】${a} - 执行第${l}个任务，参数【%o】`,i);try{f[t]=await e[t].caller(...i)}catch(e){r.error(`【${o}】${a} - 执行错误，%o`,e)}u++;let $=n(Date.now()-s,u,e.length);r.debug(`【${o}】${a} - 完成第${t+1}个任务！`),r.info(`【${o}】 已经完成${u}/${e.length}个任务，预计还需要时间：${$}`)}t()}catch(e){i(e)}});return i}}));
//# sourceMappingURL=taskqueue.js.map

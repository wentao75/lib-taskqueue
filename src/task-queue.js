const pino = require("pino");
const numeral = require("numeral");

const logger = pino({
    level: process.env.LOGGER || "info",
    prettyPrint: {
        levelFirst: true,
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
        crlf: true,
    },
    prettifier: require("pino-pretty"),
});

/**
 * 使用一个最大并行maxWorker数量的方式执行任务，任务采用[ {caller, args } ]方式传入
 * @param {Array} tasks 传入的任务信息，对象数组，对象格式为 {caller, args}，其中caller为async异步方法，args为方法使用的参数
 * @param {Number} maxWorker 执行队列的最大并发数，默认20
 * @param {string} name 执行队列名称，用于日志和内部识别显示
 * @returns {Array<Promise>} 返回并发执行的Promise函数数组，可以用于外部等待结果
 */
function executeTasks(tasks, maxWorker = 20, name = "默认任务队列") {
    // 工作线程
    let workers = [];
    // 当前已经执行的任务数（不等于完成的任务数，等于已经完成+正在执行）
    let taskCount = 0;
    // 返回结果
    let results = [];

    let startTime = Date.now();
    let finished = 0;

    for (let i = 0; i < maxWorker; i++) {
        workers[i] = new Promise(async (resolve, reject) => {
            try {
                while (tasks && taskCount < tasks.length) {
                    let index = taskCount;
                    let taskArgs = tasks[index].args;
                    taskCount++;
                    logger.debug(
                        `【${name}】${i} - 执行第${taskCount}个任务，参数【%o】`,
                        taskArgs
                    );
                    try {
                        results[index] = await tasks[index].caller(...taskArgs);
                    } catch (error) {
                        logger.error(`【${name}】${i} - 执行错误，%o`, error);
                    }
                    finished++;
                    let elapsed = Date.now() - startTime;
                    let est = calculateEstimateTime(
                        elapsed,
                        finished,
                        tasks.length
                    );
                    logger.debug(
                        `【${name}】${i} - 完成第${index + 1}个任务！`
                    );
                    logger.info(
                        `【${name}】 已经完成${finished}/${tasks.length}个任务，预计还需要时间：${est}`
                    );
                }

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    return workers;
}

function calculateEstimateTime(elapsed, finished, total) {
    let time = (elapsed * (total - finished)) / finished;

    time = Number.parseInt(time);
    let ms = time % 1000;

    time = Number.parseInt(time / 1000);
    let sec = time % 60;

    time = Number.parseInt(time / 60);
    let min = time % 60;

    let hour = Number.parseInt(time / 60);
    // logger.debug(
    //     `计算预计时间：elapsed=${elapsed}, finished=${finished}, total=${total}; 计算结果：time=${time}, ms=${ms}, sec=${sec}, min=${min}, hour=${hour}`
    // );
    return `${numeral(hour).format("00")}:${numeral(min).format(
        "00"
    )}:${numeral(sec).format("00")}.${numeral(ms).format("000")}`;
}

export default executeTasks;

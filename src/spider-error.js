export class SpiderError extends Error{
    name = "SpiderError";
    occur = null
    /**
     * 
     * @param {string} message 
     * @param {Error} cause 
     * @param {{key:string,item:any}} occur 
     */
    constructor(message, cause, occur){
        super(`${message}(SPIDER_ERR, occur key=${occur?.key})`, {cause});
        this.occur = occur;
        //处理 stack —— 用 this.stack 的第一行，替换 cause.stack 的第一行，赋值回 this.stack
        const [, ...causeStacks] = cause.stack.split("\n");
        const thisStacks = this.stack.split("\n");
        this.stack = [thisStacks[0], ...causeStacks].join("\n");
    }
}
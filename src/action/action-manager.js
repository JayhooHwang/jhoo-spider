/**
 * @typedef ActionOptions
 * @property {string} name
 * @property {Function} handler
 * @property {'single'|'group'} applyFor
 */

/**
 * Manage actions for spider
 */
export class ActionManager{
    static existsActionNames = [];
    /** @private */
    _actionList = {};

    get actions(){
        return this._actionList;
    }
    /**
     * 注册 Action
     * @param {string} name Action 的注册名
     * @param {Function} actionFunc action 的具体处理
     * @param {'single'|'group'} applyFor 设置适用于单一文本还是数组，默认为 'single'
     */
    register(name, actionFunc, applyFor='single'){
        if(ActionList.existsActionNames.includes(name)){
            throw new Error(`action ${name} 已经被注册`);
        }
        if(typeof actionFunc !== 'function' || actionFunc.length === 0){
            throw new Error(`action 的执行函数必须是至少包含一个参数的函数`);
        }
        this._actionList[name] = {
            action: (rawData, context, ...params)=>{
                if(!Array.isArray(rawData) && typeof rawData !== 'string'){
                    throw new Error(`Action 只能用来处理数组或字符串`);
                }
                if(Array.isArray(rawData) && applyFor === 'single'){
                    throw new Error(`Action ${name} 不能用于处理数组`);
                }
                if(!Array.isArray(rawData) && applyFor === 'group'){
                    throw new Error(`Action ${name} 不能用于处理单文本`);
                }
                return actionFunc.call(context, rawData, ...params);
            },
            applyFor
        };
    }
    /**
     * 批量注册
     * @param {ActionOptions[]} actionOptions 
     */
    batchRegister(actionOptions){
        for(let { name, handler, applyFor } of actionOptions){
            this.register(name, handler, applyFor);
        }
    }
    /**
     * 目标 Action 是否已经存在
     * @param {string} name Action Name
     * @returns 
     */
    includes(name){
        return !!this._actionList[name];
    }
}

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
     * @param {string | ActionOptions[]} nameOrOptions Action 的注册名
     * @param {Function} handler action 的具体处理
     * @param {'single'|'group'} applyFor 设置适用于单一文本还是数组，默认为 'single'
     */
    register(nameOrOptions, handler, applyFor='single'){
        if(Array.isArray(nameOrOptions)){
            this._batchRegister(nameOrOptions);
        }else{
            this._register(nameOrOptions, handler, applyFor);
        }
    }
    /**
     * 注册 Action
     * @private
     * @param {string} name Action 的注册名
     * @param {Function} handler action 的具体处理
     * @param {'single'|'group'} applyFor 设置适用于单一文本还是数组，默认为 'single'
     */
    _register(name, handler, applyFor='single'){
        if(ActionList.existsActionNames.includes(name)){
            throw new Error(`action ${name} 已经被注册`);
        }
        if(typeof handler !== 'function' || handler.length === 0){
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
                return handler.call(context, rawData, ...params);
            },
            applyFor
        };
    }
    /**
     * 批量注册
     * @private
     * @param {ActionOptions[]} actionOptions 
     */
    _batchRegister(actionOptions){
        for(let { name, handler, applyFor } of actionOptions){
            this._register(name, handler, applyFor);
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

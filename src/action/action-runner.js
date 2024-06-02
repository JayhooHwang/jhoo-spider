/**
 * Run actions for spider
 */
export class ActionRunner{
    /** @private */
    _actionManager = null;
    constructor(actionManager){
        this._actionManager = actionManager;
    }

    runGroupActions(rawArray, actions, context){
        if(!Array.isArray(rawArray)){
            throw new Error("Group actions 不适用于非数组");
        }
        return _runActions(rawArray, actions, context, 'group', this._actionManager.actions);
    }
    
    runSingleActions(rawData, actions, context){
        if(Array.isArray(rawData)){
            throw new Error("Single actions 不适用于数组");
        }
        return _runActions(rawData, actions, context, 'single', this._actionManager.actions);
    }
}
    
function _runActions(rawData, actions, context, applyFor, usageActions){
    let result = rawData;
    if(!actions){
        return result;
    }
    for(let act of actions){
        const { name, params } = _checkAction(act);
        const action = usageActions[name];
        if(!action){
            throw new Error(`Action "${name}" 不存在`);
        }
        
        if(action.applyFor === applyFor){
            result = action.action.call(null, result, context, ...params);
        }
    }
    return result;
}

function _checkAction(action){
    if(typeof action === 'string'){
        // 当 action 是 string 时，表示没有任何参数的 action
        action = { name: action };
    }
    action.params = action.params || []; //如果 params 为空，赋予 []

    let { name, params } = action;
    if(typeof name !== 'string' || !name.trim().length){
        throw new Error("action.name 是必选项，且为字符串类型");
    }
    if(!Array.isArray(params)){
        throw new Error("action.params 必须是数组");
    }
    return action;
}

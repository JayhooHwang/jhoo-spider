import { SpiderError } from './spider-error';
import { ActionRunner } from './action/action-runner';
import { ActionManager } from './action/action-manager';
import baseActions from './action/base-actions';

const attrAliasOptions = {
    'text': "innerText",
    'html': "innerHTML"
}

/**
 * @typedef SpiderContext
 * @property {string} root
 */

export class Spider{
    /** @private */
    _targetDom = document.body;
    /** @private */
    _context = {};
    /** @private */
    _groupKeys = [];
    /** @private */
    _actionManager = null;
    /** @private */
    _actionRunner = null;
    /**
     * @param {HTMLElement} targetDom 
     * @param {SpiderContext} context 
     * @param {string[]} groupKeys
     */
    constructor(targetDom, context={}, groupKeys=[]){
        if(!targetDom){
            throw new Error("Spider 需要 targetDom 才能初始化");
        }
        this._targetDom = targetDom;
        this._context = context;
        this._groupKeys = groupKeys;
        this._actionManager = new ActionManager();
        this._actionManager.batchRegister(baseActions);
        this._actionRunner = new ActionRunner(this._actionManager);
    }
    search(map){
        let current = {};
        try{
            let resultObj = {};
            for(let rawKey in map){
                const {key, optional} = this._resolveOptionalKey(rawKey);
                const item = map[rawKey];
                current = {key, item};
                if(this._isGroupResult(key)){
                    resultObj[key] = this._searchGroup(item, optional);
                }else{
                    resultObj[key] = this._searchSingle(item, optional);
                }
            }
            return resultObj;
        }catch(ex){
            throw new SpiderError(ex.message, ex, current);
        }
    }

    /**
     * @private
     * @param {*} mapItem 
     * @param {*} optional 
     * @returns 
     */
    _searchGroup(mapItem, optional){
        const { selector, attr, actions } = this._checkMapItem(mapItem);
        const elList = this._targetDom.querySelectorAll(selector);
        let result = [];
        for(let el of elList){
            const rawData = this._getRawDataByAttr(el, attr, optional);
            //执行子元素 action（applyFor = 'single'）
            result.push(this._actionRunner.runSingleActions(rawData, actions, this._context));
        }
        //执行数组整体的 action（applyFor = 'group'）
        result = this._actionRunner.runGroupActions(result, actions, this._context);
        return result;
    }
    /**
     * @private
     * @param {*} mapItem 
     * @param {*} optional 
     * @returns 
     */
    _searchSingle(mapItem, optional){
        const {selector, attr, actions} = this._checkMapItem(mapItem);
        const el = this._targetDom.querySelector(selector);
        const rawData = this._getRawDataByAttr(el, attr, optional);
        let finalStr = this._actionRunner.runSingleActions(rawData, actions, this._context);
        if(Array.isArray(finalStr)){
            throw new Error(`Actions 处理冲突，该地图要素不应该输出数组`);
        }
        return finalStr;
    }

    /**
     * 对 mapItem 进行参数检查或赋予默认值
     * @private
     * @param {{selector:string, attr:string, actions:object[]}} mapItem 
     * @returns 
     */
    _checkMapItem(mapItem){
        let {selector, attr, actions} = mapItem;
        if(!selector){
            throw new Error("selector 不能为空");
        }
        if(!attr){
            attr = "text";
        }
        if(!!actions && !Array.isArray(actions)){
            throw new Error("actions 必须是数组");
        }
        return {selector, attr, actions};
    }
    

    /**
     * 从 element 中获取原始数据
     * @private
     * @param {Element} el 
     * @param {string} attr 
     * @returns {string}
     */
    _getRawDataByAttr(el, attr, optional){
        let rawData = "";
        if(!el){
            if(optional){
                return "";
            }
            throw new Error("找不到指定的 element");
        }
        const realAttr = this._resolveAttrAlias(attr);
        rawData = el[realAttr];
        if(typeof rawData === 'string'){
            return rawData.trim();
        }else{
            throw new Error(`无法从指定的 element 中正确获取 ${attr} 属性，或其结果不是字符串`);
        }
    }

    /**
     * 解析属性别名
     * @private
     * @param {string} alias 
     * @returns {string}
     */
    _resolveAttrAlias(alias){
        return attrAliasOptions[alias] || alias;
    }

    /**
     * 解析可选键
     * @private
     * @param {string} key 
     */
    _resolveOptionalKey(key){
        let optional = false;
        if(key.endsWith("?")){
            optional = true;
            key = key.slice(0, -1);
        }
        return {key, optional};
    }

    /**
     * 指定键是否仅适用于“组”
     * @private
     * @param {string} key 
     * @returns {boolean}
     */
    _isGroupResult(key){
        return this._groupKeys.includes(key);
    }
}

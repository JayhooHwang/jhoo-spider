/**
 * @typedef ActionOptions
 * @property {string} name
 * @property {Function} handler
 * @property {'single'|'group'} applyFor
 */

/** @type {ActionOptions[]} */
export default [{
    /** 拆分，应用于 group */
    name: 'split',
    handler: (strArr, splitter)=>{
        if(!splitter || !splitter.length){
            throw new Error("Action [split] 必须传递 1 个参数")
        }
        const [str] = strArr;
        return str.split(splitter);
    },
    applyFor: 'group'
},{
    /** 字符替换 */
    name: 'replace',
    handler: (str, from, to)=>{
        if(!from || !from.length || typeof to === 'undefined'){
            throw new Error("Action [replace] 必须传递 2 个参数")
        }
        const serachRgx = new RegExp(from, 'g');
        return str.replace(serachRgx, to);
    }
},{
    /** 字符移除 */
    name: 'remove',
    handler: (str, target)=>{
        if(!target || !target.length){
            throw new Error("Action [remove] 必须传递 1 个参数")
        }
        const serachRgx = new RegExp(target, 'g');
        return str.replace(serachRgx, "");
    }
}]


// actionManager.register('remove', (str, target)=>{
//     if(!target || !target.length){
//         throw new Error("Action [remove] 必须传递 1 个参数")
//     }
//     const serachRgx = new RegExp(target, 'g');
//     return str.replace(serachRgx, "");
// })
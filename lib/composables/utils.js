export function hasKey(obj, key){
    return Object.prototype.hasOwnProperty.call(obj, key);
}
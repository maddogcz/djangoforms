import {computed, ref} from "vue";

function hasKey(obj, key){
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function getData(data, fields, getType){
    if(!data){
        data = {};
    }
    for(const fname of Object.keys(fields)){
        if(!hasKey(data, fname)){
            const field = fields[fname];
            let def = field.initial !== undefined ? field.initial : field.default;
            if(getType && getType(fname) == 'q-file' && def === undefined){
                def = [];
            }
            if(!def && field.multiple){
                def = [];
            }
            data[fname] = def === undefined ? "" : def;
        }
    }
    return data;
}

function getErrors(errors, fields){
    // const errors = form.errors;
    if(!errors){
        errors = {};
    }
    for(const field of Object.keys(fields)){
        if(!hasKey(errors, field)){
            errors[field] = null;
        }
    }
    return errors;
}

const input2type = {
    TextInput: "text",
    EmailInput: "email",
    NumberInput: "number",
    HiddenInput: "hidden",
    PasswordInput: "password",
    Textarea: "textarea",
}

function fieldType(fname, fields){
    let res;
    const field = fields[fname];
    const widget = field.widget;

    if(hasKey(input2type, widget) && input2type[widget] != "hidden"){
        return "q-input";
    }

    switch(widget){
        case "Select":
            res = "q-select";
            break;
        case "SelectMultiple":
            res = "q-select";
            break;
        case "FileWidget":
            res = "q-file";
            break;
        case "ClearableFileInput":
            res = "q-file";
            break;
        case "CheckboxInput":
            res = "q-checkbox";
            break;
        case "HiddenInput":
            res = "input"; // native input
            break;
        default:
            res = widget;
    }
    return res
}

function fieldCfg(fname, form, data, errors, extend=null, inputProps=null){
    const field = form.value.fields[fname];
    if(!field){
        console.warn(`fieldCfg: Field name ${fname} not found. Available fields: ${Object.keys(form.value.fields).join(", ")}`);
        return {};
    }
    const hidden = field.widget == "HiddenInput";

    let res;
    if(hidden){
        res = {
            value: data.value[fname],
        };
    }
    else{
        res = {
            modelValue: data.value[fname],
        };
    }
    res["onUpdate:modelValue"] = function(val){
        data.value[fname] = val;
    }
    if(field.choices){
        const options = [];
        for(const [val, label] of field.choices){
            options.push({
                label: label,
                value: val,
            });
        }
        res.options = options;
        res["emit-value"] = true;
        res["map-options"] = true;
    }
    if(!hidden){
        res["label"] = field.label;
        if(field.help_text){
            res["hint"] = field.help_text;
        }
    }
    res["name"] = `${form.value.prefix ? `${form.value.prefix}-` : ""}${fname}`;

    for(const attr of ["required", "readonly", "min", "max"]){
        res[attr] = field[attr];
    }

    // if(field.required){
    //     res["required"] = true;
    // }
    if (field.widget == "SelectMultiple") {
        res["multiple"] = true;
    }

    if(field.disabled){
        res["disable"] = true;
    }
    // if(field.readonly){
    //     res["readonly"] = true;
    // }
    if(hasKey(input2type, field.widget)){
        res["type"] = input2type[field.widget];
    }
    if(errors.value[fname] && errors.value[fname].length){
        res["error-message"] = errors.value[fname].join("; ");
        res["error"] = computed(()=>{
            return errors.value[fname] && errors.value[fname].length > 0;
        }).value;
    }
    if(extend){
        extend(fname, field, res)
    }

    if(inputProps){
        const propsApply = new Set(["q-input", "q-select", "q-file"]);
        const ftype = fieldType(fname, form.value.fields);
        if(propsApply.has(ftype)){
            for(const ip of inputProps){
                res[ip] = true;
            }
        }
    }
    return res;
}

function form(form, cfgExtend=null, inputProps=null){

    function _fieldType(fname){
        return fieldType(fname, form.value.fields);
    }

    function _getData(data){
        return getData(data, form.value.fields, _fieldType);
    }

    function _getErrors(errors){
        return getErrors(errors, form.value.fields);
    }

    const data = ref(_getData(form.value.data));
    const errors = ref(_getErrors(form.value.errors));
    return{
        data: data,
        errors: errors,
        fieldType: _fieldType,
        getData: _getData,
        getErrors: _getErrors,
        fieldCfg(fname){
            return fieldCfg(fname, form, data, errors, cfgExtend, inputProps);
        },
    }

}


export function formset(form, data, errors, emit, extend=null){

    function iprefix(index=null){
        return `${form.value.prefix || "form"}${index === null ? "": "-"}${index === null ? "" : index}`;
    }

    function prefixName(name, index=null){
        // Prefixed name
        return `${iprefix(index)}-${name}`;
    }

    function formCfg(idx){
        const frm = ref({
            fields: form.value.fields,
            prefix: iprefix(idx),
        });
        return {
            fields: form.value.fields,
            prefix: iprefix(idx),
            fieldList: form.value.field_list,
            fieldCfg(fname){
                const ret = fieldCfg(
                    fname, frm,
                    computed(()=>data.value[idx]),
                    computed(()=>errors.value[idx]),
                    extend,
                );
                ret["onUpdate:modelValue"] = function(val){
                    data.value[idx][fname] = val;
                }
                return ret;
            }
        };
    }

    return {
        formCfg,
        prefixName,
    }

}


export function formsetValues(form){
    const data = ref([]);
    const errors = ref([]);

    function _getData(data){
        return getData(
            data, form.value.fields, (fname)=>{
                return fieldType(fname, form.value.fields)
            }
        );
    }

    function _getErrors(errors=null){
        return getErrors(errors, form.value.fields);
    }

    for(const d of form.value.data){
        data.value.push(_getData(d));
    }

    for(const e of form.value.errors){
        errors.value.push(_getErrors(e));
    }

    return {
        getData: _getData,
        getErrors: _getErrors,
        errors,
        data,
    }
}

export {
    form,
    getErrors,
    getData,
    fieldType,
    fieldCfg,
};

import {computed, ref} from "vue";
import {hasKey} from "./utils";
let formCfg
try{
    formCfg = require("/config/djangoforms").default.formCfg;
}
catch(e){
    formCfg = require("./cfg").BaseFormConfig;
}

let formid = 1;


export function form(form, cfgExtend=null){

    const cfg = new formCfg(
        form,
        form.value.data,
        form.value.errors,
        cfgExtend
    );

    return{
        data: cfg.data,
        errors: cfg.errors,
        fieldType(fname){
            return cfg.fieldType(fname);
        },
        getData(data){
            return cfg.getData(data);
        },
        getErrors(errors){
            return cfg.getErrors(errors);
        },
        fieldCfg(fname){
            return cfg.fieldCfg(fname);
        },
        cfg,
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

    function _formCfg(idx){
        const frm = ref({
            fields: form.value.fields,
            prefix: iprefix(idx),
        });
        const cfg = new formCfg(
            frm,
            computed(()=>data.value[idx]),
            computed(()=>errors.value[idx]),
            extend,
            false,
        );
        return {
            fields: form.value.fields,
            prefix: iprefix(idx),
            fieldList: form.value.field_list,
            fieldCfg(fname){
                return cfg.fieldCfg(fname);
            }
        };
    }

    return {
        formCfg: _formCfg,
        prefixName,
    }

}


export function formsetValues(form){
    const data = ref([]);
    const errors = ref([]);

    function getData(data=null){
        const cfg = new formCfg(form, null, null, null, false);
        return cfg.getData(data || {});
    }

    function getErrors(errors=null){
        const cfg = new formCfg(form, null, null, null, false);
        return cfg.getErrors(errors || {});
    }

    const fv = form.value
    for(let i=0; i<fv.data.length; i++){
        data.value.push(getData(fv.data[i]));
        errors.value.push(getErrors(fv.errors[i]));

    }

    return {
        getData,
        getErrors,
        errors,
        data,
    }
}

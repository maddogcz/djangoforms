import {ref, computed, reactive} from "vue";
import {hasKey} from "./utils.js";

let formid = 1;

export class BaseFormConfig{

    // Native attrs that will be just stransferred to component if set on field
    nativeAttrs = ["required", "readonly", "min", "max", "step", "placeholder"]

    input2type = {
        TextInput: "text",
        EmailInput: "email",
        NumberInput: "number",
        HiddenInput: "hidden",
        PasswordInput: "password",
    }

    formIdName = "_djangoformid"

    formIdValue(id){
        return `djangoform-${id}`;
    }

    constructor(form, data, errors, filedCfgExtend=null, initData=true){


        this.form = form;
        if(initData){
            this.data = ref(this.getData({...data}));
            this.errors = ref(this.getErrors({...errors}));
        }
        else{
            this.data = data;
            this.errors = errors;

        }
        this.filedCfgExtend = filedCfgExtend;
    }

    getField(fname){
        return this.form.value.fields[fname];
    }

    isHidden(field){
        return field.widget == "HiddenInput";
    }

    fieldCfg(fname){
        const field = this.getField(fname);
        if(!field){
            console.warn(`fieldCfg: Field name ${fname} not found. Available fields: ${Object.keys(this.form.value.fields).join(", ")}`);
            return {};
        }

        const res = {};

        // let's presume that for hidden field we always use native form element
        // and for others some kind of component with standard v-model capabilities
        // const mval = this.data.value ? this.data.value[fname] : null;
        const mval = computed(()=>this.data.value[fname]);
        if(this.isHidden(field)){
            res["value"] = mval;
        }
        else{
            res["modelValue"] = mval;
            res["onUpdate:modelValue"] = (val)=>{
                this.data.value[fname] = val;
            }
            for(const attr of this.nativeAttrs){
                const val = field[attr];
                if(val !== null && val !== undefined){
                    res[attr] = val;
                }
            }
        }
        const prefix = this.form.value.prefix;
        res["name"] = `${prefix ? `${prefix}-` : ""}${fname}`;

        if(this.filedCfgExtend){
            this.filedCfgExtend(fname, field, res);
        }

        return reactive(res);

    }

    fieldsCfg(){
        const ret = reactive({});
        for(const field of Object.keys(this.form.value.fields)){

            // For backwards compatibility
            const fcfg = this.fieldCfg(field);
            if(hasKey(fcfg, "value")){
                fcfg["value"] = computed(()=>{
                    return this.data.value ? this.data.value[field] : null;
                });
            }
            if(hasKey(fcfg, "modelValue")){
                fcfg["modelValue"] = computed(()=>{
                    return this.data.value ? this.data.value[field] : null;
                });
            }
            ret[field] = fcfg;
        }
        return ret;
    }

    fieldType(fname){
        return this.getField(fname).widget;
    }

    getDataDefault(fname, field, value){
        return value;
    }

    getData(data=null){
        if(!data){
            data = {};
        }
        for(const fname of Object.keys(this.form.value.fields)){
            if(!hasKey(data, fname)){
                const field = this.getField(fname);
                let def = field.initial !== undefined ? field.initial : field.default;
                const val = def === undefined ? "" : def;
                data[fname] = this.getDataDefault(fname, field, val);

            }
        }
        if(this.formIdName && !data[this.formIdName]){
            data[this.formIdName] = this.formIdValue(formid);
            formid++;
        }
        return data;
    }

    getErrors(errors=null){
        // const errors = form.errors;
        if(!errors){
            errors = {};
        }
        for(const field of Object.keys(this.form.value.fields)){
            if(!hasKey(errors, field)){
                errors[field] = null;
            }
        }
        return errors;
    }
}

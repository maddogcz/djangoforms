import {ref, computed, reactive} from "vue";
import {hasKey} from "./utils";

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

        const res = reactive({});

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

        return res;
    
    }

    fieldsCfg(){
        const ret = reactive({});
        for(const field of Object.keys(this.form.value.fields)){

            // For backwards compatibility
            const fcfg = this.fieldCfg(field);
            if(hasKey(fcfg, "value")){
                fcfg["value"] = computed(()=>this.data.value[field]);
            }
            if(hasKey(fcfg, "modelValue")){
                fcfg["modelValue"] = computed(()=>this.data.value[field]);
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


export class QuasarFormConfig extends BaseFormConfig{
    fieldCfg(fname){
        const res = super.fieldCfg(fname);
        const field = this.getField(fname);
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
        if(!this.isHidden(field)){
            res["label"] = field.label;
            if(field.help_text){
                res["hint"] = field.help_text;
            }
        }


        if(field.widget == "SelectMultiple"){
            res["multiple"] = true;
        }

        if(field.widget == "Textarea"){
            res["type"] = "textarea";
        }        

        if(field.disabled){
            res["disable"] = true;
        }
        const itype = this.input2type[field.widget];
        if(itype){
            res["type"] = itype;
        }
        if(this.errors.value[fname] && this.errors.value[fname].length){
            res["error-message"] = this.errors.value[fname].join("; ");
            // res["error"] = computed(()=>{
            //     return this.errors.value[fname] && this.errors.value[fname].length > 0;
            // }).value;
            res["error"] = this.errors.value[fname] && this.errors.value[fname].length > 0;
        }
        return res;

    }

    fieldType(fname){
        let res;
        const field = this.getField(fname)
        const widget = field.widget;

        if(this.isHidden(field)){
            return "input"; // native input
        }

        if(this.input2type[widget]){
            return "q-input";
        }
        if(widget == "Textarea"){
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
            default:
                res = widget;
        }
        return res
    }

    getDataDefault(fname, field, value){
        // files and multiselect default values muset be an Array
        if(this.fieldType(fname) == 'q-file' || field.multiple){
            if(!value || value.constructor !== Array){
                return [];
            }
        }
        return value;
    }
}
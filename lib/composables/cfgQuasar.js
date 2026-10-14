import {computed} from "vue";
import {QInput, QFile, QSelect, QCheckbox} from "quasar";

import {BaseFormConfig} from "./cfg";


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
        const errors = computed(()=>{
            if(this.errors.value && this.errors.value[fname] && this.errors.value[fname].length){
                return this.errors.value[fname].join("; ");
            }
            return null;
        });
        res["error-message"] = errors;
        res["error"] = computed(function(){
            return errors.value && errors.value.length > 0;
        });
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
            return QInput;
        }
        if(widget == "Textarea"){
            return QInput;
        }

        switch(widget){
            case "Select":
                res = QSelect;
                break;
            case "SelectMultiple":
                res = QSelect;
                break;
            case "FileWidget":
                res = QFile;
                break;
            case "ClearableFileInput":
                res = QFile;
                break;
            case "CheckboxInput":
                res = QCheckbox;
                break;
            default:
                res = widget;
        }
        return res
    }

    getDataDefault(fname, field, value){
        // files and multiselect default values muset be an Array
        if(this.fieldType(fname) === QFile || field.multiple){
            if(!value || value.constructor !== Array){
                return [];
            }
        }
        return value;
    }
}

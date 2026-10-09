<template>
    <div>
        <component :is="fieldType(field)" :key="field" v-for="field in form.field_list" v-bind='fieldCfg(field)'></component>
    </div>
</template>

<script>
    import {form as frm} from "./composables/forms.js";
    import {toRefs, watch} from "vue";
    import {QInput, QFile, QCheckbox, QSelect} from "quasar";


    const inputProps = ["filled", "outlined", "standout", "borderless", "rounded", "square", "dense"];
    const props = {
        form: {
            type: Object,
            required: true,
        },
        cfgExtend: {
            type: Function,
        },
        errors: Object,
    }

    for(const ip of inputProps){
        props[ip] = {
            type: Boolean,
            default: false,
        }
    }
    export default {
        props,
        components: {QInput, QFile, QCheckbox, QSelect},
        setup(props){
            const {form, errors, cfgExtend: _cfgExtend} = toRefs(props);

            const ips = [];
            for(const ip of inputProps){
                if(props[ip]){
                    ips.push(ip);
                }
            }

            function cfgExtend(name, fields, res){
                _cfgExtend.value(name, fields, res);
                for(const ip of ips){
                    res[ip] = true;
                }
            }

            const {errors: errs, fieldType, fieldCfg, getErrors, data} = frm(
                form,
                cfgExtend,
            );

            watch(errors, ()=>{
                errs.value = getErrors(errors.value);
            });

            return {
                data,
                // errors,
                fieldType,
                fieldCfg,
            }
        },
    }

</script>

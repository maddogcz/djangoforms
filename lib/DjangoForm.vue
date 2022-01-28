<template>
    <div>
        <component :is="fieldType(field)" :key="field" v-for="field in form.field_list" v-bind='fieldCfg(field)'></component>
    </div>
</template>

<script>
    import {form as frm} from "./composables/forms";
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

            const ips = [];
            for(const ip of inputProps){
                if(props[ip]){
                    ips.push(ip);
                }
            }

            const {form, errors} = toRefs(props);
            const {errors: errs, fieldType, fieldCfg, getErrors} = frm(
                form,
                props.cfgExtend,
                ips,
            );

            watch(errors, ()=>{
                errs.value = getErrors(errors.value);
            });

            return {
                // data,
                // errors,
                fieldType,
                fieldCfg,
            }
        },
    }
    
</script>
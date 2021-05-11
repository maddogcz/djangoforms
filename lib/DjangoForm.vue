<template>
    <div>
        <component :is="fieldType(field)" :key="field" v-for="field in form.field_list" v-bind='fieldCfg(field)'></component>
    </div>
</template>

<script>
    import {form as frm} from "./composables/forms";
    import {toRefs} from "vue";

    // The comment below is actually important !!! DO NOT DELETE !!!
    // ["q-input", "q-file", "q-checkbox", "q-select"]

    const inputProps = ["filled", "outlined", "standout", "borderless", "rounded", "square", "dense"];
    const props = {
        form: {
            type: Object,
            required: true,
        },
        cfgExtend: {
            type: Function,
        },
    }

    for(const ip of inputProps){
        props[ip] = {
            type: Boolean,
            default: false,
        }
    }

    export default {
        props,
        setup(props){

            const ips = [];
            for(const ip of inputProps){
                if(props[ip]){
                    ips.push(ip);
                }
            }

            const {form} = toRefs(props);
            const {data, errors, fieldType, fieldCfg} = frm(
                form,
                props.cfgExtend,
                ips,
            );
            return {
                data,
                errors,
                fieldType,
                fieldCfg,
            }
        },
    }
    
</script>
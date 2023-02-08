<template>
    <div>
        <div>
            <input type="hidden" :name="prefixName('TOTAL_FORMS')" :value="data.length">
            <input type="hidden" :name="prefixName('INITIAL_FORMS')" :value="min">
            <input type="hidden" :name="prefixName('MIN_NUM_FORMS')" :value="min">
            <input type="hidden" :name="prefixName('MAX_NUM_FORMS')" :value="max">
        </div>
        <slot name="forms" :formCfg="formCfg">
            
        </slot>
        <component :is="tag" :key="formKey(d, i)" v-for="(d, i) in data" :class="wrapperClass">
            <slot
                name="form" :index="i" :formCfg="formCfgs[i]" :data="data[i]"
                :errors="errors[i]"
            ></slot>
        </component>
    </div>
</template>

<script>

    import {formset} from "./composables/forms";
    import {toRefs, computed} from "vue";

    export default {
        props: {
            form: Object,
            data: Array,
            errors: Array,
            fieldCfgExtend: {
                type: Function,
                default: null,
            },
            min: {
                type: Number,
                default: 0,
            },
            max: {
                type: Number,
                default: 20,
            },
            formKey: {
                type: Function,
                default: (d, i)=>{
                    return d._djangoformid || i;
                }
            },
            tag: {
                type: String,
                default: "div",
            },
            wrapperClass: String,
        },
        emits: ["update:modelValue"],
        setup(props, {emit}){
            const {form, data, errors, fieldCfgExtend} = toRefs(props);
            const {formCfg, prefixName} = formset(form, data, errors, emit, fieldCfgExtend ? fieldCfgExtend.value : null);
            const formCfgs = computed(function(){
                const res = [];
                for(let i=0; i<data.value.length; i++){
                    res.push(formCfg(i))
                }
                return res;
            });

            return {
                formCfg,
                prefixName,
                formCfgs,
            }
        },
    };

</script>
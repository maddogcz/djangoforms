<template>
    <div>
        <div>
            <input type="hidden" :name="pname('TOTAL_FORMS')" :value="formCount">
            <input type="hidden" :name="pname('INITIAL_FORMS')" :value="min">
            <input type="hidden" :name="pname('MIN_NUM_FORMS')" :value="min">
            <input type="hidden" :name="pname('MAX_NUM_FORMS')" :value="max">
        </div>
        <div :key="i" v-for="i in vcount" :ref="formRefs">
            <slot name="form" :index="i - 1" :formCfg="formCfg(form, i - 1)"></slot>
        </div>
        <slot name="buttons">
            <div v-if="!disabled && buttons">
                <q-btn icon="fa fa-plus-circle" label="Add" type="button" color="primary" @click="formCount++" :disabled="formCount >= max">
                </q-btn>
                <q-btn icon="fa fa-minus-circle" label="Remove" type="button" color="secondary" @click="formCount--" :disabled="formCount <= min">
                </q-btn>
            </div>
        </slot>
    </div>
</template>

<script>
    import {getData, getErrors, fieldType} from "./composables/forms";

    export default {
        props: {
            form: Object,
            count: Number,
            min: {
                type: Number,
                default: 0,
            },
            max: {
                type: Number,
                default: 20,
            },
            buttons: {
                type: Boolean,
                default: true,
            }
        },
        data(){
            this.init = false;
            const data = this.form.data || [];

            const errors = this.form.errors || [];
            let count = this.count;
            if(count === undefined){
                // count = mixins.formsetInitCount(this.form);
                count = 0;
                if(data.length){
                    count = data.length;
                }
            }
            for(let i=0; i<count; i++){
                if(i < this.form.data.length){
                    this.getData(this.form.data[i]);
                }   
                else{
                    data.push(this.getData());
                }

                if(i < this.form.errors.length){
                    this.getErrors(this.form.errors[i]);
                }   
                else{
                    errors.push(this.getErrors());
                }
            }

            return {
                vcount: parseInt(count),
                hcount: 0,
                data,
                errors,
                formCount: parseInt(count),
                forms: [],
            }
        },
        watch: {
            count(nu){
                this.form_count = nu;
            },
            formCount(nu, old){
                if(nu > this.max){
                    this.form_count = this.max;
                    return;
                }
                else if(nu < this.min){
                    this.form_count = this.min;
                    return;
                }
                const diff = nu - this.vcount;
                if(diff > 0){
                    this.vcount += diff;
                    for(let i=0; i<diff; i++){
                        if(this.hcount){
                            this.hcount--;
                        }
                        else{
                            this.data.push(this.getData());
                            this.errors.push(this.getErrors({}));
                        }
                    }
                }
                else{
                    if(this.hcount){
                        this.hcount -= diff;
                        this.vcount += diff;
                    }
                    else{
                        const forms = this.forms;
                        let rm = 0, hide = 0;
                        for(let i=forms.length-1; i>=nu; i--){
                            if(hide == 0){
                                let empty = true;
                                const data = this.data[i];
                                for(const fname of Object.keys(data)){
                                    let d = data[fname];
                                    if((d && d.constructor === Array && d.length == 0)){
                                        d = "";
                                    }

                                    const init = this.form.fields[fname].initial;
                                    if((d !== "" && d !== undefined) && (init === undefined ? true : d != init)){
                                        empty = false;
                                    }
                                }

                                if(empty){
                                    rm++;
                                    this.data.pop();
                                    continue;
                                }
                            }
                            hide++;

                        }

                        this.hcount += hide;
                        this.vcount -= rm + hide;
                    }
                }
            }
        },
        computed: {
            disabled(){
                return false;
            }
        },
        methods: {
            iprefix(index=null){
                return `${this.form.prefix || "form"}${index === null ? "": "-"}${index === null ? "" : index}`;
            },
            pname(name, index=null){
                // Prefixed name
                return `${this.iprefix(index)}-${name}`;
            },
            getData(defaults=null){
                return getData(defaults, this.form.fields, this.fieldType);
            },
            getErrors(errors=null){
                return getErrors(errors, this.form.fields)
            },
            formCfg(form, index){
                const res = {
                    fields: form.fields,
                    prefix: this.iprefix(index),
                    field_list: form.field_list,
                };
                res.data = this.data[index];
                res.errors = this.errors[index];
                return res;
            },
            formRefs(f){
                this.forms.push(f);
            },
            fieldType(fname){
                return fieldType(fname, this.form.fields);
            }
        },
        beforeUpdate(){
            this.forms = [];
        },
    };

</script>
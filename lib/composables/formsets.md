# FormSet composition functions

This set of tools facilitates creating HTML forms based on serialized formsets from Django

```js
const {
    data, errors, getData, getErrors
} = formsetValues(formset);
```

## Arguments

Formset arguments have the same structure as for `form` except:
- `data` and `errors` are arrays of objects
- `type: "FormSet"`
- `prefix` is usually not `null`
- `cfgExtend` argument is moved to `fieldCfgExtend` property of `DjangoFormSet` component

## Returns

Again very similar to `form` except:
- `data` and `error` are list of objects
- although `data` and `errors` are arrays, `getData` and `getErrors` still return object (e.g. you can push it to create new form in the formset: `data.value.push(getData())`)
- you won't get `fieldCfg` here, you'll get it in form(s) slot scope

## Slot scopes

### form
- index: current form index
- formCfg: current form config
```js
{
    fieldCfg: Function, // field config function
    prefix: String, // current form prefix
    fieldList: Array, // list of fields in order
    fields: Object, // form fields mapping
}
```
- data: current form data
- errors: current form errors

### forms
- formCfg: form config generator, call `formCfg(index)` to get form config

## Example usage

```vue
<template>
    <form>
        <form-set :form="formset" :data="data" :errors="errors">

            <!-- Single form mode -->
            <template v-slot:form="{{fieldCfg}: formCfg}">
                <div>
                    <q-input v-bind="fieldCfg('name')"></q-input>
                </div>
            </template>

            <!-- OR All forms at once (iterating is up to you) -->
            <template v-slot:forms="formCfg">
                <div v-for="(d, idx) in data" :key="idx">
                    <my-form :fieldCfg="formCfg(idx).fieldCfg"></my-form>
                </div>
            </template>
        </form-set>
    </form>
</template>

<script>
    import {toRefs} from "vue";
    import {form} from "@maddogcz/djangoforms/lib/composables/formsetValues";
    import FormSet from "@maddogcz/djangoforms/lib/DjangoFormSet";

    export default {
        props: ["formset"],
        components: {
            FormSet,
        },
        setup(props){
            const {formset} = toRefs(props);
            const {data, errors, getData, getErrors} = formsetValues(formset);

            // add one more form in set
            erros.push(getErrors());
            data.push(getData());

            return{
                data, errors
            }
        }
    }
</script>
```

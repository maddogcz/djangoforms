# FormSet composition functions

This set of tools facilitates creating HTML forms based on serilized formsets from Django

```js
const {
    data, errors, getData, getErrors
} = formsetValues(formset);
```

## Arguments

Formset argument has the same structure as for `form` except:
- `data` and `errors` are arrays of objects
- `type: "FormSet",`
- `prefix` is usually not `null`
- `cfgExtend` argument is moved to `fieldCfgExtend` property of `DjangoFormSet` component

## Returns

Again very similar to `form` except:
- `data` and `error` are list of objects
- although `data` and `errors` are arrays, `getData` and `getErrors` still return and object (e.g. you can push it to create new form in the formset `data.value.push(getData())`)
- you won't get `fieldCfg` here, you'll get it in form(s) slot scope

## Slot scopes

### form
- index: current form index
- formCfg: current form config
```js
{
    fieldCfg, // field confg fucntion
    prefix, // current form prefix
    fieldList, // list of fields in order
    fields, // form fields mapping
}
```
- data: current form data
- errors: current form errors

### forms
- formCfg: form config generator, call `formCfg(idx)` to get form config

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

            <!-- All forms at once (iterating is up tp you) -->
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

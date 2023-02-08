# Form composition function

This function facilitates creating HTML forms based on serilized forms from Django

```js
const {
    data, errors, fieldType, getData, getErrors, fieldsCfg
} = form(serializedForm, cfgExtend)
 ```
## Arguments
- **serializedForm**: Object containing serialized form in following format:
```js
{
    type: "Form",
    prefix: "my-prefix", // or null
    field_list: ["name", "surname", "title"], // list of fileds in order for looping
    fields: {
        "name": {
            label: "Person's name",
            help_text: "How's the person called?",
            disabled: false,
            "null": false,
            required: true,
            widget: "TextInput",
            initial: "John",
        },
        "surname": {
            label: "Persons's surnae",
            // ... same as above
        },
        "title": {
            label: "Title",
            widget: "Select",
            choices: [ // 2D Array of arrays of 2: ['value', 'label']
                ["mr", "Mr."],
                ["ms", "Miss"],
                ["mrs", "Mistress"],
            ]
            // ...
        }
    },
    data: { // Object containing data values
        name: "Francis",
    },
    errors: { // Object containing field errors
        surname: ["This filed is required"],
        name: null,
    }
    
}
```
- **cfgExtend**: A callback function that allows you to modify configuration for certain fields
```js
cfgExtend(fieldName, fieldObject, fieldCfg){
    if(fieldNmae == "surname"){
        fieldCfg.class = "form-surname"
    }
}
```

## Returns
- **data**: Reactive objects of form data
- **errors**: Same for errors
- **getData**: Function that accepts (potentially) incomplete object of form data and returns **data** object
- **getErrors**: same for errors
- **fieldType**: Function that maps field name to its corresponding component according to `field.widget` property. If the mapping fails, the widget value is unchaged assuming a corresponding component will be used. Type mapping includes: TextInput, EmailInput, NumberInput, HiddenInput, PasswordInput, Textarea, Select, CheckboxInput, HiddenInput, FileInput and ClearableFileInput.
- **fieldCfg**: Function that receive filed name (`String`) and return object containing filed configuration meant to be used with `v-bind="fieldCfg('fieldName')"`. Configuration also includes value handling using `modelValue` prop and `onUpdate:modelValue` listener.
- **fieldsCfg**: Function that create object of all fields CFGs in more effective manner the oneby one calling `fieldCfg` in template. Used for configuring form fields like: in `setup()` call and return `const fileds = fieldsCfg();` and then `v-bind="fields.fieldName"`;

## Usage example

```vue
<template>
    <form>
        <!-- Using a loop -->
        <component
            v-for="field in personForm.field_list" :key="field"
            :is="fieldType(field)"
            v-bind="fields[field]"

        ></component>

        <!-- Or explicitly -->
        <q-input v-bind="fields.name"></q-input>
    </form>
</template>

<script>
    import {toRefs} from "vue";
    import {form} from "@maddogcz/djangoforms";

    export default {
        props: ["personForm"],
        setup(props){
            const {personForm} = toRefs(props);
            const {fieldType, fieldsCfg, data} = form(personForm);

            data.value.name = "Freddy"; // Manually set field value;

            return{
                personForm, fieldType, fields: fieldsCfg()
            }
        }
    }
</script>
```
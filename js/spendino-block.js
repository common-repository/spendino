
const { createElement } = wp.element;
console.log('here is the forms variable transferred', spendinoData);
/* This section of the code registers a new block, sets an icon and a category, and indicates what type of fields it'll include. */
wp.blocks.registerBlockType('wppp/slide-title', {
    title:('Spendino Formular'),
    icon: 'dashicons-editor-table',
    category: 'widgets',
    example: {'mode': 'preview'},
    attributes: {
        content: {type: 'string'},
        form: {type: 'string', default: '6817' },
        settings: {type: 'string', default: 'display'},
        language: {type: 'string', default: 'de'},
        button: {type: 'string'}
    },

    /* This configures how the content fields will work, and sets up the necessary elements */
    edit: function(props) {

        function updateContent(event) {
            console.log('updateContent', event.target.value);
            switch (event.target.id) {
                case 'form':
                    props.setAttributes({form: event.target.value})
                    break;
                case 'settings':
                    props.setAttributes({settings: event.target.value})
                    break;
                case 'language':
                    props.setAttributes({language: event.target.value})
                    break;
            }
        }

        function updateFormInfo() {
        //     let my_options = {"form": "test"};
        //
        //     alert(my_options.forms);
            console.log("i have been clicked");
        }


        let formData = spendinodata.forms;
        console.log(spendinodata);



        return React.createElement(
            "div",
            null,
            React.createElement(
                "h1",
                null,
                "Spendino Formular Auswahl"
            ),
            React.createElement(
                "label",
                null,
                "Formular"
            ),
            React.createElement("select", {id: "form", value: props.attributes.form, onChange: updateContent },
                forms.map(forms => React.createElement("option", {value:forms.id}, forms.name))

            ),
            React.createElement(
                "label",
                null,
                "Darstellung"
            ),
            React.createElement("select", { id: "settings", value: props.attributes.settings, onChange: updateContent },
                React.createElement("option", {value: "display"}, "Formular"),
                React.createElement("option", {value: "widget"}, "Button"),
                React.createElement("option", {value: "widgetA"}, "Widget"),
                React.createElement("option", {value: "slider"}, "Hilfeleiste"),
                React.createElement("option", {value: "displayoccasion"}, "Spendenaktion"),
            ),
            React.createElement(
                "label",
                null,
                "Sprache"
            ),
            React.createElement("select", { id: "language", value: props.attributes.language, onChange: updateContent },
                React.createElement("option", {value: "en"}, "Englisch"),
                React.createElement("option", {value: "de"}, "Deutsch"),
            ),
        );
    },

    // This is what gets displayed on the page.
    save: function(props) {

        let url = "https://api.spendino.de/donationmanager/themed_forms/";
        let ext = '';

        switch (props.attributes.settings) {
            case 'widgetA':
                url += 'widget/';
                ext = '/type:3';
                break;
            case 'widget':
                url += 'widget/';
                break;
            default:
                url += (props.attributes.settings + '/')
                break;
        }

        return  wp.element.createElement( 'script', {src: url + props.attributes.form + ext + "/xlang:" + props.attributes.language} );
    }
})
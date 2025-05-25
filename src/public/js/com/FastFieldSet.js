export const FastFieldSet = class extends Fast{
    constructor(props){
        super();  
        this.name = "FastFieldset";
        this.props = props;     
        if(props){if(props.id){this.id = props.id}} ;
        this.built = ()=>{}; 
        this.attachShadow({mode:'open'});
        this._isBuilt = false;
        this.objectProps = new Map();
    }

    #getTemplate(){ return `
            
        `    
    }
}

if (!customElements.get ('fast-fieldset')) {
    customElements.define ('fast-fieldset', FastFieldSet);
}
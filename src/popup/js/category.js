/*
<div class="card">
    <div class="card-header" id="headingOne">
        <h5 class="mb-0">
            <button class="btn btn-link" data-toggle="collapse" data-target="#collapseOne"
                aria-expanded="true" aria-controls="collapseOne">
                Collapsible Group Item #1
            </button>
        </h5>
    </div>

    <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
        <div class="card-body">
            Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad
            squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa
            nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid
            single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft
            beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice
            lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you
            probably haven't heard of them accusamus labore sustainable VHS.
        </div>
    </div>
</div>
*/

class Category {
    /*
    card:HTMLDivElement;
    body:HTMLDivElement;
    name:string;
    parentType:string;
    */
    /**
     * 
     * @param {string} name 
     * @param {bool} expanded 
     */
    constructor(name,expanded) {
        //class="card-header" id="headingOne"
        this.parentType = "createtpform";
        this.name = name;
        this.expanded = expanded;
        var title = name.split("")[0].toUpperCase()+name.slice(1);

        var button = document.createElement('button');
        button.setAttribute("data-toggle","collapse");
        button.setAttribute("data-target","#collapse" + name);
        button.setAttribute("aria-expanded",expanded);
        button.setAttribute("aria-controls","collapse" + name);
        button.classList.add("btn","btn-link");
        if(!expanded) {
            button.classList.add("collapsed");
            
        }
        button.innerText = title;

        var heading = document.createElement("h5");
        heading.classList.add("mb-0");
        heading.appendChild(button);
        
        var header = document.createElement('div');
        header.classList.add("card-header");
        header.id = "heading" + name;
        header.appendChild(heading);

        
        this.card = document.createElement('div');
        this.card.classList.add("card");
        this.card.appendChild(header);

        this.cardrow = document.createElement('div');
        if(this.name=="info") {
            this.cardrow.classList.add("card-body");
        } else {
            this.cardrow.classList.add("row");
        }
    }

    /**
     * 
     * @param {any} newChild 
     */
    appendChild(newChild) {
        if(newChild instanceof Category) {
            if(!this.acordian) {
                this.acordian = document.createElement("div");
                this.acordian.id = "acordian" + this.name;
                this.acordian.classList.add("col-12")
                this.cardrow.appendChild(this.acordian);
            }
            newChild.parentType = this.acordian.id;
            this.acordian.appendChild(newChild.getElement());
            return;
        }
        this.cardrow.appendChild(newChild)
    }

    /**
     * @returns {HTMLDivElement}
     */
    getElement() {
        //<div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
        var collapseBody = document.createElement("div");
        collapseBody.id = "collapse" + this.name;
        collapseBody.classList.add("collapse");
        if(this.expanded) {
            collapseBody.classList.add("show");
        }
        collapseBody.setAttribute("aria-labelledby","heading"+this.name);
        collapseBody.setAttribute("data-parent","#" + this.parentType);

        if(this.name=="info") {
            collapseBody.appendChild(this.cardrow);
            this.card.appendChild(collapseBody);

        } else {
            var body = document.createElement('div');
            body.classList.add('card-body');
            body.appendChild(this.cardrow);
            collapseBody.appendChild(body);
            this.card.appendChild(collapseBody);

        }
        return this.card;
    }
}

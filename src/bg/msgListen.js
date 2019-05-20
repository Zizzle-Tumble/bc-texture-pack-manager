class MsgListener {
    constructor() {
        this.names = [];
        this.actions = [];
    }

    /**
     * 
     * @param {string} name 
     * @param {(content:any,sendResponse:(...args:any[])=>void)=>any} action 
     */
    addListener(name,action) {
        if(this.names.includes(name)) {
            console.warn("Action for message type",type,"has been overwritten.");
        } else {
            this.names.push(name);
            this.actions.length = name.length;
        }
        var i = this.names.indexOf(name);
        this.actions[i] = action;
    }

    start() {
        browser.runtime.onMessage.addListener(({ type, content }, sender, sendResponse) => {
            if(!this.names.includes(type)) {
                console.error("no such msg type",type);
                sendResponse();
            }
            var i = this.names.indexOf(type);
            this.actions[i](content,sendResponse,sender);
        });
    }
}
const MSG_LISTENER = new MsgListener();
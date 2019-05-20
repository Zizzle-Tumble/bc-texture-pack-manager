class MsgListener {
    constructor() {
        this.types = [];
        this.actions = [];
    }

    /**
     * 
     * @param {string} type 
     * @param {(content:any,sendResponse:(...args:any[])=>void)=>any} action 
     */
    addListener(type,action) {
        if(this.types.includes(type)) {
            console.warn("message type",type,"already exists.");
            return;
        }
        this.types.push(type);
        this.actions.push(action);
    }

    start() {
        browser.runtime.onMessage.addListener(({ type, content }, sender, sendResponse) => {
            if(!this.types.includes(type)) {
                console.error("no such msg type",type);
                sendResponse();
            }
            var i = this.types.indexOf(type);
            this.actions[i](content,sendResponse,sender);
        });
    }
}
const MSG_LISTENER = new MsgListener();
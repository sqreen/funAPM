'use strict';
const AsyncHooks = require('async_hooks');



const hook = AsyncHooks.createHook({
    init(asyncId, type, triggerAsyncId) {

        Context.init(asyncId, type, triggerAsyncId);
    },
    destroy(asyncId) {

        Context.destroy(asyncId);
    }
});

hook.enable();


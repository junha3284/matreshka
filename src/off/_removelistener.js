/* eslint no-shadow: ["error", { "allow": ["name", "events"] }]*/
import defs from '../_core/defs';
import triggerOne from '../trigger/_triggerone';

// removes simple event listener to an object
export default function removeListener(object, name, callback, context, info = {}) {
    const def = defs.get(object);

    // if no definition do nothing
    if (!def) return;

    const { events: allEvents } = def;
    const events = allEvents[name];
    const retain = [];
    const noTrigger = name ? name[0] === '_' : false;

    // if all events need to be removed
    if (typeof name === 'undefined') {
        if (!noTrigger) {
            nofn.forOwn(allEvents, (events, name) => {
                nofn.forEach(events, evt => {
                    const removeEvtData = {
                        name,
                        callback: evt.callback,
                        context: evt.context
                    };

                    triggerOne(object, `removeevent:${name}`, removeEvtData);
                    triggerOne(object, 'removeevent', removeEvtData);
                });
            });
        }

        // restore default value of "events"
        def.events = {};
    } else if (events) {
        // if events with given name are found
        nofn.forEach(events, evt => {
            const argCallback = callback && callback._callback || callback;
            const evtCallback = evt.callback._callback || evt.callback;

            if (argCallback && argCallback !== evtCallback
                || (context && context !== evt.context)) {
                // keep event
                retain.push(evt);
            } else {
                const removeEvtData = {
                    name,
                    callback: evt.callback,
                    context: evt.context
                };

                if (!noTrigger) {
                    triggerOne(object, `removeevent:${name}`, removeEvtData);
                    triggerOne(object, 'removeevent', removeEvtData);
                }
            }
        });

        if (retain.length) {
            allEvents[name] = retain;
        } else {
            delete def.events[name];
        }
    }

    return;
}
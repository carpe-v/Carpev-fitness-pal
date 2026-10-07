


/*** CALENDAR */

let calendar = null;

/* =====================================
   CALENDAR EVENTS
===================================== */

function loadCalendarEvents() {

    const db =
        getDB();

    const events = [];

    db.workouts.forEach(
        workout => {

            if (!workout.data)
                return;

            const client =
                db.clienti.find(

                    item =>

                        Number(item.id) ===
                        Number(workout.clientId)

                );

            events.push({

                id:
                    `${workout.clientId}-${workout.session}`,

                title:
                    `${client?.nume || "Client"} - Ședința ${workout.session}`,

                start:
                    workout.data,

                allDay: true,

                backgroundColor:
                    "#22c55e",

                borderColor:
                    "#22c55e",

                textColor:
                    "#ffffff"

            });

        }
    );

    return events;

}

/* =====================================
   RENDER CALENDAR
===================================== */

function renderCalendar() {

    const calendarElement =
        document.getElementById(
            "calendar"
        );

    if (!calendarElement)
        return;

    calendar =
        new FullCalendar.Calendar(

            calendarElement,

            {

                locale: "ro",

                firstDay: 1,

                initialView:
                    "dayGridMonth",

                height:
                    "100%",

                headerToolbar: {

                    left:
                        "prev,next today",

                    center:
                        "title",

                    right:
                        "dayGridMonth,timeGridWeek"

                },

                events:
                    loadCalendarEvents(),

                eventClick(info) {

                    alert(
                        info.event.title
                    );

                }

            }

        );

    calendar.render();

}

/* =====================================
   REFRESH CALENDAR
===================================== */

function refreshCalendar() {

    if (!calendar)
        return;

    calendar.removeAllEvents();

    calendar.addEventSource(
        loadCalendarEvents()
    );

}

/* =====================================
   INIT
===================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderCalendar();

    }
);

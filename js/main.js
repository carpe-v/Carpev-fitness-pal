let calendar = null;

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
                        "prev,next",

                    center:
                        "title",

                    right:
                        ""

                },

                events: [

                    {
                        title:
                            "Victor",

                        start:
                            "2026-10-07"
                    },

                    {
                        title:
                            "Ion Popescu",

                        start:
                            "2026-10-09"
                    },

                    {
                        title:
                            "Mihai Ionescu",

                        start:
                            "2026-10-12"
                    }

                ]

            }
        );

    calendar.render();

}
/*** redirect Admin
 * 
 */



    document
    .getElementById(
        "addClientCard"
    )
    ?.addEventListener(
        "click",
        ()=>openClientModal()
    );



    document
    .getElementById(
        "closeClientModal"
    )
    ?.addEventListener(
        "click",
        ()=>closeClientModal()
    );

document
    .getElementById(
        "saveClientBtn"
    )
    ?.addEventListener(
        "click",
        ()=>saveClient()
    );



document.addEventListener(
    "DOMContentLoaded",
    renderCalendar
);
document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderClients();

    }
);

document
    .getElementById("adminCard")
    ?.addEventListener(
        "click",
        () => {

            window.location.href =
                "admin.html";

        }
    );



/*** redirect Admin
 * 
 */


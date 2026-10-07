function renderClients() {

    const db =
        getDB();

    const grid =
        document.getElementById(
            "clientGrid"
        );

    if (!grid)
        return;

    grid.innerHTML =

        (db.clienti || [])
            .map(
                client =>

                    renderClientCard(
                        client
                    )

            )
            .join("");

}

function renderClientCard(client) 
{

    return `

        <div class="client-card">

            <div class="client-card-header">

                <h3>

                    ${client.nume}

                </h3>

                <span
                    class="status ${
                        client.activ
                            ? "active"
                            : "inactive"
                    }">

                    ${
                        client.activ
                            ? "Activ"
                            : "Inactiv"
                    }

                </span>

            </div>

            <div class="client-card-body">

                <div>

                    📞 ${client.telefon || "-"}

                </div>

                <div>

                    🎯 ${client.obiectiv || "-"}

                </div>

                <div>

                    📅 ${
                        client.numarSedinte || 0
                    } ședințe

                </div>

            </div>

         <button
    class="client-card-btn"
    onclick="openClientFile(${client.id})">

    Deschide Fișa

</button>
<button
class="client-delete-btn"
onclick="deleteClient(${client.id})">
Șterge
</button>
        </div>

    `;

}
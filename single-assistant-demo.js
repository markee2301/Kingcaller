const WEBHOOK_URL = "https://hook.eu2.make.com/1bufypv47mv1gqbv8t30g1v8meugi39h"; // Webhook URL
const ASSISTANT_ID = "2bdeaf85-f37e-4f54-8d4f-5d948fd9676b"; // Assistant ID

let table = base.getTable("Demo");

let query = await table.selectRecordsAsync();
console.log("All Records:", query.records);

let sortedRecords = [...query.records].sort((a, b) => {
    let idA = a.getCellValue("Id");
    let idB = b.getCellValue("Id");
    return idB - idA;
});

let record = sortedRecords[0];
console.log("Record with Highest Id Selected:", record);

if (!record) {
    console.error("No record found!");
} else {
    let phoneNumber = record.getCellValue("PhoneNumber");
    let name = record.getCellValue("Name");

    console.log("Phone Number:", phoneNumber);
    console.log("Name:", name);

    let recordData = {
        Id: record.getCellValue("Id"),
        PhoneNumber: phoneNumber,
        Name: name
    };

    try {
        let webhookResponse = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                record: recordData,
                assistantId: ASSISTANT_ID
            })
        });

        console.log("Webhook Response Status:", webhookResponse.status);
        if (!webhookResponse.ok) {
            console.error("Failed to send record:", await webhookResponse.text());
        }
    } catch (error) {
        console.error("Error sending to webhook:", error);
    }
}

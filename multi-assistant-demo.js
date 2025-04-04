const WEBHOOK_URL = "https://hook.us2.make.com/2qqdgam6wu4ksfn71npnlkj31d69u8g8"; // Webhook URL
const LEAH_OUTBOUND_ID = "a12c9b8d-b3c9-4417-8b9d-c62c17e75a9f"; // Leah Outbound assistant ID
const LEAH_OUTBOUND_ADS_ID = "27fa2de4-91c6-4811-a814-f0bdd79fd761"; // Leah Outbound (Ads) assistant ID

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
    let assistantType = record.getCellValue("Assistant");
    let assistantId = assistantType.name === "Leah Outbound (Ads)" ? LEAH_OUTBOUND_ADS_ID : LEAH_OUTBOUND_ID;

    console.log("Phone Number:", phoneNumber);
    console.log("Name:", name);
    console.log("Assistant Type:", assistantType.name);

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
                assistantType: {
                    type: assistantType.name,
                    assistantId: assistantId
                }
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

const WEBHOOK_URL = "https://hook.us2.make.com/nwrtzvqt88ep6tacna7sg8u3hfjakmq86f5s7"; // Webhook URL
const OUTBOUND_ASSISTANT_ID = "d39d72f4-46ab-48d4-9dae-38d69087wej5783e8"; // Outbound assistant ID
const OUTBOUND_ADS_ASSISTANT_ID = "550545ae-758b-4be8-aae9-4cbdcva67ah70296c93"; // Outbound (Ads) assistant ID

let table = base.getTable("CSV DATA");

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
   let fileAttachment = record.getCellValue("File Upload");
   let assistantType = record.getCellValue("Assistant");
   let assistantId = assistantType.name === "Outbound (Ads)" ? OUTBOUND_ADS_ASSISTANT_ID : OUTBOUND_ASSISTANT_ID;
   
   if (!fileAttachment || fileAttachment.length === 0) {
       console.error("No file found in the 'File Upload' field.");
   } else {
       let fileUrl = fileAttachment[0].url;
       let fileName = fileAttachment[0].filename;
       console.log("File URL:", fileUrl);
       console.log("File Name:", fileName);
       console.log("Assistant Type:", assistantType.name);

       let response = await fetch(fileUrl);
       console.log("HTTP Response Status:", response.status);

       if (response.ok) {
           let csvText = await response.text();
           console.log("CSV Content:", csvText);

           let rows = csvText.split("\n").filter(row => row.trim() !== "");
           let headers = rows[0].split(",");
           let data = rows.slice(1).map(row => {
               let cells = row.split(",");
               let record = {};
               headers.forEach((header, index) => {
                   record[header.trim()] = cells[index] ? cells[index].trim() : null;
               });
               record["File Name"] = fileName;
               return record;
           });

           console.log("Parsed Records with File Name:", data);

           const BATCH_SIZE = 75;
           let batches = [];
           for (let i = 0; i < data.length; i += BATCH_SIZE) {
               batches.push(data.slice(i, i + BATCH_SIZE));
           }

           console.log("Total Batches:", batches.length);

           for (let i = 0; i < batches.length; i++) {
               console.log(`Sending Batch ${i + 1} of ${batches.length}:`, batches[i]);

               let webhookResponse = await fetch(WEBHOOK_URL, {
                   method: "POST",
                   headers: {
                       "Content-Type": "application/json"
                   },
                   body: JSON.stringify({ 
                       records: batches[i],
                       assistantType: {
                           type: assistantType.name,
                           assistantId: assistantId
                       }
                   })
               });

               console.log(`Batch ${i + 1} Webhook Response Status:`, webhookResponse.status);
               if (!webhookResponse.ok) {
                   console.error(`Failed to send Batch ${i + 1}:`, await webhookResponse.text());
               }
           }
       } else {
           console.error("Failed to fetch file. HTTP Status:", response.status);
       }
   }
}

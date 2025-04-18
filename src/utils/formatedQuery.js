export function formatQueryForChart(message) {
  try {
    console.log("Raw message before sanitization:", message);

    // Sanitize the message to remove the surrounding code block markers
    const sanitizedMessage = message.replace(/```json|```/g, '').trim();
    console.log("Sanitized message:", sanitizedMessage);

    const queryData = JSON.parse(sanitizedMessage);
    console.log("Parsed queryData before modification:", queryData);

    const cleanedData = {
      query: queryData.query,
      chartType: queryData.chartType
    };
    console.log("Modified queryData:", cleanedData);

    return cleanedData;
  } catch (error) {
    console.warn("Message is not a valid JSON object, returning as plain text.");
    return null; 
  }
}

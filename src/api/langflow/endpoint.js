const sendMessageToBot = async (message) => {
    const response = await fetch('https://api.langflow.com/chat', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer <your_application_token>',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        user_id: '12345',  // Optional user ID to track individual conversations
      }),
    });
  
    const data = await response.json();
    console.log('Response from bot:', data);
  };
  
  sendMessageToBot("Hello, bot!");
  
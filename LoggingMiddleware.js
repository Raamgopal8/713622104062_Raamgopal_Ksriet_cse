const LoggingMiddleware = (message, level = 'INFO') => {
    const logPayload = {
      clientID: "431ea601-a2a3-4e5e-8fdc-c85986a42f28",
      clientSecret: "WQzJSRjdCXZDqFvH",
      timestamp: new Date().toISOString(),
      level,
      message
    };
       
    const logStorage = JSON.parse(localStorage.getItem('customLogs') || '[]');
    logStorage.push(logPayload);
    localStorage.setItem('customLogs', JSON.stringify(logStorage));
  };
  
  export default LoggingMiddleware;
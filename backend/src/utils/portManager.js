const net = require('net');

// Find an available port starting from the given port
const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use, try the next one
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
};

// Kill any process using the specified port
const killProcessOnPort = async (port) => {
  try {
    const { execSync } = require('child_process');
    
    if (process.platform === 'win32') {
      // Windows
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = result.split('\n');
      for (const line of lines) {
        if (line.includes(`:${port}`)) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            try {
              execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
              console.log(`✅ Killed process ${pid} on port ${port}`);
            } catch (killError) {
              console.log(`⚠️ Could not kill process ${pid}: ${killError.message}`);
            }
          }
        }
      }
    } else {
      // macOS/Linux
      const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8' });
      const pids = result.trim().split('\n').filter(Boolean);
      
      for (const pid of pids) {
        if (pid && !isNaN(pid)) {
          try {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
            console.log(`✅ Killed process ${pid} on port ${port}`);
          } catch (killError) {
            console.log(`⚠️ Could not kill process ${pid}: ${killError.message}`);
          }
        }
      }
    }
  } catch (error) {
    console.log(`⚠️ Could not kill processes on port ${port}: ${error.message}`);
  }
};

// Safely start server on specified port
const startServerSafely = async (app, desiredPort) => {
  try {
    // First, try to kill any existing processes on the port
    await killProcessOnPort(desiredPort);
    
    // Wait a moment for processes to be killed
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find an available port
    const availablePort = await findAvailablePort(desiredPort);
    
    if (availablePort === desiredPort) {
      console.log(`✅ Port ${desiredPort} is available`);
    } else {
      console.log(`⚠️ Port ${desiredPort} was in use, using port ${availablePort} instead`);
    }
    
    return new Promise((resolve, reject) => {
      const server = app.listen(availablePort, () => {
        console.log(`🚀 Server started successfully on port ${availablePort}`);
        resolve({ server, port: availablePort });
      });
      
      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
          console.log(`🚨 Port ${availablePort} is still in use, trying next port...`);
          server.close();
          // Try the next port
          startServerSafely(app, availablePort + 1).then(resolve).catch(reject);
        } else {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server safely:', error);
    throw error;
  }
};

module.exports = {
  findAvailablePort,
  killProcessOnPort,
  startServerSafely
};
